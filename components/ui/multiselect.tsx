import { colors } from "@/constants/colors";
import { largeScreen } from "@/constants/generalconstants";
import { icons } from "@/constants/icons";
import { useUniversalStore } from "@/stores/useuniversalstore";
import { getColorForItem } from "@/utils/commonmethods";
import { Image } from "expo-image";
import { FormikProps } from "formik";
import React from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableHighlight,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown, FadeOutDown } from "react-native-reanimated";
import AppButton from "./appbutton";
import AppText from "./apptext";
interface multiSelectModalProps {
  label: string;
  placeholder: string;
  data: any;
  field: string;
  formik: FormikProps<any>;
  value: any[];
}
const MultiSelectModal: React.FC<multiSelectModalProps> = ({
  label,
  placeholder,
  data,
  field,
  formik,
  value,
}) => {
  const selectModalVisible = useUniversalStore(
    (state) => state.selectModalVisible
  );
  const hasError = formik.touched[field] && formik.errors[field];

  // const toggleItem = (item: string) => {
  //   const selected = new Set(value);
  //   if (selected.has(item)) {
  //     selected.delete(item);
  //   } else {
  //     selected.add(item);
  //   }
  //   formik.setFieldValue(field, Array.from(selected));
  // };

  const toggleItem = (item: any) => {
    const selectedIds = value.map((v) => v.id);
    const exists = selectedIds.includes(item.id);
    let updatedValues;

    if (exists) {
      updatedValues = value.filter((v) => v.id !== item.id);
    } else {
      updatedValues = [...value, item];
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
                // backgroundColor: "red",
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
                {formik.values[field].length === 0 ? null : (
                  <View
                    style={{
                      paddingHorizontal: 16,
                      // paddingTop: 30,
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
                    paddingBottom: formik.values[field].length === 0 ? 0 : 60,
                  }}
                  renderItem={({ item }) => {
                    // const isSelected = value.some((v) => v.id === item.id);
                    const selectedIds = value.map((v) => v.id); // ✅ defined here
                    const isSelected = selectedIds.includes(item.id);
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
                        onPress={() => toggleItem(item)}
                      >
                        <AppText
                          fontFamily="Medium"
                          fontSize={15}
                          color="textBold"
                        >
                          {item.product.name}
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
                      {`No ${field} data available`}
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

          <AppText
            fontSize={14}
            color="error"
            fontFamily="SemiBold"
            style={{ marginLeft: 4 }}
          >
            *
          </AppText>
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
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={true}
            // contentContainerStyle={{ gap: 8, }}
            contentContainerStyle={{
              flexGrow: 1,
              flexDirection: "row",
              gap: 8,
            }}
            keyboardShouldPersistTaps="handled"
          >
            {value.length > 0 ? (
              value.map((item, index) => {
                const { bgColor, textColor } = getColorForItem(
                  item.product.name
                );
                return (
                  <View
                    key={index}
                    style={[styles.tag, { backgroundColor: bgColor }]}
                  >
                    <AppText
                      fontSize={12}
                      fontFamily="SemiBold"
                      //   color="primary"
                      style={{ marginRight: 6, color: textColor }}
                    >
                      {item.product.name}
                    </AppText>
                    <TouchableOpacity
                      onPress={() =>
                        formik.setFieldValue(
                          field,
                          value.filter((v) => v.id !== item.id)
                        )
                      }
                    >
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
          </ScrollView>
        </Pressable>
      </View>
    </>
  );
};

export default MultiSelectModal;

const styles = StyleSheet.create({
  selectButton: {
    width: "100%",
    borderRadius: 10,
    borderWidth: 1,
    height: largeScreen ? 54 : 49,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
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
    // backgroundColor: colors.backgroundSecondary,
    borderRadius: 15,
    paddingHorizontal: 7,
    paddingVertical: 6,
    // borderWidth: 1,
    // borderColor: colors.formBorder,
  },

  closeIcon: {
    width: 17,
    height: 17,
    tintColor: colors.error,
  },
});
