import FarmCard from "@/components/ui/farmcard";
import FarmerCard from "@/components/ui/farmercard";
import FloatingButton from "@/components/ui/floatingbutton";
import InfoCard from "@/components/ui/infocard";
import AppText from "@/components/ui/apptext";
import { SegmentedScrollView } from "@/components/ui/segmentedview";
import { colors } from "@/constants/colors";
import { isIOS, width } from "@/constants/generalconstants";
import { icons } from "@/constants/icons";
import { usePaginatedInfiniteQuery } from "@/hooks/usefetchquery";
import { useUniversalStore } from "@/stores/useuniversalstore";
import { userStore } from "@/stores/userstore";
import { livestockKept } from "@/types/farm";
import { smallHolder } from "@/types/farmers";
import {
  EDUCATION_LEVEL_OPTIONS,
  MARITAL_STATUS_OPTIONS,
  NUMBER_OF_FARMS_API_KEY,
} from "@/constants/farmerform";
import { dataDecoder, dataEncoder } from "@/utils/commonmethods";
import { formatLabourForce, formatLandOwnership } from "@/utils/farmform";
import {
  farmerTypeLabel,
  isEditableFarmerType,
  normalizeIdType,
  optionLabel,
} from "@/utils/farmerform";
import { getFarmListSource } from "@/utils/farmdatasource";
import { canManageFarmersAndFarms } from "@/utils/userroles";
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
  const routeData: smallHolder = dataDecoder(params?.data);
  // The route param is a snapshot from when the card was tapped. If this
  // farmer was edited since, the saved values live in the store.
  const editedData = useUniversalStore((state) =>
    routeData?.id ? state.editedFarmers[routeData.id] : undefined
  );
  const data: smallHolder = { ...routeData, ...editedData };
  const selectedOption = useUniversalStore(
    (state) => state.selectedSegmentedOption.myFarmerDetails
  );
  const setSegmentedOption = useUniversalStore(
    (state) => state.setSegmentedOption
  );
  const isFarmTabSelected = selectedOption === "Farm";

  const user = userStore((state) => state.user);
  const { endpoint: farmEndpoint, queryKey: farmQueryKey } =
    getFarmListSource(user);

  const { items: allFarms } = usePaginatedInfiniteQuery<any>(
    farmEndpoint,
    farmQueryKey,
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

  // This list is already scoped by the backend (a lead farmer only ever sees
  // their own smallholders; field officers/admins see the ones they manage),
  // so anyone allowed to manage farmers may edit what's shown here.
  // The edit form only handles smallholder and commercial farmers; a field
  // officer's mixed list also holds lead farmers (see isEditableFarmerType).
  const canEditFarmer =
    canManageFarmersAndFarms(user) && isEditableFarmerType(data?.type);

  const farmerPersonalInformation = {
    headerTitle: "Personal Information",
    headerIcon: icons.user,
    // The Edit button only renders when this is defined. It used to be an
    // empty `() => {}`, which is why tapping Edit did nothing.
    onEditPress: canEditFarmer
      ? () => router.navigate(`/myfarmers/editfarmer?data=${dataEncoder(data)}`)
      : undefined,
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
      { key: "Farmer Type", value: farmerTypeLabel(data?.type) },
      { key: "ID Type", value: normalizeIdType(data?.id_type) || "N/A" },
      { key: "ID Number", value: data?.id_number || "N/A" },
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

  // Mirrors the web admin's "Project & Profile Details" card. Records made
  // before the updated form (or endpoints that don't return these yet) just
  // show "-".
  const show = (value: unknown) =>
    value === undefined || value === null || value === "" ? "-" : String(value);
  const projectName =
    typeof data?.project === "object" && data.project
      ? data.project.name
      : undefined;

  const farmerProfileInformation = {
    headerTitle: "Project & Profile Details",
    headerIcon: icons.user,
    information: [
      { key: "Project", value: show(projectName) },
      { key: "Nationality", value: show(data?.nationality) },
      {
        key: "Marital Status",
        value: show(optionLabel(MARITAL_STATUS_OPTIONS, data?.marital_status)),
      },
      {
        key: "Education Level",
        value: show(optionLabel(EDUCATION_LEVEL_OPTIONS, data?.education_level)),
      },
      {
        key: "Alternative Phone Number",
        value: data?.alternative_phone_number
          ? `+${data.alternative_phone_number}`
          : "-",
      },
      {
        key: "Average Income",
        value:
          data?.average_income != null && data.average_income !== ""
            ? `GH₵${data.average_income}`
            : "-",
      },
      { key: "Years of Farming Experience", value: show(data?.years_of_experience) },
      { key: "Number of Households", value: show(data?.number_of_households) },
      { key: "Number of Dependents", value: show(data?.number_of_dependents) },
      { key: "Number of Farms", value: show((data as any)?.[NUMBER_OF_FARMS_API_KEY]) },
      { key: "Data Consent Given", value: data?.consent ? "Yes" : "No" },
    ],
  };

  const farmInformation = {
    headerTitle: "Farm Information",
    headerIcon: icons.user,
    // Opens the shared Edit Farm screen on THIS farmer's farm. (It used to be
    // an empty `() => {}`. The edit screen now saves to the farm it is given,
    // rather than always to the signed-in user's own farm.)
    onEditPress:
      canEditFarmer && data?.farm?.id
        ? () =>
            router.navigate(
              `/myfarm/editfarmdetails?data=${dataEncoder(data.farm)}&farmerId=${data.id}`
            )
        : undefined,
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
      {
        key: "Land Ownership",
        value:
          formatLandOwnership(
            data?.farm?.land_ownership,
            data?.farm?.other_specification
          ) || "N/A",
      },
      { key: "Labour Force", value: formatLabourForce(data?.farm) || "N/A" },
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
            <InfoCard headerVisibility={true} info={farmerProfileInformation} />
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
