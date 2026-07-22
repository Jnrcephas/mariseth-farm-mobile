import AppText from "@/components/ui/apptext";
import { colors } from "@/constants/colors";
import React from "react";
import { StyleSheet, View } from "react-native";

const Finance = () => {
  return (
    <View style={styles.container}>
      <AppText fontFamily="SemiBold" fontSize={16} color="textBold">
        Finance
      </AppText>
    </View>
  );
};

export default Finance;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
    padding: 16,
  },
});
