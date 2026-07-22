import { colors } from "@/constants/colors";
import React from "react";
import { StyleSheet, View } from "react-native";
import AppText from "./apptext";

interface ErrorProps {
  error?: any;
  style?: any;
}
const FormErrorMessage = ({ error, style }: ErrorProps) => {
  return (
    <View style={styles.container}>
      {!error ? null : (
        <AppText
          style={[{ color: colors.error }, style]}
          fontFamily="Regular"
          fontSize={15}
        >
          {error}
        </AppText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 19,
    // backgroundColor: "red",
    marginBottom: 3,
    justifyContent: "center",
  },
});
export default FormErrorMessage;
