import AppButton from "@/components/ui/appbutton";
import AppText from "@/components/ui/apptext";
import PinInput from "@/components/ui/pininput";
import FormErrorMessage from "@/components/ui/formerrormessage";
import { colors } from "@/constants/colors";
import { endpoints } from "@/constants/endpoints";
import { images } from "@/constants/images";
import useAuthMutation from "@/hooks/usemutation";
import { authStyles } from "@/styles/auth";
import { handleAuthApiError } from "@/utils/apierrorhandler";
import { handleToastShow } from "@/utils/commonmethods";
import { resetPinSchema } from "@/utils/validationschema";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useFormik } from "formik";
import React from "react";
import { StyleSheet, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useToast } from "react-native-toast-notifications";

const ResetPin = () => {
  const params = useLocalSearchParams<{ phone_number: string }>();
  const phoneNumber = params?.phone_number;
  const bottomInset = useSafeAreaInsets().bottom;
  const toast = useToast();

  const { mutate, isLoading } = useAuthMutation(
    endpoints.resetPin,
    "POST",
    "resetpin",
    {
      onSuccess: (data) => {
        handleToastShow(toast, "All set — your new password is ready to use");
        setTimeout(() => {
          router.replace(`/(auth)/signin`);
        }, 300);
        console.log(data);
      },
      onError: (error: any) => {
        handleAuthApiError(error, formik, toast);
      },
    }
  );

  const formik = useFormik({
    initialValues: { code: "", pin: "", new_pin: "" },
    validationSchema: resetPinSchema,
    onSubmit: async (values: {
      code: string;
      pin: string;
      new_pin: string;
    }) => {
      const data = {
        phone_number: phoneNumber,
        code: values.code,
        new_pin: values.new_pin,
      };
      mutate(data);
    },
  });
  return (
    <>
      <KeyboardAwareScrollView
        extraHeight={100}
        enableOnAndroid={true}
        extraScrollHeight={50}
        keyboardShouldPersistTaps="always"
        keyboardDismissMode="none"
        bounces={false}
        style={{ flex: 1, backgroundColor: colors.backgroundPrimary }}
        contentContainerStyle={authStyles.container}
      >
        <Image
          source={images.logo}
          style={authStyles.logo}
          contentFit="contain"
        />

        <AppText
          fontSize={22}
          fontFamily="SemiBold"
          color="textBold"
          style={{ marginBottom: 22 }}
        >
          Reset Pin
        </AppText>
        <PinInput
          autoFocus
          label="Verification Code"
          value={formik.values.code}
          onChangeText={(code) => formik.setFieldValue("code", code)}
          onBlur={() => formik.setFieldTouched("code", true)}
          error={formik.touched.code && formik.errors.code}
          placeholder="Enter code"
          editable={!isLoading}
        />

        <View style={{ paddingTop: 10 }}>
          <FormErrorMessage error={formik.errors.code} />
        </View>

        <PinInput
          label="New Pin"
          value={formik.values.pin}
          onChangeText={(pin) => formik.setFieldValue("pin", pin)}
          onBlur={() => formik.setFieldTouched("pin", true)}
          error={formik.touched.pin && formik.errors.pin}
          editable={!isLoading}
        />

        <FormErrorMessage
          error={(formik.touched.pin && formik.errors.pin) as string}
        />

        <PinInput
          label="Confirm Pin"
          value={formik.values.new_pin}
          onChangeText={(pin) => formik.setFieldValue("new_pin", pin)}
          onBlur={() => formik.setFieldTouched("new_pin", true)}
          error={formik.touched.new_pin && formik.errors.new_pin}
          editable={!isLoading}
        />

        <FormErrorMessage
          error={(formik.touched.new_pin && formik.errors.new_pin) as string}
        />
      </KeyboardAwareScrollView>
      <View style={[authStyles.buttonContainer, { bottom: bottomInset + 20 }]}>
        <AppButton
          title="Reset"
          textColor="white"
          btnColor="buttonPrimary"
          style={{}}
          onPress={formik.submitForm}
          loading={isLoading}
          disabled={!(formik.isValid && formik.dirty)}
        />
      </View>
    </>
  );
};

export default ResetPin;

const styles = StyleSheet.create({});
