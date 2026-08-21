import React from "react";
import { View } from "react-native";
import Svg, { Polygon, Circle, Line, Text as SvgText } from "react-native-svg";
import { colors } from "@/constants/colors";
import { farmBoundary } from "@/types/farm";
import { geoJSONToPoints } from "./ui/farmboundarycapture";

// Reverted to the SVG renderer for both web AND native (see geofencing.tsx) -
// react-native-maps needs native map-provider config (Google Maps API keys
// on Android, etc.) that isn't reliably set up in every build, which made it
// a risk for a stakeholder demo. This has no native dependencies at all, so
// it always renders. boundarymapview.tsx is left in place in case a real
// tiled map is wanted again later once that config is sorted out.
interface BoundaryPreviewProps {
  boundary?: farmBoundary | null;
  height?: number;
}

const VIEW_W = 300;
const PADDING = 28;
const GRID_LINES = 4;

const BoundaryPreview: React.FC<BoundaryPreviewProps> = ({
  boundary,
  height = 160,
}) => {
  const points = geoJSONToPoints(boundary);
  if (points.length < 3) return null;

  const lats = points.map((p) => p.latitude);
  const lngs = points.map((p) => p.longitude);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  const latSpan = maxLat - minLat || 0.0001;
  const lngSpan = maxLng - minLng || 0.0001;

  // Longitude degrees are narrower than latitude degrees away from the
  // equator - correct by cos(latitude) so the shape isn't stretched.
  const avgLatRad = ((minLat + maxLat) / 2) * (Math.PI / 180);
  const lngCorrection = Math.max(Math.cos(avgLatRad), 0.15);

  const availW = VIEW_W - PADDING * 2;
  const availH = height - PADDING * 2;
  const correctedLngSpan = lngSpan * lngCorrection;

  const scale = Math.min(availW / correctedLngSpan, availH / latSpan);
  const drawnW = correctedLngSpan * scale;
  const drawnH = latSpan * scale;
  const offsetX = (VIEW_W - drawnW) / 2;
  const offsetY = (height - drawnH) / 2;

  const projected = points.map((p) => ({
    x: offsetX + (p.longitude - minLng) * lngCorrection * scale,
    // Latitude increases northward but SVG y increases downward, so flip.
    y: offsetY + (maxLat - p.latitude) * scale,
  }));

  const polygonPoints = projected.map((p) => `${p.x},${p.y}`).join(" ");

  // Centroid, for a small area/point-count label under the shape.
  const centroidX = projected.reduce((sum, p) => sum + p.x, 0) / projected.length;
  const centroidY = projected.reduce((sum, p) => sum + p.y, 0) / projected.length;

  const gridStepX = VIEW_W / GRID_LINES;
  const gridStepY = height / GRID_LINES;

  return (
    <View style={{ width: "100%", height, borderRadius: 12, overflow: "hidden", backgroundColor: colors.backgroundTertiary }}>
      <Svg width="100%" height={height} viewBox={`0 0 ${VIEW_W} ${height}`}>
        {/* Faint grid backdrop so the shape reads as "mapped" rather than
            floating on a blank background - a cheap stand-in for real
            map tiles without needing any tile provider. */}
        {Array.from({ length: GRID_LINES - 1 }).map((_, i) => (
          <Line
            key={`v${i}`}
            x1={gridStepX * (i + 1)}
            y1={0}
            x2={gridStepX * (i + 1)}
            y2={height}
            stroke={colors.light}
            strokeWidth={1}
          />
        ))}
        {Array.from({ length: GRID_LINES - 1 }).map((_, i) => (
          <Line
            key={`h${i}`}
            x1={0}
            y1={gridStepY * (i + 1)}
            x2={VIEW_W}
            y2={gridStepY * (i + 1)}
            stroke={colors.light}
            strokeWidth={1}
          />
        ))}

        <Polygon
          points={polygonPoints}
          fill={colors.primary + "26"}
          stroke={colors.primary}
          strokeWidth={2.5}
          strokeLinejoin="round"
        />

        {/* Connect each vertex back to the shape's centroid with a thin
            spoke - reads more like a surveyed plot than a bare outline. */}
        {projected.map((p, i) => (
          <Line
            key={`spoke${i}`}
            x1={centroidX}
            y1={centroidY}
            x2={p.x}
            y2={p.y}
            stroke={colors.primary}
            strokeWidth={0.75}
            strokeOpacity={0.35}
          />
        ))}

        {projected.map((p, i) => (
          <Circle key={i} cx={p.x} cy={p.y} r={5} fill={colors.white} stroke={colors.primary} strokeWidth={2.5} />
        ))}
        {projected.map((p, i) => (
          <SvgText
            key={`label${i}`}
            x={p.x}
            y={p.y - 10}
            fontSize={9}
            fontWeight="600"
            fill={colors.primary}
            textAnchor="middle"
          >
            {i + 1}
          </SvgText>
        ))}
      </Svg>
    </View>
  );
};

export default BoundaryPreview;