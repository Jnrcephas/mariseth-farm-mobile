import { colors } from "@/constants/colors";
import React from "react";
import {
  StyleSheet,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import AppText from "./apptext";

interface SegmentedControlProps {
  options: string[];
  selectedOption: string;
  onOptionPress?: (option: any) => void;
}

const SegmentedControl: React.FC<SegmentedControlProps> = ({
  options,
  selectedOption,
  onOptionPress,
}) => {
  const { width: windowWidth } = useWindowDimensions();

  const internalPadding = 10;
  const segmentedControlWidth = windowWidth / 1.75;
  const itemWidth = (segmentedControlWidth - internalPadding) / options.length;

  const rStyle = useAnimatedStyle(() => {
    return {
      left: withTiming(
        itemWidth * options.indexOf(selectedOption) + internalPadding / 2
      ),
    };
  }, [selectedOption, options, itemWidth]);

  const handleOptionPress = (option: any) => {
    onOptionPress?.(option);
  };

  return (
    <View
      style={[
        styles.container,
        {
          width: segmentedControlWidth,
          borderRadius: 20,
          justifyContent: "center",
        },
      ]}
    >
      <Animated.View
        pointerEvents="none"
        style={[{ width: itemWidth }, rStyle, styles.activeBox]}
      />
      {options.map((option) => {
        const isActive = option === selectedOption;
        return (
          <TouchableOpacity
            onPress={() => handleOptionPress(option)}
            key={option}
            style={[{ width: itemWidth }, styles.labelContainer]}
          >
            <AppText
              fontFamily="SemiBold"
              fontSize={13}
              color={isActive ? "white" : "textPrimary"}
            >
              {option}
            </AppText>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    height: 40,
    backgroundColor: colors.segmentedControlBg,
    overflow: "hidden",
  },
  activeBox: {
    position: "absolute",
    borderRadius: 15,
    // shadowColor: "black",
    // shadowOffset: {
    //   width: 0,
    //   height: 0,
    // },
    // shadowOpacity: 0.1,
    // elevation: 3,
    height: "80%",
    top: "10%",
    backgroundColor: colors.primary,
    zIndex: -1,
    borderWidth: 1.5,
    borderColor: colors.white,
  },
  labelContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
});

export { SegmentedControl };
