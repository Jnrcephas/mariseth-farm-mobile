import AppButton from "@/components/ui/appbutton";
import AppText from "@/components/ui/apptext";
import AuthLoading from "@/components/ui/authloading";
import FormErrorMessage from "@/components/ui/formerrormessage";
import PinInput from "@/components/ui/pininput";
import { colors } from "@/constants/colors";
import { endpoints } from "@/constants/endpoints";
import { images } from "@/constants/images";
import useAuthMutation from "@/hooks/usemutation";
import { authStyles } from "@/styles/auth";
import { handleAuthApiError } from "@/utils/apierrorhandler";
import { dataDecoder, handleToastShow } from "@/utils/commonmethods";
import { confirmPinSchema } from "@/utils/validationschema";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useFormik } from "formik";
import React from "react";
import { Pressable, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useToast } from "react-native-toast-notifications";

const ConfirmPin = () => {
  const params = useLocalSearchParams<{ data: string }>();
  const paramsData: {
    phone_number: string;
    pin: string;
    code: number | null;
  } = dataDecoder(params?.data);
  const bottomInset = useSafeAreaInsets().bottom;
  const isSignup = paramsData?.code === null;

  const toast = useToast();

  const { mutate, isLoading } = useAuthMutation(
    isSignup ? endpoints.pinSetup : endpoints.resetPin,
    "POST",
    isSignup ? "confirmpin" : "resetpin",
    {
      onSuccess: (data) => {
        const toastMessage = isSignup
          ? "Registration completed successfully."
          : "All set — your new password is ready to use";

        handleToastShow(toast, toastMessage);
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
    initialValues: {
      phone_number: paramsData?.phone_number || "",
      pin: paramsData?.pin || "",
      confirm_pin: "",
    },
    validationSchema: confirmPinSchema,
    onSubmit: async (values: {
      phone_number: string;
      pin: string;
      confirm_pin: string;
    }) => {
      const signUpItem = {
        phone_number: values?.phone_number,
        pin: values?.pin,
      };

      const resetPinItem = {
        phone_number: values?.phone_number,
        new_pin: values?.pin,
        code: paramsData?.code,
      };
      mutate(isSignup ? signUpItem : resetPinItem);
    },
  });

  return (
    <>
      <AuthLoading visible={isLoading} />
      <KeyboardAwareScrollView
        extraScrollHeight={50}
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

        <AppText
          fontSize={22}
          fontFamily="SemiBold"
          color="textBold"
          style={{ marginBottom: 22 }}
        >
          Confirm Pin
        </AppText>

        <PinInput
          autoFocus
          value={formik.values.confirm_pin}
          onChangeText={(pin) => formik.setFieldValue("confirm_pin", pin)}
          onBlur={() => formik.setFieldTouched("confirm_pin", true)}
          error={formik.touched.confirm_pin && formik.errors.confirm_pin}
          placeholder="Confirm PIN"
        />

        <View style={{ paddingTop: 10 }}>
          <FormErrorMessage error={formik.errors.confirm_pin} />
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
          title="Sign in"
          textColor="white"
          btnColor="buttonPrimary"
          height={48}
          borderRadius={8}
          fontSize={16}
          style={authStyles.authButton}
          onPress={formik.submitForm}
          disabled={!(formik.isValid && formik.dirty) || isLoading}
        />
      </View>
    </>
  );
};

export default ConfirmPin;
