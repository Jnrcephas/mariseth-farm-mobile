import AppText from "@/components/ui/apptext";
import { colors } from "@/constants/colors";
import { isIOS } from "@/constants/generalconstants";
import { icons } from "@/constants/icons";
import { Image } from "expo-image";
import React from "react";
import { FlatList, StyleSheet, View } from "react-native";

// NOTE: There is no market-prices endpoint wired up yet (nothing like
// "market" or "prices" in constants/endpoints.ts). Per SRD section 4.3
// (USSD Market Price Inquiry) and the mobile screens table (8.3), this
// uses illustrative placeholder data so the screen is ready to receive
// real data. SWAP OUT marketPrices for a real useFetchQuery hook once a
// prices endpoint exists - search "marketPrices" to find this again.
type MarketPrice = {
  id: string;
  commodity: string;
  unit: string;
  price: number;
  change: "up" | "down" | "flat";
  lastUpdated: string;
};

const marketPrices: MarketPrice[] = [
  { id: "1", commodity: "Maize", unit: "kg", price: 2.5, change: "up", lastUpdated: "Today, 7:00 AM" },
  { id: "2", commodity: "Cassava", unit: "kg", price: 1.8, change: "flat", lastUpdated: "Today, 7:00 AM" },
  { id: "3", commodity: "Tomatoes", unit: "crate", price: 340, change: "down", lastUpdated: "Today, 7:00 AM" },
  { id: "4", commodity: "Rice (Paddy)", unit: "kg", price: 3.2, change: "up", lastUpdated: "Yesterday, 6:45 AM" },
  { id: "5", commodity: "Yam", unit: "tuber", price: 12.5, change: "flat", lastUpdated: "Yesterday, 6:45 AM" },
  { id: "6", commodity: "Groundnut", unit: "kg", price: 4.1, change: "up", lastUpdated: "20 Jul 2026" },
  { id: "7", commodity: "Plantain", unit: "bunch", price: 28, change: "down", lastUpdated: "20 Jul 2026" },
  { id: "8", commodity: "Onion", unit: "kg", price: 5.6, change: "flat", lastUpdated: "19 Jul 2026" },
];

const changeMeta = {
  up: { color: colors.primary, label: "▲" },
  down: { color: colors.error, label: "▼" },
  flat: { color: colors.formPlaceholderText, label: "—" },
};

const PriceRow = ({ item }: { item: MarketPrice }) => {
  const meta = changeMeta[item.change];

  return (
    <View style={styles.row}>
      <View style={styles.iconWrap}>
        <Image source={icons.bill} style={styles.icon} tintColor={colors.primary} />
      </View>

      <View style={styles.details}>
        <AppText fontFamily="Medium" fontSize={14} color="textBold">
          {item.commodity}
        </AppText>
        <AppText fontFamily="Regular" fontSize={12} color="formPlaceholderText">
          Updated: {item.lastUpdated}
        </AppText>
      </View>

      <View style={styles.priceWrap}>
        <AppText fontFamily="SemiBold" fontSize={14} color="textBold">
          GHS {item.price.toFixed(2)}
        </AppText>
        <View style={styles.changeRow}>
          <AppText fontFamily="Medium" fontSize={11} style={{ color: meta.color }}>
            {meta.label} per {item.unit}
          </AppText>
        </View>
      </View>
    </View>
  );
};

const MarketPrices = () => {
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

      <FlatList
        data={marketPrices}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PriceRow item={item} />}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: isIOS ? "20%" : "12%",
        }}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
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
  changeRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  separator: {
    height: 1,
    backgroundColor: colors.light,
  },
});
