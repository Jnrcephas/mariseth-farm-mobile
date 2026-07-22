import AppButton from "@/components/ui/appbutton";
import AppText from "@/components/ui/apptext";
import PinInput from "@/components/ui/pininput";
import FormErrorMessage from "@/components/ui/formerrormessage";
import ResendTimer from "@/components/ui/resendtimer";
import { colors } from "@/constants/colors";
import { endpoints } from "@/constants/endpoints";
import { images } from "@/constants/images";
import useAuthMutation from "@/hooks/usemutation";
import { authStyles } from "@/styles/auth";
import { handleAuthApiError } from "@/utils/apierrorhandler";
import { dataDecoder, dataEncoder } from "@/utils/commonmethods";
import { otpverificationSchema } from "@/utils/validationschema";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useFormik } from "formik";
import React from "react";
import { Pressable, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useToast } from "react-native-toast-notifications";

const OtpVerification = () => {
  const params = useLocalSearchParams<{ data: string }>();
  const paramData: { phone_number: string; action: "signup" | "pinreset" } =
    dataDecoder(params?.data);
  const phoneNumber = paramData?.phone_number;
  const isSignup = paramData?.action === "signup";
  const bottomInset = useSafeAreaInsets().bottom;
  const toast = useToast();

  const { mutate, isLoading } = useAuthMutation(
    endpoints.verify,
    "POST",
    "otpverification",
    {
      onSuccess: () => {
        const item = {
          phone_number: phoneNumber,
          code: isSignup ? null : formik.values.code,
        };
        router.replace(`/createpin?data=${dataEncoder(item)}`);
      },
      onError: (error: any) => {
        handleAuthApiError(error, formik, toast);
      },
    }
  );

  const formik = useFormik({
    initialValues: { phone_number: phoneNumber || "", code: "" },
    validationSchema: otpverificationSchema,
    onSubmit: async (values: { phone_number: string; code: string }) => {
      mutate(values);
    },
  });

  const buttonTitle =
    paramData?.action === "signup" || paramData?.action === "pinreset"
      ? "Continue"
      : "Sign In";

  return (
    <>
      <KeyboardAwareScrollView
        extraHeight={100}
        enableOnAndroid={true}
        keyboardShouldPersistTaps="always"
        keyboardDismissMode="none"
        bounces={false}
        style={{ flex: 1, backgroundColor: colors.backgroundPrimary }}
        contentContainerStyle={authStyles.pinContainer}
      >
        <Image
          source={images.logo}
          style={authStyles.logo}
          contentFit="contain"
        />

        <AppText fontSize={22} fontFamily="SemiBold" color="textBold">
          Please check your SMS
        </AppText>

        <AppText
          fontSize={14}
          fontFamily="Regular"
          color="textPrimary"
          style={{ marginTop: 8, marginBottom: 22, lineHeight: 22 }}
        >
          We sent you a temporary pin to gain access to your account. Please
          check and enter that password here.
        </AppText>

        <PinInput
          autoFocus
          value={formik.values.code}
          onChangeText={(code) => formik.setFieldValue("code", code)}
          onBlur={() => formik.setFieldTouched("code", true)}
          error={formik.touched.code && formik.errors.code}
          placeholder="Enter temporary pin"
          editable={!isLoading}
        />

        <View style={{ paddingTop: 10 }}>
          <FormErrorMessage error={formik.errors.code as string} />
        </View>

        <View style={{ marginTop: 10 }}>
          <ResendTimer
            setOtp={() => formik.setFieldValue("code", "")}
            formik={formik}
          />
        </View>

        <Pressable
          onPress={() => router.navigate("/signin")}
          style={authStyles.authFooter}
        >
          <AppText fontFamily="Regular" color="formLabelText" fontSize={14}>
            Already have an account?
          </AppText>
          <AppText fontFamily="SemiBold" color="formLabelText" fontSize={14}>
            Sign in
          </AppText>
        </Pressable>
      </KeyboardAwareScrollView>

      <View style={[authStyles.buttonContainer, { bottom: bottomInset + 20 }]}>
        <AppButton
          title={buttonTitle}
          textColor="white"
          btnColor="buttonPrimary"
          height={48}
          borderRadius={8}
          fontSize={16}
          style={authStyles.authButton}
          onPress={formik.submitForm}
          loading={isLoading}
          disabled={!(formik.isValid && formik.dirty)}
        />
      </View>
    </>
  );
};

export default OtpVerification;
