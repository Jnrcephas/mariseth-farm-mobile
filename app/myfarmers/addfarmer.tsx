import AddFarmerForm from "@/components/ui/addfarmerform";
import useAuthMutation from "@/hooks/usemutation";
import { userStore } from "@/stores/userstore";
import { handleGenericApiError } from "@/utils/apierrorhandler";
import { handleToastShow } from "@/utils/commonmethods";
import { getAddFarmerSource } from "@/utils/farmdatasource";
import {
  buildFarmerPayload,
  FarmerFormValues,
  farmerTypeLabel,
  getFarmerInitialValues,
} from "@/utils/farmerform";
import {
  canRegisterCommercialFarmer,
  isFieldOfficerExperience,
} from "@/utils/userroles";
import { getAddFarmerSchema } from "@/utils/validationschema";
import { useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useFormik } from "formik";
import React from "react";
import { useToast } from "react-native-toast-notifications";

const AddFarmer = () => {
  const user = userStore((state) => state.user);
  const farms = userStore((state) => state.farms);
  // Everyone registers farmers through the web admin endpoint (see
  // getAddFarmerSource). A field officer/admin picks which lead farmer the
  // farmer belongs to; a lead farmer is always the owner, so we send their id.
  const isFieldOfficer = isFieldOfficerExperience(user);
  const leadFarmerId = isFieldOfficer ? undefined : user?.farmer?.id;
  const { endpoint: addFarmerEndpoint, queryKeys } = getAddFarmerSource(user);

  const toast = useToast();
  const queryClient = useQueryClient();
  const { mutate, isLoading } = useAuthMutation(
    addFarmerEndpoint,
    "POST",
    "addNewFarmer",
    {
      onSuccess: (_response: unknown, variables: any) => {
        handleToastShow(
          toast,
          `${farmerTypeLabel(variables?.type)} has been added successfully!`
        );
        Promise.all(
          queryKeys.map((key) =>
            queryClient.invalidateQueries({ queryKey: [key] })
          )
        ).then(() => {
          router.back();
        });
      },
      onError: (error: unknown) => {
        // Surfaces the server's own message (e.g. "phone number already
        // exists") rather than a vague failure.
        handleGenericApiError(error, toast);
      },
    }
  );

  const formik = useFormik<FarmerFormValues>({
    initialValues: getFarmerInitialValues(),
    // The web form requires a lead farmer for every smallholder. Lead farmers
    // are exempt (the backend infers it from their token).
    validationSchema: getAddFarmerSchema({ requireLeadFarmer: isFieldOfficer }),
    onSubmit: (values) => {
      mutate(buildFarmerPayload(values, { leadFarmerId }));
    },
  });

  return (
    <AddFarmerForm
      mode="add"
      formik={formik}
      isLoading={isLoading}
      farms={farms}
      isFieldOfficer={isFieldOfficer}
      canChooseFarmerType={canRegisterCommercialFarmer(user)}
    />
  );
};

export default AddFarmer;
