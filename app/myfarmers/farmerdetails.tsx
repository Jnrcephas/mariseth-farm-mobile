import FarmCard from "@/components/ui/farmcard";
import FarmerCard from "@/components/ui/farmercard";
import FloatingButton from "@/components/ui/floatingbutton";
import InfoCard from "@/components/ui/infocard";
import AppText from "@/components/ui/apptext";
import { SegmentedScrollView } from "@/components/ui/segmentedview";
import { colors } from "@/constants/colors";
import { endpoints } from "@/constants/endpoints";
import { isIOS, width } from "@/constants/generalconstants";
import { icons } from "@/constants/icons";
import { usePaginatedInfiniteQuery } from "@/hooks/usefetchquery";
import { useUniversalStore } from "@/stores/useuniversalstore";
import { livestockKept } from "@/types/farm";
import { smallHolder } from "@/types/farmers";
import { dataDecoder, dataEncoder } from "@/utils/commonmethods";
import { differenceInDays, format, parseISO } from "date-fns";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

const isRecentlyAddedFarm = (farm: any) => {
  if (!farm?.date_created) return false;

  return differenceInDays(new Date(), parseISO(farm.date_created)) < 14;
};

const FarmerDetails = () => {
  const params = useLocalSearchParams<{ data: string }>();
  const data: smallHolder = dataDecoder(params?.data);
  const selectedOption = useUniversalStore(
    (state) => state.selectedSegmentedOption.myFarmerDetails
  );
  const setSegmentedOption = useUniversalStore(
    (state) => state.setSegmentedOption
  );
  const isFarmTabSelected = selectedOption === "Farm";

  const { items: allFarms } = usePaginatedInfiniteQuery<any>(
    endpoints.leadFarmersFarms,
    "leadfarmersfarms",
    {
      page_size: 50,
      query: "",
    }
  );

  const recentlyAddedFarms = useMemo(
    () =>
      allFarms
        .filter(
          (farm) =>
            farm?.farmer?.id === data?.id && isRecentlyAddedFarm(farm)
        )
        .slice(0, 5),
    [allFarms, data?.id]
  );

  const farmerPersonalInformation = {
    headerTitle: "Personal Information",
    headerIcon: icons.user,
    onEditPress: () => {},
    information: [
      {
        key: "Gender",
        value: (data?.gender === "m" ? "Male" : "Female") as string,
      },
      {
        key: "Date of Birth",
        value: data?.date_of_birth
          ? format(parseISO(data.date_of_birth), "do MMMM, yyyy")
          : "N/A",
      },
      { key: "National ID/Passport Number", value: data?.id_number || "N/A" },
      {
        key: "Contact Number",
        value: data?.phone_number ? `+${data.phone_number}` : "N/A",
      },
      { key: "Email", value: data?.email || "-" },
      { key: "Address", value: data?.address || "N/A" },
      { key: "Village/Community", value: data?.village || "N/A" },
      { key: "District", value: data?.district?.name || "N/A" },
      { key: "Country", value: data?.country || "N/A" },
      {
        key: "Do you provide training to other farmers?",
        value: data?.farm?.provide_training ? "Yes" : "No",
      },
    ],
  };

  const farmInformation = {
    headerTitle: "Farm Information",
    headerIcon: icons.user,
    onEditPress: () => {},
    information: [
      { key: "Farm Name", value: data?.farm?.name || "N/A" },
      {
        key: "Location",
        value: data?.farm?.location ? `GPS ${data.farm.location}` : "N/A",
      },
      { key: "District", value: data?.farm?.district?.name || "N/A" },
      {
        key: "Total Land Size",
        value: data?.farm?.size
          ? `${data.farm.size} ${data.farm.size_metric?.name ?? ""}`.trim()
          : "N/A",
      },
      { key: "Land Ownership", value: data?.farm?.land_ownership || "N/A" },
      {
        key: "Livestock Kept",
        value:
          data?.farm?.livestock
            ?.map((item: livestockKept) => item.product.name)
            .join(", ") || "N/A",
      },
    ],
  };

  return (
    <>
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.backgroundPrimary }}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.summarySection}>
          <FarmerCard
            type="small"
            item={data}
            onPress={() => setSegmentedOption("myFarmerDetails", "Farm")}
          />
        </View>

        <SegmentedScrollView
          storeKey="myFarmerDetails"
          options={["Personal", "Farm"]}
        >
          <View style={styles.segmentPanel}>
            <InfoCard headerVisibility={true} info={farmerPersonalInformation} />
          </View>

          <View style={styles.segmentPanel}>
            <InfoCard
              headerVisibility={true}
              previewLabel="Preview"
              info={farmInformation}
            />
          </View>
        </SegmentedScrollView>

        {isFarmTabSelected && recentlyAddedFarms.length > 0 ? (
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
      </ScrollView>

      {isFarmTabSelected ? (
        <FloatingButton
          icon={icons.location}
          onPress={() =>
            router.navigate(`/myfarmers/addfarm?data=${dataEncoder(data)}`)
          }
        />
      ) : null}
    </>
  );
};

export default FarmerDetails;

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: isIOS ? "30%" : "20%",
  },
  summarySection: {
    marginTop: 32,
    marginBottom: 32,
  },
  segmentPanel: {
    width: width,
    paddingHorizontal: 16,
  },
  recentlyAddedSection: {
    paddingHorizontal: 16,
    gap: 12,
    marginTop: 32,
  },
  recentlyAddedList: {
    width: "100%",
  },
});
