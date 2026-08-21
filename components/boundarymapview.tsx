import React, { useRef, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import MapView, { Polygon, Marker, PROVIDER_DEFAULT } from "react-native-maps";
import { colors } from "@/constants/colors";
import { farmBoundary } from "@/types/farm";
import { geoJSONToPoints } from "./ui/farmboundarycapture";
import AppText from "./ui/apptext";

interface BoundaryMapViewProps {
  boundary?: farmBoundary | null;
  height?: number;
}

const EDGE_PADDING = { top: 40, right: 40, bottom: 40, left: 40 };

const BoundaryMapView: React.FC<BoundaryMapViewProps> = ({
  boundary,
  height = 220,
}) => {
  const mapRef = useRef<MapView>(null);
  const [isSatellite, setIsSatellite] = useState(true);

  const points = geoJSONToPoints(boundary);
  if (points.length < 3) return null;

  const lats = points.map((p) => p.latitude);
  const lngs = points.map((p) => p.longitude);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  // Rough starting region - fitToCoordinates on map-ready does the real
  // framing (accounting for the view's actual pixel size), this initial
  // region just avoids a flash of the whole-world default zoom first.
  const initialRegion = {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: Math.max((maxLat - minLat) * 1.8, 0.003),
    longitudeDelta: Math.max((maxLng - minLng) * 1.8, 0.003),
  };

  const handleMapReady = () => {
    mapRef.current?.fitToCoordinates(points, {
      edgePadding: EDGE_PADDING,
      animated: false,
    });
  };

  return (
    <View style={{ width: "100%", height, borderRadius: 12, overflow: "hidden" }}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        provider={PROVIDER_DEFAULT}
        initialRegion={initialRegion}
        onMapReady={handleMapReady}
        mapType={isSatellite ? "hybrid" : "standard"}
        pitchEnabled={false}
        rotateEnabled={false}
        toolbarEnabled={false}
        showsCompass={false}
      >
        <Polygon
          coordinates={points}
          fillColor={colors.primary + "33"}
          strokeColor={colors.primary}
          strokeWidth={2}
        />
        {points.map((p, i) => (
          <Marker key={i} coordinate={p} anchor={{ x: 0.5, y: 0.5 }} tracksViewChanges={false}>
            <View style={styles.marker} />
          </Marker>
        ))}
      </MapView>

      <Pressable
        style={styles.mapTypeToggle}
        onPress={() => setIsSatellite((v) => !v)}
        hitSlop={8}
      >
        <AppText fontFamily="SemiBold" fontSize={12} color="textBold">
          {isSatellite ? "Map" : "Satellite"}
        </AppText>
      </Pressable>
    </View>
  );
};

export default BoundaryMapView;

const styles = StyleSheet.create({
  marker: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.white,
  },
  mapTypeToggle: {
    position: "absolute",
    top: 10,
    right: 10,
    paddingHorizontal: 10,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.92)",
    justifyContent: "center",
    alignItems: "center",
  },
});