import AppButton from "@/components/ui/appbutton";
import AppTextInput from "@/components/ui/apptextinput";
import FormErrorMessage from "@/components/ui/formerrormessage";
import YesNoSelector from "@/components/ui/yesnoselector";
import { colors } from "@/constants/colors";
import { endpoints } from "@/constants/endpoints";
import useAuthMutation from "@/hooks/usemutation";
import { userStore } from "@/stores/userstore";
import { useUniversalStore } from "@/stores/useuniversalstore";
import { handleAuthApiError } from "@/utils/apierrorhandler";
import { handleToastShow } from "@/utils/commonmethods";
import { leadershipExperienceEditSchema } from "@/utils/validationschema";
import { useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useFormik } from "formik";
import React from "react";
import { StyleSheet, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useToast } from "react-native-toast-notifications";

const LeadershipInfoEdit = () => {
  const user = userStore((state) => state.user);
  const farmerLeadership = user?.farmer?.leadership_experience;
  const bottomInset = useSafeAreaInsets().bottom;
  const toast = useToast();
  const queryClient = useQueryClient();

  const { mutate, isLoading } = useAuthMutation(
    endpoints.updateMyFarmer,
    "PUT",
    "updatemyfarmer",
    {
      onSuccess: async () => {
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

        handleToastShow(toast, "Updated successful!");

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
      is_mentoring_other_farmers:
        farmerLeadership?.is_mentoring_other_farmers || false,
      number_of_farmers_mentoring:
        farmerLeadership?.number_of_farmers_mentoring || "",
      has_farming_membership: farmerLeadership?.has_farming_membership || false,
      has_received_farming_leadership_training:
        farmerLeadership?.has_received_farming_leadership_training || false,
    },
    validationSchema: leadershipExperienceEditSchema,
    onSubmit: async (values) => {
      mutate({
        leadership_experience: {
          is_mentoring_other_farmers: values.is_mentoring_other_farmers,
          number_of_farmers_mentoring: values.number_of_farmers_mentoring,
          has_farming_membership: values.has_farming_membership,
          has_received_farming_leadership_training:
            values.has_received_farming_leadership_training,
        },
      });
    },
  });

  return (
    <View style={styles.screen}>
      <KeyboardAwareScrollView
        extraHeight={100}
        extraScrollHeight={50}
        enableOnAndroid={true}
        keyboardShouldPersistTaps="always"
        keyboardDismissMode="none"
        bounces={false}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <YesNoSelector
          label="Are you currently mentoring other farmers?"
          value={formik.values.is_mentoring_other_farmers}
          onChange={(value) =>
            formik.setFieldValue("is_mentoring_other_farmers", value)
          }
        />

        <FormErrorMessage
          error={
            (formik.touched.is_mentoring_other_farmers &&
              formik.errors.is_mentoring_other_farmers) as string
          }
        />

        {formik.values.is_mentoring_other_farmers ? (
          <>
            <AppTextInput
              error={
                formik.touched.number_of_farmers_mentoring &&
                formik.errors.number_of_farmers_mentoring
              }
              label="If Yes, how many farmers are you mentoring"
              placeholder="Enter number of farmers"
              style={{
                backgroundColor: isLoading
                  ? colors.backgroundTertiary
                  : colors.backgroundPrimary,
              }}
              value={formik.values.number_of_farmers_mentoring}
              required
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
              keyboardType="numeric"
              onBlur={() =>
                formik.setFieldTouched("number_of_farmers_mentoring")
              }
              onChangeText={formik.handleChange("number_of_farmers_mentoring")}
            />
            <FormErrorMessage
              error={
                (formik.touched.number_of_farmers_mentoring &&
                  formik.errors.number_of_farmers_mentoring) as string
              }
            />
          </>
        ) : null}

        <YesNoSelector
          label="Membership in Farming Cooperatives/Associations"
          value={formik.values.has_farming_membership}
          onChange={(value) =>
            formik.setFieldValue("has_farming_membership", value)
          }
        />

        <FormErrorMessage
          error={
            (formik.touched.has_farming_membership &&
              formik.errors.has_farming_membership) as string
          }
        />

        <YesNoSelector
          label="Have you received any leadership or agricultural training?"
          value={formik.values.has_received_farming_leadership_training}
          onChange={(value) =>
            formik.setFieldValue(
              "has_received_farming_leadership_training",
              value
            )
          }
        />

        <FormErrorMessage
          error={
            (formik.touched.has_received_farming_leadership_training &&
              formik.errors.has_received_farming_leadership_training) as string
          }
        />
      </KeyboardAwareScrollView>

      <View style={[styles.formFooter, { paddingBottom: bottomInset + 23 }]}>
        <AppButton
          title="Save Changes"
          textColor="white"
          btnColor="buttonPrimary"
          borderRadius={8}
          height={48}
          onPress={formik.submitForm}
          loading={isLoading}
          disabled={!(formik.isValid && formik.dirty)}
        />
      </View>
    </View>
  );
};

export default LeadershipInfoEdit;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 120,
    gap: 32,
  },
  formFooter: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    paddingTop: 23,
    paddingHorizontal: 18,
  },
});
