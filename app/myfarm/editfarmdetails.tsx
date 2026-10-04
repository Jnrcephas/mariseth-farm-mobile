import FarmForm from "@/components/ui/farmform";
import ErrorComponent from "@/components/ui/errorcomponent";
import { pointsToGeoJSON, geoJSONToPoints } from "@/components/ui/farmboundarycapture";
import { endpoints } from "@/constants/endpoints";
import useAuthMutation from "@/hooks/usemutation";
import { userStore } from "@/stores/userstore";
import { myFarm1 } from "@/types/farm";
import { handleAuthApiError, handleGenericApiError } from "@/utils/apierrorhandler";
import { dataDecoder, handleToastShow } from "@/utils/commonmethods";
import { adddFarmerSchema } from "@/utils/validationschema";
import { buildFarmPayload, normalizeLandOwnership } from "@/utils/farmform";
import { useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { useFormik } from "formik";
import React from "react";
import { StyleSheet } from "react-native";
import { useToast } from "react-native-toast-notifications";

const EditFarmDetails = () => {
  // `farmerId` is only passed when a lead farmer / field officer is editing a
  // *farmer's* farm from the farmer details screen (see farmerdetails.tsx).
  const params = useLocalSearchParams<{ data: string; farmerId?: string }>();
  const isEditingFarmersFarm = !!params?.farmerId;
  const farmData: myFarm1 | undefined = dataDecoder(params?.data);

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
    boundary,
    other_specification,
    labor_force_total,
    labor_force_male,
    labor_force_female,
  } = farmData || ({} as Partial<myFarm1>);

  // Older records can hold "Rented" (not a valid choice on the API) - shown
  // as "Other: Rented" so nothing is lost. See normalizeLandOwnership.
  const ownership = normalizeLandOwnership(land_ownership, other_specification);

  const newCrops = (crops || []).map((crop) => crop?.product?.id);
  const newLivestock = (livestock || []).map((crop) => crop?.product?.id);

  const toast = useToast();

  const queryClient = useQueryClient();
  const { mutate, isLoading, error } = useAuthMutation(
  // Save to the farm we were handed. This used to always use the signed-in
  // user's own farm id, which would have overwritten the wrong record when
  // editing a smallholder's farm. For "My Farm" the two ids are the same.
  `${endpoints.adminFarms}/${farmData?.id ?? user?.farmer?.farm?.id}`,
  "PUT",
  "editfarmdetails",
    {
      onSuccess: async (data) => {
        // console.log(JSON.stringify(data));
        const toastMessage = "Farm details updated successfully!";
        handleToastShow(toast, toastMessage);
        await Promise.all(
          // "myfarm" is the signed-in farmer's own farm; the rest are the
          // farm and farmer lists a farmer's farm also appears in.
          ["myfarm", "leadfarmersfarms", "admin-farms", "smallholders", "admin-farmers"].map(
            (key) => queryClient.invalidateQueries({ queryKey: [key] })
          )
        );
        if (isEditingFarmersFarm) {
          // The farmer details screen only holds a snapshot of the farmer
          // (including this farm), so go back to the refreshed farmers list
          // instead of to a screen that would still show the old values.
          // (navigate pops back to the list tab, across the myfarm and
          // myfarmers stacks - same call the Home tab uses to reach it.)
          router.navigate("/myfarmers");
        } else {
          router.back();
        }
      },
      onError: (error: any) => {
        console.log(error);
        handleGenericApiError(error, toast); 
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
      size: size?.toString() || "",
      size_metric: size_metric?.id,
      land_ownership: ownership.land_ownership,
      other_specification: ownership.other_specification,
      crops: newCrops || [],
      livestock: newLivestock || [],
      use_of_fertilizers: use_of_fertilizers || [],
      farming_methods: farming_methods || [],
      irrigation: irrigation,
      has_access_to_market: has_access_to_market,
      labor_force_total: labor_force_total?.toString() ?? "",
      labor_force_male: labor_force_male?.toString() ?? "",
      labor_force_female: labor_force_female?.toString() ?? "",
      boundary: geoJSONToPoints(boundary),
    },
    validationSchema: adddFarmerSchema,
    onSubmit: async (values) => {
      // Boundary is optional - it's only used for the Geofencing/asset-
      // tracking feature (confirmed with backend: weather and soil
      // quality are resolved purely from the farm id and don't need
      // it). If the farmer hasn't drawn one, just submit without it.
      // Only block if they've started marking points but haven't
      // finished (need 3+ to form a valid shape).
      const { boundary: boundaryPoints, ...rest } = values;
      if (boundaryPoints.length > 0 && boundaryPoints.length < 3) {
        handleToastShow(
          toast,
          "Add at least 3 points to complete the boundary, or clear them to skip it for now."
        );
        return;
      }
      const boundaryGeoJSON = pointsToGeoJSON(boundaryPoints);
      // Edits always go to the admin farm endpoint, so use the web's body.
      // (`farmer` is left out on purpose: editing must not reassign the farm.)
      mutate(
        buildFarmPayload(rest, { webFormat: true, boundary: boundaryGeoJSON })
      );
    },
  });

  const districts = React.useMemo(
    () =>
      regions.find((region) => region.id === formik.values.region)?.districts ||
      [],
    [formik.values.region]
  );

  // Belt-and-braces: this screen only knows how to render a farm it was
  // handed via the `data` route param (see farmdetails.tsx's "Edit"
  // button, and geofencing.tsx's "Edit/Set Farm Boundary" button, for how
  // callers are meant to navigate here). If that param is ever missing
  // or malformed, show a recoverable screen instead of the blank crash
  // this used to be - the hooks above still run unconditionally on every
  // render either way, so this check happens at the very end, at render
  // time, rather than as an early return.
  if (!farmData) {
    return (
      <ErrorComponent
        type="CLIENT_ERROR"
        title="Couldn't load farm details"
        message="We couldn't load this farm's details to edit. Please go back and try again."
        btnTitle="Go Back"
        refetch={() => router.back()}
      />
    );
  }

  return (
    <FarmForm
      formik={formik}
      isLoading={isLoading}
      type="edit"
      districts={districts}
      webFormat
    />
  );
};

export default EditFarmDetails;

const styles = StyleSheet.create({});
