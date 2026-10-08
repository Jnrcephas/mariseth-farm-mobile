import * as Location from "expo-location";
import { Platform } from "react-native";

/**
 * Why this file exists
 * --------------------
 * Marking a farm corner used to call `Location.getCurrentPositionAsync()` once.
 * On Android that can hand back:
 *   - a cached "last known" fix (so every tap returns the same coordinates), or
 *   - a coarse, network-only fix (Wi-Fi / cell tower) that doesn't change until
 *     you move hundreds of metres, or
 *   - an *approximate* location, which is what Android 12+ gives the app when
 *     the user picks "Approximate" in the permission dialog.
 * All three look exactly like "the coordinates never change when I walk".
 *
 * `getFreshPosition` fixes that by (1) refusing approximate-only permission,
 * (2) asking Android to switch on Google's location service / high-accuracy
 * mode (the same "Google Location Accuracy" setting in the phone's Location
 * settings), and (3) listening for live GPS updates, discarding stale ones,
 * until it gets a good-enough reading.
 */

export type FreshFix = {
  latitude: number;
  longitude: number;
  /** Estimated horizontal error in metres (smaller is better). */
  accuracy: number | null;
};

export type LocationErrorCode =
  | "PERMISSION_DENIED"
  | "APPROXIMATE_ONLY"
  | "SERVICES_OFF"
  | "TIMEOUT"
  | "UNKNOWN";

export class LocationError extends Error {
  code: LocationErrorCode;
  constructor(code: LocationErrorCode) {
    super(code);
    this.name = "LocationError";
    this.code = code;
  }
}

/**
 * Duck-typed instead of `instanceof`: `instanceof` on Error subclasses is
 * unreliable once Babel/Hermes has transpiled the class.
 */
export function getLocationErrorCode(error: unknown): LocationErrorCode {
  const candidate = error as { name?: string; code?: LocationErrorCode } | null;
  return candidate?.name === "LocationError" && candidate.code
    ? candidate.code
    : "UNKNOWN";
}

/** Stop as soon as a reading is this accurate (metres). Fine for a farm corner. */
export const TARGET_ACCURACY_M = 15;
/** Readings worse than this (metres) are returned, but the UI should warn. */
export const POOR_ACCURACY_M = 30;
/** Give up waiting for a good reading after this long and use the best so far. */
const MAX_WAIT_MS = 20000;
/** A reading older than this (relative to when we asked) is a cached one. */
const MAX_FIX_AGE_MS = 5000;

export function distanceInMetres(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number }
) {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.latitude)) *
      Math.cos(toRad(b.latitude)) *
      Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

async function ensureLocationReady() {
  const permission = await Location.requestForegroundPermissionsAsync();
  if (permission.status !== "granted") {
    throw new LocationError("PERMISSION_DENIED");
  }
  // Android 12+ lets people grant "Approximate" only. That is deliberately
  // fuzzed by the OS and will not change as you walk between farm corners.
  if (Platform.OS === "android" && permission.android?.accuracy === "coarse") {
    throw new LocationError("APPROXIMATE_ONLY");
  }

  if (Platform.OS === "android") {
    // Shows Google's "turn on location accuracy" prompt if the phone isn't
    // already using Google location services / high-accuracy mode. Resolves
    // silently when it's already on. If the person says no we carry on and
    // let the checks below decide whether we can still get a usable fix.
    try {
      await Location.enableNetworkProviderAsync();
    } catch {
      /* declined - not fatal on its own */
    }
  }

  if (!(await Location.hasServicesEnabledAsync())) {
    throw new LocationError("SERVICES_OFF");
  }
}

export async function getFreshPosition(): Promise<FreshFix> {
  await ensureLocationReady();

  const requestedAt = Date.now();

  return new Promise<FreshFix>((resolve, reject) => {
    let best: Location.LocationObject | null = null;
    let subscription: Location.LocationSubscription | null = null;
    let settled = false;

    const finish = (fix: Location.LocationObject | null, error?: LocationError) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      subscription?.remove();
      if (fix) {
        resolve({
          latitude: fix.coords.latitude,
          longitude: fix.coords.longitude,
          accuracy: fix.coords.accuracy ?? null,
        });
      } else {
        reject(error ?? new LocationError("UNKNOWN"));
      }
    };

    const timer = setTimeout(() => {
      finish(best, new LocationError("TIMEOUT"));
    }, MAX_WAIT_MS);

    Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.Highest,
        timeInterval: 1000,
        distanceInterval: 0,
      },
      (location) => {
        // Drop cached readings delivered before we actually asked.
        if (location.timestamp < requestedAt - MAX_FIX_AGE_MS) return;

        const accuracy = location.coords.accuracy ?? Number.POSITIVE_INFINITY;
        const bestAccuracy = best?.coords.accuracy ?? Number.POSITIVE_INFINITY;
        if (!best || accuracy < bestAccuracy) best = location;

        if (accuracy <= TARGET_ACCURACY_M) finish(location);
      }
    )
      .then((sub) => {
        // `finish` may already have run while the subscription was starting.
        if (settled) sub.remove();
        else subscription = sub;
      })
      .catch(() => finish(null, new LocationError("UNKNOWN")));
  });
}

