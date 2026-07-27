import { SegmentedControl } from "@/components/ui/segmentedcontrol";
import { useSegmentedScroll } from "@/hooks/usesegmentedscroll";
import { SegmentedControlKey, SegmentedControlValue } from "@/types/universal";
import React from "react";
import { ScrollView, View, ViewStyle } from "react-native";

interface SegmentedTabBarProps<K extends SegmentedControlKey> {
  storeKey: K;
  options: SegmentedControlValue<K>[];
  labelOverrides?: Record<string, string>;
  style?: ViewStyle;
}

// Just the pill/tab row - use this when you need other content (a hero
// card, etc.) to sit between the tabs and the paged content below.
export const SegmentedTabBar = <K extends SegmentedControlKey>({
  storeKey,
  options,
  labelOverrides,
  style,
}: SegmentedTabBarProps<K>) => {
  const { selectedOption, setSegmentedOption } = useSegmentedScroll(
    storeKey,
    options
  );

  return (
    <View style={[{ width: "100%", alignItems: "center" }, style]}>
      <SegmentedControl
        options={options as string[]}
        selectedOption={selectedOption as string}
        labelOverrides={labelOverrides}
        onOptionPress={(option) => {
          setSegmentedOption(storeKey, option);
        }}
      />
    </View>
  );
};

interface SegmentedContentPagesProps<K extends SegmentedControlKey> {
  storeKey: K;
  options: SegmentedControlValue<K>[];
  children: React.ReactNode[];
}

// Just the horizontally-paged content - reads/writes the same store key
// as SegmentedTabBar so the two stay in sync even when rendered apart.
export const SegmentedContentPages = <K extends SegmentedControlKey>({
  storeKey,
  options,
  children,
}: SegmentedContentPagesProps<K>) => {
  const { scrollViewRef, handleScroll } = useSegmentedScroll(
    storeKey,
    options
  );

  return (
    <ScrollView
      ref={scrollViewRef}
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      onMomentumScrollEnd={handleScroll}
      decelerationRate="fast"
    >
      {children}
    </ScrollView>
  );
};

interface SegmentedScrollViewProps<K extends SegmentedControlKey> {
  storeKey: K;
  options: SegmentedControlValue<K>[];
  children: React.ReactNode[];
  labelOverrides?: Record<string, string>;
}

// Backward-compatible combined component for screens that don't need
// anything rendered between the tab bar and the paged content.
export const SegmentedScrollView = <K extends SegmentedControlKey>({
  storeKey,
  options,
  children,
  labelOverrides,
}: SegmentedScrollViewProps<K>) => {
  return (
    <>
      <SegmentedTabBar
        storeKey={storeKey}
        options={options}
        labelOverrides={labelOverrides}
        style={{ marginBottom: 32 }}
      />
      <SegmentedContentPages storeKey={storeKey} options={options}>
        {children}
      </SegmentedContentPages>
    </>
  );
};