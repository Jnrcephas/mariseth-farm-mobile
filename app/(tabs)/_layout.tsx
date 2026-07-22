import { HapticTab } from "@/components/ui/haptictab";
import { endpoints } from "@/constants/endpoints";
import { isIOS } from "@/constants/generalconstants";
import {
  useFetchQuery,
  usePaginatedInfiniteQuery,
} from "@/hooks/usefetchquery";
import { userStore } from "@/stores/userstore";
import { tabbarScreenOptions, tabScreenOptions } from "@/utils/layoutmethods";
import { isAdminUser, isLeadFarmerUser, isSmallholderUser, shouldShowFarmerHomeHeader, shouldShowLeadFarmerHome } from "@/utils/userroles";
import { UseQueryOptions } from "@tanstack/react-query";
import { BlurView } from "expo-blur";
import { Tabs } from "expo-router";
import React from "react";
import { Platform, StyleSheet } from "react-native";
import { useStore } from "zustand";
// const handleTabPress = async () => {
//   await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
// };
export default function TabsLayout() {
  const user = useStore(userStore, (state) => state.user);

  const isAdmin = isAdminUser(user);
  const isLeaderFarmer = isLeadFarmerUser(user);
  const isSmallholder = isSmallholderUser(user);
  const showLeadFarmerHome = shouldShowLeadFarmerHome(user);
  const showFarmerHomeHeader = shouldShowFarmerHomeHeader(user);
  const tabRoleOptions = {
    isAdmin,
    isLeaderFarmer,
    isSmallholder,
    showLeadFarmerHome,
    showFarmerHomeHeader,
  };

  const regions = userStore((state) => state.regions);
  const { data } = useFetchQuery(endpoints.regions, "regions", {
    enabled: !regions?.length,
  } as UseQueryOptions);

  React.useEffect(() => {
    if (data?.results) {
      // console.log(JSON.stringify(data?.results));
      userStore.setState({ regions: data?.results });
    }
  }, [data]);

  const { data: userData } = useFetchQuery(endpoints.getMyFamer, "getprofile", {
    enabled: !!user?.access_token,
  } as UseQueryOptions);
  React.useEffect(() => {
    if (!userData) return;

    const currentUser = userStore.getState().user;
    if (
      currentUser?.id === userData?.id &&
      currentUser?.access_token === userData?.access_token
    ) {
      return;
    }

    userStore.setState({ user: userData });
  }, [userData]);

  const { items } = usePaginatedInfiniteQuery<any>(
    endpoints.customType,
    "custom-type",
    {
      page_size: 50,
      query: "",
    }
  );
  React.useEffect(() => {
    if (items) {
      userStore.setState({ metrics: items });
    }
  }, [items]);

  const { items: products } = usePaginatedInfiniteQuery<any>(
    endpoints.farmproducts,
    "farm-products",
    {
      page_size: 50,
      query: "",
    }
  );

  React.useEffect(() => {
    if (products) {
      // console.log(JSON.stringify(products));
      userStore.setState({ farmProducts: products });
    }
  }, [products]);

  const { items: farms } = usePaginatedInfiniteQuery<any>(
    endpoints.leadFarmersFarms,
    "leadfarmersfarms",
    {
      page_size: 10,
      query: "",
    }
  );

  React.useEffect(() => {
    if (farms) {
      // console.log(JSON.stringify(farms));
      userStore.setState({ farms: farms });
    }
  }, [farms]);

  const { items: inputCredits } = usePaginatedInfiniteQuery<any>(
    endpoints.inputCredits,
    "input-credits-list",
    {
      page_size: 50,
      query: "",
    }
  );
  React.useEffect(() => {
    if (inputCredits) {
      // console.log(inputCredits);
      userStore.setState({ inputCredits: inputCredits });
    }
  }, [inputCredits]);

  const { data: unreadData } = useFetchQuery(
    endpoints.unreadNotificationCount,
    "unread-notification-count",
    {
      enabled: !!user?.access_token,
      retry: false,
    } as UseQueryOptions
  );

  React.useEffect(() => {
    if (!unreadData) return;

    const count =
      typeof unreadData?.unread_count === "number"
        ? unreadData.unread_count
        : typeof unreadData?.count === "number"
          ? unreadData.count
          : null;

    if (count !== null && userStore.getState().unreadNotificationCount !== count) {
      userStore.setState({ unreadNotificationCount: count });
    }
  }, [unreadData]);

  // function listener() {
  //   return {
  //     tabPress: async (e: any) => {
  //       await handleTabPress();
  //       e.preventDefault();
  //     },
  //   };
  // }

  return (
    <Tabs
      initialRouteName="index"
      screenOptions={{
        ...tabbarScreenOptions(),
        animation: "none",
        tabBarButton: HapticTab,
        tabBarStyle: Platform.select({
          ios: { position: "absolute" },
          default: {},
        }),
        ...(isIOS
          ? {
              tabBarBackground: () =>
                isIOS && (
                  <BlurView
                    tint="systemChromeMaterialLight"
                    intensity={40}
                    style={StyleSheet.absoluteFill}
                  />
                ),
            }
          : {}),
      }}
    >
      <Tabs.Screen
        name="index"
        options={tabScreenOptions("Home", tabRoleOptions)}
        // listeners={listener()}
      />
      <Tabs.Screen
        name="credits"
        options={tabScreenOptions("Credits", tabRoleOptions)}
        // listeners={listener()}
      />
      <Tabs.Screen
        name="myfarm"
        options={tabScreenOptions("My Farm", tabRoleOptions)}
        // listeners={listener()}
      />
      <Tabs.Screen
        name="myfarmers"
        options={{
          ...tabScreenOptions("My Farmers", tabRoleOptions),
          ...(showLeadFarmerHome || isAdmin ? {} : { href: null }),
        }}
        // listeners={listener()}
      />
      <Tabs.Screen
        name="finance"
        options={{
          ...tabScreenOptions("Finance", tabRoleOptions),
          ...(isAdmin ? {} : { href: null }),
        }}
      />
      <Tabs.Screen
        name="more"
        options={tabScreenOptions("More", tabRoleOptions)}
        // listeners={listener()}
      />
    </Tabs>
  );
}
