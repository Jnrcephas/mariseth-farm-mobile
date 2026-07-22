import { endpoints } from "@/constants/endpoints";
import { width } from "@/constants/generalconstants";
import { usePaginatedInfiniteQuery } from "@/hooks/usefetchquery";
import { differenceInDays, parseISO } from "date-fns";
import React, { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import AppText from "./apptext";
import CustomList from "./customlist";
import FarmCard from "./farmcard";

const isRecentlyAddedFarm = (farm: any) => {
  if (!farm?.date_created) return false;

  return differenceInDays(new Date(), parseISO(farm.date_created)) < 14;
};

const Farms = () => {
  const {
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    items,
    refetch,
    isRefetching,
  } = usePaginatedInfiniteQuery<any>(
    endpoints.leadFarmersFarms,
    "leadfarmersfarms",
    {
      page_size: 10,
      query: "",
    }
  );

  const hasFarms = (items?.length ?? 0) > 0;

  const recentlyAddedFarms = useMemo(
    () => (hasFarms ? items.filter(isRecentlyAddedFarm).slice(0, 5) : []),
    [hasFarms, items]
  );

  return (
    <View style={styles.container}>
      {hasFarms ? (
        <AppText
          fontFamily="SemiBold"
          fontSize={16}
          color="primary"
          style={styles.sectionTitle}
        >
          Farms
        </AppText>
      ) : null}

      <CustomList
        data={items}
        bounces={false}
        fetchNextPage={fetchNextPage}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        refetch={refetch}
        isRefetching={isRefetching}
        renderItem={({ item }: any) => <FarmCard item={item} />}
        type={"farms"}
        emptyVariant="inline"
        contentContainerStyle={
          hasFarms ? undefined : { minHeight: 220, flexGrow: 1 }
        }
      />

      {recentlyAddedFarms.length > 0 ? (
        <View style={styles.recentlyAddedSection}>
          <AppText fontFamily="SemiBold" fontSize={16} color="black">
            Recently Added
          </AppText>

          <View style={styles.recentlyAddedList}>
            {recentlyAddedFarms.map((item) => (
              <FarmCard
                key={item.id}
                item={item}
                variant="compact"
                showNewBadge
              />
            ))}
          </View>
        </View>
      ) : null}
    </View>
  );
};

export default Farms;

const styles = StyleSheet.create({
  container: {
    width: width,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    marginBottom: 7,
  },
  recentlyAddedSection: {
    gap: 12,
    marginTop: 12,
  },
  recentlyAddedList: {
    width: "100%",
  },
});
