import { width } from "@/constants/generalconstants";
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
}
const emptyValue = "-";

const displayValue = (value?: string | number | null) => {
  if (value == null || value === "") return emptyValue;
  return String(value);
};

const FarmDetails: React.FC<farmDetailsProps> = React.memo(({ item }) => {
  const user = userStore((state) => state.user);
  const canEdit = canEditOwnFarm(user);
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
        value: displayValue(item?.land_ownership),
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
              onPress: () =>
                router.navigate(
                  `/myfarm/editfarmdetails?data=${dataEncoder(item)}`
                ),
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
});

export default FarmDetails;

const styles = StyleSheet.create({});
