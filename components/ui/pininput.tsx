import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

import { colors } from "@/constants/colors";

type PinInputProps = {
  label?: string;
  value?: string;
  onChangeText: (pin: string) => void;
  onBlur?: () => void;
  error?: string | false;
  placeholder?: string;
  autoFocus?: boolean;
  editable?: boolean;
};

const PinInput: React.FC<PinInputProps> = ({
  label,
  value = "",
  onChangeText,
  onBlur,
  error,
  placeholder = "Enter PIN",
  autoFocus = false,
  editable = true,
}) => {
  const borderColor = error ? colors.error : colors.formBorder;
  const backgroundColor = editable
    ? colors.backgroundPrimary
    : colors.backgroundTertiary;

  return (
    <View>
      {label ? <Text style={styles.fieldLabel}>{label}</Text> : null}
      <View style={[styles.inputBox, { borderColor, backgroundColor }]}>
        <TextInput
          style={styles.textInput}
          value={value}
          onChangeText={(text) => onChangeText(text.replace(/\D/g, "").slice(0, 4))}
          onBlur={onBlur}
          placeholder={placeholder}
          placeholderTextColor={colors.formPlaceholderText}
          keyboardType="number-pad"
          maxLength={4}
          autoCapitalize="none"
          autoCorrect={false}
          autoFocus={autoFocus}
          editable={editable}
          autoComplete="off"
          underlineColorAndroid="transparent"
          selectionColor={colors.primary}
          cursorColor="#101828"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  fieldLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.formLabelText,
    marginBottom: 12,
  },
  inputBox: {
    borderWidth: 1,
    borderRadius: 8,
    minHeight: 54,
    paddingHorizontal: 12,
    justifyContent: "center",
  },
  textInput: {
    minHeight: 48,
    fontSize: 17,
    color: "#101828",
    paddingVertical: 12,
    paddingHorizontal: 0,
    includeFontPadding: false,
  },
});

export default PinInput;
