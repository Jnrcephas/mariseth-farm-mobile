import { width } from "@/constants/generalconstants";
import { icons } from "@/constants/icons";
import { colors } from "@/constants/colors";
import { kelvinToCelsius, useFarmSoilQuality } from "@/hooks/usefetchquery";
import { format, parseISO } from "date-fns";
import { Image } from "expo-image";
import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import AppText from "./apptext";

// NOTE: there previously was no soil quality endpoint wired up here -
// this rendered illustrative Google-Air-Quality-API-shaped placeholder
// data (AQI, soil pH, nitrogen, a 7-day trend). That endpoint/shape
// doesn't exist on the backend. The real endpoint is
// GET api/v1/agro-monitoring/{farm_id}/soil_quality (same one the admin
// web app uses), keyed by farm id, no boundary required. It only
// returns soil moisture and topsoil/subsoil temperature - there's no
// AQI, pH, nitrogen, or trend data available, so that part of the UI is
// gone rather than shown with fake numbers.

interface SoilAirQualityProps {
  farmId?: number | string;
}

const MetricPill = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.metricPill}>
    <AppText fontFamily="Regular" fontSize={12} color="formPlaceholderText">
      {label}
    </AppText>
    <AppText fontFamily="SemiBold" fontSize={15} color="textBold">
      {value}
    </AppText>
  </View>
);

const SoilAirQuality: React.FC<SoilAirQualityProps> = ({ farmId }) => {
  console.log("[SoilAirQuality] received farmId prop", { farmId });

  const { data, isLoading, error } = useFarmSoilQuality(farmId);

  console.log("[SoilAirQuality] hook state", {
    farmId,
    isLoading,
    hasData: !!data,
    data,
    error,
  });

  if (isLoading) {
    return (
      <View style={[styles.messageCard, { width }]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.messageCard, { width }]}>
        <Image
          source={icons.location}
          style={{ width: 28, height: 28, marginBottom: 8 }}
          tintColor={colors.light}
        />
        <AppText
          fontFamily="SemiBold"
          fontSize={14}
          color="textBold"
          style={{ textAlign: "center" }}
        >
          No soil quality reading available for this farm yet.
        </AppText>
      </View>
    );
  }

  const moisturePercent =
    data?.moisture != null ? Math.round(data.moisture * 100) : null;
  const topsoilTemp =
    data?.t0 != null ? Math.round(kelvinToCelsius(data.t0)) : null;
  const subsoilTemp =
    data?.t10 != null ? Math.round(kelvinToCelsius(data.t10)) : null;
  const hasAnyReading =
    moisturePercent != null || topsoilTemp != null || subsoilTemp != null;

  if (!hasAnyReading) {
    return (
      <View style={[styles.messageCard, { width }]}>
        <Image
          source={icons.location}
          style={{ width: 28, height: 28, marginBottom: 8 }}
          tintColor={colors.light}
        />
        <AppText
          fontFamily="SemiBold"
          fontSize={14}
          color="textBold"
          style={{ textAlign: "center" }}
        >
          No soil quality reading available for this farm yet.
        </AppText>
      </View>
    );
  }

  const lastReading = data?.dt
    ? format(parseISO(data.dt), "do MMMM, yyyy - h:mm a")
    : null;

  return (
    <View style={{ width, paddingHorizontal: 16, gap: 16 }}>
      <View style={styles.metricsRow}>
        <MetricPill
          label="Soil Moisture"
          value={moisturePercent != null ? `${moisturePercent}%` : "--"}
        />
        <MetricPill
          label="Topsoil Temp"
          value={topsoilTemp != null ? `${topsoilTemp}°C` : "--"}
        />
        <MetricPill
          label="Subsoil Temp (10cm)"
          value={subsoilTemp != null ? `${subsoilTemp}°C` : "--"}
        />
      </View>

      {lastReading ? (
        <AppText fontFamily="Regular" fontSize={11} color="formPlaceholderText">
          Last reading {lastReading}
        </AppText>
      ) : null}
    </View>
  );
};

export default SoilAirQuality;

const styles = StyleSheet.create({
  messageCard: {
    paddingHorizontal: 16,
    paddingVertical: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  metricsRow: {
    flexDirection: "row",
    gap: 10,
  },
  metricPill: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.light,
    gap: 4,
  },
});