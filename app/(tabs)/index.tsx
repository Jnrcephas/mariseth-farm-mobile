import AppText from "@/components/ui/apptext";
import AdminHomeHeader from "@/components/ui/adminhomeheader";
import FarmerCard from "@/components/ui/farmercard";
import HomeActiveCreditCard from "@/components/ui/homeactivecreditcard";
import HomeHeroBackground from "@/components/ui/homeherobackground";
import HomeRecentItemCard from "@/components/ui/homerecentitemcard";
import QuickActionButton from "@/components/ui/quickactionbutton";
import SmallFarmerCard from "@/components/ui/smallfarmercard";
import WeatherCard from "@/components/ui/weathercard";
import { colors } from "@/constants/colors";
import { endpoints } from "@/constants/endpoints";
import { isIOS } from "@/constants/generalconstants";
import { usePaginatedInfiniteQuery } from "@/hooks/usefetchquery";
import { userStore } from "@/stores/userstore";
import {
  isAdminUser,
  isSmallholderUser,
  shouldShowLeadFarmerHome,
} from "@/utils/userroles";
import { router } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";

const formatCreditAmount = (amount?: string | number | null) => {
  if (amount === undefined || amount === null || amount === "") return "—";
  const numeric = Number(String(amount).replace(/,/g, ""));
  if (Number.isNaN(numeric)) return String(amount);
  return numeric.toLocaleString("en-GH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const Index = () => {
  const user = userStore((state) => state.user);
  const isAdmin = isAdminUser(user);
  const isSmallholder = isSmallholderUser(user);
  const isLeaderFarmer = shouldShowLeadFarmerHome(user);

  const { data, isLoading, isError, items } = usePaginatedInfiniteQuery<any>(
    endpoints.myFarmers,
    "smallholders",
    {
      page_size: 10,
      query: "",
    },
    { enabled: isLeaderFarmer }
  );

  const { items: creditHistoryItems } = usePaginatedInfiniteQuery<any>(
    endpoints.creditHistory,
    "credit-history-home",
    {
      page_size: 5,
      query: "",
    },
    { enabled: isSmallholder }
  );

  const farmerCount = isError
    ? 0
    : data?.pages?.[0]?.pagination?.total ?? items?.length ?? 0;

  const recentlyAddedFarmers =
    isLeaderFarmer && farmerCount > 0 ? items?.slice(0, 5) ?? [] : [];

  const recentlyAddedCredits =
    isSmallholder && creditHistoryItems.length > 0
      ? creditHistoryItems.slice(0, 5)
      : [];

  if (isAdmin) {
    return (
      <ScrollView
        style={styles.adminScreen}
        contentContainerStyle={styles.adminScrollContent}
      >
        <HomeHeroBackground>
          <AdminHomeHeader />
        </HomeHeroBackground>

        <View style={styles.adminWeatherSection}>
          <WeatherCard variant="hero" />
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.backgroundPrimary }}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.homeSection}>
        <WeatherCard variant={isSmallholder ? "home" : "default"} />

        <View style={styles.quickActionsBlock}>
          <AppText fontFamily="SemiBold" fontSize={16} color="black">
            Quick Actions
          </AppText>
          <View
            style={[
              styles.quickActionsContainer,
              isSmallholder && styles.quickActionsContainerSingle,
            ]}
          >
            <QuickActionButton
              type="credit"
              flex={isSmallholder ? undefined : 1}
              width={isSmallholder ? "100%" : undefined}
            />
            {isLeaderFarmer ? <QuickActionButton type="farmer" /> : null}
          </View>
        </View>
      </View>

      <View style={styles.cardsSection}>
        {isLeaderFarmer ? (
          <FarmerCard
            type="big"
            onPress={() => router.navigate("/myfarmers")}
            isLoading={isLoading}
            count={isError ? 0 : farmerCount}
          />
        ) : null}

        <HomeActiveCreditCard />
      </View>

      {recentlyAddedFarmers.length > 0 ? (
        <View style={styles.recentlyAddedSection}>
          <AppText fontFamily="SemiBold" fontSize={16} color="black">
            Recently Added
          </AppText>

          <View style={styles.recentlyAddedList}>
            {recentlyAddedFarmers.map((item) => (
              <SmallFarmerCard
                key={item.id}
                item={item}
                showNewBadge
                avatarSize={40}
              />
            ))}
          </View>
        </View>
      ) : null}

      {recentlyAddedCredits.length > 0 ? (
        <View style={styles.recentlyAddedSection}>
          <AppText fontFamily="SemiBold" fontSize={16} color="black">
            Recently Added
          </AppText>

          <View style={styles.recentlyAddedList}>
            {recentlyAddedCredits.map((item, index) => (
              <HomeRecentItemCard
                key={item.id ?? `${item.credit_id}-${index}`}
                title={item?.input_credit ?? "Credit Application"}
                subtitle={[
                  item?.credit_id,
                  item?.credit_amount
                    ? `GHC ${formatCreditAmount(item.credit_amount)}`
                    : null,
                ]
                  .filter(Boolean)
                  .join(" · ")}
                showNewBadge={index < 5}
                onPress={() => router.navigate("/credits")}
              />
            ))}
          </View>
        </View>
      ) : null}
    </ScrollView>
  );
};

export default Index;

const styles = StyleSheet.create({
  adminScreen: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
  adminScrollContent: {
    paddingBottom: isIOS ? "30%" : "20%",
  },
  adminWeatherSection: {
    marginTop: -100,
    paddingHorizontal: 16,
  },
  scrollContent: {
    gap: 32,
    paddingTop: 4,
    paddingBottom: isIOS ? "30%" : "20%",
  },
  homeSection: {
    paddingHorizontal: 16,
    gap: 32,
  },
  quickActionsBlock: {
    gap: 12,
  },
  cardsSection: {
    gap: 32,
  },
  quickActionsContainer: {
    flexDirection: "row",
    width: "100%",
    gap: 18,
  },
  quickActionsContainerSingle: {
    gap: 0,
  },
  recentlyAddedSection: {
    paddingHorizontal: 16,
    gap: 12,
  },
  recentlyAddedList: {
    borderTopWidth: 1,
    borderTopColor: colors.light,
  },
});
