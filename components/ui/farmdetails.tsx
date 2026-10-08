import { width } from "@/constants/generalconstants";
import { formatLabourForce, formatLandOwnership } from "@/utils/farmform";
import { userStore } from "@/stores/userstore";
import { myFarm } from "@/types/farm";
import { dataEncoder } from "@/utils/commonmethods";
import { canEditOwnFarm } from "@/utils/userroles";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";
import InfoCard from "./infocard";
import SectionHeader from "./sectionheader";
interface farmDetailsProps {
  item: myFarm;
  /**
   * Override who sees the Edit button. By default only the signed-in farmer
   * editing their own farm does (see canEditOwnFarm). The farm details screen
   * a lead farmer opens from the Farms list passes its own rule and target.
   */
  canEdit?: boolean;
  onEdit?: () => void;
}
const emptyValue = "-";

const displayValue = (value?: string | number | null) => {
  if (value == null || value === "") return emptyValue;
  return String(value);
};

const FarmDetails: React.FC<farmDetailsProps> = React.memo(
  ({ item, canEdit: canEditProp, onEdit }) => {
  const user = userStore((state) => state.user);
  const canEdit = canEditProp ?? canEditOwnFarm(user);
  const farmingMethods = Array.isArray(item?.farming_methods)
    ? item?.farming_methods?.map((method: any) => method).join(", ") || emptyValue
    : emptyValue;

  const fertilizers = Array.isArray(item?.use_of_fertilizers)
    ? item.use_of_fertilizers.join(", ") || emptyValue
    : displayValue(item?.use_of_fertilizers as string | undefined);

  const liveStock =
    item?.livestock?.length > 0
      ? item.livestock.map((item: any) => item.product?.name).join(", ")
      : emptyValue;

  const landSize = [item?.size, item?.size_metric?.name].filter(Boolean).join(" ");

  // console.log('FARMING METHODS',farmingMethods);

  // const liveStock =
  //   item?.products.length > 0
  //     ? item?.products
  //         ?.filter((item: any) => item.product?.type === "livestock")
  //         ?.map((item: any) => item.product?.name)
  //         .join(", ")
  //     : "N/A";

  const farmDetails = {
    information: [
      {
        key: "Farm Name",
        value: displayValue(item?.name),
      },
      {
        key: "Location",
        value: displayValue(item?.location),
      },
      {
        key: "District",
        value: displayValue(item?.district?.name),
      },
      {
        key: "Total Land Size",
        value: landSize || emptyValue,
      },
      {
        key: "Land Ownership",
        value: displayValue(
          formatLandOwnership(item?.land_ownership, item?.other_specification)
        ),
      },
      {
        key: "Labour Force",
        value: displayValue(formatLabourForce(item)),
      },
      {
        key: "Livestock Kept",
        value: liveStock,
      },
    ],
  };
  const agriculturalDetails = {
    headerTitle: "Agricultural Practices",

    information: [
      {
        key: "Use of Fertilizers",
        value: fertilizers as string,
      },
      {
        key: "Farming Methods",
        value: farmingMethods,
      },
      {
        key: "Irrigation",
        value: (item?.irrigation ? "Yes" : "No") as any,
      },
      {
        key: "Access to Market",
        value: (item?.has_access_to_market ? "Yes" : "No") as any,
      },
      {
        key: "Do you provide training to other farmers?",
        value: (item?.provide_training ? "Yes" : "No") as any,
      },
    ],
  };
  return (
    <View style={{ width, paddingHorizontal: 16 }}>
      <SectionHeader
        title="Farm Details"
        btnIcon="edit"
        btnTitle="Edit"
        titleColor="black"
        dualEdit={canEdit}
        {...(canEdit
          ? {
              onPress:
                onEdit ??
                (() =>
                  router.navigate(
                    `/myfarm/editfarmdetails?data=${dataEncoder(item)}`
                  )),
            }
          : {})}
      />
      <InfoCard
        headerVisibility={false}
        previewLabel="Preview"
        info={farmDetails}
      />

      <InfoCard headerVisibility={true} info={agriculturalDetails} />
    </View>
  );
  }
);

export default FarmDetails;

const styles = StyleSheet.create({});


