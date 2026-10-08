import React, { useRef, useState } from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import * as Location from "expo-location";
import MapView, {
  MapPressEvent,
  Marker,
  MarkerDragStartEndEvent,
  Polygon,
  Polyline,
  PROVIDER_DEFAULT,
  Region,
} from "react-native-maps";
import AppButton from "./appbutton";
import AppText from "./apptext";
import AccuracyHint from "./accuracyhint";
import { colors } from "@/constants/colors";
import {
  BoundaryPoint,
  LOCATION_ERROR_MESSAGES,
} from "./farmboundarycapture";
import {
  distanceInMetres,
  getFreshPosition,
  getLocationErrorCode,
  getQuickPosition,
  LiveFix,
  POOR_ACCURACY_M,
  usableLiveFix,
} from "@/utils/location";
import { hasSelfIntersection } from "@/utils/geometry";

/**
 * "Draw on map" mode for the farm boundary.
 *
 * Works on the same `points` array as the "Walk the boundary" mode
 * (farmboundarycapture.tsx), so the two can be mixed freely: walk a few
 * corners, switch here to tidy them up, or draw everything from the couch.
 *
 *  - Tap the map to drop a corner.
 *  - Touch and hold a corner, then drag, to move it.
 *  - Tap a corner to select it, then remove it.
 *  - "Add my location" drops a corner at the live GPS fix.
 *  - "Find me" just moves the map to where the person is standing.
 */

const GHANA_REGION: Region = {
  latitude: 7.9465,
  longitude: -1.0232,
  latitudeDelta: 6,
  longitudeDelta: 6,
};
const EDGE_PADDING = { top: 50, right: 50, bottom: 50, left: 50 };
const MAP_HEIGHT = 340;
const CLOSE_ZOOM_DELTA = 0.003; // roughly a 300 m wide view
// A tap right after touching a corner shouldn't also drop a new corner.
const PRESS_GUARD_MS = 400;
const SAME_SPOT_METRES = 3;

function regionFor(points: BoundaryPoint[]): Region {
  if (points.length === 0) return GHANA_REGION;
  const lats = points.map((p) => p.latitude);
  const lngs = points.map((p) => p.longitude);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: Math.max((maxLat - minLat) * 1.8, CLOSE_ZOOM_DELTA),
    longitudeDelta: Math.max((maxLng - minLng) * 1.8, CLOSE_ZOOM_DELTA),
  };
}

