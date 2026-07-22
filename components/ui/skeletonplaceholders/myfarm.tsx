import { skeletonStyles } from "@/styles/skeletonplaceholder";
import React from "react";
import { StyleSheet, View } from "react-native";

const MyFarmSP = () => {
  return (
    <View style={skeletonStyles.myFarmSPContainer}>
      <View style={skeletonStyles.myFarmSPImage} />
      <View style={skeletonStyles.segmentedControl} />
      <View style={skeletonStyles.rowContainer}>
        <View style={skeletonStyles.titleText} />
        <View style={skeletonStyles.editBtn} />
      </View>
      <View style={skeletonStyles.farmInfoCard} />
      <View style={skeletonStyles.farmAgricInfoCard} />
    </View>
  );
};

export default MyFarmSP;

const styles = StyleSheet.create({});
