import { colors } from "@/constants/colors";
import { largeScreen, weatherBackgrounds } from "@/constants/generalconstants";
import { icons } from "@/constants/icons";
import { endpoints } from "@/constants/endpoints";
import { kelvinToCelsius, mpsToKph, useFarmWeather, useFetchQuery } from "@/hooks/usefetchquery";
import { userStore } from "@/stores/userstore";
import { getWeatherAssets } from "@/utils/commonmethods";
import { format } from "date-fns";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import AppText from "./apptext";

interface weatherCondition {
  icon: string;
  description: string;
  metric: string;
  marginBottom?: number;
}
const WeatherCondition: React.FC<weatherCondition> = ({
  icon,
  description,
  metric,
  marginBottom,
}) => {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        marginBottom: marginBottom,
      }}
    >
      <Image
        source={icon}
        style={{ height: 32, width: 32, marginRight: 5 }}
        contentFit="contain"
      />
      <View style={{ flexDirection: "column" }}>
        <AppText fontFamily="Bold" fontSize={13} color="white">
          {metric}
        </AppText>

        <AppText fontFamily="SemiBold" fontSize={13} color="white">
          {description}
        </AppText>
      </View>
    </View>
  );
};
interface WeatherCardProps {
  variant?: "default" | "hero" | "farm" | "home";
  farmId?: number | string;
  // When provided (e.g. from myfarm.tsx), these render as the card's
  // title in place of the user's village. This replaces the old
  // pattern of absolutely-positioning the farm name on top of the
  // card from outside - that collided with the icon/temperature since
  // this card's internal layout can change height (loading/error
  // states, variant differences) in ways an external overlay can't
  // account for.
  farmName?: string;
  farmSubtitle?: string;
}

const WeatherCard: React.FC<WeatherCardProps> = ({
  variant = "default",
  farmId: farmIdOverride,
  farmName,
  farmSubtitle,
}) => {
  const weatherIconSize = largeScreen ? 133 : 113;
  const { user } = userStore.getState();

  // Home tab doesn't have a farm in scope already, so fetch the user's
  // own farm here just to get its id. myfarm.tsx (variant="farm") already
  // has the farm loaded and passes farmId directly, so this is skipped
  // there via `enabled`.
  const { data: ownFarm } = useFetchQuery(endpoints.myFarm, "myfarm", {
    enabled: !farmIdOverride,
  });
  const farmId = farmIdOverride ?? ownFarm?.id;

  console.log("[WeatherCard] farmId resolution", {
    variant,
    farmIdOverride,
    ownFarmId: ownFarm?.id,
    resolvedFarmId: farmId,
  });

  const { data, isLoading, error } = useFarmWeather(farmId);
  const showWeatherFallback =
    (variant === "default" || variant === "home") && !!error;
  const showToolbar =
    variant === "hero" || variant === "farm" || variant === "home";

  if (isLoading) {
    return (
      <View
        style={[
          styles.weatherSkeletonPlaceholder,
          { backgroundColor: colors.skeletonPlaceholder },
        ]}
      />
    );
  }

  if (error && !showWeatherFallback) {
    return (
      <View
        style={[
          styles.weatherSkeletonPlaceholder,
          {
            backgroundColor: colors.skeletonPlaceholder,
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 24,
          },
        ]}
      >
        <AppText
          fontFamily="SemiBold"
          fontSize={14}
          color="textPrimary"
          style={{ textAlign: "center" }}
        >
          Weather data isn&apos;t available for this farm right now.
        </AppText>
      </View>
    );
  }

  const locationName = farmName || (user?.farmer?.village ?? "Your Farm");
  const temperature =
    data?.temp != null ? Math.round(kelvinToCelsius(data.temp)) : "--";
  const conditionText = data?.weather?.[0]?.description
    ? data.weather[0].description.replace(/\b\w/g, (c) => c.toUpperCase())
    : showWeatherFallback
      ? "Weather unavailable"
      : "Sunny";
  const windKph =
    data?.wind_speed != null ? Math.round(mpsToKph(data.wind_speed)) : "--";
  const pressureMb = data?.pressure ?? "--";
  const humidity = data?.humidity ?? "--";
  const cloudCover = data?.clouds ?? "--";
  const { icon: weatherIcon, gradient: weatherGradient } =
    getWeatherAssets(conditionText);
  const icon =
    showWeatherFallback &&
    (variant === "default" || variant === "home")
      ? icons.sunny
      : weatherIcon;
  const gradient =
    variant === "default" || variant === "home"
      ? weatherBackgrounds.sunny
      : weatherGradient;

  return (
    <LinearGradient
      colors={gradient?.colors as any}
      start={gradient.start}
      end={gradient.end}
      style={[
        styles.weatherContainer,
        variant === "hero" && styles.weatherContainerHero,
        variant === "farm" && styles.weatherContainerFarm,
      ]}
    >
      {!showToolbar ? (
        <View style={styles.weatherLocationOnly}>
          <AppText
            fontFamily="SemiBold"
            fontSize={16}
            color="white"
            style={{ textAlign: "center" }}
          >
            {locationName}
          </AppText>
          {farmSubtitle ? (
            <AppText
              fontFamily="Medium"
              fontSize={12}
              color="white"
              style={{ textAlign: "center", opacity: 0.85, marginTop: 2 }}
            >
              {farmSubtitle}
            </AppText>
          ) : null}
        </View>
      ) : (
        <View style={styles.weatherToolbar}>
          <Pressable style={styles.weatherToolbarButton}>
            <AppText fontFamily="SemiBold" fontSize={22} color="white">
              +
            </AppText>
          </Pressable>

          <View style={styles.weatherLocationContainer}>
            <AppText
              fontFamily="SemiBold"
              fontSize={16}
              color="white"
              style={{ textAlign: "center" }}
            >
              {locationName}
            </AppText>
            {farmSubtitle ? (
              <AppText
                fontFamily="Medium"
                fontSize={12}
                color="white"
                style={{ textAlign: "center", opacity: 0.85, marginTop: 2 }}
              >
                {farmSubtitle}
              </AppText>
            ) : null}
            <View style={styles.weatherDots}>
              <View style={[styles.weatherDot, styles.weatherDotActive]} />
              <View style={styles.weatherDot} />
              <View style={styles.weatherDot} />
            </View>
          </View>

          <Pressable style={styles.weatherToolbarButton}>
            <View style={styles.overflowMenu}>
              <View style={styles.overflowDot} />
              <View style={styles.overflowDot} />
              <View style={styles.overflowDot} />
            </View>
          </Pressable>
        </View>
      )}

      <View style={styles.weatherHeaderContainer}>
        <View style={styles.headerIconContainer}>
          <Image
            source={icon}
            style={{ height: weatherIconSize, width: weatherIconSize }}
          />
        </View>
        <View style={styles.weatherDateContainer}>
          <View style={styles.weatherDateRow}>
            <AppText fontFamily="SemiBold" fontSize={16} color="white">
              {format(new Date(), "EEEE")}
            </AppText>
            <View style={styles.weatherDateDivider} />
            <AppText fontFamily="SemiBold" fontSize={16} color="white">
              {format(new Date(), "MMM d")}
            </AppText>
          </View>
          <View style={styles.weatherTempContainer}>
            <AppText
              fontFamily="SemiBold"
              fontSize={largeScreen ? 70 : 60}
              color="white"
              style={{ textAlign: "center", verticalAlign: "middle" }}
            >
              {temperature}
            </AppText>
            <AppText
              fontFamily="SemiBold"
              fontSize={30}
              color="white"
              style={{
                verticalAlign: "middle",
                marginBottom: "15%",
              }}
            >
              °
            </AppText>
          </View>
          <AppText
            fontFamily="SemiBold"
            fontSize={16}
            color="white"
            style={{ textAlign: "center" }}
          >
            {conditionText}
          </AppText>
        </View>
      </View>
      <View style={styles.weatherMetricsContainer}>
        <View style={{ flexDirection: "column" }}>
          <WeatherCondition
            icon={icons.wind}
            description={"Wind"}
            metric={`${windKph} km/h`}
            marginBottom={20}
          />
          <WeatherCondition
            icon={icons.pressure}
            description={"Pressure"}
            metric={`${pressureMb} mbar`}
          />
        </View>

        <View style={{ flexDirection: "column" }}>
          <WeatherCondition
            icon={icons.rainn}
            description={"Cloud Cover"}
            metric={`${cloudCover}%`}
            marginBottom={20}
          />

          <WeatherCondition
            icon={icons.humidity}
            description={"Humidity"}
            metric={`${humidity}%`}
          />
        </View>
      </View>
    </LinearGradient>
  );
};

