import AppText from "@/components/ui/apptext";
import { colors } from "@/constants/colors";
import React from "react";
import { StyleSheet, View } from "react-native";

interface PaybackLogFieldProps {
  label: string;
  value: string;
  highlightLabel?: boolean;
}

const PaybackLogField: React.FC<PaybackLogFieldProps> = ({
  label,
  value,
  highlightLabel = false,
}) => {
  return (
    <View style={styles.container}>
      <AppText
        fontFamily="Medium"
        fontSize={12}
        color={highlightLabel ? "primary" : "formLabelText"}
      >
        {label}
      </AppText>
      <AppText fontFamily="Medium" fontSize={14} color="textBold">
        {value}
      </AppText>
    </View>
  );
};

export default PaybackLogField;

const styles = StyleSheet.create({
  container: {
    gap: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
});
