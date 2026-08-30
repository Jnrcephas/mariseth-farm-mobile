import { HapticTab } from "@/components/ui/haptictab";
import { endpoints } from "@/constants/endpoints";
import { isIOS } from "@/constants/generalconstants";
import {
  useFetchQuery,
  usePaginatedInfiniteQuery,
} from "@/hooks/usefetchquery";
import { userStore } from "@/stores/userstore";
import { tabbarScreenOptions, tabScreenOptions } from "@/utils/layoutmethods";
import {
  canManageFarmersAndFarms,
  isAdminUser,
  isFieldOfficerExperience,
  isFieldOfficerUser,
  isLeadFarmerUser,
  isSmallholderUser,
  shouldShowFarmerHomeHeader,
  shouldShowFieldOfficerHomeHeader,
  shouldShowLeadFarmerHome,
} from "@/utils/userroles";
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
  const isFieldOfficer = isFieldOfficerUser(user);
  const showLeadFarmerHome = shouldShowLeadFarmerHome(user);
  const showFarmerHomeHeader = shouldShowFarmerHomeHeader(user);
  const showFieldOfficerHomeHeader = shouldShowFieldOfficerHomeHeader(user);
  // The backend doesn't issue a distinct field-officer credential - field
  // officers just log in with admin accounts - so admin and field officer
  // share one mobile experience: onboarding-focused Home cards, "My
  // Farmers" tab, and no Credits/My Farm/Finance (see isFieldOfficerExperience).
  const isFieldOfficerUI = isFieldOfficerExperience(user);
  // Field officers aren't farmers themselves - they have no farm/credit of
  // their own - so "My Farmers" (onboarding) is the only farm-management
  // surface that applies to them; Credits and My Farm assume farm ownership.
  const canManageFarmers = canManageFarmersAndFarms(user);
  const tabRoleOptions = {
    isAdmin,
    isLeaderFarmer,
    isSmallholder,
    isFieldOfficer,
    showLeadFarmerHome,
    showFarmerHomeHeader,
    showFieldOfficerHomeHeader,
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
    },
    // Own-farm products - doesn't apply to field officers/admins, who have
    // no farm of their own (see isFieldOfficerExperience above).
    { enabled: !isFieldOfficerUI }
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
    },
    // Field officers/admins get their farms list from the admin
    // farm-management endpoint instead (fetched separately in the Home and
    // My Farmers screens - see utils/farmdatasource.ts) - this lead-farmer
    // endpoint 403s for them.
    { enabled: !isFieldOfficerUI }
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
        options={{
          ...tabScreenOptions("Credits", tabRoleOptions),
          // Credits are tied to a farmer's own farm; the field-officer
          // experience (now including admin - see isFieldOfficerUI above)
          // doesn't apply here.
          ...(isFieldOfficerUI ? { href: null } : {}),
        }}
        // listeners={listener()}
      />
      <Tabs.Screen
        name="myfarm"
        options={{
          ...tabScreenOptions("My Farm", tabRoleOptions),
          // Same reasoning as Credits above - no farm of their own to show.
          ...(isFieldOfficerUI ? { href: null } : {}),
        }}
        // listeners={listener()}
      />
      <Tabs.Screen
        name="myfarmers"
        options={{
          ...tabScreenOptions("My Farmers", tabRoleOptions),
          ...(canManageFarmers ? {} : { href: null }),
        }}
        // listeners={listener()}
      />
      <Tabs.Screen
        name="finance"
        options={{
          ...tabScreenOptions("Finance", tabRoleOptions),
          // Admin credentials are now also used for field officers (see
          // isFieldOfficerUI), and Finance isn't part of that experience,
          // so this is unreachable for now. Left in place - rather than
          // deleted - for whenever a distinct back-office admin login
          // exists again.
          href: null,
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