export default WeatherCard;

const styles = StyleSheet.create({
  weatherContainer: {
    width: "100%",
    flexDirection: "column",
    padding: 16,
    borderRadius: 16,
  },
  weatherContainerHero: {
    borderRadius: 30,
  },
  weatherContainerFarm: {
    borderRadius: 16,
  },
  weatherToolbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  weatherToolbarButton: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  weatherLocationContainer: {
    alignItems: "center",
    flex: 1,
  },
  weatherDots: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  weatherDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.white,
  },
  weatherDotActive: {
    backgroundColor: colors.white,
  },
  overflowMenu: {
    gap: 4,
    alignItems: "center",
  },
  overflowDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.white,
  },
  weatherHeaderContainer: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    paddingBottom: 21,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.5)",
  },
  weatherLocationOnly: {
    alignItems: "center",
    marginBottom: 24,
  },
  headerIconContainer: {
    flexDirection: "column",
    width: "48%",
    alignItems: "center",
    // backgroundColor: "red",
  },
  weatherDateContainer: {
    flexDirection: "column",
    width: "50%",
    alignItems: "center",
  },
  weatherDateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },
  weatherDateDivider: {
    width: 2,
    height: 19,
    backgroundColor: colors.white,
  },
  weatherTempContainer: {
    flexDirection: "row",
    //   marginVertical: 6,
    justifyContent: "center",
    //   backgroundColor: "blue",
  },
  weatherMetricsContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 21,
    gap: 40,
  },
  weatherSkeletonPlaceholder: {
    width: "100%",
    height: 344,
    borderRadius: 16,
  },
  alertBanner: {
    marginTop: 16,
    padding: 12,
    borderRadius: 10,
    backgroundColor: "rgba(220, 38, 38, 0.35)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
  },
  forecastRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.3)",
  },
  forecastDay: {
    alignItems: "center",
    gap: 4,
  },
  forecastIcon: {
    width: 28,
    height: 28,
  },
});