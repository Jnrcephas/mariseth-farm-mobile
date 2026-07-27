import { width } from "@/constants/generalconstants";
import React from "react";
import { StyleSheet, View } from "react-native";
import AppText from "./apptext";
import { colors } from "@/constants/colors";

// NOTE: There is no Soil & Air Quality endpoint wired up yet (nothing
// like "soil" or "air-quality" in constants/endpoints.ts). Per SRD section
// 4.2.2 (Soil & Air Quality Dashboard, sourced from the Google Soil & Air
// Quality API) and the mobile screens table (8.3: "Current air quality
// index and soil quality data from Google API, mini trend chart,
// recommendation card if values are out of range"), this uses
// illustrative placeholder data so the screen is ready to receive real
// data. SWAP OUT soilAirQualityData for a real useFetchQuery hook once an
// endpoint exists - search "soilAirQualityData" to find this again.
const soilAirQualityData = {
  airQualityIndex: 62,
  airQualityLabel: "Moderate",
  soilMoisture: 38,
  soilPh: 6.4,
  soilNitrogen: "Medium",
  lastUpdated: "22 Jul 2026, 9:00 AM",
  weeklyTrend: [48, 55, 60, 58, 65, 70, 62],
  isOutOfRange: true,
  recommendation:
    "Air quality has trended upward this week and soil moisture is slightly below optimal range for this crop stage. Consider irrigating in the next 24-48 hours and limiting outdoor field work during peak AQI hours.",
};

const aqiColor = (aqi: number) => {
  if (aqi <= 50) return colors.primary;
  if (aqi <= 100) return "#F59E0B";
  return colors.error;
};

const MetricPill = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => (
  <View style={styles.metricPill}>
    <AppText fontFamily="Regular" fontSize={12} color="formPlaceholderText">
      {label}
    </AppText>
    <AppText fontFamily="SemiBold" fontSize={15} color="textBold">
      {value}
    </AppText>
  </View>
);

const TrendChart = ({ data }: { data: number[] }) => {
  const max = Math.max(...data, 1);

  return (
    <View style={styles.trendRow}>
      {data.map((value, index) => (
        <View key={index} style={styles.trendBarWrap}>
          <View
            style={[
              styles.trendBar,
              {
                height: Math.max((value / max) * 64, 6),
                backgroundColor: aqiColor(value),
              },
            ]}
          />
        </View>
      ))}
    </View>
  );
};

const SoilAirQuality = () => {
  const data = soilAirQualityData;
  const color = aqiColor(data.airQualityIndex);

  return (
    <View style={{ width, paddingHorizontal: 16, gap: 16 }}>
      <View style={styles.aqiCard}>
        <View style={{ flex: 1 }}>
          <AppText fontFamily="Medium" fontSize={13} color="formPlaceholderText">
            Air Quality Index
          </AppText>
          <View style={styles.aqiValueRow}>
            <AppText fontFamily="Bold" fontSize={36} color="textBold">
              {data.airQualityIndex}
            </AppText>
            <View style={[styles.aqiBadge, { backgroundColor: color + "1A" }]}>
              <AppText fontFamily="SemiBold" fontSize={12} style={{ color }}>
                {data.airQualityLabel}
              </AppText>
            </View>
          </View>
          <AppText fontFamily="Regular" fontSize={11} color="formPlaceholderText">
            Updated {data.lastUpdated}
          </AppText>
        </View>
      </View>

      <View style={styles.metricsRow}>
        <MetricPill label="Soil Moisture" value={`${data.soilMoisture}%`} />
        <MetricPill label="Soil pH" value={`${data.soilPh}`} />
        <MetricPill label="Nitrogen" value={data.soilNitrogen} />
      </View>

      <View style={styles.trendSection}>
        <AppText fontFamily="SemiBold" fontSize={14} color="textBold">
          7-Day AQI Trend
        </AppText>
        <TrendChart data={data.weeklyTrend} />
      </View>

      {data.isOutOfRange ? (
        <View style={styles.recommendationCard}>
          <AppText fontFamily="SemiBold" fontSize={13} color="primary">
            Recommendation
          </AppText>
          <AppText
            fontFamily="Regular"
            fontSize={13}
            color="textBold"
            style={{ marginTop: 4, lineHeight: 19 }}
          >
            {data.recommendation}
          </AppText>
        </View>
      ) : null}
    </View>
  );
};

export default SoilAirQuality;

const styles = StyleSheet.create({
  aqiCard: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 12,
    backgroundColor: colors.backgroundTertiary,
  },
  aqiValueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 2,
  },
  aqiBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
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
  trendSection: {
    gap: 12,
  },
  trendRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: 74,
    gap: 8,
  },
  trendBarWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    height: 64,
  },
  trendBar: {
    width: "100%",
    borderRadius: 6,
  },
  recommendationCard: {
    padding: 14,
    borderRadius: 12,
    backgroundColor: colors.secondaryLight,
  },
});


