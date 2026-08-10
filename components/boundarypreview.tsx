import React from "react";
import { View } from "react-native";
import Svg, { Polygon, Circle } from "react-native-svg";
import { colors } from "@/constants/colors";
import { farmBoundary } from "@/types/farm";
import { geoJSONToPoints } from "./ui/farmboundarycapture";

// There's no `react-native-maps` (or any tile-based map lib) in this
// project - only `react-native-svg`. So this renders the boundary as a
// simple shape (lat/lng projected to a flat viewBox) rather than a real
// map with satellite/street tiles. Good enough to confirm "yes, this is
// the shape that got saved" at a glance; not a substitute for a real
// map if that's ever needed (would require expo install react-native-maps
// + a native rebuild, which isn't in scope here).
interface BoundaryPreviewProps {
  boundary?: farmBoundary | null;
  height?: number;
}

const VIEW_W = 300;
const PADDING = 24;

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

  return (
    <View style={{ width: "100%", height, borderRadius: 12, overflow: "hidden" }}>
      <Svg width="100%" height={height} viewBox={`0 0 ${VIEW_W} ${height}`}>
        <Polygon
          points={polygonPoints}
          fill={colors.primary + "26"}
          stroke={colors.primary}
          strokeWidth={2}
          strokeLinejoin="round"
        />
        {projected.map((p, i) => (
          <Circle key={i} cx={p.x} cy={p.y} r={3.5} fill={colors.primary} />
        ))}
      </Svg>
    </View>
  );
};

export default BoundaryPreview;