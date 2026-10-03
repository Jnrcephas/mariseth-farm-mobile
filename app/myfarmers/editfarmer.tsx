import AddFarmerForm from "@/components/ui/addfarmerform";
import ErrorComponent from "@/components/ui/errorcomponent";
import useAuthMutation from "@/hooks/usemutation";
import { useUniversalStore } from "@/stores/useuniversalstore";
import { userStore } from "@/stores/userstore";
import { smallHolder } from "@/types/farmers";
import { handleGenericApiError } from "@/utils/apierrorhandler";
import { dataDecoder, handleToastShow } from "@/utils/commonmethods";
import { getEditFarmerSource } from "@/utils/farmdatasource";
import {
  joinFullName,
  normalizeFarmerPhone,
  splitFullName,
  toLocalPhone,
} from "@/utils/farmerhelpers";
import { addFarmerSchema } from "@/utils/validationschema";
import { useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { useFormik } from "formik";
import React from "react";
import { useToast } from "react-native-toast-notifications";

/**
 * Edit an existing farmer. Reached from the "Edit" button on the farmer
 * details screen, which passes the farmer in the `data` route param (same
 * pattern as app/myfarm/editfarmdetails.tsx). Uses the very same form as
 * "Add Farmer" so the two can't drift apart.
 */
const EditFarmer = () => {
  const params = useLocalSearchParams<{ data: string }>();
  const farmer: smallHolder | undefined = dataDecoder(params?.data);

  const farms = userStore((state) => state.farms);
  const regions = userStore((state) => state.regions);

  const toast = useToast();
  const queryClient = useQueryClient();

  const districts = React.useMemo(
    () =>
      regions.flatMap((region) =>
        region.districts.map((district) => ({
          ...district,
          regionId: region.id,
        }))
      ),
    [regions]
  );

  const { endpoint, queryKeys } = getEditFarmerSource(farmer?.id ?? "");

  const { mutate, isLoading } = useAuthMutation(
    endpoint,
    "PUT",
    "editFarmer",
    {
      onSuccess: async (_response: unknown, variables: any) => {
        // Show the new values on the details screen immediately (it only
        // holds a snapshot from its route param), then refresh the lists.
        if (farmer?.id) {
          const district = districts.find((d) => d.id === variables.district);
          const region = regions.find((r) => r.id === variables.region);
          useUniversalStore.setState((state) => ({
            editedFarmers: {
              ...state.editedFarmers,
              [farmer.id]: {
                first_name: variables.first_name,
                last_name: variables.last_name,
                other_names: variables.other_names,
                gender: variables.gender,
                date_of_birth: variables.date_of_birth,
                id_type: variables.id_type,
                id_number: variables.id_number,
                phone_number: variables.phone_number,
                email: variables.email ?? "",
                address: variables.address,
                village: variables.village,
                ...(district ? { district: { id: district.id, name: district.name } } : {}),
                ...(region
                  ? { region: { id: region.id, name: region.name, code: region.code } }
                  : {}),
              },
            },
          }));
        }

        handleToastShow(toast, "Farmer has been updated successfully!");
        await Promise.all(
          queryKeys.map((key) => queryClient.invalidateQueries({ queryKey: [key] }))
        );
        router.back();
      },
      onError: (error: unknown) => {
        handleGenericApiError(error, toast);
      },
    }
  );

  const formik = useFormik({
    initialValues: {
      name: joinFullName(farmer),
      gender: farmer?.gender ?? "",
      email: farmer?.email ?? "",
      address: farmer?.address ?? "",
      village: farmer?.village ?? "",
      // Region isn't an input on this form (it follows the chosen district),
      // but the schema requires it - so if a record has a district and no
      // region, derive it rather than leaving the form silently invalid.
      region:
        farmer?.region?.id ??
        regions.find((r) =>
          r.districts.some((d) => d.id === farmer?.district?.id)
        )?.id ??
        "",
      district: farmer?.district?.id ?? "",
      country: farmer?.country || "Ghana",
      date_of_birth: farmer?.date_of_birth ?? "",
      phone_number: toLocalPhone(farmer?.phone_number),
      // Older records may have no id_type saved; Ghana Card was the only
      // option the app offered before the selector existed.
      id_type: farmer?.id_type || "ghana_card",
      id_number: farmer?.id_number ?? "",
      farm: farmer?.farm?.id ?? "",
      // `type` only exists so addFarmerSchema's phone rule applies (it is
      // skipped for the "profile" type). It is never sent.
      type: "edit",
    },
    validationSchema: addFarmerSchema,
    onSubmit: async (values) => {
      const { name, type, ...rest } = values;
      mutate({
        ...rest,
        ...splitFullName(name),
        email: values.email.trim() || null,
        phone_number: normalizeFarmerPhone(values.phone_number),
        id_number: values.id_number.trim(),
        farm: values.farm || null,
        district: Number(values.district),
        region: Number(values.region),
      });
    },
  });

  // Same safety net as editfarmdetails.tsx: if this screen is ever opened
  // without its `data` param, show a recoverable message instead of a blank
  // form that would silently PUT to `/farmer/`.
  if (!farmer?.id) {
    return (
      <ErrorComponent
        type="CLIENT_ERROR"
        title="Couldn't load farmer details"
        message="We couldn't load this farmer's details to edit. Please go back and try again."
        btnTitle="Go Back"
        refetch={() => router.back()}
      />
    );
  }

  return (
    <AddFarmerForm
      mode="edit"
      formik={formik}
      isLoading={isLoading}
      districts={districts}
      farms={farms}
    />
  );
};

export default EditFarmer;
