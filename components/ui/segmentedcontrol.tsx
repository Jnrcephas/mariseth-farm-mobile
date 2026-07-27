import { colors } from "@/constants/colors";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
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
  // Optional shorter text to display in the pill without changing the
  // underlying option value (e.g. "Soil & Air Quality" -> "Soil & Air").
  labelOverrides?: Record<string, string>;
}

const MAX_VISIBLE_ITEMS = 3;

const SegmentedControl: React.FC<SegmentedControlProps> = ({
  options,
  selectedOption,
  onOptionPress,
  labelOverrides = {},
}) => {
  const { width: windowWidth } = useWindowDimensions();
  const scrollRef = React.useRef<ScrollView>(null);

  const internalPadding = 10;
  // Same overall width budget as before - keeps 2/3-option screens
  // (myFarmers, myFarmerDetails) looking exactly like they did.
  const segmentedControlWidth = windowWidth / 1.75;
  const visibleCount = Math.min(options.length, MAX_VISIBLE_ITEMS);
  const itemWidth = (segmentedControlWidth - internalPadding) / visibleCount;
  const isScrollable = options.length > MAX_VISIBLE_ITEMS;

  const [showRightHint, setShowRightHint] = React.useState(isScrollable);

  const rStyle = useAnimatedStyle(() => {
    return {
      left: withTiming(
        itemWidth * options.indexOf(selectedOption) + internalPadding / 2
      ),
    };
  }, [selectedOption, options, itemWidth]);

  React.useEffect(() => {
    if (!scrollRef.current || !isScrollable) return;
    const index = options.indexOf(selectedOption);
    const maxScroll = itemWidth * (options.length - visibleCount);
    const target = Math.max(
      0,
      Math.min(itemWidth * index - itemWidth * (visibleCount - 1), maxScroll)
    );
    scrollRef.current.scrollTo({ x: target, animated: true });
  }, [selectedOption]);

  const handleOptionPress = (option: any) => {
    onOptionPress?.(option);
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!isScrollable) return;
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const isAtEnd =
      contentOffset.x + layoutMeasurement.width >= contentSize.width - 4;
    setShowRightHint(!isAtEnd);
  };

  return (
    <View style={{ width: segmentedControlWidth }}>
      <View
        style={[
          styles.container,
          {
            width: segmentedControlWidth,
            borderRadius: 20,
            justifyContent: isScrollable ? "flex-start" : "center",
          },
        ]}
      >
        <ScrollView
          ref={scrollRef}
          horizontal
          scrollEnabled={isScrollable}
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          contentContainerStyle={{ width: itemWidth * options.length }}
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
                  numberOfLines={1}
                >
                  {labelOverrides[option] ?? option}
                </AppText>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {isScrollable && showRightHint ? (
        <LinearGradient
          colors={["rgba(255,255,255,0)", colors.segmentedControlBg]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.scrollHint}
          pointerEvents="none"
        />
      ) : null}
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
  scrollHint: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 28,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
  },
});

export { SegmentedControl };