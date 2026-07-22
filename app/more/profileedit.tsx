import ProfileForm from "@/components/ui/profileform";
import { endpoints } from "@/constants/endpoints";
import useAuthMutation from "@/hooks/usemutation";
import { userStore } from "@/stores/userstore";
import { useUniversalStore } from "@/stores/useuniversalstore";
import { handleAuthApiError } from "@/utils/apierrorhandler";
import { handleToastShow } from "@/utils/commonmethods";
import { profileEditSchema } from "@/utils/validationschema";
import { useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useFormik } from "formik";

import React from "react";
import { StyleSheet } from "react-native";
import { useToast } from "react-native-toast-notifications";

const ProfileEdit = () => {
  const user = userStore((state) => state.user);
  const regions = userStore((state) => state.regions);

  const toast = useToast();

  const queryClient = useQueryClient();

  const { mutate, isLoading } = useAuthMutation(
    endpoints.updateMyFarmer,
    "PUT",
    "updatemyfarmer",
    {
      onSuccess: async (data) => {
        // console.log(JSON.stringify(data));
        useUniversalStore.setState({ enabled: true });

        await queryClient
          .refetchQueries({
            queryKey: ["getprofile"],
            type: "all",
            exact: true,
          })
          .then(() => {
            useUniversalStore.setState({ enabled: false });
          });
        const toastMessage = "Updated successful!";
        handleToastShow(toast, toastMessage);

        setTimeout(() => {
          router.back();
        }, 2000);
      },

      onError: (error: any) => {
        console.log(error);
        handleAuthApiError(error, formik, toast);
      },
    }
  );

  const formik = useFormik({
    initialValues: {
      name:
        `${user?.first_name ?? ("" as string)} ${
          user?.last_name ?? ("" as string)
        } ${user?.farmer?.other_names ?? ("" as string)}` || "",
      gender: (user?.farmer?.gender as string) || "",
      email: (user?.farmer?.email as string) || "",
      address: (user?.farmer?.address as string) || "",
      village: (user?.farmer?.village as string) || "",
      region: user?.farmer?.region?.id || "",
      district: user?.farmer?.district?.id || "",
      country: "Ghana",
      date_of_birth: (user?.farmer?.date_of_birth as string) || "",
      id_type: (user?.farmer?.id_type as string) || "",
      id_number: (user?.farmer?.id_number as string) || "",
      first_name: (user?.farmer?.first_name as string) || "",
      last_name: (user?.farmer?.last_name as string) || "",
      other_names: (user?.farmer?.other_names as string) || "",
      type: "profile",
    },
    validationSchema: profileEditSchema,
    onSubmit: async (values) => {
      const { name, type, ...cleanedValues } = values;
      cleanedValues.email = (cleanedValues.email.trim() || null) as any;
      const fullName = values.name.trim().split(" ");
      cleanedValues.first_name = fullName.shift() || "";
      cleanedValues.last_name = fullName.shift() || "";
      cleanedValues.other_names = fullName.join(" ") || "";

      // console.log(cleanedValues);
      mutate(cleanedValues);
    },
  });

  const districts = React.useMemo(
    () =>
      regions.find((region) => region.id === formik.values.region)?.districts ||
      [],
    [formik.values.region]
  );
  return (
    <ProfileForm
      formik={formik}
      isLoading={isLoading}
      type="profile"
      districts={districts}
    />
  );
};

export default ProfileEdit;

const styles = StyleSheet.create({});
