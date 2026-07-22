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
import { handleAuthApiError } from "@/utils/apierrorhandler";
import { signInSchema } from "@/utils/validationschema";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Keyboard,
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

const SignIn = () => {
  const bottomInset = useSafeAreaInsets().bottom;
  const toast = useToast();
  const scrollRef = useRef<ScrollView>(null);
  const phoneInputRef = useRef<TextInput>(null);
  const pinInputRef = useRef<TextInput>(null);
  const pinSectionY = useRef(0);
  const pinFocusedRef = useRef(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [pin, setPin] = useState("");
  const [errors, setErrors] = useState<{ phone_number?: string; pin?: string }>(
    {}
  );

  const buttonAreaHeight = bottomInset + 88;

  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, (event) => {
      setKeyboardHeight(event.endCoordinates.height);
      if (pinFocusedRef.current) {
        scrollPinIntoView();
      }
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const scrollPinIntoView = () => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({
        y: Math.max(0, pinSectionY.current - 24),
        animated: true,
      });
    }, 120);
  };

  const { mutate, isLoading } = useAuthMutation(
    endpoints.signIn,
    "POST",
    "signin",
    {
      onSuccess: (data) => {
        userStore.setState({ user: data });
        router.replace(`/(tabs)`);
      },
      onError: (error: any) => {
        handleAuthApiError(error, { setErrors }, toast);
      },
    }
  );

  const handleSubmit = async () => {
    try {
      await signInSchema.validate(
        { phone_number: phoneNumber, pin },
        { abortEarly: false }
      );
      setErrors({});
      mutate({ phone_number: `233${phoneNumber}`, pin });
    } catch (validationError: any) {
      const nextErrors: { phone_number?: string; pin?: string } = {};
      validationError?.inner?.forEach((issue: any) => {
        if (issue.path === "phone_number") {
          nextErrors.phone_number = issue.message;
        }
        if (issue.path === "pin") {
          nextErrors.pin = issue.message;
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
          ref={scrollRef}
          style={styles.screen}
          contentContainerStyle={[
            authStyles.container,
            styles.scrollContent,
            {
              paddingBottom: buttonAreaHeight + keyboardHeight,
            },
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
          Welcome back
        </AppText>

        <AppText
          fontSize={14}
          fontFamily="Regular"
          color="textPrimary"
          style={{ marginBottom: 22, lineHeight: 22 }}
        >
          Sign in to continue
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
            ref={phoneInputRef}
            style={styles.textInput}
            value={phoneNumber}
            onChangeText={(text) =>
              setPhoneNumber(text.replace(/\D/g, "").slice(0, 10))
            }
            keyboardType="phone-pad"
            returnKeyType="next"
            blurOnSubmit={false}
            onSubmitEditing={() => pinInputRef.current?.focus()}
            maxLength={10}
            placeholder="Phone number"
            placeholderTextColor={colors.formPlaceholderText}
            editable={!isLoading}
            autoCorrect={false}
            autoCapitalize="none"
            underlineColorAndroid="transparent"
          />
        </View>
        <FormErrorMessage error={errors.phone_number} />

        <View
          onLayout={(event) => {
            pinSectionY.current = event.nativeEvent.layout.y;
          }}
        >
          <Text style={[styles.fieldLabel, { marginTop: 16 }]}>PIN</Text>
          <View
            style={[
              styles.inputBox,
              { backgroundColor: inputBackground, marginBottom: 4 },
            ]}
          >
            <TextInput
              ref={pinInputRef}
              style={styles.textInput}
              value={pin}
              onChangeText={(text) =>
                setPin(text.replace(/\D/g, "").slice(0, 4))
              }
              keyboardType="number-pad"
              maxLength={4}
              placeholder="Enter your pin"
              placeholderTextColor={colors.formPlaceholderText}
              editable={!isLoading}
              autoCorrect={false}
              autoCapitalize="none"
              underlineColorAndroid="transparent"
              onFocus={() => {
                pinFocusedRef.current = true;
                scrollPinIntoView();
              }}
              onBlur={() => {
                pinFocusedRef.current = false;
              }}
            />
          </View>
          <FormErrorMessage error={errors.pin} />
        </View>

        <Pressable
          onPress={() => router.navigate("/forgotpin")}
          style={{ marginTop: 8 }}
        >
          <AppText fontFamily="SemiBold" color="buttonPrimary" fontSize={14}>
            Forgot pin?
          </AppText>
        </Pressable>

        <Pressable
          onPress={() => router.navigate("/signup")}
          style={authStyles.authFooter}
        >
          <AppText fontFamily="Regular" color="formLabelText" fontSize={14}>
            Don&apos;t have an account?
          </AppText>
          <AppText fontFamily="SemiBold" color="formLabelText" fontSize={14}>
            Sign up
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
          disabled={isLoading || !phoneNumber || !pin}
        />
      </View>
    </>
  );
};

export default SignIn;

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
