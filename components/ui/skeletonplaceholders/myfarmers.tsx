import { colors } from "@/constants/colors";
import { skeletonStyles } from "@/styles/skeletonplaceholder";
import React from "react";
import { StyleSheet, View } from "react-native";

const MyFarmersSP = () => {
  return (
    <View style={skeletonStyles.myFarmSPContainer}>
      <View style={styles.farmerCountCard} />
      <View style={skeletonStyles.segmentedControl} />

      <View style={skeletonStyles.titleText} />
      {Array(10)
        .fill(null)
        .map((_, index) => (
          <View style={styles.myFarmCardContainer} key={index}>
            <View style={styles.farmerCardAvatar} />
            <View style={{ flexDirection: "column", width: "100%" }}>
              <View style={styles.farmerCardTitle} />
              <View style={styles.farmerCardNumber} />
            </View>
          </View>
        ))}
    </View>
  );
};

export default MyFarmersSP;

const styles = StyleSheet.create({
  farmerCountCard: {
    marginVertical: 32,
    height: 112,
    width: "100%",
    borderRadius: 16,
    backgroundColor: colors.skeletonPlaceholder,
  },
  myFarmCardContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.skeletonPlaceholder,
  },
  farmerCardAvatar: {
    backgroundColor: colors.skeletonPlaceholder,
    height: 40,
    width: 40,
    marginRight: 20,
    borderRadius: 100,
  },
  farmerCardTitle: {
    height: 16,
    width: "40%",
    backgroundColor: colors.skeletonPlaceholder,
    borderRadius: 10,
    marginBottom: 10,
  },
  farmerCardNumber: {
    height: 14,
    width: "60%",
    backgroundColor: colors.skeletonPlaceholder,
    borderRadius: 10,
  },
});
