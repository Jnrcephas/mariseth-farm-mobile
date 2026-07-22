import React, { useState } from "react";
import {
  Platform,
  StyleSheet,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from "react-native";

import { colors } from "@/constants/colors";
import { isIOS, largeScreen } from "@/constants/generalconstants";
import { icons } from "@/constants/icons";
import { Image } from "expo-image";
import AppText from "./apptext";

interface AppTextInputProps extends TextInputProps {
  Inputstyle?: TextInputProps["style"];
  style?: View["props"]["style"];
  marginLeft?: number;
  marginRight?: number;
  required?: boolean;
  TextinputHeight?: number;
  borderRadius?: number;
  label?: string;
  optional?: boolean;
  error?: unknown;
  leftComponent?: React.ReactNode;
}

const ANDROID_INPUT_COLOR = "#101828";

const AppTextInput: React.FC<AppTextInputProps> = ({
  Inputstyle,
  style,
  marginLeft,
  marginRight,
  required,
  placeholderTextColor = colors.formPlaceholderText,
  placeholder = "",
  secureTextEntry = false,
  TextinputHeight = largeScreen ? 54 : 54,
  borderRadius = 8,
  textAlignVertical,
  label,
  optional,
  error,
  leftComponent,
  onFocus,
  onBlur,
  onChangeText,
  onEndEditing,
  showSoftInputOnFocus = true,
  value,
  editable = true,
  keyboardType,
  ...textInputProps
}) => {
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const isNumericKeyboard =
    keyboardType === "number-pad" || keyboardType === "numeric";
  const useSecureEntry =
    Boolean(secureTextEntry && !isPasswordVisible) &&
    (isIOS || !isNumericKeyboard);

  const borderColor = error
    ? colors.error
    : isFocused
    ? colors.primary
    : colors.formBorder;

  const inputStyle = Platform.select({
    ios: {
      flex: 1,
      height: "100%" as const,
      fontFamily: "Regular",
      color: ANDROID_INPUT_COLOR,
      fontSize: 17,
      textAlignVertical: textAlignVertical ?? "center",
    },
    android: {
      flex: 1,
      minHeight: 48,
      color: ANDROID_INPUT_COLOR,
      fontSize: 17,
      paddingVertical: 12,
      paddingHorizontal: 0,
      includeFontPadding: false,
      textAlignVertical: textAlignVertical ?? "center",
    },
    default: {
      flex: 1,
      color: ANDROID_INPUT_COLOR,
      fontSize: 17,
    },
  });

  return (
    <>
      {label ? (
        <View style={styles.labelRow}>
          <View style={styles.labelTitleRow}>
            <AppText fontSize={14} fontFamily="SemiBold" color="formLabelText">
              {label}
            </AppText>
            {required ? (
              <AppText fontSize={14} color="error" fontFamily="SemiBold">
                *
              </AppText>
            ) : null}
          </View>
          {optional ? (
            <AppText fontSize={12} fontFamily="Medium" color="textPrimary">
              Optional
            </AppText>
          ) : null}
        </View>
      ) : null}

      <View
        style={[
          styles.container,
          style,
          {
            marginLeft,
            marginRight,
            minHeight: TextinputHeight,
            borderColor,
            borderRadius,
          },
          isFocused && isIOS && styles.focusedContainer,
        ]}
      >
        {leftComponent}

        <TextInput
          {...textInputProps}
          style={[inputStyle, Inputstyle]}
          placeholder={placeholder}
          placeholderTextColor={placeholderTextColor}
          keyboardType={keyboardType}
          value={value ?? ""}
          editable={editable}
          secureTextEntry={useSecureEntry}
          autoCapitalize="none"
          autoCorrect={false}
          underlineColorAndroid="transparent"
          showSoftInputOnFocus={showSoftInputOnFocus}
          onChangeText={onChangeText}
          onFocus={(event) => {
            setIsFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setIsFocused(false);
            onBlur?.(event);
          }}
          onEndEditing={(event) => {
            setIsFocused(false);
            onEndEditing?.(event);
          }}
          {...(isIOS
            ? {}
            : {
                selectionColor: colors.primary,
                cursorColor: ANDROID_INPUT_COLOR,
              })}
        />

        {secureTextEntry && useSecureEntry ? (
          <TouchableOpacity
            onPress={() => setPasswordVisible((visible) => !visible)}
            style={styles.iconContainer}
          >
            <Image
              source={isPasswordVisible ? icons.eye : icons.eyeSlash}
              style={styles.eyeIcon}
              contentFit="contain"
            />
          </TouchableOpacity>
        ) : null}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    gap: 4,
  },
  labelTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flex: 1,
  },
  container: {
    borderWidth: 1,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  focusedContainer: {
    shadowColor: colors.formShadow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 3,
  },
  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  eyeIcon: {
    height: 25,
    width: 25,
    tintColor: colors.primary,
  },
});

export default AppTextInput;
