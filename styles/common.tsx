import { colors } from "@/constants/colors";
import { StyleSheet } from "react-native";

export const commonStyles = StyleSheet.create({
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 100,
    backgroundColor: colors.secondaryLight,
  },
  farmDetailsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
});
