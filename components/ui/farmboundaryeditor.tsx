import React, { useEffect, useRef, useState } from "react";
import { Platform, StyleSheet, View } from "react-native";
import AppButton from "./appbutton";
import AppText from "./apptext";
import { SegmentedControl } from "./segmentedcontrol";
import FarmBoundaryCapture, { BoundaryPoint } from "./farmboundarycapture";
import FarmBoundaryCentre from "./farmboundarycentre";
import FarmBoundaryDraw from "./farmboundarydraw";
import LiveGpsPanel from "./livegpspanel";
import { colors } from "@/constants/colors";
import { useLiveLocation } from "@/hooks/uselivelocation";
import {
  BoundaryDraft,
  clearBoundaryDraft,
  loadBoundaryDraft,
  samePoints,
  saveBoundaryDraft,
} from "@/utils/boundarydraft";
import {
  formatNumber,
  hasSelfIntersection,
  polygonAreaSqMetres,
  sqMetresToAcres,
  sqMetresToHectares,
} from "@/utils/geometry";

/**
 * The farm-boundary section of the farm form.
 *
 * Three ways to build the same list of points, switchable at any time:
 *   - "Walk boundary": stand at each corner and mark it with GPS
 *     (farmboundarycapture.tsx).
 *   - "Draw on map": tap / drag corners on a satellite map
 *     (farmboundarydraw.tsx).
 *   - "Farm centre": mark ONE point in the middle of the farm; a square of the
 *     entered farm size is drawn around it (farmboundarycentre.tsx).
 *
 * All of them edit the `points` the parent passes in, so nothing is lost when
 * switching. The area / validity summary underneath applies to all of them.
 *
 * Progress is also backed up on the phone as points are marked (see
 * utils/boundarydraft.ts), so a closed app or locked phone mid-walk does not
 * lose the corners already marked.
 */

const WALK_MODE = "Walk boundary";
const DRAW_MODE = "Draw on map";
const CENTRE_MODE = "Farm centre";
type Mode = typeof WALK_MODE | typeof DRAW_MODE | typeof CENTRE_MODE;

// react-native-maps has no web implementation in this project's static web
// export, so web keeps the walk / type-in mode (and the centre point) only.
const DRAW_SUPPORTED = Platform.OS !== "web";
const MODE_OPTIONS = DRAW_SUPPORTED
  ? [WALK_MODE, DRAW_MODE, CENTRE_MODE]
  : [WALK_MODE, CENTRE_MODE];

interface FarmBoundaryEditorProps {
  points: BoundaryPoint[];
  onChange: (points: BoundaryPoint[]) => void;
  /**
   * Called when the person taps "Use as farm size", with the drawn area in
   * square metres. Return a short message to show them (e.g. "Farm size set
   * to 2.4 Hectares"), or null if nothing could be applied. When omitted
   * the button is not shown.
   */
  onUseArea?: (areaSqMetres: number) => string | null;
  /** Farm size from the form in square metres (null if not usable yet). */
  farmSizeSqMetres?: number | null;
  /**
   * Where to back the points up on the phone (see boundaryDraftKey). When
   * omitted nothing is saved or restored.
   */
  draftKey?: string;
  /** Mode shown first. Defaults to drawing on the map where supported. */
  defaultMode?: Mode;
}

