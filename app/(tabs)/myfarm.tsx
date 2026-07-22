import AppText from "@/components/ui/apptext";
import ErrorComponent from "@/components/ui/errorcomponent";
import FarmDetails from "@/components/ui/farmdetails";
import FarmProducts from "@/components/ui/farmproducts";
import { SegmentedScrollView } from "@/components/ui/segmentedview";
import SmallFarmerCard from "@/components/ui/smallfarmercard";
import MyFarmSP from "@/components/ui/skeletonplaceholders/myfarm";
import WeatherCard from "@/components/ui/weathercard";
import { colors } from "@/constants/colors";
import { endpoints } from "@/constants/endpoints";
import { isIOS } from "@/constants/generalconstants";
import { useFetchQuery, usePaginatedInfiniteQuery } from "@/hooks/usefetchquery";
import { userStore } from "@/stores/userstore";
import { isLeadFarmerUser, isSmallholderUser } from "@/utils/userroles";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useStore } from "zustand";

const MyFarm = () => {
  const user = useStore(userStore, (state) => state.user);
  const isLeaderFarmer = isLeadFarmerUser(user);
  const isSmallholder = isSmallholderUser(user);

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

  const weatherLocation =
    data?.district?.name ?? user?.farmer?.village ?? "Accra";

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.backgroundPrimary }}
      contentContainerStyle={[
        styles.scrollContent,
        { paddingBottom: isIOS ? "30%" : "20%" },
      ]}
    >
      <View
        style={[
          styles.heroSection,
          isSmallholder && styles.heroSectionSmallholder,
        ]}
      >
        <View style={styles.weatherWrapper}>
          <WeatherCard variant="farm" location={weatherLocation} />
          <View style={styles.farmTitleOverlay}>
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
      </View>

      <SegmentedScrollView
        storeKey="myFarm"
        options={["Farm Details", "Farm Products"]}
      >
        <FarmDetails item={data} />
        <FarmProducts products={data} />
      </SegmentedScrollView>

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
  heroSection: {
    paddingHorizontal: 16,
    marginTop: 32,
  },
  heroSectionSmallholder: {
    marginTop: 0,
  },
  weatherWrapper: {
    position: "relative",
  },
  farmTitleOverlay: {
    position: "absolute",
    left: 25,
    top: 118,
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
