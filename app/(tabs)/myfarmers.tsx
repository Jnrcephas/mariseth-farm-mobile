import AppText from "@/components/ui/apptext";
import ErrorComponent from "@/components/ui/errorcomponent";
import FarmerCard from "@/components/ui/farmercard";
import Farms from "@/components/ui/farms";
import FloatingButton from "@/components/ui/floatingbutton";
import { SegmentedScrollView } from "@/components/ui/segmentedview";
import MyFarmersSP from "@/components/ui/skeletonplaceholders/myfarmers";
import SmallFarmerCard from "@/components/ui/smallfarmercard";
import SmallFarmers from "@/components/ui/smallfarmers";
import { colors } from "@/constants/colors";
import { endpoints } from "@/constants/endpoints";
import { isIOS } from "@/constants/generalconstants";
import { icons } from "@/constants/icons";
import { usePaginatedInfiniteQuery } from "@/hooks/usefetchquery";
import { useUniversalStore } from "@/stores/useuniversalstore";
import { router } from "expo-router";
import React, { useMemo } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

const MyFarmers = () => {
  const selectedOption = useUniversalStore(
    (state) => state.selectedSegmentedOption.myFarmers
  );
  const setSegmentedOption = useUniversalStore(
    (state) => state.setSegmentedOption
  );
  const options = {
    Farmers: {
      icon: icons.userAdd,
      action: () => {
        router.navigate(`/myfarmers/addfarmer?data=""`);
      },
    },
    Farms: {
      icon: icons.location,
      action: () => {
        router.navigate(`/myfarmers/addfarm?data=""`);
      },
    },
  };

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    items,
    refetch,
    isRefetching,
    error,
  } = usePaginatedInfiniteQuery<any>(endpoints.myFarmers, "smallholders", {
    page_size: 10,
    query: "",
  });

  const farmerCount = data?.pages?.[0]?.pagination?.total ?? items?.length ?? 0;
  const recentlyAddedFarmers = useMemo(
    () => (farmerCount > 0 ? items?.slice(0, 5) ?? [] : []),
    [farmerCount, items]
  );

  if (isLoading) return <MyFarmersSP />;

  if (error) {
    return (
      <ErrorComponent
        type={(error as any)?.problem}
        refetch={() => refetch()}
      />
    );
  }
  return (
    <>
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.backgroundPrimary }}
        contentContainerStyle={{ paddingBottom: isIOS ? "30%" : "20%" }}
      >
        <View style={styles.summarySection}>
          <FarmerCard
            type="big"
            item={items}
            count={farmerCount}
            onPress={() => setSegmentedOption("myFarmers", "Farmers")}
          />
        </View>

        <SegmentedScrollView
          storeKey="myFarmers"
          options={["Farmers", "Farms"]}
        >
          <SmallFarmers
            data={items}
            fetchNextPage={fetchNextPage}
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            refetch={refetch}
            isRefetching={isRefetching}
          />
          <Farms />
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

      <FloatingButton
        icon={options[selectedOption]?.icon}
        onPress={options[selectedOption]?.action}
      />
    </>
  );
};

export default MyFarmers;

const styles = StyleSheet.create({
  summarySection: {
    marginTop: 32,
    marginBottom: 32,
  },
  recentlyAddedSection: {
    paddingHorizontal: 16,
    gap: 12,
    marginTop: 32,
  },
  recentlyAddedList: {
    width: "100%",
  },
});