const FarmBoundaryDraw = ({
  points,
  onChange,
  liveFix,
}: {
  points: BoundaryPoint[];
  onChange: (points: BoundaryPoint[]) => void;
  /** Latest reading from the live GPS feed, when it is running. */
  liveFix?: LiveFix | null;
}) => {
  const mapRef = useRef<MapView>(null);
  const ignoreMapPressRef = useRef(false);

  // Only used for the very first frame; later movement is done through
  // mapRef so the map never snaps back while the person is panning.
  const [initialRegion] = useState<Region>(() => regionFor(points));
  const [isSatellite, setIsSatellite] = useState(true);
  const [showUser, setShowUser] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [busy, setBusy] = useState<"add" | "find" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [needsSettings, setNeedsSettings] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const selectedIndex =
    selected !== null && selected < points.length ? selected : null;
  const crossing = hasSelfIntersection(points);
  const shapeColor = crossing ? colors.error : colors.primary;

  const guardNextMapPress = () => {
    ignoreMapPressRef.current = true;
    setTimeout(() => {
      ignoreMapPressRef.current = false;
    }, PRESS_GUARD_MS);
  };

  const animateTo = (latitude: number, longitude: number) => {
    mapRef.current?.animateToRegion(
      {
        latitude,
        longitude,
        latitudeDelta: CLOSE_ZOOM_DELTA,
        longitudeDelta: CLOSE_ZOOM_DELTA,
      },
      500
    );
  };

  const reportLocationError = (err: unknown) => {
    const code = getLocationErrorCode(err);
    setError(LOCATION_ERROR_MESSAGES[code] ?? LOCATION_ERROR_MESSAGES.UNKNOWN);
    setNeedsSettings(
      code === "PERMISSION_DENIED" ||
        code === "APPROXIMATE_ONLY" ||
        code === "SERVICES_OFF"
    );
  };

  const resetMessages = () => {
    setError(null);
    setNeedsSettings(false);
    setNotice(null);
  };

  // --- Map ready: frame the existing shape, or find the person if we can ---
  const handleMapReady = async () => {
    if (points.length >= 2) {
      mapRef.current?.fitToCoordinates(points, {
        edgePadding: EDGE_PADDING,
        animated: false,
      });
      return;
    }
    if (points.length === 1) return;

    // No shape yet. Only move the map if location permission was ALREADY
    // granted - opening the map shouldn't throw a permission prompt.
    try {
      const permission = await Location.getForegroundPermissionsAsync();
      if (permission.status !== "granted") return;
      setShowUser(true);
      const last = await Location.getLastKnownPositionAsync();
      if (last) animateTo(last.coords.latitude, last.coords.longitude);
    } catch {
      /* staying on the default view is fine */
    }
  };

  // --- Drawing ---
  const handleMapPress = (event: MapPressEvent) => {
    if (ignoreMapPressRef.current) return;
    const { latitude, longitude } = event.nativeEvent.coordinate;
    resetMessages();
    setSelected(null);
    onChange([...points, { latitude, longitude }]);
  };

  const handleMarkerPress = (index: number) => {
    guardNextMapPress();
    resetMessages();
    setSelected(index);
  };

  const handleMarkerDragEnd = (index: number, event: MarkerDragStartEndEvent) => {
    guardNextMapPress();
    const { latitude, longitude } = event.nativeEvent.coordinate;
    // A dragged point is no longer a GPS reading, so drop its accuracy.
    onChange(
      points.map((p, i) => (i === index ? { latitude, longitude } : p))
    );
  };

  const handleRemoveSelected = () => {
    if (selectedIndex === null) return;
    onChange(points.filter((_, i) => i !== selectedIndex));
    setSelected(null);
  };

  const handleUndo = () => {
    resetMessages();
    setSelected(null);
    onChange(points.slice(0, -1));
  };

  const handleClear = () => {
    resetMessages();
    setSelected(null);
    onChange([]);
  };

  // --- GPS ---
  const handleFindMe = async () => {
    resetMessages();
    setBusy("find");
    try {
      const fix = usableLiveFix(liveFix) ?? (await getQuickPosition());
      setShowUser(true);
      animateTo(fix.latitude, fix.longitude);
    } catch (err) {
      reportLocationError(err);
    } finally {
      setBusy(null);
    }
  };

  const handleAddMyLocation = async () => {
    resetMessages();
    setBusy("add");
    try {
      // Same as the "Walk boundary" mode: the live feed's current reading if
      // there is one, otherwise a fresh, non-cached reading.
      const fix = usableLiveFix(liveFix) ?? (await getFreshPosition());
      const newPoint: BoundaryPoint = {
        latitude: fix.latitude,
        longitude: fix.longitude,
        ...(fix.accuracy != null ? { accuracy: fix.accuracy } : {}),
      };

      const previous = points[points.length - 1];
      const moved = previous ? distanceInMetres(previous, newPoint) : null;
      const accuracyText =
        fix.accuracy != null
          ? ` (accuracy about ${Math.round(fix.accuracy)} m)`
          : "";

      if (fix.accuracy != null && fix.accuracy > POOR_ACCURACY_M) {
        setNotice(
          `Point ${points.length + 1} added, but the GPS signal is weak${accuracyText}. Tap Undo, move to open sky and try again, or drag the point into place.`
        );
      } else if (moved != null && moved < SAME_SPOT_METRES) {
        setNotice(
          `Point ${points.length + 1} added${accuracyText}, but it is only ${Math.round(
            moved
          )} m from the previous point. Walk to the next corner first.`
        );
      } else {
        setNotice(`Point ${points.length + 1} added${accuracyText}.`);
      }

      setSelected(null);
      setShowUser(true);
      onChange([...points, newPoint]);
      animateTo(fix.latitude, fix.longitude);
    } catch (err) {
      reportLocationError(err);
    } finally {
      setBusy(null);
    }
  };

  const isBusy = busy !== null;

  return (
    <View style={{ gap: 10 }}>
      <AppText fontFamily="Regular" fontSize={12} color="formPlaceholderText">
        Tap the map to drop each corner of the farm. Touch and hold a corner,
        then drag, to move it. Tap a corner to select it. You need at least 3
        corners.
      </AppText>

      <View style={styles.mapWrap}>
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFill}
          provider={PROVIDER_DEFAULT}
          initialRegion={initialRegion}
          onMapReady={handleMapReady}
          onPress={handleMapPress}
          mapType={isSatellite ? "hybrid" : "standard"}
          showsUserLocation={showUser || liveFix != null}
          showsMyLocationButton={false}
          pitchEnabled={false}
          rotateEnabled={false}
          toolbarEnabled={false}
          showsCompass={false}
        >
          {points.length >= 3 ? (
            <Polygon
              coordinates={points}
              fillColor={shapeColor + "33"}
              strokeColor={shapeColor}
              strokeWidth={2}
            />
          ) : null}
          {points.length === 2 ? (
            <Polyline
              coordinates={points}
              strokeColor={shapeColor}
              strokeWidth={2}
            />
          ) : null}

          {points.map((p, i) => {
            const isSelected = i === selectedIndex;
            return (
              <Marker
                // Selection state is baked into the marker's snapshot (we keep
                // tracksViewChanges off for performance), so re-key on change.
                key={`${i}-${isSelected ? 1 : 0}`}
                coordinate={{ latitude: p.latitude, longitude: p.longitude }}
                anchor={{ x: 0.5, y: 0.5 }}
                draggable
                tracksViewChanges={false}
                onPress={() => handleMarkerPress(i)}
                onDragEnd={(event) => handleMarkerDragEnd(i, event)}
              >
                <View
                  style={[
                    styles.vertex,
                    { backgroundColor: shapeColor },
                    isSelected && styles.vertexSelected,
                  ]}
                >
                  <Text style={styles.vertexText}>{i + 1}</Text>
                </View>
              </Marker>
            );
          })}
        </MapView>

        <Pressable
          style={[styles.mapPill, { left: 10 }]}
          onPress={handleFindMe}
          disabled={isBusy}
          hitSlop={8}
        >
          <AppText fontFamily="SemiBold" fontSize={12} color="textBold">
            {busy === "find" ? "Finding..." : "Find me"}
          </AppText>
        </Pressable>
        <Pressable
          style={[styles.mapPill, { right: 10 }]}
          onPress={() => setIsSatellite((v) => !v)}
          hitSlop={8}
        >
          <AppText fontFamily="SemiBold" fontSize={12} color="textBold">
            {isSatellite ? "Map" : "Satellite"}
          </AppText>
        </Pressable>
      </View>

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

      {busy === "add" ? (
        <AppText fontFamily="Regular" fontSize={12} color="formLabelText">
          Getting a live GPS reading - stand still for a few seconds...
        </AppText>
      ) : null}

      {notice ? (
        <AppText fontFamily="Regular" fontSize={12} color="formLabelText">
          {notice}
        </AppText>
      ) : null}

      <AppButton
        title="Add my location as a point"
        textColor="white"
        btnColor="buttonPrimary"
        height={44}
        fontSize={14}
        disabled={isBusy}
        loading={busy === "add"}
        onPress={handleAddMyLocation}
      />
      <AccuracyHint
        accuracy={usableLiveFix(liveFix)?.accuracy}
        prefix="GPS right now"
      />
      {selectedIndex !== null && points[selectedIndex]?.accuracy != null ? (
        <AccuracyHint
          accuracy={points[selectedIndex].accuracy}
          prefix={`Point ${selectedIndex + 1} was marked`}
        />
      ) : null}

      {points.length > 0 ? (
        <View style={{ flexDirection: "row", gap: 10 }}>
          {selectedIndex !== null ? (
            <AppButton
              title={`Remove point ${selectedIndex + 1}`}
              textColor="error"
              btnColor="backgroundPrimary"
              borderWidth={1}
              borderColor="error"
              height={38}
              fontSize={13}
              style={{ flex: 1 }}
              onPress={handleRemoveSelected}
            />
          ) : null}
          <AppButton
            title="Undo"
            textColor="textBold"
            btnColor="backgroundPrimary"
            borderWidth={1}
            borderColor="light"
            height={38}
            fontSize={13}
            style={{ flex: 1 }}
            onPress={handleUndo}
          />
          <AppButton
            title="Clear"
            textColor="textBold"
            btnColor="backgroundPrimary"
            borderWidth={1}
            borderColor="light"
            height={38}
            fontSize={13}
            style={{ flex: 1 }}
            onPress={handleClear}
          />
        </View>
      ) : null}
    </View>
  );
};

export default FarmBoundaryDraw;

const styles = StyleSheet.create({
  mapWrap: {
    width: "100%",
    height: MAP_HEIGHT,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.light,
  },
  mapPill: {
    position: "absolute",
    top: 10,
    paddingHorizontal: 10,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.92)",
    justifyContent: "center",
    alignItems: "center",
  },
  vertex: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.white,
    justifyContent: "center",
    alignItems: "center",
  },
  vertexSelected: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 3,
    borderColor: colors.activeText,
  },
  vertexText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: "700",
  },
});
