import ActiveCreditCard from "@/components/ui/activecreditcard";
import CreditHistoryCard from "@/components/ui/credithistorycard";
import CustomList from "@/components/ui/customlist";
import ErrorComponent from "@/components/ui/errorcomponent";
import FloatingButton from "@/components/ui/floatingbutton";
import SectionHeader from "@/components/ui/sectionheader";
import CreditsSP from "@/components/ui/skeletonplaceholders/credits";
import { colors } from "@/constants/colors";
import { endpoints } from "@/constants/endpoints";
import { isIOS } from "@/constants/generalconstants";
import { icons } from "@/constants/icons";
import { usePaginatedInfiniteQuery } from "@/hooks/usefetchquery";
import { userStore } from "@/stores/userstore";
import { isFieldOfficerExperience, isSmallholderUser } from "@/utils/userroles";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";

const Credits = () => {
  const user = userStore((state) => state.user);
  const isSmallholder = isSmallholderUser(user);
  // This tab is hidden from the tab bar for field officers/admins (see
  // href: null in app/(tabs)/_layout.tsx) since they have no credit history
  // of their own, but gate the fetch too - the endpoint 403s/500s for them
  // regardless of whether the tab bar entry is visible.
  const isFieldOfficer = isFieldOfficerExperience(user);

  const {
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    items,
    refetch,
    isRefetching,
    error,
  } = usePaginatedInfiniteQuery<any>(
    endpoints.creditHistory,
    "credit-history",
    {
      page_size: 10,
      query: "",
    },
    { enabled: !isFieldOfficer }
  );

  if (error) {
    return (
      <ErrorComponent
        type={(error as any)?.problem}
        refetch={() => refetch()}
      />
    );
  }
  if (isLoading) return <CreditsSP />;

  return (
    <>
      <View style={{ flex: 1, backgroundColor: colors.backgroundPrimary }}>
        <CustomList
          data={items}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: isIOS ? 100 : "10%",
          }}
          ListHeaderComponent={
            <>
              <ActiveCreditCard />
              <SectionHeader
                title={isSmallholder ? "Credit History" : "Credit Applications"}
                marginBottom={1}
                marginTop={32}
                titleColor="black"
                {...(isSmallholder && hasNextPage
                  ? {
                      linkTitle: "View all",
                      onLinkPress: () => fetchNextPage(),
                    }
                  : {})}
              />
            </>
          }
          fetchNextPage={fetchNextPage}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          refetch={refetch}
          isRefetching={isRefetching}
          renderItem={({ item }: any) => <CreditHistoryCard item={item} />}
          type={"credits"}
          emptyVariant="inline"
        />
      </View>

      <FloatingButton
        icon={icons.cardAdd}
        onPress={() => {
          router.navigate("/credits/applycredit");
        }}
      />
    </>
  );
};

export default Credits;

const styles = StyleSheet.create({});