/**
 * A quick, "good enough" position for centring a map on the person - not for
 * marking a boundary corner. Same permission / services checks as
 * `getFreshPosition`, but returns after one reading instead of waiting for a
 * high-accuracy fix, so the map moves right away. Use `getFreshPosition`
 * whenever the coordinates will be saved.
 */
export async function getQuickPosition(): Promise<FreshFix> {
  await ensureLocationReady();
  try {
    const fix = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    return {
      latitude: fix.coords.latitude,
      longitude: fix.coords.longitude,
      accuracy: fix.coords.accuracy ?? null,
    };
  } catch {
    throw new LocationError("UNKNOWN");
  }
}

// ---------------------------------------------------------------------------
// Live location (a continuous feed, like a "GPS status" app)
// ---------------------------------------------------------------------------

export type LiveFix = FreshFix & {
  /** When the phone took this reading (ms since 1970). */
  timestamp: number;
};

/**
 * A live reading older than this is treated as stale (the feed may have
 * stalled), so marking a point falls back to asking for a fresh one.
 */
export const LIVE_FIX_MAX_AGE_MS = 10000;

export type SignalLevel = "good" | "fair" | "weak" | "unknown";

/**
 * Turns the accuracy number (metres of possible error - smaller is better)
 * into a simple traffic light, using the same two thresholds as marking:
 *   <= TARGET_ACCURACY_M  -> good   (15 m or better)
 *   <= POOR_ACCURACY_M    -> fair   (16-30 m)
 *   >  POOR_ACCURACY_M    -> weak   (more than 30 m)
 */
export function getSignalLevel(accuracy: number | null | undefined): SignalLevel {
  if (accuracy == null || Number.isNaN(accuracy)) return "unknown";
  if (accuracy <= TARGET_ACCURACY_M) return "good";
  if (accuracy <= POOR_ACCURACY_M) return "fair";
  return "weak";
}

/**
 * Starts a continuous GPS feed and calls `onFix` about once a second until
 * the returned function is called. Unlike `getFreshPosition` this never
 * settles on one reading - it is for showing the person where they are *right
 * now* as they walk.
 *
 * `silent: true` never asks for permission or pops a system dialog: it only
 * starts if location is already allowed, otherwise it throws. Use it to start
 * automatically when a screen opens; use the default for a button the person
 * pressed themselves.
 */
export async function startLiveLocation(
  onFix: (fix: LiveFix) => void,
  options: { silent?: boolean } = {}
): Promise<() => void> {
  if (options.silent) {
    const permission = await Location.getForegroundPermissionsAsync();
    if (permission.status !== "granted") {
      throw new LocationError("PERMISSION_DENIED");
    }
    if (Platform.OS === "android" && permission.android?.accuracy === "coarse") {
      throw new LocationError("APPROXIMATE_ONLY");
    }
    if (!(await Location.hasServicesEnabledAsync())) {
      throw new LocationError("SERVICES_OFF");
    }
  } else {
    await ensureLocationReady();
  }

  try {
    const subscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.Highest,
        timeInterval: 1000,
        distanceInterval: 0,
      },
      (location) => {
        onFix({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          accuracy: location.coords.accuracy ?? null,
          timestamp: location.timestamp,
        });
      }
    );
    return () => subscription.remove();
  } catch {
    throw new LocationError("UNKNOWN");
  }
}

/**
 * The live reading as a plain fix, but only if it is recent enough to trust.
 * Returns null when there is no live feed or it has gone quiet - the caller
 * should then fall back to `getFreshPosition`.
 */
export function usableLiveFix(live?: LiveFix | null): FreshFix | null {
  if (!live) return null;
  if (Date.now() - live.timestamp > LIVE_FIX_MAX_AGE_MS) return null;
  return {
    latitude: live.latitude,
    longitude: live.longitude,
    accuracy: live.accuracy,
  };
}
