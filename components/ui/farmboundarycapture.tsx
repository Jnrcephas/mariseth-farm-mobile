import * as Location from "expo-location";
import React, { useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { Image } from "expo-image";
import AppButton from "./appbutton";
import AppText from "./apptext";
import { colors } from "@/constants/colors";
import { icons } from "@/constants/icons";

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

// The backend returns `boundary` as `{}` (an empty object) rather than
// null/undefined for farms that have never had one drawn. A plain
// `!!farm.boundary` truthiness check treats `{}` as "has a boundary"
// since empty objects are truthy in JS - use this instead anywhere
// "is this farm's boundary actually configured?" matters.
export function hasValidBoundary(boundary?: {
  type?: string;
  coordinates?: [number, number][][];
} | null): boolean {
  return (
    !!boundary &&
    boundary.type === "Polygon" &&
    Array.isArray(boundary.coordinates?.[0]) &&
    (boundary.coordinates?.[0]?.length ?? 0) > 0
  );
}

// Accepts lines like "5.651200, -0.149850" (latitude then longitude,
// matching how points are stored/displayed here - not GeoJSON order).
// Skips lines that don't parse rather than failing the whole paste.
function parseBulkCoordinates(text: string): BoundaryPoint[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split(/[,\s]+/).map((p) => parseFloat(p));
      if (parts.length < 2 || parts.some((n) => Number.isNaN(n))) return null;
      const [latitude, longitude] = parts;
      if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) return null;
      return { latitude, longitude };
    })
    .filter((p): p is BoundaryPoint => p !== null);
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
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [pasteError, setPasteError] = useState<string | null>(null);

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

  const handleAddManualPoint = () => {
    // Start the new row from the last point (if any) so it's at least in
    // the right neighbourhood rather than defaulting to 0,0 in the ocean.
    const base = points.length > 0 ? points[points.length - 1] : { latitude: 0, longitude: 0 };
    onChange([...points, { ...base }]);
  };

  const handleUpdatePoint = (index: number, field: "latitude" | "longitude", raw: string) => {
    const num = parseFloat(raw);
    onChange(
      points.map((pt, i) => (i === index ? { ...pt, [field]: Number.isNaN(num) ? 0 : num } : pt))
    );
  };

  const handleRemovePoint = (index: number) => {
    onChange(points.filter((_, i) => i !== index));
  };

  const handleApplyPaste = () => {
    const parsed = parseBulkCoordinates(pasteText);
    if (parsed.length < 3) {
      setPasteError('Couldn\'t find at least 3 valid coordinate pairs. Use one "lat, lng" pair per line.');
      return;
    }
    onChange(parsed);
    setPasteText("");
    setPasteError(null);
    setPasteOpen(false);
  };

  return (
    <View style={{ gap: 10 }}>
      <AppText fontFamily="Regular" fontSize={12} color="formPlaceholderText">
        Walk to each corner of the farm and tap &quot;Mark this point&quot; while standing there, or enter coordinates directly below if you already have them. Mark at least 3 points. Farms need a boundary set to receive weather data.
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
              <TextInput
                value={String(pt.latitude)}
                onChangeText={(t) => handleUpdatePoint(index, "latitude", t)}
                keyboardType="numbers-and-punctuation"
                placeholder="Latitude"
                style={styles.coordInput}
              />
              <TextInput
                value={String(pt.longitude)}
                onChangeText={(t) => handleUpdatePoint(index, "longitude", t)}
                keyboardType="numbers-and-punctuation"
                placeholder="Longitude"
                style={styles.coordInput}
              />
              <Pressable onPress={() => handleRemovePoint(index)} hitSlop={8}>
                <Image source={icons.close} style={{ width: 14, height: 14 }} />
              </Pressable>
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

      <View style={{ flexDirection: "row", gap: 10 }}>
        <AppButton
          title="+ Add point manually"
          textColor="textBold"
          btnColor="backgroundPrimary"
          borderWidth={1}
          borderColor="light"
          height={38}
          fontSize={13}
          style={{ flex: 1 }}
          onPress={handleAddManualPoint}
        />
        <AppButton
          title="Paste list"
          textColor="textBold"
          btnColor="backgroundPrimary"
          borderWidth={1}
          borderColor="light"
          height={38}
          fontSize={13}
          style={{ flex: 1 }}
          onPress={() => setPasteOpen((v) => !v)}
        />
      </View>

      {pasteOpen ? (
        <View style={styles.pasteBox}>
          <AppText fontFamily="Regular" fontSize={12} color="formPlaceholderText" style={{ marginBottom: 6 }}>
            One point per line, as &quot;latitude, longitude&quot;. This replaces the current points.
          </AppText>
          <TextInput
            value={pasteText}
            onChangeText={setPasteText}
            multiline
            numberOfLines={4}
            placeholder={"5.651200, -0.149850\n5.651200, -0.149350\n5.650700, -0.149350"}
            style={styles.pasteInput}
          />
          {pasteError ? (
            <AppText fontFamily="Regular" fontSize={12} color="error" style={{ marginTop: 4 }}>
              {pasteError}
            </AppText>
          ) : null}
          <View style={{ flexDirection: "row", gap: 10, marginTop: 8 }}>
            <AppButton
              title="Cancel"
              textColor="textBold"
              btnColor="backgroundPrimary"
              borderWidth={1}
              borderColor="light"
              height={38}
              fontSize={13}
              style={{ flex: 1 }}
              onPress={() => {
                setPasteOpen(false);
                setPasteError(null);
              }}
            />
            <AppButton
              title="Apply"
              textColor="white"
              btnColor="buttonPrimary"
              height={38}
              fontSize={13}
              style={{ flex: 1 }}
              onPress={handleApplyPaste}
            />
          </View>
        </View>
      ) : null}

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
    gap: 10,
  },
  pointRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  pointBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  coordInput: {
    flex: 1,
    height: 34,
    borderWidth: 1,
    borderColor: colors.light,
    borderRadius: 8,
    paddingHorizontal: 8,
    fontSize: 12,
    color: colors.textBold,
  },
  pasteBox: {
    borderWidth: 1,
    borderColor: colors.light,
    borderRadius: 10,
    padding: 12,
  },
  pasteInput: {
    borderWidth: 1,
    borderColor: colors.light,
    borderRadius: 8,
    padding: 10,
    fontSize: 12,
    color: colors.textBold,
    textAlignVertical: "top",
    minHeight: 90,
  },
});