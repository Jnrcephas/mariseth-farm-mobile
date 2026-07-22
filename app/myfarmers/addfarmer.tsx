import AddFarmerForm from "@/components/ui/addfarmerform";
import { endpoints } from "@/constants/endpoints";
import useAuthMutation from "@/hooks/usemutation";
import { userStore } from "@/stores/userstore";
import { handleAuthApiError } from "@/utils/apierrorhandler";
import { handleToastShow } from "@/utils/commonmethods";
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
  const farms = userStore((state) => state.farms);
  const regions = userStore((state) => state.regions);

  const toast = useToast();
  const queryClient = useQueryClient();
  const { mutate, isLoading } = useAuthMutation(
    endpoints.addNewFarmer,
    "POST",
    "addNewFarmer",
    {
      onSuccess: () => {
        handleToastShow(toast, "Farmer has been added successfully!");
        queryClient
          .invalidateQueries({ queryKey: ["smallholders"] })
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
