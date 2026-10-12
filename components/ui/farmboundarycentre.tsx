import React, { useState } from "react";
import { Linking, Pressable, View } from "react-native";
import AppButton from "./appbutton";
import AppText from "./apptext";
import AccuracyHint from "./accuracyhint";
import {
  BoundaryPoint,
  LOCATION_ERROR_MESSAGES,
} from "./farmboundarycapture";
import {
  getFreshPosition,
  getLocationErrorCode,
  LiveFix,
  POOR_ACCURACY_M,
  usableLiveFix,
} from "@/utils/location";
import { formatNumber, sqMetresToHectares, squareAroundPoint } from "@/utils/geometry";

/**
 * "Farm centre" mode: a fallback for when walking the whole boundary is not
 * possible. The farmer stands in the middle of the farm and marks ONE point.
 *
 * The backend only stores a polygon, so that one point is turned into a square
 * centred on it, with the same area as the farm size already entered on the
 * form. It is an approximation of where the farm is and how big it is - not its
 * real shape - and can be refined afterwards with "Draw on map".
 */
const FarmBoundaryCentre = ({
  points,
  onChange,
  liveFix,
  farmSizeSqMetres,
}: {
  points: BoundaryPoint[];
  onChange: (points: BoundaryPoint[]) => void;
  liveFix?: LiveFix | null;
  /** Farm size from the form in square metres, or null if not usable yet. */
  farmSizeSqMetres?: number | null;
}) => {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsSettings, setNeedsSettings] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const hasSize = !!farmSizeSqMetres && farmSizeSqMetres > 0;

  const handleMarkCentre = async () => {
    if (!hasSize || !farmSizeSqMetres) return;
    setError(null);
    setNeedsSettings(false);
    setNotice(null);
    setBusy(true);
    try {
      const fix = usableLiveFix(liveFix) ?? (await getFreshPosition());
      const corners = squareAroundPoint(
        { latitude: fix.latitude, longitude: fix.longitude },
        farmSizeSqMetres
      );
      onChange(corners.map((c) => ({ ...c })));

      const accuracyText =
        fix.accuracy != null ? ` (accuracy about ${Math.round(fix.accuracy)} m)` : "";
      setNotice(
        fix.accuracy != null && fix.accuracy > POOR_ACCURACY_M
          ? `Centre marked, but the GPS signal is weak${accuracyText}. For a better reading, move to open sky and mark it again.`
          : `Centre marked${accuracyText}. The farm is outlined as a square of about ${formatNumber(
              sqMetresToHectares(farmSizeSqMetres)
            )} ha around this spot.`
      );
    } catch (err) {
      const code = getLocationErrorCode(err);
      setError(LOCATION_ERROR_MESSAGES[code] ?? LOCATION_ERROR_MESSAGES.UNKNOWN);
      setNeedsSettings(
        code === "PERMISSION_DENIED" ||
          code === "APPROXIMATE_ONLY" ||
          code === "SERVICES_OFF"
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={{ gap: 10 }}>
      <AppText fontFamily="Regular" fontSize={12} color="formPlaceholderText">
        Can&apos;t walk the whole boundary? Stand in the middle of the farm and
        mark one point. We&apos;ll outline the farm as a square around it using
        the farm size you entered. It is an approximation, not the real shape.
        You can adjust the corners later with &quot;Draw on map&quot;.
      </AppText>

      {!hasSize ? (
        <AppText fontFamily="Medium" fontSize={12} color="error">
          Enter the farm size in hectares or acres (in the Size field above)
          first, so we know how big to make the outline.
        </AppText>
      ) : null}

      {hasSize && points.length > 0 ? (
        <AppText fontFamily="Regular" fontSize={12} color="formLabelText">
          Marking the centre replaces the outline you already have.
        </AppText>
      ) : null}

      <AppButton
        title={points.length > 0 ? "Mark the centre again" : "Mark farm centre here"}
        textColor="white"
        btnColor="buttonPrimary"
        height={44}
        fontSize={14}
        disabled={busy || !hasSize}
        loading={busy}
        onPress={handleMarkCentre}
      />

      <AccuracyHint
        accuracy={usableLiveFix(liveFix)?.accuracy}
        prefix="GPS right now"
      />

      {busy ? (
        <AppText fontFamily="Regular" fontSize={12} color="formLabelText">
          Getting a live GPS reading - stand still for a few seconds...
        </AppText>
      ) : null}

      {error ? (
        <View style={{ gap: 6 }}>
          <AppText fontFamily="Regular" fontSize={12} color="error">
            {error}
          </AppText>
          {needsSettings ? (
            <Pressable onPress={() => Linking.openSettings()} hitSlop={8}>
              <AppText fontFamily="SemiBold" fontSize={12} color="primary">
                Open phone settings
              </AppText>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      {notice ? (
        <AppText fontFamily="Regular" fontSize={12} color="formLabelText">
          {notice}
        </AppText>
      ) : null}

      {points.length > 0 ? (
        <AppButton
          title="Clear outline"
          textColor="textBold"
          btnColor="backgroundPrimary"
          borderWidth={1}
          borderColor="light"
          height={38}
          fontSize={13}
          onPress={() => {
            setNotice(null);
            onChange([]);
          }}
        />
      ) : null}
    </View>
  );
};

export default FarmBoundaryCentre;
