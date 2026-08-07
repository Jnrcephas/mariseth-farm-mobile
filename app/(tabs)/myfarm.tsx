import AppText from "@/components/ui/apptext";
import ErrorComponent from "@/components/ui/errorcomponent";
import FarmDetails from "@/components/ui/farmdetails";
import FarmProducts from "@/components/ui/farmproducts";
import Geofencing from "@/components/ui/geofencing";
import {
  SegmentedContentPages,
  SegmentedTabBar,
} from "@/components/ui/segmentedview";
import SoilAirQuality from "@/components/ui/soilairquality";
import SmallFarmerCard from "@/components/ui/smallfarmercard";
import MyFarmSP from "@/components/ui/skeletonplaceholders/myfarm";
import { colors } from "@/constants/colors";
import { endpoints } from "@/constants/endpoints";
import { icons } from "@/constants/icons";
import { isIOS, weatherBackgrounds } from "@/constants/generalconstants";
// ASSUMPTION: placeholder key - point this at whatever your real
// constants/images.ts exports for a farm/cornfield hero photo (or add
// the uploaded photo there under this name).
import { images } from "@/constants/images";
import { useFetchQuery, usePaginatedInfiniteQuery } from "@/hooks/usefetchquery";
import { useUniversalStore } from "@/stores/useuniversalstore";
import { userStore } from "@/stores/userstore";
import { SegmentedControlValue } from "@/types/universal";
import { isLeadFarmerUser, isSmallholderUser } from "@/utils/userroles";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useStore } from "zustand";

const TAB_OPTIONS: SegmentedControlValue<"myFarm">[] = [
  "Farm Details",
  "Farm Products",
  "Soil & Air Quality",
  "Geofencing",
];

const TAB_LABELS: Record<string, string> = {
  "Farm Details": "Details",
  "Farm Products": "Products",
  "Soil & Air Quality": "Soil & Air",
  "Geofencing": "Geofence",
};

// Each non-default tab gets its own hero "widget" - a gradient
// placeholder with an icon and short label - instead of the live
// weather card. Weather is Home-screen-only; showing it here read as
// live conditions for whatever tab was open, which wasn't the intent
// for Soil & Air Quality or Geofencing. Farm Details/Products fall
// through to the static farm photo below since they don't need either.
const WIDGET_HERO_CONFIG: Partial<
  Record<
    SegmentedControlValue<"myFarm">,
    { icon: keyof typeof icons; gradient: keyof typeof weatherBackgrounds; label: string }
  >
> = {
  "Soil & Air Quality": {
    icon: "farm",
    gradient: "thunderStorm",
    label: "Soil & air quality snapshot",
  },
  "Geofencing": {
    icon: "location",
    gradient: "cloudy",
    label: "Geofence map preview coming soon",
  },
};

