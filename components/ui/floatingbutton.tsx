import { colors } from "@/constants/colors";
import { icons } from "@/constants/icons";
import { Image } from "expo-image";
import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
interface floatingButton {
  icon: keyof typeof icons;
  onPress: () => void;
}
const FloatingButton: React.FC<floatingButton> = React.memo(
  ({ icon, onPress }) => {
    return (
      <TouchableOpacity style={styles.floatingButton} onPress={onPress}>
        <Image source={icon} style={{ height: 36, width: 36 }} />
      </TouchableOpacity>
    );
  }
);

export default FloatingButton;

const styles = StyleSheet.create({
  floatingButton: {
    position: "absolute",
    right: 27,
    bottom: 100,
    height: 61,
    width: 61,
    backgroundColor: colors.primary,
    borderRadius: 200,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
});
