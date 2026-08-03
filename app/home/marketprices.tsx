import AppText from "@/components/ui/apptext";
import { colors } from "@/constants/colors";
import { endpoints } from "@/constants/endpoints";
import { isIOS } from "@/constants/generalconstants";
import { icons } from "@/constants/icons";
import { usePaginatedInfiniteQuery } from "@/hooks/usefetchquery"; // adjust path to wherever this hook actually lives
import { Image } from "expo-image";
import React from "react";
import { ActivityIndicator, FlatList, StyleSheet, View } from "react-native";

// Product shape as returned by GET /api/v1/farm-management/product
// (same endpoint the web admin's Products screen uses). See sample
// response - price currently always comes back as "0.00" from the
// backend, so it's rendered as-is rather than hidden.
interface ProductCategory {
  id: number;
  name: string;
}

interface Metric {
  id: number;
  name: string;
}

interface Product {
  id: number;
  product_id: string;
  name: string;
  category: ProductCategory | null;
  weight: string | null;
  weight_metric: Metric | null;
  quantity: string | null;
  quantity_metric: Metric | null;
  type: string;
  season_status: "in" | "out" | string;
  status: string;
  last_updated: string;
  price: string;
}

const formatUpdatedDate = (value?: string) => {
  if (!value) return "-";
  const date = new Date(value);
  if (isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const PriceRow = ({ item }: { item: Product }) => {
  const unit = item.weight_metric?.name || item.quantity_metric?.name || "";
  const price = Number(item.price ?? 0);

  return (
    <View style={styles.row}>
      <View style={styles.iconWrap}>
        <Image source={icons.bill} style={styles.icon} tintColor={colors.primary} />
      </View>

      <View style={styles.details}>
        <AppText fontFamily="Medium" fontSize={14} color="textBold">
          {item.name}
        </AppText>
        <AppText fontFamily="Regular" fontSize={12} color="formPlaceholderText">
          Updated: {formatUpdatedDate(item.last_updated)}
        </AppText>
      </View>

      <View style={styles.priceWrap}>
        <AppText fontFamily="SemiBold" fontSize={14} color="textBold">
          GHS {price.toFixed(2)}
        </AppText>
        {unit ? (
          <AppText
            fontFamily="Medium"
            fontSize={11}
            style={{ color: colors.formPlaceholderText }}
          >
            per {unit}
          </AppText>
        ) : null}
      </View>
    </View>
  );
};

const MarketPrices = () => {
  const {
    items: products,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    error,
  } = usePaginatedInfiniteQuery<Product>(
    endpoints.products,
    "market-prices",
    { type: "crop", page_size: 10 }
  );

  React.useEffect(() => {
    if (error) {
      console.log("[MarketPrices] load error", {
        endpoint: endpoints.products,
        error,
      });
    }
  }, [error]);

  return (
    <View style={styles.screen}>
      <AppText
        fontFamily="Regular"
        fontSize={13}
        color="formPlaceholderText"
        style={styles.subtitle}
      >
        Latest commodity prices from your region
      </AppText>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <AppText fontFamily="Medium" fontSize={13} color="formPlaceholderText">
            Couldn't load market prices. Pull to try again.
          </AppText>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => <PriceRow item={item} />}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: isIOS ? "20%" : "12%",
          }}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          onEndReachedThreshold={0.4}
          onEndReached={() => {
            if (hasNextPage) fetchNextPage();
          }}
          ListFooterComponent={
            isFetchingNextPage ? (
              <View style={{ paddingVertical: 16 }}>
                <ActivityIndicator color={colors.primary} />
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.centered}>
              <AppText fontFamily="Medium" fontSize={13} color="formPlaceholderText">
                No commodity prices available yet.
              </AppText>
            </View>
          }
        />
      )}
    </View>
  );
};

export default MarketPrices;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
  subtitle: {
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  centered: {
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    gap: 12,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.secondaryLight,
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {
    width: 20,
    height: 20,
  },
  details: {
    flex: 1,
    gap: 2,
  },
  priceWrap: {
    alignItems: "flex-end",
    gap: 2,
  },
  separator: {
    height: 1,
    backgroundColor: colors.light,
  },
});