import { colors } from "@/constants/colors";
import { icons } from "@/constants/icons";
import { Image } from "expo-image";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import AppText from "./apptext";

interface CheckboxFieldProps {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}

/** A labelled tick box (used for the farmer's data-consent statement). */
const CheckboxField: React.FC<CheckboxFieldProps> = ({
  label,
  value,
  onChange,
  disabled = false,
}) => (
  <Pressable
    style={styles.container}
    onPress={() => onChange(!value)}
    disabled={disabled}
    accessibilityRole="checkbox"
    accessibilityState={{ checked: value, disabled }}
  >
    <View style={[styles.box, value && styles.boxChecked]}>
      {value ? (
        <Image
          source={icons.checkmark}
          style={styles.tick}
          tintColor={colors.white}
        />
      ) : null}
    </View>
    <AppText
      fontFamily="Medium"
      fontSize={14}
      color="formLabelText"
      style={{ flex: 1 }}
    >
      {label}
    </AppText>
  </Pressable>
);

export default CheckboxField;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.formBorder,
    backgroundColor: colors.white,
  },
  box: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.formBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  boxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tick: {
    width: 14,
    height: 14,
  },
});
