import { skeletonStyles } from "@/styles/skeletonplaceholder";
import React from "react";
import { View } from "react-native";

const CreditsSP = () => {
  return (
    <View style={skeletonStyles.creditContainer}>
      <View style={skeletonStyles.activeCredit} />
      <View style={[skeletonStyles.rowContainer]}>
        <View style={skeletonStyles.titleText} />
        <View style={skeletonStyles.editBtn} />
      </View>
      {Array(10)
        .fill(null)
        .map((_, index) => (
          <View style={skeletonStyles.creditCard} key={index}>
            <View style={{ width: "80%", flexDirection: "column" }}>
              <View style={skeletonStyles.creditTitle} />
              <View style={skeletonStyles.creditSubtitle} />
            </View>
            <View style={skeletonStyles.creditStatus} />
          </View>
        ))}
    </View>
  );
};

export default CreditsSP;
