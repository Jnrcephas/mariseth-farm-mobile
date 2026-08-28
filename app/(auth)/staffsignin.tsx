import AppButton from "@/components/ui/appbutton";
import AppText from "@/components/ui/apptext";
import AuthLoading from "@/components/ui/authloading";
import FormErrorMessage from "@/components/ui/formerrormessage";
import { colors } from "@/constants/colors";
import { endpoints } from "@/constants/endpoints";
import { images } from "@/constants/images";
import useAuthMutation from "@/hooks/usemutation";
import { userStore } from "@/stores/userstore";
import { authStyles } from "@/styles/auth";
import { handleAdminAuthApiError } from "@/utils/apierrorhandler";
import { emailSignInSchema } from "@/utils/validationschema";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useToast } from "react-native-toast-notifications";

// Field officer / staff sign-in. Same underlying admin accounts as the web
// app (email + password, POST accounts/auth/login), not the farmer phone+PIN
// flow - see endpoints.adminSignIn and isFieldOfficerExperience in
// utils/userroles.ts for why admin credentials are how field officers get
// the onboarding-focused mobile experience.
const StaffSignIn = () => {
  const bottomInset = useSafeAreaInsets().bottom;
  const toast = useToast();
  const passwordInputRef = useRef<TextInput>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );

  const buttonAreaHeight = bottomInset + 88;

  const { mutate, isLoading } = useAuthMutation(
    endpoints.adminSignIn,
    "POST",
    "adminsignin",
    {
      onSuccess: (data: any) => {
        userStore.setState({ user: data });
        router.replace(`/(tabs)`);
      },
      onError: (error: any) => {
        handleAdminAuthApiError(error, { setErrors }, toast);
      },
    }
  );

  const handleSubmit = async () => {
    try {
      await emailSignInSchema.validate(
        { email, password },
        { abortEarly: false }
      );
      setErrors({});
      mutate({ email: email.trim(), password });
    } catch (validationError: any) {
      const nextErrors: { email?: string; password?: string } = {};
      validationError?.inner?.forEach((issue: any) => {
        if (issue.path === "email") {
          nextErrors.email = issue.message;
        }
        if (issue.path === "password") {
          nextErrors.password = issue.message;
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
      <AuthLoading visible={isLoading} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
      >
        <ScrollView
          style={styles.screen}
          contentContainerStyle={[
            authStyles.container,
            styles.scrollContent,
            { paddingBottom: buttonAreaHeight },
          ]}
          keyboardShouldPersistTaps="always"
          keyboardDismissMode="none"
          showsVerticalScrollIndicator={false}
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
            Staff sign in
          </AppText>

          <AppText
            fontSize={14}
            fontFamily="Regular"
            color="textPrimary"
            style={{ marginBottom: 22, lineHeight: 22 }}
          >
            For field officers and other staff. Sign in with your email and
            password.
          </AppText>

          <Text style={styles.fieldLabel}>Email</Text>
          <View
            style={[
              styles.inputBox,
              { backgroundColor: inputBackground, marginBottom: 4 },
            ]}
          >
            <TextInput
              style={styles.textInput}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              returnKeyType="next"
              blurOnSubmit={false}
              onSubmitEditing={() => passwordInputRef.current?.focus()}
              placeholder="Email address"
              placeholderTextColor={colors.formPlaceholderText}
              editable={!isLoading}
              autoCorrect={false}
              autoCapitalize="none"
              underlineColorAndroid="transparent"
            />
          </View>
          <FormErrorMessage error={errors.email} />

          <Text style={[styles.fieldLabel, { marginTop: 16 }]}>Password</Text>
          <View
            style={[
              styles.inputBox,
              { backgroundColor: inputBackground, marginBottom: 4 },
            ]}
          >
            <TextInput
              ref={passwordInputRef}
              style={styles.textInput}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
              placeholder="Password"
              placeholderTextColor={colors.formPlaceholderText}
              editable={!isLoading}
              autoCorrect={false}
              autoCapitalize="none"
              underlineColorAndroid="transparent"
            />
            <Pressable onPress={() => setShowPassword((prev) => !prev)}>
              <AppText fontFamily="SemiBold" color="buttonPrimary" fontSize={13}>
                {showPassword ? "Hide" : "Show"}
              </AppText>
            </Pressable>
          </View>
          <FormErrorMessage error={errors.password} />

          <Pressable
            onPress={() => router.replace("/signin")}
            style={authStyles.authFooter}
          >
            <AppText fontFamily="Regular" color="formLabelText" fontSize={14}>
              Not staff?
            </AppText>
            <AppText fontFamily="SemiBold" color="formLabelText" fontSize={14}>
              Sign in as a farmer
            </AppText>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={[authStyles.buttonContainer, { bottom: bottomInset + 20 }]}>
        <AppButton
          title="Sign in"
          textColor="white"
          btnColor="buttonPrimary"
          height={48}
          borderRadius={8}
          fontSize={16}
          style={authStyles.authButton}
          onPress={handleSubmit}
          disabled={isLoading || !email || !password}
        />
      </View>
    </>
  );
};

export default StaffSignIn;

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  screen: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
  scrollContent: {
    flexGrow: 1,
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
  textInput: {
    flex: 1,
    minHeight: 48,
    fontSize: 17,
    color: colors.textBold,
    paddingVertical: 12,
    paddingHorizontal: 0,
  },
});
