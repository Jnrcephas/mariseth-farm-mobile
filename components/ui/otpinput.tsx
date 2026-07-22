import React, { FC, useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from "react-native-confirmation-code-field";

import { colors } from "@/constants/colors";
import { isIOS } from "@/constants/generalconstants";

const cell_count = 4;

type OtpInputProps = {
  onOtpEntered: (otp: string) => void;
  clearValue: boolean;
  borderColor?: string;
  autoFocus?: boolean;
};

const OtpInput: FC<OtpInputProps> = ({
  onOtpEntered,
  clearValue,
  borderColor = colors.formBorder,
  autoFocus = false,
}) => {
  const [value, setValue] = useState("");
  const ref = useBlurOnFulfill({ value, cellCount: cell_count });
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value,
    setValue,
  });

  useEffect(() => {
    if (value.length === cell_count) {
      onOtpEntered(value);
    }
  }, [value, onOtpEntered]);

  useEffect(() => {
    if (clearValue) {
      setValue("");
    }
  }, [clearValue]);

  useEffect(() => {
    if (!autoFocus) return;

    const timer = setTimeout(() => {
      ref.current?.focus();
    }, 300);

    return () => clearTimeout(timer);
  }, [autoFocus, ref]);

  return (
    <CodeField
      ref={ref}
      {...props}
      value={value}
      onChangeText={setValue}
      cellCount={cell_count}
      rootStyle={styles.codeFieldRoot}
      keyboardType="number-pad"
      showSoftInputOnFocus
      autoCorrect={false}
      textContentType={isIOS ? "oneTimeCode" : "none"}
      renderCell={({ index, symbol, isFocused }) => (
        <View
          onLayout={getCellOnLayoutHandler(index)}
          key={index}
          style={[
            styles.cell,
            {
              borderColor: isFocused ? colors.primary : borderColor,
            },
            isFocused && styles.cellFocused,
          ]}
        >
          <Text style={styles.cellText}>
            {symbol || (isFocused ? <Cursor /> : null)}
          </Text>
        </View>
      )}
    />
  );
};

export default OtpInput;

const styles = StyleSheet.create({
  codeFieldRoot: {
    width: "100%",
    gap: 11,
  },
  cell: {
    flex: 1,
    height: 54,
    borderWidth: 1,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.white,
  },
  cellFocused: {
    borderRadius: 8,
    shadowColor: colors.formShadow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 3,
  },
  cellText: {
    fontSize: 17,
    color: colors.formInputText,
    textAlign: "center",
    textAlignVertical: "center",
  },
});
