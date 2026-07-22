import { width } from "@/constants/generalconstants";
import React from "react";
import { View } from "react-native";
import AppText from "./apptext";
import CustomList from "./customlist";
import SmallFarmerCard from "./smallfarmercard";
interface smallFarmersProps {
  data: any;
  fetchNextPage: any;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  refetch: any;
  isRefetching: boolean;
}
const SmallFarmers: React.FC<smallFarmersProps> = ({
  data,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  refetch,
  isRefetching,
}) => {
  // const RenderFooter = () => {
  //   if (isFetchingNextPage) {
  //     return (
  //       <View style={{ padding: 16, alignItems: "center" }}>
  //         <ActivityIndicator size="small" color="#666" />
  //       </View>
  //     );
  //   }

  //   if (!hasNextPage && data?.length > 0) {
  //     return (
  //       <View style={{ padding: 16, alignItems: "center" }}>
  //         <AppText
  //           color="formPlaceholderText"
  //           fontFamily="Medium"
  //           fontSize={14}
  //         >
  //           No more items to load
  //         </AppText>
  //       </View>
  //     );
  //   }

  //   return null;
  // };
  const hasFarmers = (data?.length ?? 0) > 0;

  return (
    <View style={{ width: width, paddingHorizontal: 16 }}>
      {hasFarmers ? (
        <AppText
          fontFamily="SemiBold"
          fontSize={16}
          color="primary"
          style={{ marginBottom: 7 }}
        >
          Smallholder Farmers
        </AppText>
      ) : null}

      {/* <FlashList
        data={data}
        keyExtractor={(item, index) => index.toString()}
        onEndReachedThreshold={1}
        estimatedListSize={{ height, width }}
        removeClippedSubviews={true}
        getItemType={(item: any) => {
          return item?.id;
        }}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) fetchNextPage();
        }}
        renderItem={({ item }) => <SmallFarmerCard item={item} />}
        estimatedItemSize={200}
        ListFooterComponent={<RenderFooter />}
        refreshing={isRefetching}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            colors={[colors.primary]}
          />
        }
      /> */}

      <CustomList
        data={data}
        bounces={false}
        fetchNextPage={fetchNextPage}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        refetch={refetch}
        isRefetching={isRefetching}
        renderItem={({ item }: any) => (
          <SmallFarmerCard item={item} showNewBadge />
        )}
        type={"farmers"}
        emptyVariant="inline"
        contentContainerStyle={
          hasFarmers ? undefined : { minHeight: 220, flexGrow: 1 }
        }
      />
    </View>
  );
};

export default SmallFarmers;
