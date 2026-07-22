import { colors } from "@/constants/colors";
import { icons } from "@/constants/icons";
import { useUniversalStore } from "@/stores/useuniversalstore";
import { getColorForItem } from "@/utils/commonmethods";
import { Image } from "expo-image";
import { FormikProps } from "formik";
import React from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  TouchableHighlight,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown, FadeOutDown } from "react-native-reanimated";
import AppButton from "./appbutton";
import AppText from "./apptext";

interface FarmProductsSelectorProps {
  label: string;
  placeholder: string;
  data: any[];
  field: string;
  formik: FormikProps<any>;
  value: number[];
  required?: boolean;
}

const FarmProductsSelector: React.FC<FarmProductsSelectorProps> = ({
  label,
  placeholder,
  data,
  field,
  formik,
  value,
  required = true,
}) => {
  const selectModalVisible = useUniversalStore(
    (state) => state.selectModalVisible
  );

  const hasError = formik.touched[field] && formik.errors[field];

  const toggleItem = (itemId: number) => {
    const selectedIds = [...value];
    const exists = selectedIds.includes(itemId);
    let updatedValues;

    if (exists) {
      updatedValues = selectedIds.filter((id) => id !== itemId);
    } else {
      updatedValues = [...selectedIds, itemId];
    }

    formik.setFieldValue(field, updatedValues);
  };

  const closeModal = () => {
    useUniversalStore.setState((state) => ({
      selectModalVisible: {
        ...state.selectModalVisible,
        [field]: false,
      },
    }));
  };

  return (
    <>
      {selectModalVisible[field] && (
        <Modal
          visible={selectModalVisible[field]}
          animationType="none"
          transparent
          navigationBarTranslucent
          statusBarTranslucent
        >
          <View style={styles.modalBgOverlay}>
            <Animated.View
              entering={FadeInDown.duration(300)}
              exiting={FadeOutDown.duration(250)}
              style={{
                paddingHorizontal: 16,
                width: "100%",
                height: "50%",
              }}
            >
              <View
                style={{
                  backgroundColor: colors.white,
                  borderRadius: 16,
                  paddingTop: 16,
                  paddingBottom: 20,
                }}
              >
                <View
                  style={{
                    paddingBottom: 17,
                    width: "100%",
                    flexDirection: "row",
                    justifyContent: "center",
                    borderBottomWidth: 1,
                    borderBottomColor: colors.formBorder,
                    paddingHorizontal: 16,
                  }}
                >
                  <AppText
                    fontFamily="SemiBold"
                    fontSize={17}
                    color="textBold"
                    style={{ flex: 1 }}
                  >
                    {label}
                  </AppText>

                  <TouchableOpacity
                    onPress={() =>
                      useUniversalStore.setState((state) => ({
                        selectModalVisible: {
                          ...state.selectModalVisible,
                          [field]: false,
                        },
                      }))
                    }
                  >
                    <Image
                      source={icons.close}
                      style={{
                        width: 24,
                        height: 24,
                        tintColor: colors.primary,
                      }}
                    />
                  </TouchableOpacity>
                </View>
                {value.length === 0 ? null : (
                  <View
                    style={{
                      paddingHorizontal: 16,
                      position: "absolute",
                      width: "100%",
                      bottom: 16,
                      zIndex: 1,
                    }}
                  >
                    <AppButton
                      title={"Done"}
                      textColor="white"
                      btnColor="buttonPrimary"
                      style={{}}
                      onPress={() => {
                        useUniversalStore.setState((state) => ({
                          selectModalVisible: {
                            ...state.selectModalVisible,
                            [field]: false,
                          },
                        }));
                      }}
                    />
                  </View>
                )}
                <Animated.FlatList
                  entering={FadeInDown.duration(500)}
                  exiting={FadeOutDown.duration(650)}
                  data={data}
                  keyExtractor={(item, index) => index?.toString()}
                  contentContainerStyle={{
                    paddingBottom: value.length === 0 ? 0 : 60,
                  }}
                  renderItem={({ item }) => {
                    const isSelected = value.includes(item.id);
                    return (
                      <TouchableHighlight
                        underlayColor={colors.buttonActionSheet}
                        style={[
                          {
                            paddingVertical: 15,
                            paddingHorizontal: 16,
                            borderBottomWidth: 1,
                            borderBottomColor: colors.light,
                          },
                          isSelected && {
                            backgroundColor: colors.buttonActionSheet,
                          },
                        ]}
                        onPress={() => toggleItem(item.id)}
                      >
                        <AppText
                          fontFamily="Medium"
                          fontSize={15}
                          color="textBold"
                        >
                          {item.name}
                        </AppText>
                      </TouchableHighlight>
                    );
                  }}
                  ListEmptyComponent={() => (
                    <AppText
                      fontFamily="Medium"
                      fontSize={15}
                      color="textBold"
                      style={{ paddingVertical: "10%", textAlign: "center" }}
                    >
                      {`No ${
                        field === "livestock" ? "Other Products" : field
                      } data available`}
                    </AppText>
                  )}
                />
              </View>
            </Animated.View>
          </View>
        </Modal>
      )}
      <View style={{ width: "100%" }}>
        <View
          style={{
            flexDirection: "row",
            marginBottom: 8,
          }}
        >
          <AppText
            fontSize={14}
            fontFamily="SemiBold"
            color="formLabelText"
            style={{}}
          >
            {label}
          </AppText>

          {required && (
            <AppText
              fontSize={14}
              color="error"
              fontFamily="SemiBold"
              style={{ marginLeft: 4 }}
            >
              *
            </AppText>
          )}
        </View>

        <Pressable
          style={[
            styles.selectButton,
            {
              borderColor: hasError ? colors.error : colors.formBorder,
            },
          ]}
          onPress={() => {
            useUniversalStore.setState((state) => ({
              selectModalVisible: {
                ...state.selectModalVisible,
                [field]: true,
              },
            }));
          }}
        >
          <View style={styles.chipsContainer}>
            {value.length > 0 ? (
              value.map((itemId) => {
                const selectedItem = data.find((item) => item.id === itemId);
                if (!selectedItem) return null;
                const { textColor } = getColorForItem(selectedItem.name);
                return (
                  <View key={itemId} style={styles.tag}>
                    <AppText
                      fontSize={12}
                      fontFamily="SemiBold"
                      style={{ marginRight: 6, color: textColor }}
                    >
                      {selectedItem.name}
                    </AppText>
                    <TouchableOpacity onPress={() => toggleItem(itemId)}>
                      <Image
                        source={icons.close}
                        style={styles.closeIcon}
                        contentFit="contain"
                      />
                    </TouchableOpacity>
                  </View>
                );
              })
            ) : (
              <AppText
                fontSize={17}
                fontFamily="Regular"
                color="formPlaceholderText"
                style={{ opacity: 0.6 }}
              >
                {placeholder}
              </AppText>
            )}
          </View>
          <Image
            source={icons.arrowDown}
            style={[
              styles.chevron,
              { tintColor: hasError ? colors.error : colors.primary },
            ]}
          />
        </Pressable>
      </View>
    </>
  );
};

export default FarmProductsSelector;

const styles = StyleSheet.create({
  selectButton: {
    width: "100%",
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: colors.white,
    gap: 10,
  },
  chipsContainer: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8,
  },
  chevron: {
    width: 20,
    height: 20,
  },

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
  tag: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.formBorder,
    backgroundColor: colors.white,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },

  closeIcon: {
    width: 17,
    height: 17,
    tintColor: colors.error,
  },
});
