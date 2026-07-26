import * as Location from "expo-location";
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import AppButton from "./appbutton";
import AppText from "./apptext";
import { colors } from "@/constants/colors";

export type BoundaryPoint = { latitude: number; longitude: number };

// Converts captured points into the GeoJSON Polygon shape the backend
// expects on the farm creation/edit payload. GeoJSON coordinates are
// [lng, lat] - the OPPOSITE order from how we store/display them here.
export function pointsToGeoJSON(points: BoundaryPoint[]) {
  if (points.length < 3) return null;
  const ring = points.map((p) => [p.longitude, p.latitude] as [number, number]);
  ring.push(ring[0]); // a GeoJSON ring must start and end on the same point
  return { type: "Polygon" as const, coordinates: [ring] };
}

export function geoJSONToPoints(boundary?: {
  type: "Polygon";
  coordinates: [number, number][][];
} | null): BoundaryPoint[] {
  if (!boundary?.coordinates?.[0]) return [];
  const ring = boundary.coordinates[0];
  const isClosed =
    ring.length > 1 &&
    ring[0][0] === ring[ring.length - 1][0] &&
    ring[0][1] === ring[ring.length - 1][1];
  const openRing = isClosed ? ring.slice(0, -1) : ring;
  return openRing.map(([lng, lat]) => ({ latitude: lat, longitude: lng }));
}

const FarmBoundaryCapture = ({
  points,
  onChange,
}: {
  points: BoundaryPoint[];
  onChange: (points: BoundaryPoint[]) => void;
}) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  const handleMarkPoint = async () => {
    setPermissionError(null);
    setIsCapturing(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setPermissionError(
          "Location permission is needed to mark boundary points. Enable it in your phone's settings."
        );
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      onChange([
        ...points,
        {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        },
      ]);
    } catch {
      setPermissionError("Couldn't get your location. Make sure GPS is on and try again.");
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <View style={{ gap: 10 }}>
      <AppText fontFamily="Regular" fontSize={12} color="formPlaceholderText">
        Walk to each corner of the farm and tap &quot;Mark this point&quot; while standing there. Mark at least 3 points. Farms need a boundary set to receive weather data.
      </AppText>

      {points.length > 0 ? (
        <View style={styles.pointsList}>
          {points.map((pt, index) => (
            <View key={index} style={styles.pointRow}>
              <View style={styles.pointBadge}>
                <AppText fontFamily="SemiBold" fontSize={12} color="white">
                  {index + 1}
                </AppText>
              </View>
              <AppText fontFamily="Regular" fontSize={13} color="textBold">
                {pt.latitude.toFixed(6)}, {pt.longitude.toFixed(6)}
              </AppText>
            </View>
          ))}
        </View>
      ) : null}

      {permissionError ? (
        <AppText fontFamily="Regular" fontSize={12} color="error">
          {permissionError}
        </AppText>
      ) : null}

      <View style={{ flexDirection: "row", gap: 10 }}>
        <AppButton
          title="Mark this point"
          textColor="white"
          btnColor="buttonPrimary"
          height={44}
          fontSize={14}
          style={{ flex: 1 }}
          disabled={isCapturing}
          loading={isCapturing}
          onPress={handleMarkPoint}
        />
        {points.length > 0 ? (
          <AppButton
            title="Undo"
            textColor="textBold"
            btnColor="backgroundPrimary"
            borderWidth={1}
            borderColor="light"
            height={44}
            fontSize={14}
            onPress={() => onChange(points.slice(0, -1))}
          />
        ) : null}
      </View>

      <AppText fontFamily="Medium" fontSize={12} color="formPlaceholderText">
        {points.length} point{points.length !== 1 ? "s" : ""} marked
        {points.length > 0 && points.length < 3 ? " - mark at least 3 to form a boundary" : ""}
      </AppText>
    </View>
  );
};

export default FarmBoundaryCapture;

const styles = StyleSheet.create({
  pointsList: {
    borderWidth: 1,
    borderColor: colors.light,
    borderRadius: 10,
    padding: 12,
    gap: 8,
  },
  pointRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  pointBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
});
