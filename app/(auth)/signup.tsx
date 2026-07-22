import AppButton from "@/components/ui/appbutton";
import AppText from "@/components/ui/apptext";
import FormErrorMessage from "@/components/ui/formerrormessage";
import { colors } from "@/constants/colors";
import { endpoints } from "@/constants/endpoints";
import { images } from "@/constants/images";
import useAuthMutation from "@/hooks/usemutation";
import { authStyles } from "@/styles/auth";
import { handleAuthApiError } from "@/utils/apierrorhandler";
import { dataEncoder } from "@/utils/commonmethods";
import { phoneNumberSchema } from "@/utils/validationschema";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useToast } from "react-native-toast-notifications";

const SignUp = () => {
  const bottomInset = useSafeAreaInsets().bottom;
  const toast = useToast();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [errors, setErrors] = useState<{ phone_number?: string }>({});

  const { mutate, isLoading } = useAuthMutation(
    endpoints.signup,
    "POST",
    "signup",
    {
      onSuccess: () => {
        const item = {
          phone_number: `233${phoneNumber}`,
          action: "signup",
        };
        router.navigate(`/otpverification?data=${dataEncoder(item)}`);
      },
      onError: (error: any) => {
        handleAuthApiError(error, { setErrors }, toast);
      },
    }
  );

  const handleSubmit = async () => {
    try {
      await phoneNumberSchema.validate(
        { phone_number: phoneNumber },
        { abortEarly: false }
      );
      setErrors({});
      mutate({ phone_number: `233${phoneNumber}` });
    } catch (validationError: any) {
      const nextErrors: { phone_number?: string } = {};
      validationError?.inner?.forEach((issue: any) => {
        if (issue.path === "phone_number") {
          nextErrors.phone_number = issue.message;
        }
      });
      setErrors(nextErrors);
    }
  };

  const inputBackground = isLoading
    ? colors.backgroundTertiary
    : colors.backgroundPrimary;

  return (
    <>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={authStyles.container}
        keyboardShouldPersistTaps="always"
        keyboardDismissMode="none"
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
          style={{ marginBottom: 6 }}
        >
          Welcome to Mariseth Farms
        </AppText>

        <AppText
          fontSize={14}
          fontFamily="Regular"
          color="textPrimary"
          style={{ marginBottom: 22, lineHeight: 22 }}
        >
          Enter your phone number and we&apos;ll send you a code to verify it
        </AppText>

        <Text style={styles.fieldLabel}>Phone Number</Text>
        <View
          style={[
            styles.inputBox,
            { backgroundColor: inputBackground, marginBottom: 4 },
          ]}
        >
          <Text style={styles.prefix}>+233</Text>
          <TextInput
            style={styles.textInput}
            value={phoneNumber}
            onChangeText={(text) =>
              setPhoneNumber(text.replace(/\D/g, "").slice(0, 9))
            }
            keyboardType="phone-pad"
            returnKeyType="done"
            maxLength={9}
            placeholder="Phone number"
            placeholderTextColor={colors.formPlaceholderText}
            editable={!isLoading}
            autoCorrect={false}
            autoCapitalize="none"
            underlineColorAndroid="transparent"
          />
        </View>
        <FormErrorMessage error={errors.phone_number} />

        <Pressable
          onPress={() => router.push("/(auth)/signin")}
          style={authStyles.authFooter}
        >
          <AppText fontFamily="Regular" color="formLabelText" fontSize={14}>
            Already have an account?
          </AppText>
          <AppText fontFamily="SemiBold" color="buttonPrimary" fontSize={14}>
            Sign in
          </AppText>
        </Pressable>
      </ScrollView>

      <View style={[authStyles.buttonContainer, { bottom: bottomInset + 20 }]}>
        <AppButton
          title="Continue"
          textColor="white"
          btnColor="buttonPrimary"
          height={48}
          borderRadius={8}
          fontSize={16}
          style={authStyles.authButton}
          onPress={handleSubmit}
          loading={isLoading}
          disabled={isLoading || !phoneNumber}
        />
      </View>
    </>
  );
};

export default SignUp;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.formLabelText,
    marginBottom: 12,
  },
  inputBox: {
    borderWidth: 1,
    borderColor: colors.formBorder,
    borderRadius: 8,
    minHeight: 54,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  prefix: {
    fontSize: 17,
    color: colors.formInputText,
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    minHeight: 48,
    fontSize: 17,
    color: "#101828",
    paddingVertical: 12,
    paddingHorizontal: 0,
  },
});
