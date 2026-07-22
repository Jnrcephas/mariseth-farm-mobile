import AppText from "@/components/ui/apptext";
import { colors } from "@/constants/colors";
import { icons } from "@/constants/icons";
import { Image } from "expo-image";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";

export type ApplyForOption = "myself" | "my_farmer";

interface ApplyForSelectorProps {
  value: ApplyForOption;
  onChange: (value: ApplyForOption) => void;
  showSelectionIndicator?: boolean;
}

const options: { value: ApplyForOption; label: string }[] = [
  { value: "myself", label: "Myself" },
  { value: "my_farmer", label: "My Farmer" },
];

const ApplyForSelector: React.FC<ApplyForSelectorProps> = ({
  value,
  onChange,
  showSelectionIndicator = true,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <AppText fontFamily="SemiBold" fontSize={14} color="formLabelText">
          Apply For
        </AppText>
        <AppText fontFamily="SemiBold" fontSize={14} color="error">
          *
        </AppText>
      </View>

      <View style={styles.optionsRow}>
        {options.map((option) => {
          const isSelected = value === option.value;

          return (
            <Pressable
              key={option.value}
              style={[
                styles.optionCard,
                isSelected && showSelectionIndicator && styles.optionCardSelected,
              ]}
              onPress={() => onChange(option.value)}
            >
              <Image
                source={icons.user}
                style={styles.optionIcon}
                tintColor={colors.primary}
              />
              <AppText fontFamily="Medium" fontSize={14} color="textBold">
                {option.label}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

export default ApplyForSelector;

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
    gap: 12,
    height: 48,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: colors.white,
    boxShadow: "0px 4px 19px 0px rgba(63, 30, 87, 0.10)",
  },
  optionCardSelected: {
    backgroundColor: colors.secondaryLight,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  optionIcon: {
    width: 24,
    height: 24,
  },
});
