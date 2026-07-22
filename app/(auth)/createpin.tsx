import AppButton from "@/components/ui/appbutton";
import AppText from "@/components/ui/apptext";
import FormErrorMessage from "@/components/ui/formerrormessage";
import PinInput from "@/components/ui/pininput";
import { colors } from "@/constants/colors";
import { images } from "@/constants/images";
import { authStyles } from "@/styles/auth";
import { dataDecoder, dataEncoder } from "@/utils/commonmethods";
import { createPinSchema } from "@/utils/validationschema";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useFormik } from "formik";
import React from "react";
import { Pressable, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const CreatePin = () => {
  const params = useLocalSearchParams<{ data: string }>();
  const paramData: { phone_number: string; code: number | null } = dataDecoder(
    params?.data
  );
  const phoneNumber = paramData?.phone_number;
  const bottomInset = useSafeAreaInsets().bottom;

  const formik = useFormik({
    initialValues: { pin: "" },
    validationSchema: createPinSchema,
    onSubmit: async (values: { pin: string }) => {
      const data = {
        phone_number: phoneNumber,
        pin: values.pin,
        code: paramData?.code,
      };
      router.navigate(`/confirmpin?data=${dataEncoder(data)}`);
    },
  });

  return (
    <>
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
          Create New Pin
        </AppText>

        <PinInput
          autoFocus
          value={formik.values.pin}
          onChangeText={(pin) => formik.setFieldValue("pin", pin)}
          onBlur={() => formik.setFieldTouched("pin", true)}
          error={formik.touched.pin && formik.errors.pin}
        />

        <View style={{ paddingTop: 10 }}>
          <FormErrorMessage error={formik.errors.pin} />
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
          title="Continue"
          textColor="white"
          btnColor="buttonPrimary"
          height={48}
          borderRadius={8}
          fontSize={16}
          style={authStyles.authButton}
          onPress={formik.handleSubmit}
          disabled={!(formik.isValid && formik.dirty)}
        />
      </View>
    </>
  );
};

export default CreatePin;
