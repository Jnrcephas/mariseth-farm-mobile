import {
  getLocationErrorCode,
  LiveFix,
  LocationErrorCode,
  startLiveLocation,
} from "@/utils/location";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppState } from "react-native";

export type LiveLocation = {
  /** The latest reading, or null until the first one arrives. */
  fix: LiveFix | null;
  /** True while the GPS feed is running. */
  isLive: boolean;
  /** True while a start is in progress (waiting for permission / first fix). */
  starting: boolean;
  errorCode: LocationErrorCode | null;
  /** Turn the feed on. May show the permission prompt. */
  start: () => Promise<void>;
  /** Turn the feed off (saves battery). */
  stop: () => void;
};

/**
 * Live GPS for a screen.
 *
 *  - Starts by itself when the screen mounts, but ONLY if location is already
 *    allowed, so opening a screen never throws a permission prompt.
 *  - Otherwise `start()` (from a button) asks for permission and begins.
 *  - Switches off when the screen unmounts and while the app is in the
 *    background, and resumes by itself when the app comes back.
 */
export function useLiveLocation(): LiveLocation {
  const [fix, setFix] = useState<LiveFix | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [starting, setStarting] = useState(false);
  const [errorCode, setErrorCode] = useState<LocationErrorCode | null>(null);

  const stopRef = useRef<(() => void) | null>(null);
  const mountedRef = useRef(true);
  // Whether the feed *should* be on (so we can resume after the app was in
  // the background even though the subscription itself was removed).
  const wantedRef = useRef(false);

  const end = useCallback(() => {
    stopRef.current?.();
    stopRef.current = null;
    if (mountedRef.current) setIsLive(false);
  }, []);

  const begin = useCallback(async (silent: boolean) => {
    if (stopRef.current) return;
    if (mountedRef.current) {
      setStarting(true);
      setErrorCode(null);
    }
    try {
      const remove = await startLiveLocation(
        (next) => {
          if (mountedRef.current) setFix(next);
        },
        { silent }
      );
      // The screen closed, or the app went to the background, while we
      // were waiting - don't leave a feed running that nobody can see.
      if (!mountedRef.current || AppState.currentState !== "active") {
        remove();
        return;
      }
      stopRef.current = remove;
      wantedRef.current = true;
      setIsLive(true);
    } catch (error) {
      if (mountedRef.current) setErrorCode(getLocationErrorCode(error));
    } finally {
      if (mountedRef.current) setStarting(false);
    }
  }, []);

  const start = useCallback(async () => {
    await begin(false);
  }, [begin]);

  const stop = useCallback(() => {
    wantedRef.current = false;
    end();
    // Forget the last reading so nothing (e.g. the map's blue dot) keeps
    // showing a position that is no longer being tracked.
    if (mountedRef.current) setFix(null);
  }, [end]);

  useEffect(() => {
    mountedRef.current = true;

    // Silent: only starts if permission was already granted. A failure here
    // just means the person sees the "Turn on live GPS" button instead.
    begin(true).then(() => {
      // Silent failure is not an error worth showing on first open.
      if (mountedRef.current && !stopRef.current) setErrorCode(null);
    });

    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        if (wantedRef.current && !stopRef.current) begin(true);
      } else {
        end();
      }
    });

    return () => {
      mountedRef.current = false;
      subscription.remove();
      stopRef.current?.();
      stopRef.current = null;
    };
  }, [begin, end]);

  return { fix, isLive, starting, errorCode, start, stop };
}
