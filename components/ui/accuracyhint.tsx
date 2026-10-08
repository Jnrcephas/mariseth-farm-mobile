import React from "react";
import { StyleSheet, View } from "react-native";
import AppText from "./apptext";
import { colors } from "@/constants/colors";
import { getSignalLevel } from "@/utils/location";

/**
 * A small, quiet "how accurate is this?" line: a coloured dot plus the error
 * in metres ("within 8 m"). Smaller is better. Colours match the live GPS panel
 * (green 15 m or better, amber up to 30 m, red worse than that). Renders
 * nothing when there is no accuracy number, so it is safe to drop in anywhere.
 */
const LEVEL_COLOR = {
  good: colors.primary,
  fair: colors.activeText,
  weak: colors.error,
} as const;

const AccuracyHint = ({
  accuracy,
  prefix,
}: {
  accuracy?: number | null;
  /** Text before the number, e.g. "Right now" or "Marked". */
  prefix?: string;
}) => {
  const level = getSignalLevel(accuracy);
  if (level === "unknown" || accuracy == null) return null;

  const metres = accuracy < 1 ? "under 1 m" : `${Math.round(accuracy)} m`;
  const color = LEVEL_COLOR[level];

  return (
    <View style={styles.row}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <AppText fontFamily="Medium" fontSize={11} style={{ color }}>
        {prefix ? `${prefix}: ` : ""}within {metres}
      </AppText>
    </View>
  );
};

export default AccuracyHint;

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
