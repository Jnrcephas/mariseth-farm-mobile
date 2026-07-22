import { colors } from "@/constants/colors";
import { icons } from "@/constants/icons";
import { Image } from "expo-image";
import React from "react";
import { Modal, StyleSheet, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown, FadeOutDown } from "react-native-reanimated";
import AppText from "./apptext";

interface ModalSelectorProps {
  visible: boolean;
  onClose: () => void;
  label: string;
  data: any[];
  renderItem: (item: any) => React.ReactElement;
  keyExtractor: (item: any, index?: number) => string;
  ListEmptyComponent: React.ReactElement;
}

const ModalSelector: React.FC<ModalSelectorProps> = ({
  visible,
  onClose,
  label,
  data,
  renderItem,
  keyExtractor,
  ListEmptyComponent,
}) => {
  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent
      navigationBarTranslucent
      statusBarTranslucent
    >
      <View style={styles.modalBgOverlay}>
        <Animated.View
          entering={FadeInDown.duration(300)}
          exiting={FadeOutDown.duration(250)}
          style={styles.modalContainer}
        >
          <View style={styles.modalContentContainer}>
            <View style={styles.modalHeaderContainer}>
              <AppText
                fontFamily="SemiBold"
                fontSize={17}
                color="textBold"
                style={{ flex: 1 }}
              >
                {label}
              </AppText>

              <TouchableOpacity onPress={onClose}>
                <Image source={icons.close} style={styles.closeIcon} />
              </TouchableOpacity>
            </View>

            <Animated.FlatList
              entering={FadeInDown.duration(500)}
              exiting={FadeOutDown.duration(650)}
              data={data}
              keyExtractor={keyExtractor}
              renderItem={renderItem}
              ListEmptyComponent={ListEmptyComponent}
            />
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBgOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.overlayDark,
    position: "absolute",
    width: "100%",
    height: "100%",
    zIndex: 999999,
  },

  modalContainer: {
    paddingHorizontal: 16,
    width: "100%",
    height: "50%",
  },
  modalHeaderContainer: {
    paddingBottom: 17,
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    borderBottomWidth: 1,
    borderBottomColor: colors.formBorder,
    paddingHorizontal: 16,
  },
  modalContentContainer: {
    backgroundColor: colors.white,
    borderRadius: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },
  closeIcon: {
    width: 24,
    height: 24,
    tintColor: colors.primary,
  },
  itemButton: {
    paddingVertical: 15,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.light,
  },
});

export default ModalSelector;
