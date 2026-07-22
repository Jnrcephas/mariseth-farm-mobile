import AppText from "@/components/ui/apptext";
import { colors } from "@/constants/colors";
import { icons } from "@/constants/icons";
import { Image } from "expo-image";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";

interface YesNoSelectorProps {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  required?: boolean;
}

const options = [
  { value: true, label: "Yes" },
  { value: false, label: "No" },
] as const;

const YesNoSelector: React.FC<YesNoSelectorProps> = ({
  label,
  value,
  onChange,
  required = true,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <AppText fontFamily="SemiBold" fontSize={14} color="formLabelText">
          {label}
        </AppText>
        {required ? (
          <AppText fontFamily="SemiBold" fontSize={14} color="error">
            *
          </AppText>
        ) : null}
      </View>

      <View style={styles.optionsRow}>
        {options.map((option) => {
          const isSelected = value === option.value;

          return (
            <Pressable
              key={String(option.value)}
              style={[
                styles.optionCard,
                isSelected && styles.optionCardSelected,
              ]}
              onPress={() => onChange(option.value)}
            >
              <AppText fontFamily="Medium" fontSize={14} color="textBold">
                {option.label}
              </AppText>
              {isSelected ? (
                <Image
                  source={icons.checkmark}
                  style={styles.checkIcon}
                  tintColor={colors.primary}
                />
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

export default YesNoSelector;

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  optionsRow: {
    flexDirection: "row",
    gap: 17,
  },
  optionCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 48,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: colors.white,
    boxShadow: "0px 4px 19px 0px rgba(63, 30, 87, 0.10)",
  },
  optionCardSelected: {
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  checkIcon: {
    width: 20,
    height: 20,
  },
});
