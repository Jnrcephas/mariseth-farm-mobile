import { colors } from "@/constants/colors";
import { height, width } from "@/constants/generalconstants";
import { ContentStyle, FlashList } from "@shopify/flash-list";
import React from "react";
import {
  ActivityIndicator,
  RefreshControl,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import AppText from "./apptext";
import ListEmptyComponent from "./listemptycomponent";
type types =
  | "farmers"
  | "crops"
  | "farms"
  | "credits"
  | "new_farmer"
  | "notifications";

interface customListprops<T> {
  data: T[];
  fetchNextPage: any;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  refetch: any;
  isRefetching: boolean;
  renderItem: any;
  type: types;
  contentContainerStyle?: ContentStyle;
  ListHeaderComponent?: React.ReactElement;
  style?: StyleProp<ViewStyle>;
  bounces?: boolean;
  emptyVariant?: "default" | "inline";
}
const CustomList: React.FC<customListprops<any>> = ({
  data,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  refetch,
  isRefetching,
  renderItem,
  type,
  contentContainerStyle,
  ListHeaderComponent,
  style,
  bounces = true,
  emptyVariant = "default",
}) => {
  const RenderFooter = ({ type }: { type: types }) => {
    const types = {
      farmers: "No more Farmers to load",
      farms: "No more Farms to load",
      credits: "No more Credits to load",
      crops: "No more Crops to load",
      new_farmer: "No more Farms to load",
      notifications: "No more Notifications to load",
    };
    if (isFetchingNextPage) {
      return (
        <View style={{ padding: 16, alignItems: "center" }}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      );
    }

    if (!hasNextPage && data?.length > 0) {
      return (
        <View style={{ padding: 16, alignItems: "center" }}>
          <AppText
            color="formPlaceholderText"
            fontFamily="Medium"
            fontSize={14}
          >
            {types[type]}
          </AppText>
        </View>
      );
    }

    return null;
  };

  return (
    <FlashList
      data={data}
      style={style}
      bounces={bounces}
      contentContainerStyle={contentContainerStyle}
      ListHeaderComponent={ListHeaderComponent}
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
      renderItem={renderItem}
      estimatedItemSize={100}
      ListFooterComponent={<RenderFooter type={type} />}
      refreshing={isRefetching}
      ListEmptyComponent={
        <ListEmptyComponent type={type} variant={emptyVariant} />
      }
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={refetch}
          colors={[colors.primary]}
          tintColor={colors.primary}
        />
      }
    />
  );
};

export default CustomList;

const styles = StyleSheet.create({});
