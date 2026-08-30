import AppButton from "@/components/ui/appbutton";
import FormErrorMessage from "@/components/ui/formerrormessage";
import { colors } from "@/constants/colors";
import { endpoints } from "@/constants/endpoints";
import useAuthMutation from "@/hooks/usemutation";
import { handleToastShow } from "@/utils/commonmethods";
import { changePasswordSchema } from "@/utils/validationschema";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useToast } from "react-native-toast-notifications";

type FieldErrors = {
  old_password?: string;
  new_password?: string;
  confirm_password?: string;
};

// Local rather than reusing handleAuthApiError/handleAdminAuthApiError from
// utils/apierrorhandler.ts - both are written around sign-in field names
// (phone_number/pin, email/password) and sign-in copy ("Invalid email or
// password"), neither of which fits a password-change error.
function extractPasswordFieldErrors(message: unknown): FieldErrors {
  const fieldErrors: FieldErrors = {};
  if (!message || typeof message !== "object") return fieldErrors;

  const payload = message as Record<string, string[] | string | undefined>;
  const readField = (key: string) => {
    const raw = payload[key];
    if (!raw) return undefined;
    return Array.isArray(raw) ? raw[0] : String(raw);
  };

  fieldErrors.old_password = readField("old_password");
  fieldErrors.new_password = readField("new_password");

  return fieldErrors;
}

// Field officers/staff have a real password (see app/(auth)/staffsignin.tsx),
// not the 4-digit PIN farmers use - app/more/changepin.tsx doesn't apply to
// them. Matches the web admin's account settings, which use the same
// PATCH accounts/auth/update_password endpoint (old_password + new_password).
const ChangePassword = () => {
  const bottomInset = useSafeAreaInsets().bottom;
  const toast = useToast();
  const newPasswordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});

  const buttonAreaHeight = bottomInset + 88;

  const { mutate, isLoading } = useAuthMutation(
    endpoints.updatePassword,
    "PATCH",
    "updatepassword",
    {
      onSuccess: () => {
        handleToastShow(toast, "Password updated successfully!");
        router.back();
      },
      onError: (error: any) => {
        const fieldErrors = extractPasswordFieldErrors(error?.message);
        if (fieldErrors.old_password || fieldErrors.new_password) {
          setErrors(fieldErrors);
          return;
        }
        handleToastShow(
          toast,
          "Couldn't update your password. Double-check your current password and try again."
        );
      },
    }
  );

  const handleSubmit = async () => {
    try {
      await changePasswordSchema.validate(
        {
          old_password: oldPassword,
          new_password: newPassword,
          confirm_password: confirmPassword,
        },
        { abortEarly: false }
      );
      setErrors({});
      mutate({ old_password: oldPassword, new_password: newPassword });
    } catch (validationError: any) {
      const nextErrors: FieldErrors = {};
      validationError?.inner?.forEach((issue: any) => {
        if (issue.path && !nextErrors[issue.path as keyof FieldErrors]) {
          nextErrors[issue.path as keyof FieldErrors] = issue.message;
        }
      });
      setErrors(nextErrors);
    }
  };

  const inputBackground = isLoading
    ? colors.backgroundTertiary
    : colors.backgroundPrimary;

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
    >
      <ScrollView
        style={styles.screen}
        contentContainerStyle={[
          styles.container,
          { paddingBottom: buttonAreaHeight },
        ]}
        keyboardShouldPersistTaps="always"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.fieldLabel}>Current password</Text>
        <View style={[styles.inputBox, { backgroundColor: inputBackground }]}>
          <TextInput
            style={styles.textInput}
            value={oldPassword}
            onChangeText={setOldPassword}
            secureTextEntry
            returnKeyType="next"
            blurOnSubmit={false}
            onSubmitEditing={() => newPasswordRef.current?.focus()}
            placeholder="Current password"
            placeholderTextColor={colors.formPlaceholderText}
            editable={!isLoading}
            autoCorrect={false}
            autoCapitalize="none"
          />
        </View>
        <FormErrorMessage error={errors.old_password} />

        <Text style={[styles.fieldLabel, { marginTop: 16 }]}>
          New password
        </Text>
        <View style={[styles.inputBox, { backgroundColor: inputBackground }]}>
          <TextInput
            ref={newPasswordRef}
            style={styles.textInput}
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
            returnKeyType="next"
            blurOnSubmit={false}
            onSubmitEditing={() => confirmPasswordRef.current?.focus()}
            placeholder="New password"
            placeholderTextColor={colors.formPlaceholderText}
            editable={!isLoading}
            autoCorrect={false}
            autoCapitalize="none"
          />
        </View>
        <FormErrorMessage error={errors.new_password} />

        <Text style={[styles.fieldLabel, { marginTop: 16 }]}>
          Confirm new password
        </Text>
        <View style={[styles.inputBox, { backgroundColor: inputBackground }]}>
          <TextInput
            ref={confirmPasswordRef}
            style={styles.textInput}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            returnKeyType="done"
            onSubmitEditing={handleSubmit}
            placeholder="Confirm new password"
            placeholderTextColor={colors.formPlaceholderText}
            editable={!isLoading}
            autoCorrect={false}
            autoCapitalize="none"
          />
        </View>
        <FormErrorMessage error={errors.confirm_password} />
      </ScrollView>

      <View style={[styles.buttonContainer, { bottom: bottomInset + 20 }]}>
        <AppButton
          title="Update password"
          textColor="white"
          btnColor="buttonPrimary"
          height={48}
          borderRadius={8}
          fontSize={16}
          onPress={handleSubmit}
          disabled={
            isLoading || !oldPassword || !newPassword || !confirmPassword
          }
        />
      </View>
    </KeyboardAvoidingView>
  );
};

export default ChangePassword;

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  screen: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
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
  },
  buttonContainer: {
    position: "absolute",
    left: 16,
    right: 16,
  },
});
