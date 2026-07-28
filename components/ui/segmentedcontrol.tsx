import { colors } from "@/constants/colors";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
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

const TAB_HORIZONTAL_PADDING = 16;

const SegmentedControl: React.FC<SegmentedControlProps> = ({
  options,
  selectedOption,
  onOptionPress,
  labelOverrides = {},
}) => {
  const scrollRef = React.useRef<ScrollView>(null);

  // Each tab reports its own real x/width once rendered, instead of the
  // old approach of dividing a fixed container width evenly by option
  // count - that's what was truncating longer labels like "Farm
  // Details" once there were more than 1-2 short tabs.
  const [layouts, setLayouts] = React.useState<
    Record<string, { x: number; width: number }>
  >({});
  const [containerWidth, setContainerWidth] = React.useState(0);
  const [contentWidth, setContentWidth] = React.useState(0);
  const [showRightHint, setShowRightHint] = React.useState(false);

  const selectedLayout = layouts[selectedOption];
  const isScrollable = containerWidth > 0 && contentWidth > containerWidth;

  const rStyle = useAnimatedStyle(() => {
    if (!selectedLayout) return { opacity: 0 };
    return {
      opacity: 1,
      left: withTiming(selectedLayout.x),
      width: withTiming(selectedLayout.width),
    };
  }, [selectedLayout]);

  const handleTabLayout = (option: string) => (event: LayoutChangeEvent) => {
    const { x, width } = event.nativeEvent.layout;
    setLayouts((prev) => {
      const existing = prev[option];
      if (existing && existing.x === x && existing.width === width) {
        return prev;
      }
      return { ...prev, [option]: { x, width } };
    });
  };

  React.useEffect(() => {
    if (!scrollRef.current || !selectedLayout || !containerWidth) return;
    const tabCenter = selectedLayout.x + selectedLayout.width / 2;
    const target = Math.max(0, tabCenter - containerWidth / 2);
    scrollRef.current.scrollTo({ x: target, animated: true });
  }, [selectedOption, selectedLayout, containerWidth]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const isAtEnd =
      contentOffset.x + layoutMeasurement.width >= contentSize.width - 4;
    setShowRightHint(!isAtEnd && contentSize.width > layoutMeasurement.width);
  };

  const handleOptionPress = (option: any) => {
    onOptionPress?.(option);
  };

  return (
    <View
      style={styles.wrapper}
      onLayout={(event) => setContainerWidth(event.nativeEvent.layout.width)}
    >
      <View style={styles.container}>
        <ScrollView
          ref={scrollRef}
          horizontal
          scrollEnabled={isScrollable}
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          onContentSizeChange={(w) => setContentWidth(w)}
          contentContainerStyle={styles.scrollContent}
        >
          <Animated.View
            pointerEvents="none"
            style={[styles.activeBox, rStyle]}
          />
          {options.map((option) => {
            const isActive = option === selectedOption;
            return (
              <TouchableOpacity
                onPress={() => handleOptionPress(option)}
                onLayout={handleTabLayout(option)}
                key={option}
                style={styles.labelContainer}
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
  wrapper: {
    alignSelf: "center",
    maxWidth: "100%",
  },
  container: {
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.segmentedControlBg,
    overflow: "hidden",
  },
  scrollContent: {
    flexDirection: "row",
    paddingHorizontal: 5,
  },
  activeBox: {
    position: "absolute",
    borderRadius: 15,
    height: 32,
    top: 4,
    backgroundColor: colors.primary,
    zIndex: -1,
    borderWidth: 1.5,
    borderColor: colors.white,
  },
  labelContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: TAB_HORIZONTAL_PADDING,
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