const MyFarm = () => {
  const user = useStore(userStore, (state) => state.user);
  const isLeaderFarmer = isLeadFarmerUser(user);
  const isSmallholder = isSmallholderUser(user);

  const selectedTab = useUniversalStore(
    (state) => state.selectedSegmentedOption.myFarm
  );
  const widgetHero = WIDGET_HERO_CONFIG[selectedTab ?? TAB_OPTIONS[0]];

  const { data, isLoading, error, refetch } = useFetchQuery(
    endpoints.myFarm,
    "myfarm"
  );

  const {
    data: farmersData,
    isError: farmersError,
    items: farmerItems,
  } = usePaginatedInfiniteQuery<any>(
    endpoints.myFarmers,
    "smallholders",
    {
      page_size: 10,
      query: "",
    },
    { enabled: isLeaderFarmer }
  );

  const farmerCount = farmersError
    ? 0
    : farmersData?.pages?.[0]?.pagination?.total ?? farmerItems?.length ?? 0;

  const recentlyAddedFarmers =
    isLeaderFarmer && farmerCount > 0 ? farmerItems?.slice(0, 5) ?? [] : [];

  if (isLoading) return <MyFarmSP />;
  if (error) {
    const isEmpty = error.message?.detail === "No farm found for this user";
    const message =
      "We couldn't find any farm linked to your account. Please refresh or add a new farm to continue.";
    return (
      <ErrorComponent
        type={(error as any)?.problem}
        message={isEmpty ? message : (error as any)?.message?.detail}
        refetch={() => refetch()}
        {...(isEmpty ? { title: "No Farm Found", btnTitle: "Refresh" } : {})}
      />
    );
  }

  const farmSubtitle = [
    data?.farm_id,
    data?.district?.name,
    data?.region?.code,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.backgroundPrimary }}
      contentContainerStyle={[
        styles.scrollContent,
        { paddingBottom: isIOS ? "30%" : "20%" },
      ]}
    >
      <SegmentedTabBar
        storeKey="myFarm"
        options={TAB_OPTIONS}
        labelOverrides={TAB_LABELS}
        style={styles.tabBarWrapper}
      />

      <View
        style={[
          styles.heroSection,
          isSmallholder && styles.heroSectionSmallholder,
        ]}
      >
        {widgetHero ? (
          <View style={styles.weatherWrapper}>
            <LinearGradient
              colors={weatherBackgrounds[widgetHero.gradient].colors as any}
              start={weatherBackgrounds[widgetHero.gradient].start}
              end={weatherBackgrounds[widgetHero.gradient].end}
              style={styles.mapHeroPlaceholder}
            >
              <Image
                source={icons[widgetHero.icon]}
                style={{ width: 32, height: 32 }}
                tintColor={colors.white}
              />
              <AppText
                fontFamily="Medium"
                fontSize={13}
                color="white"
                style={{ marginTop: 8, textAlign: "center", opacity: 0.85 }}
              >
                {widgetHero.label}
              </AppText>
            </LinearGradient>
            <View style={styles.farmTitleOverlayBottom}>
              <AppText fontFamily="Bold" fontSize={20} color="white">
                {data?.name}
              </AppText>
              {farmSubtitle ? (
                <AppText fontFamily="SemiBold" fontSize={16} color="white">
                  {farmSubtitle}
                </AppText>
              ) : null}
            </View>
          </View>
        ) : (
          <View style={styles.weatherWrapper}>
            <Image
              source={images.farmHeroImage}
              style={styles.farmHeroImage}
              contentFit="cover"
            />
            <View style={styles.farmTitleOverlayBottom}>
              <AppText fontFamily="Bold" fontSize={20} color="white">
                {data?.name}
              </AppText>
              {farmSubtitle ? (
                <AppText fontFamily="SemiBold" fontSize={16} color="white">
                  {farmSubtitle}
                </AppText>
              ) : null}
            </View>
          </View>
        )}
      </View>

      <SegmentedContentPages storeKey="myFarm" options={TAB_OPTIONS}>
        <FarmDetails item={data} />
        <FarmProducts products={data} />
        <SoilAirQuality farmId={data?.id} />
        <Geofencing farm={data} />
      </SegmentedContentPages>

      {recentlyAddedFarmers.length > 0 ? (
        <View style={styles.recentlyAddedSection}>
          <AppText fontFamily="SemiBold" fontSize={16} color="black">
            Recently Added
          </AppText>
          <View style={styles.recentlyAddedList}>
            {recentlyAddedFarmers.map((item) => (
              <SmallFarmerCard key={item.id} item={item} showNewBadge />
            ))}
          </View>
        </View>
      ) : null}
    </ScrollView>
  );
};

export default MyFarm;

const styles = StyleSheet.create({
  scrollContent: {
    gap: 32,
    paddingTop: 4,
  },
  tabBarWrapper: {
    marginTop: 16,
  },
  heroSection: {
    paddingHorizontal: 16,
  },
  heroSectionSmallholder: {
    marginTop: 0,
  },
  weatherWrapper: {
    position: "relative",
  },
  farmHeroImage: {
    width: "100%",
    height: 220,
    borderRadius: 16,
  },
  mapHeroPlaceholder: {
    width: "100%",
    height: 220,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  farmTitleOverlayBottom: {
    position: "absolute",
    left: 20,
    bottom: 16,
    right: 16,
    gap: 3,
  },
  recentlyAddedSection: {
    paddingHorizontal: 16,
    gap: 12,
    marginTop: 12,
  },
  recentlyAddedList: {
    borderTopWidth: 1,
    borderTopColor: colors.light,
  },
});