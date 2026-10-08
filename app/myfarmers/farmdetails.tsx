import AppText from "@/components/ui/apptext";
import FarmDetails from "@/components/ui/farmdetails";
import FarmProducts from "@/components/ui/farmproducts";
import Geofencing from "@/components/ui/geofencing";
import InfoCard from "@/components/ui/infocard";
import {
  SegmentedContentPages,
  SegmentedTabBar,
} from "@/components/ui/segmentedview";
import SoilAirQuality from "@/components/ui/soilairquality";
import { colors } from "@/constants/colors";
import { isIOS } from "@/constants/generalconstants";
import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import { usePaginatedInfiniteQuery } from "@/hooks/usefetchquery";
import { useUniversalStore } from "@/stores/useuniversalstore";
import { userStore } from "@/stores/userstore";
import { SegmentedControlValue } from "@/types/universal";
import { dataDecoder, dataEncoder } from "@/utils/commonmethods";
import { getFarmListSource } from "@/utils/farmdatasource";
import { canManageFarmersAndFarms } from "@/utils/userroles";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

/**
 * A single farm, opened by tapping a farm card. The farm equivalent of
 * farmerdetails.tsx, and it reuses the exact tabs the "My Farm" tab shows
 * (details, products, soil & air, geofence) - just fed the tapped farm instead
 * of the signed-in farmer's own.
 */

const TAB_OPTIONS: SegmentedControlValue<"farmDetails">[] = [
  "Farm Details",
  "Farm Products",
  "Soil & Air Quality",
  "Geofencing",
];

const TAB_LABELS: Record<string, string> = {
  "Farm Details": "Details",
  "Farm Products": "Products",
  "Soil & Air Quality": "Soil & Air",
  Geofencing: "Geofence",
};

const FarmDetailsScreen = () => {
  const params = useLocalSearchParams<{ data: string }>();
  // The route param is a snapshot from when the card was tapped.
  const routeFarm: any = dataDecoder(params?.data);
  const user = userStore((state) => state.user);
  const setSegmentedOption = useUniversalStore(
    (state) => state.setSegmentedOption
  );

  // Always open on the first tab, not wherever the last farm was left.
  useEffect(() => {
    setSegmentedOption("farmDetails", "Farm Details");
  }, [routeFarm?.id, setSegmentedOption]);

  // After an edit the farm lists are refetched. Prefer the fresh copy from
  // that list so this screen shows the saved values instead of the snapshot.
  const { endpoint, queryKey } = getFarmListSource(user);
  const { items: allFarms } = usePaginatedInfiniteQuery<any>(
    endpoint,
    queryKey,
    { page_size: 50, query: "" }
  );
  const liveFarm = useMemo(
    () => allFarms?.find((farm: any) => farm?.id === routeFarm?.id),
    [allFarms, routeFarm?.id]
  );
  const farm = { ...routeFarm, ...liveFarm };

  // Same rule as the farmer list: anyone who can manage farmers and farms
  // (lead farmers, field officers, admins) may edit what they can see here.
  const canEdit = canManageFarmersAndFarms(user) && !!farm?.id;
  const farmerId = farm?.farmer?.id;
  const handleEdit = canEdit
    ? () =>
        router.navigate(
          `/myfarm/editfarmdetails?data=${dataEncoder(farm)}${
            farmerId ? `&farmerId=${farmerId}` : ""
          }`
        )
    : undefined;

  const farmSubtitle = [farm?.farm_id, farm?.district?.name, farm?.region?.code]
    .filter(Boolean)
    .join(" · ");

  const farmer = farm?.farmer;
  const farmerName = [farmer?.first_name, farmer?.last_name, farmer?.other_names]
    .filter(Boolean)
    .join(" ");
  const farmerInfo = farmerName
    ? {
        headerTitle: "Farmer",
        headerIcon: icons.user,
        information: [
          { key: "Name", value: farmerName },
          {
            key: "Contact Number",
            value: farmer?.phone_number ? `+${farmer.phone_number}` : "-",
          },
        ],
      }
    : null;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.backgroundPrimary }}
      contentContainerStyle={[
        styles.scrollContent,
        { paddingBottom: isIOS ? "30%" : "20%" },
      ]}
    >
      <SegmentedTabBar
        storeKey="farmDetails"
        options={TAB_OPTIONS}
        labelOverrides={TAB_LABELS}
        style={styles.tabBarWrapper}
      />

      <View style={styles.heroSection}>
        <View style={{ position: "relative" }}>
          <Image
            source={images.farmHeroImage}
            style={styles.farmHeroImage}
            contentFit="cover"
          />
          <View style={styles.farmTitleOverlayBottom}>
            <AppText fontFamily="Bold" fontSize={20} color="white">
              {farm?.name}
            </AppText>
            {farmSubtitle ? (
              <AppText fontFamily="SemiBold" fontSize={16} color="white">
                {farmSubtitle}
              </AppText>
            ) : null}
          </View>
        </View>
      </View>

      {farmerInfo ? (
        <View style={styles.heroSection}>
          <InfoCard headerVisibility={true} info={farmerInfo} />
        </View>
      ) : null}

      <SegmentedContentPages storeKey="farmDetails" options={TAB_OPTIONS}>
        <FarmDetails item={farm} canEdit={canEdit} onEdit={handleEdit} />
        <FarmProducts products={farm} canEdit={canEdit} onEdit={handleEdit} />
        <SoilAirQuality farmId={farm?.id} />
        <Geofencing farm={farm} canEdit={canEdit} onEdit={handleEdit} />
      </SegmentedContentPages>
    </ScrollView>
  );
};

export default FarmDetailsScreen;

const styles = StyleSheet.create({
  scrollContent: {
    gap: 32,
    paddingTop: 4,
  },
  tabBarWrapper: {
    marginTop: 16,
  },
  heroSection: {
    paddingHorizontal: 16,
  },
  farmHeroImage: {
    width: "100%",
    height: 220,
    borderRadius: 16,
  },
  farmTitleOverlayBottom: {
    position: "absolute",
    left: 20,
    bottom: 16,
    right: 16,
    gap: 3,
  },
});
