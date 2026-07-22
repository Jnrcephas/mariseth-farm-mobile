import AppButton from "@/components/ui/appbutton";
import FormErrorMessage from "@/components/ui/formerrormessage";
import PinInput from "@/components/ui/pininput";
import { colors } from "@/constants/colors";
import { endpoints } from "@/constants/endpoints";
import useAuthMutation from "@/hooks/usemutation";
import { handleAuthApiError } from "@/utils/apierrorhandler";
import { handleToastShow } from "@/utils/commonmethods";
import { pinUpdateSchema } from "@/utils/validationschema";
import { router } from "expo-router";
import { useFormik } from "formik";
import React from "react";
import { StyleSheet, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useToast } from "react-native-toast-notifications";

interface PinFieldProps {
  label: string;
  value: string;
  error?: string | false;
  onChangeText: (pin: string) => void;
  onBlur: () => void;
  autoFocus?: boolean;
  editable?: boolean;
}

const PinField: React.FC<PinFieldProps> = ({
  label,
  value,
  error,
  onChangeText,
  onBlur,
  autoFocus = false,
  editable = true,
}) => {
  return (
    <View style={styles.pinField}>
      <PinInput
        label={label}
        value={value}
        onChangeText={onChangeText}
        onBlur={onBlur}
        error={error}
        autoFocus={autoFocus}
        editable={editable}
      />
      <FormErrorMessage error={error as string} />
    </View>
  );
};

const ChangePin = () => {
  const bottomInset = useSafeAreaInsets().bottom;
  const toast = useToast();

  const { mutate, isLoading } = useAuthMutation(
    endpoints.updatePin,
    "PATCH",
    "pinupdate",
    {
      onSuccess: () => {
        handleToastShow(toast, "Pin updated successfully");
        formik.resetForm();
        setTimeout(() => {
          router.back();
        }, 500);
      },

      onError: (error: any) => {
        handleAuthApiError(error, formik, toast);
      },
    }
  );

  const formik = useFormik({
    initialValues: { old_pin: "", new_pin: "", confirm_new_pin: "" },
    validationSchema: pinUpdateSchema,
    onSubmit: async (values) => {
      mutate({ old_pin: values.old_pin, new_pin: values.new_pin });
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
        <PinField
          autoFocus
          label="Enter Old Pin"
          value={formik.values.old_pin}
          error={formik.touched.old_pin && formik.errors.old_pin}
          editable={!isLoading}
          onChangeText={(pin) => formik.setFieldValue("old_pin", pin)}
          onBlur={() => formik.setFieldTouched("old_pin", true)}
        />

        <PinField
          label="Enter New Pin"
          value={formik.values.new_pin}
          error={formik.touched.new_pin && formik.errors.new_pin}
          editable={!isLoading}
          onChangeText={(pin) => formik.setFieldValue("new_pin", pin)}
          onBlur={() => formik.setFieldTouched("new_pin", true)}
        />

        <PinField
          label="Confirm New Pin"
          value={formik.values.confirm_new_pin}
          error={
            formik.touched.confirm_new_pin && formik.errors.confirm_new_pin
          }
          editable={!isLoading}
          onChangeText={(pin) => formik.setFieldValue("confirm_new_pin", pin)}
          onBlur={() => formik.setFieldTouched("confirm_new_pin", true)}
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

export default ChangePin;

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
  pinField: {
    gap: 12,
  },
  formFooter: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    paddingTop: 23,
    paddingHorizontal: 18,
    pointerEvents: "box-none",
  },
});
