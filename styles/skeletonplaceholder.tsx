import { colors } from "@/constants/colors";
import { StyleSheet } from "react-native";

export const skeletonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
    paddingHorizontal: 16,
  },
  myFarmImage: {
    marginVertical: 32,
    height: 175,
    width: "100%",
    borderRadius: 20,
    backgroundColor: colors.skeletonPlaceholder,
  },
  segmentedControl: {
    width: 232,
    height: 40,
    borderRadius: 50,
    backgroundColor: colors.skeletonPlaceholder,
    alignSelf: "center",
    marginBottom: 32,
  },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  titleText: {
    height: 16,
    width: 97,
    backgroundColor: colors.skeletonPlaceholder,
    borderRadius: 10,
  },
  editBtn: {
    height: 31,
    width: 68,
    backgroundColor: colors.skeletonPlaceholder,
    borderRadius: 50,
  },
  farmInfoCard: {
    backgroundColor: colors.skeletonPlaceholder,
    height: 250,
    width: "100%",
    borderRadius: 20,
    marginBottom: 20,
  },
  farmAgricInfoCard: {
    backgroundColor: colors.skeletonPlaceholder,
    height: 209,
    width: "100%",
    borderRadius: 20,
  },

  myFarmSPContainer: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
    paddingHorizontal: 16,
  },
  myFarmSPImage: {
    marginVertical: 32,
    height: 175,
    width: "100%",
    borderRadius: 20,
    backgroundColor: colors.skeletonPlaceholder,
  },
  creditContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 32,
    backgroundColor: colors.backgroundPrimary,
  },
  activeCredit: {
    backgroundColor: colors.skeletonPlaceholder,
    height: 305,
    borderRadius: 16,
    width: "100%",
    marginBottom: 30,
  },
  creditCard: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    alignItems: "center",
    // marginBottom: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.skeletonPlaceholder,
  },
  creditTitle: {
    width: "70%",
    height: 16,
    borderRadius: 5,
    backgroundColor: colors.skeletonPlaceholder,
  },
  creditSubtitle: {
    width: "50%",
    height: 14,
    borderRadius: 5,
    backgroundColor: colors.skeletonPlaceholder,
    marginTop: 15,
  },
  creditStatus: {
    width: "17%",
    height: 23,
    borderRadius: 200,
    backgroundColor: colors.skeletonPlaceholder,
  },
});
