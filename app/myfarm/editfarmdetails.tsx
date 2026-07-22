import FarmForm from "@/components/ui/farmform";
import { endpoints } from "@/constants/endpoints";
import useAuthMutation from "@/hooks/usemutation";
import { userStore } from "@/stores/userstore";
import { myFarm1 } from "@/types/farm";
import { handleAuthApiError } from "@/utils/apierrorhandler";
import { dataDecoder, handleToastShow } from "@/utils/commonmethods";
import { adddFarmerSchema } from "@/utils/validationschema";
import { useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { useFormik } from "formik";
import React from "react";
import { StyleSheet } from "react-native";
import { useToast } from "react-native-toast-notifications";

const EditFarmDetails = () => {
  const params = useLocalSearchParams<{ data: string }>();
  const farmData: myFarm1 = dataDecoder(params?.data);

  // console.log("Farm Data:", params?.data);
  const user = userStore((state) => state.user);
  const regions = userStore((state) => state.regions);

  const {
    name,
    location,
    region,
    district,
    land_ownership,
    size,
    has_access_to_market,
    crops,
    livestock,
    use_of_fertilizers,
    farming_methods,
    irrigation,
    size_metric,
  } = farmData;

  const newCrops = crops.map((crop) => crop?.product?.id);
  const newLivestock = livestock.map((crop) => crop?.product?.id);

  const toast = useToast();

  const queryClient = useQueryClient();
  const { mutate, isLoading, error } = useAuthMutation(
    `${endpoints.editMyFarmDetails}/${user?.farmer?.farm?.id}`,
    "POST",
    "editfarmdetails",
    {
      onSuccess: async (data) => {
        // console.log(JSON.stringify(data));
        const toastMessage = "Farm details updated successfully!";
        handleToastShow(toast, toastMessage);
        await queryClient
          .invalidateQueries({ queryKey: ["myfarm"] })
          .then(() => {
            // userStore.setState({ user: { ...user  } });
            router.back();
          });
      },

      onError: (error: any) => {
        console.log(error);
        handleAuthApiError(error, formik, toast);
      },
    }
  );
  const formik = useFormik({
    initialValues: {
      farm_type: "external",
      name: name || "",
      location: location || "",
      region: region?.id || "",
      district: district?.id || "",
      size: size.toString() || "",
      size_metric: size_metric?.id,
      land_ownership: land_ownership || "",
      crops: newCrops || [],
      livestock: newLivestock || [],
      use_of_fertilizers: use_of_fertilizers || [],
      farming_methods: farming_methods || [],
      irrigation: irrigation,
      has_access_to_market: has_access_to_market,
    },
    validationSchema: adddFarmerSchema,
    onSubmit: async (values) => {
      // console.log(values);
      mutate(values);
    },
  });

  const districts = React.useMemo(
    () =>
      regions.find((region) => region.id === formik.values.region)?.districts ||
      [],
    [formik.values.region]
  );

  return (
    <FarmForm
      formik={formik}
      isLoading={isLoading}
      type="edit"
      districts={districts}
    />
  );
};

export default EditFarmDetails;

const styles = StyleSheet.create({});
