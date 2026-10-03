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
