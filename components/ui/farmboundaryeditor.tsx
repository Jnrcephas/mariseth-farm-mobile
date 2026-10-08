import React, { useState } from "react";
import { Platform, View } from "react-native";
import AppButton from "./appbutton";
import AppText from "./apptext";
import { SegmentedControl } from "./segmentedcontrol";
import FarmBoundaryCapture, { BoundaryPoint } from "./farmboundarycapture";
import FarmBoundaryDraw from "./farmboundarydraw";
import LiveGpsPanel from "./livegpspanel";
import { useLiveLocation } from "@/hooks/uselivelocation";
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
 * Two ways to build the same list of points, switchable at any time:
 *   - "Walk the boundary": stand at each corner and mark it with GPS
 *     (the original behaviour, unchanged - farmboundarycapture.tsx).
 *   - "Draw on map": tap / drag corners on a satellite map
 *     (farmboundarydraw.tsx).
 *
 * Both edit the `points` the parent passes in, so nothing is lost when
 * switching. The area / validity summary underneath applies to both.
 */

const WALK_MODE = "Walk boundary";
const DRAW_MODE = "Draw on map";
type Mode = typeof WALK_MODE | typeof DRAW_MODE;

// react-native-maps has no web implementation in this project's static web
// export, so web keeps the walk / type-in mode only.
const DRAW_SUPPORTED = Platform.OS !== "web";

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
  /** Mode shown first. Defaults to drawing on the map where supported. */
  defaultMode?: Mode;
}

const FarmBoundaryEditor: React.FC<FarmBoundaryEditorProps> = ({
  points,
  onChange,
  onUseArea,
  defaultMode = DRAW_SUPPORTED ? DRAW_MODE : WALK_MODE,
}) => {
  const [mode, setMode] = useState<Mode>(
    DRAW_SUPPORTED ? defaultMode : WALK_MODE
  );
  const [useAreaMessage, setUseAreaMessage] = useState<string | null>(null);
  // One live GPS feed for the whole section, shared by both modes. It only
  // runs while this section is on screen (and the app is in the foreground).
  const live = useLiveLocation();

  const crossing = hasSelfIntersection(points);
  const areaSqM = points.length >= 3 && !crossing ? polygonAreaSqMetres(points) : 0;
  const tooSmall = points.length >= 3 && !crossing && areaSqM < 1;
  const hasArea = areaSqM >= 1;

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
      {DRAW_SUPPORTED ? (
        <SegmentedControl
          options={[WALK_MODE, DRAW_MODE]}
          selectedOption={mode}
          onOptionPress={(option: Mode) => setMode(option)}
        />
      ) : null}

      <LiveGpsPanel live={live} />

      {mode === DRAW_MODE && DRAW_SUPPORTED ? (
        <FarmBoundaryDraw
          points={points}
          onChange={handleChange}
          liveFix={live.fix}
        />
      ) : (
        <FarmBoundaryCapture
          points={points}
          onChange={handleChange}
          liveFix={live.fix}
        />
      )}

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
              Mapped area: about {formatNumber(sqMetresToHectares(areaSqM))}{" "}
              hectares ({formatNumber(sqMetresToAcres(areaSqM))} acres)
            </AppText>
          ) : null}

          {hasArea && onUseArea ? (
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