const FarmBoundaryEditor: React.FC<FarmBoundaryEditorProps> = ({
  points,
  onChange,
  onUseArea,
  farmSizeSqMetres,
  draftKey,
  defaultMode = DRAW_SUPPORTED ? DRAW_MODE : WALK_MODE,
}) => {
  const [mode, setMode] = useState<Mode>(
    DRAW_SUPPORTED || defaultMode !== DRAW_MODE ? defaultMode : WALK_MODE
  );
  const [useAreaMessage, setUseAreaMessage] = useState<string | null>(null);
  // One live GPS feed for the whole section, shared by all modes. It only
  // runs while this section is on screen (and the app is in the foreground).
  const live = useLiveLocation();

  // --- Backup of unsaved points on the phone ---
  // What the form started with (nothing for a new farm, the saved boundary
  // when editing). Used so we only keep a backup that differs from it.
  const initialPointsRef = useRef<BoundaryPoint[]>(points);
  // A backup from an earlier visit that differs from what the form holds now.
  // Read synchronously on first render so the save effect below can't wipe
  // it before the person has chosen what to do.
  const [pendingDraft, setPendingDraft] = useState<BoundaryDraft | null>(() => {
    if (!draftKey) return null;
    const draft = loadBoundaryDraft(draftKey);
    if (!draft || draft.points.length === 0) return null;
    return samePoints(draft.points, points) ? null : draft;
  });

  useEffect(() => {
    if (!draftKey || pendingDraft) return;
    if (samePoints(points, initialPointsRef.current)) {
      clearBoundaryDraft(draftKey);
    } else {
      saveBoundaryDraft(draftKey, points);
    }
  }, [draftKey, pendingDraft, points]);

  const handleRestoreDraft = () => {
    if (!pendingDraft) return;
    onChange(pendingDraft.points);
    setPendingDraft(null);
  };

  const handleDiscardDraft = () => {
    if (draftKey) clearBoundaryDraft(draftKey);
    setPendingDraft(null);
  };

  // --- Area / validity ---
  const crossing = hasSelfIntersection(points);
  const areaSqM = points.length >= 3 && !crossing ? polygonAreaSqMetres(points) : 0;
  const tooSmall = points.length >= 3 && !crossing && areaSqM < 1;
  const hasArea = areaSqM >= 1;
  // In "Farm centre" mode the area IS the farm size the person typed in, so
  // offering to copy it back into the size field would be circular.
  const showUseArea = hasArea && !!onUseArea && mode !== CENTRE_MODE;

  const handleChange = (next: BoundaryPoint[]) => {
    setUseAreaMessage(null);
    onChange(next);
  };

  const handleUseArea = () => {
    if (!onUseArea) return;
    setUseAreaMessage(
      onUseArea(areaSqM) ??
        "Couldn't match a size unit (hectares or acres). Enter the size manually."
    );
  };

  return (
    <View style={{ gap: 12 }}>
      {pendingDraft ? (
        <View style={styles.draftCard}>
          <AppText fontFamily="SemiBold" fontSize={13} color="textBold">
            Unsaved boundary found
          </AppText>
          <AppText fontFamily="Regular" fontSize={12} color="formLabelText">
            This phone kept {pendingDraft.points.length}{" "}
            {pendingDraft.points.length === 1 ? "point" : "points"} you marked
            earlier ({new Date(pendingDraft.savedAt).toLocaleString()}) that
            were never saved to the farm.
          </AppText>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <AppButton
              title="Restore them"
              textColor="white"
              btnColor="buttonPrimary"
              height={38}
              fontSize={13}
              style={{ flex: 1 }}
              onPress={handleRestoreDraft}
            />
            <AppButton
              title="Discard"
              textColor="textBold"
              btnColor="backgroundPrimary"
              borderWidth={1}
              borderColor="light"
              height={38}
              fontSize={13}
              style={{ flex: 1 }}
              onPress={handleDiscardDraft}
            />
          </View>
        </View>
      ) : null}

      <SegmentedControl
        options={MODE_OPTIONS}
        selectedOption={mode}
        onOptionPress={(option: Mode) => setMode(option)}
      />

      <LiveGpsPanel live={live} />

      {mode === DRAW_MODE && DRAW_SUPPORTED ? (
        <FarmBoundaryDraw
          points={points}
          onChange={handleChange}
          liveFix={live.fix}
        />
      ) : mode === CENTRE_MODE ? (
        <FarmBoundaryCentre
          points={points}
          onChange={handleChange}
          liveFix={live.fix}
          farmSizeSqMetres={farmSizeSqMetres}
        />
      ) : (
        <FarmBoundaryCapture
          points={points}
          onChange={handleChange}
          liveFix={live.fix}
        />
      )}

      {draftKey && !pendingDraft && points.length > 0 ? (
        <AppText fontFamily="Regular" fontSize={11} color="formPlaceholderText">
          Your points are saved on this phone as you go, so you won&apos;t lose
          them if the app closes. Tap Save at the bottom to add them to the farm.
        </AppText>
      ) : null}

      {points.length >= 3 ? (
        <View style={{ gap: 8 }}>
          {crossing ? (
            <AppText fontFamily="Medium" fontSize={12} color="error">
              The boundary crosses over itself. Drag or remove a corner so the
              outline doesn&apos;t cross, or use Undo.
            </AppText>
          ) : null}

          {tooSmall ? (
            <AppText fontFamily="Medium" fontSize={12} color="error">
              These points are almost on top of each other, so there is no
              area. Spread the corners out to the real edges of the farm.
            </AppText>
          ) : null}

          {hasArea ? (
            <AppText fontFamily="Medium" fontSize={13} color="formLabelText">
              {mode === CENTRE_MODE ? "Outline area" : "Mapped area"}: about{" "}
              {formatNumber(sqMetresToHectares(areaSqM))} hectares (
              {formatNumber(sqMetresToAcres(areaSqM))} acres)
              {mode === CENTRE_MODE ? " - based on the farm size, not measured" : ""}
            </AppText>
          ) : null}

          {showUseArea ? (
            <AppButton
              title="Use mapped area as farm size"
              textColor="textBold"
              btnColor="backgroundPrimary"
              borderWidth={1}
              borderColor="light"
              height={38}
              fontSize={13}
              onPress={handleUseArea}
            />
          ) : null}

          {useAreaMessage ? (
            <AppText fontFamily="Regular" fontSize={12} color="formLabelText">
              {useAreaMessage}
            </AppText>
          ) : null}
        </View>
      ) : null}
    </View>
  );
};

export default FarmBoundaryEditor;

const styles = StyleSheet.create({
  draftCard: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.activeText,
    backgroundColor: colors.backgroundTertiary,
    gap: 8,
  },
});
