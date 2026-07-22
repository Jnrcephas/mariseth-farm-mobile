import { SegmentedControl } from "@/components/ui/segmentedcontrol";
import { useSegmentedScroll } from "@/hooks/usesegmentedscroll";
import { SegmentedControlKey, SegmentedControlValue } from "@/types/universal";
import React from "react";
import { ScrollView, View } from "react-native";

interface SegmentedScrollViewProps<K extends SegmentedControlKey> {
  storeKey: K;
  options: SegmentedControlValue<K>[];
  children: React.ReactNode[];
}

export const SegmentedScrollView = <K extends SegmentedControlKey>({
  storeKey,
  options,
  children,
}: SegmentedScrollViewProps<K>) => {
  const { scrollViewRef, handleScroll, selectedOption, setSegmentedOption } =
    useSegmentedScroll(storeKey, options);

  return (
    <>
      <View style={{ width: "100%", alignItems: "center", marginBottom: 32 }}>
        <SegmentedControl
          options={options}
          selectedOption={selectedOption}
          onOptionPress={(option) => {
            setSegmentedOption(storeKey, option);
          }}
        />
      </View>

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
    </>
  );
};
