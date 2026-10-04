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
  buildFarmerPayload,
  FarmerFormValues,
  farmerTypeLabel,
  getFarmerInitialValues,
  isEditableFarmerType,
  valuesToFarmerPatch,
} from "@/utils/farmerform";
import { isFieldOfficerExperience } from "@/utils/userroles";
import { getAddFarmerSchema } from "@/utils/validationschema";
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

  const user = userStore((state) => state.user);
  const farms = userStore((state) => state.farms);
  const regions = userStore((state) => state.regions);
  const isFieldOfficer = isFieldOfficerExperience(user);
  // A lead farmer only ever edits their own farmers, so their id stays as
  // the lead farmer. (Field officers keep whatever is selected in the form.)
  const leadFarmerId = isFieldOfficer ? undefined : user?.farmer?.id;

  const toast = useToast();
  const queryClient = useQueryClient();

  const { endpoint, queryKeys } = getEditFarmerSource(farmer?.id ?? "");

  // Kept in a ref so the success callback (created before the form exists)
  // can read the values that were just submitted.
  const submittedRef = React.useRef<FarmerFormValues | null>(null);

  const { mutate, isLoading } = useAuthMutation(endpoint, "PUT", "editFarmer", {
    onSuccess: async () => {
      // Show the new values on the details screen immediately (it only holds
      // a snapshot from its route param), then refresh the lists.
      if (farmer?.id && submittedRef.current) {
        const patch = valuesToFarmerPatch(submittedRef.current, regions);
        useUniversalStore.setState((state) => ({
          editedFarmers: { ...state.editedFarmers, [farmer.id]: patch },
        }));
      }

      handleToastShow(
        toast,
        `${farmerTypeLabel(submittedRef.current?.farmer_type)} has been updated successfully!`
      );
      await Promise.all(
        queryKeys.map((key) => queryClient.invalidateQueries({ queryKey: [key] }))
      );
      router.back();
    },
    onError: (error: unknown) => {
      handleGenericApiError(error, toast);
    },
  });

  const formik = useFormik<FarmerFormValues>({
    initialValues: getFarmerInitialValues(farmer),
    // On edit the lead farmer stays optional: some admin responses only give
    // the lead farmer's name, not an id we could pre-select, and we must not
    // force (or silently change) the assignment.
    validationSchema: getAddFarmerSchema({ requireLeadFarmer: false }),
    onSubmit: (values) => {
      submittedRef.current = values;
      mutate(buildFarmerPayload(values, { leadFarmerId }));
    },
  });

  // Same safety net as editfarmdetails.tsx: if this screen is ever opened
  // without its `data` param, show a recoverable message instead of a blank
  // form that would silently PUT to `/farmer/`.
  // Lead farmers (visible in a field officer's mixed list) have a different
  // form on the web. Saving one through this form would overwrite their type.
  if (farmer?.id && !isEditableFarmerType(farmer.type)) {
    return (
      <ErrorComponent
        type="CLIENT_ERROR"
        title="Can't edit this farmer here"
        message={`${farmerTypeLabel(farmer.type)}s can't be edited from this form. Please use the web dashboard.`}
        btnTitle="Go Back"
        refetch={() => router.back()}
      />
    );
  }

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
      farms={farms}
      isFieldOfficer={isFieldOfficer}
    />
  );
};

export default EditFarmer;
