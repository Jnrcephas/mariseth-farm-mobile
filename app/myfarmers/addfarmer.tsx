import AddFarmerForm from "@/components/ui/addfarmerform";
import useAuthMutation from "@/hooks/usemutation";
import { userStore } from "@/stores/userstore";
import { handleAuthApiError } from "@/utils/apierrorhandler";
import { handleToastShow } from "@/utils/commonmethods";
import { getAddFarmerSource } from "@/utils/farmdatasource";
import { isFieldOfficerExperience } from "@/utils/userroles";
import { addFarmerSchema } from "@/utils/validationschema";
import { useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useFormik } from "formik";
import React from "react";
import { useToast } from "react-native-toast-notifications";

const normalizeFarmerPhone = (phone: string) => {
  const digits = phone.replace(/\s/g, "");
  const withoutLeadingZero = digits.startsWith("0") ? digits.slice(1) : digits;
  return withoutLeadingZero.startsWith("233")
    ? withoutLeadingZero
    : `233${withoutLeadingZero}`;
};

const AddFarmer = () => {
  const user = userStore((state) => state.user);
  const farms = userStore((state) => state.farms);
  const regions = userStore((state) => state.regions);
  // Field officers/admins create farmers through the same admin
  // farm-management endpoint the web dashboard uses (no farmer profile of
  // their own to create "under", unlike a lead farmer) - see
  // utils/farmdatasource.ts and isFieldOfficerExperience.
  const isFieldOfficer = isFieldOfficerExperience(user);
  const { endpoint: addFarmerEndpoint, queryKey: farmerQueryKey } =
    getAddFarmerSource(user);

  const toast = useToast();
  const queryClient = useQueryClient();
  const { mutate, isLoading } = useAuthMutation(
    addFarmerEndpoint,
    "POST",
    "addNewFarmer",
    {
      onSuccess: () => {
        handleToastShow(toast, "Farmer has been added successfully!");
        queryClient
          .invalidateQueries({ queryKey: [farmerQueryKey] })
          .then(() => {
            router.back();
          });
      },
      onError: (error: unknown) => {
        handleAuthApiError(error, formik, toast);
      },
    }
  );

  const formik = useFormik({
    initialValues: {
      name: "",
      gender: "",
      email: "",
      address: "",
      village: "",
      region: "",
      district: "",
      country: "Ghana",
      date_of_birth: "",
      phone_number: "",
      type: "add",
      id_number: "",
      farm: "",
      first_name: "",
      last_name: "",
      other_names: "",
    },
    validationSchema: addFarmerSchema,
    onSubmit: async (values) => {
      const { name, type, ...rest } = values;
      const fullName = name.trim().split(/\s+/);
      const payload = {
        ...rest,
        first_name: fullName[0] || "",
        last_name: fullName[1] || "",
        other_names: fullName.slice(2).join(" ") || "",
        email: values.email.trim() || null,
        phone_number: normalizeFarmerPhone(values.phone_number),
        id_type: "ghana_card",
        id_number: values.id_number.trim(),
        farm: values.farm || null,
        district: Number(values.district),
        region: Number(values.region),
        // The lead-farmer endpoint infers "smallholder under this lead
        // farmer" from the token; the admin farm-management endpoint has
        // no such implicit context and requires `type` explicitly. Field
        // officers only onboard smallholders (same as lead farmers do
        // through this screen), so this is hardcoded rather than exposed
        // as a form field.
        ...(isFieldOfficer ? { type: "smallholder" } : {}),
      };

      mutate(payload);
    },
  });

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

  return (
    <AddFarmerForm
      formik={formik}
      isLoading={isLoading}
      districts={districts}
      farms={farms}
    />
  );
};

export default AddFarmer;
