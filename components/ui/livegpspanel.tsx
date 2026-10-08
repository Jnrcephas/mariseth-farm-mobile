import React from "react";
import { Linking, Pressable, StyleSheet, View } from "react-native";
import AppText from "./apptext";
import { colors } from "@/constants/colors";
import { LOCATION_ERROR_MESSAGES } from "./farmboundarycapture";
import { LiveLocation } from "@/hooks/uselivelocation";
import {
  getSignalLevel,
  POOR_ACCURACY_M,
  SignalLevel,
  TARGET_ACCURACY_M,
} from "@/utils/location";

/**
 * Shows where the phone is RIGHT NOW, updating as the farmer walks (the same
 * idea as a GPS-status app). The accuracy number is "how many metres off the
 * dot might be" - smaller is better - and is turned into a traffic light so a
 * farmer doesn't need to understand the number to know when to mark a corner.
 */

const SIGNAL: Record<
  Exclude<SignalLevel, "unknown">,
  { label: string; color: string; hint: string }
> = {
  good: {
    label: "Good signal",
    color: colors.primary,
    hint: "Good signal - a good moment to mark a point.",
  },
  fair: {
    label: "Fair signal",
    color: colors.activeText,
    hint: `Okay signal. Wait a few seconds for the number to drop to ${TARGET_ACCURACY_M} m or less, then mark the point.`,
  },
  weak: {
    label: "Weak signal",
    color: colors.error,
    hint: `Weak signal (worse than ${POOR_ACCURACY_M} m). Move to open sky, away from buildings and trees, and wait for the number to come down.`,
  },
};

const Row = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.row}>
    <AppText fontFamily="Regular" fontSize={12} color="formPlaceholderText">
      {label}
    </AppText>
    <AppText fontFamily="SemiBold" fontSize={14} color="textBold">
      {value}
    </AppText>
  </View>
);

const LiveGpsPanel = ({ live }: { live: LiveLocation }) => {
  const { fix, isLive, starting, errorCode, start, stop } = live;
  const level = getSignalLevel(fix?.accuracy);
  const signal = level === "unknown" ? null : SIGNAL[level];
  const needsSettings =
    errorCode === "PERMISSION_DENIED" ||
    errorCode === "APPROXIMATE_ONLY" ||
    errorCode === "SERVICES_OFF";

  // --- Off (or not allowed yet) ---
  if (!isLive && !starting) {
    return (
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <View style={[styles.dot, { backgroundColor: colors.formBorder }]} />
          <AppText fontFamily="SemiBold" fontSize={13} color="textBold">
            Live GPS is off
          </AppText>
        </View>

        {errorCode ? (
          <View style={{ gap: 6 }}>
            <AppText fontFamily="Regular" fontSize={12} color="error">
              {LOCATION_ERROR_MESSAGES[errorCode] ??
                LOCATION_ERROR_MESSAGES.UNKNOWN}
            </AppText>
            {needsSettings ? (
              <Pressable onPress={() => Linking.openSettings()} hitSlop={8}>
                <AppText fontFamily="SemiBold" fontSize={12} color="primary">
                  Open phone settings
                </AppText>
              </Pressable>
            ) : null}
          </View>
        ) : (
          <AppText fontFamily="Regular" fontSize={12} color="formPlaceholderText">
            Turn it on to see your position and GPS accuracy update as you walk.
          </AppText>
        )}

        <Pressable style={styles.button} onPress={start} hitSlop={6}>
          <AppText fontFamily="SemiBold" fontSize={13} color="white">
            Turn on live GPS
          </AppText>
        </Pressable>
      </View>
    );
  }

  // --- Starting, no reading yet ---
  if (!fix) {
    return (
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <View style={[styles.dot, { backgroundColor: colors.activeText }]} />
          <AppText fontFamily="SemiBold" fontSize={13} color="textBold">
            Looking for GPS signal...
          </AppText>
        </View>
        <AppText fontFamily="Regular" fontSize={12} color="formPlaceholderText">
          This can take a few seconds. Stand outside with a clear view of the sky.
        </AppText>
      </View>
    );
  }

  // --- Live ---
  return (
    <View style={styles.card}>
      <View style={[styles.headerRow, { justifyContent: "space-between" }]}>
        <View style={styles.headerRow}>
          <View
            style={[
              styles.dot,
              { backgroundColor: signal?.color ?? colors.formBorder },
            ]}
          />
          <AppText fontFamily="SemiBold" fontSize={13} color="textBold">
            Live GPS
          </AppText>
        </View>
        {signal ? (
          <AppText
            fontFamily="SemiBold"
            fontSize={12}
            style={{ color: signal.color }}
          >
            {signal.label}
          </AppText>
        ) : null}
      </View>

      <Row label="Latitude" value={fix.latitude.toFixed(6)} />
      <Row label="Longitude" value={fix.longitude.toFixed(6)} />
      <Row
        label="Accuracy"
        value={
          fix.accuracy != null ? `within ${Math.round(fix.accuracy)} m` : "unknown"
        }
      />

      {signal ? (
        <AppText fontFamily="Regular" fontSize={12} color="formLabelText">
          {signal.hint}
        </AppText>
      ) : null}

      <Pressable onPress={stop} hitSlop={8} style={{ alignSelf: "flex-start" }}>
        <AppText fontFamily="SemiBold" fontSize={12} color="textPrimary">
          Turn off live GPS
        </AppText>
      </Pressable>
    </View>
  );
};

export default LiveGpsPanel;

const styles = StyleSheet.create({
  card: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: colors.backgroundTertiary,
    borderWidth: 1,
    borderColor: colors.light,
    gap: 8,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  button: {
    height: 38,
    borderRadius: 10,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
});
