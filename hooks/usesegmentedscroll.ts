import { width } from "@/constants/generalconstants";
import { useUniversalStore } from "@/stores/useuniversalstore";
import { SegmentedControlKey, SegmentedControlValue } from "@/types/universal";

import React from "react";
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
} from "react-native";

export const useSegmentedScroll = <K extends SegmentedControlKey>(
  storeKey: K,
  options: readonly SegmentedControlValue<K>[]
) => {
  const selectedOption = useUniversalStore(
    (state) => state.selectedSegmentedOption[storeKey]
  );
  const setSegmentedOption = useUniversalStore(
    (state) => state.setSegmentedOption
  );
  const scrollViewRef = React.useRef<ScrollView>(null);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setSegmentedOption(storeKey, options[index]);
  };

  React.useMemo(() => {
    if (scrollViewRef.current && selectedOption) {
      const index = options.indexOf(selectedOption);

      scrollViewRef.current.scrollTo({ x: index * width, animated: true });
    }
  }, [selectedOption]);

  return {
    scrollViewRef,
    handleScroll,
    selectedOption,
    setSegmentedOption,
  };
};
