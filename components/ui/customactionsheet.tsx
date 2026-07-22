import { colors } from "@/constants/colors";
import React from "react";
import { StyleSheet, View } from "react-native";
import ActionSheet from "react-native-actions-sheet";

import { useSafeAreaInsets } from "react-native-safe-area-context";

type CustomActionsheetProps = {
  children: React.ReactNode;
  height?: any;
  actionSheetRef: any;
  onOpen?: () => void;
};
const CustomActionsheet: React.FC<CustomActionsheetProps> = ({
  children,
  height = "auto",
  actionSheetRef,
  onOpen,
}) => {
  const inset = useSafeAreaInsets();

  return (
    <ActionSheet
      ref={actionSheetRef}
      gestureEnabled={true}
      animated={true}
      defaultOverlayOpacity={0.5}
      headerAlwaysVisible={true}
      zIndex={9999}
      closeOnPressBack={false}
      closeOnTouchBackdrop={true}
      backgroundInteractionEnabled={false}
      keyboardHandlerEnabled={false}
      onOpen={onOpen}
      containerStyle={{
        backgroundColor: colors.backgroundActionSheet,
        height: height,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingBottom: inset.bottom,
      }}
    >
      <View style={{ paddingVertical: 15 }}>{children}</View>
    </ActionSheet>
  );
};

export default CustomActionsheet;

const styles = StyleSheet.create({});
