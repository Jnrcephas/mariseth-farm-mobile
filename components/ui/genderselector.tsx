import AppText from "@/components/ui/apptext";
import { colors } from "@/constants/colors";
import { icons } from "@/constants/icons";
import { Image } from "expo-image";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";

type GenderValue = "m" | "f";

interface GenderSelectorProps {
  value: string;
  onChange: (value: GenderValue) => void;
  showSelectionIndicator?: boolean;
}

const options: {
  value: GenderValue;
  label: string;
  icon: keyof typeof icons;
}[] = [
  { value: "m", label: "Male", icon: "male" },
  { value: "f", label: "Female", icon: "female" },
];

const GenderSelector: React.FC<GenderSelectorProps> = ({
  value,
  onChange,
  showSelectionIndicator = true,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <AppText fontFamily="SemiBold" fontSize={14} color="formLabelText">
          Gender
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
                showSelectionIndicator &&
                  isSelected &&
                  styles.optionCardSelected,
              ]}
              onPress={() => onChange(option.value)}
            >
              <View style={styles.optionContent}>
                <Image
                  source={icons[option.icon]}
                  style={styles.optionIcon}
                  tintColor={colors.primary}
                />
                <AppText fontFamily="Medium" fontSize={14} color="textBold">
                  {option.label}
                </AppText>
              </View>
              {showSelectionIndicator && isSelected ? (
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

export default GenderSelector;

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
  optionContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  optionIcon: {
    width: 24,
    height: 24,
  },
  checkIcon: {
    width: 20,
    height: 20,
  },
});
