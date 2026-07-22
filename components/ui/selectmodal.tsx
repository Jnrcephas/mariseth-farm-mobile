import { colors } from "@/constants/colors";
import { largeScreen } from "@/constants/generalconstants";
import { icons } from "@/constants/icons";
import { useUniversalStore } from "@/stores/useuniversalstore";
import { Image } from "expo-image";
import { FormikProps } from "formik";
import React from "react";
import { Pressable, StyleSheet, TouchableHighlight, View } from "react-native";
import AppText from "./apptext";
import ModalSelector from "./modalselector";
interface selectModalProps {
  label: string;
  placeholder: string;
  data: any;
  field: string;
  formik: FormikProps<any>;
  value: string;
}
const SelectModal: React.FC<selectModalProps> = ({
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

  const handleVisibility = (value: boolean) => {
    useUniversalStore.setState((state) => ({
      selectModalVisible: {
        ...state.selectModalVisible,
        [field]: value,
      },
    }));
  };

  const isArrayField = ["use_of_fertilizers", "farming_methods"].includes(
    field
  );
  const displayValue = isArrayField && Array.isArray(value) ? value[0] : value;
  return (
    <>
      {selectModalVisible[field] && (
        <ModalSelector
          visible={selectModalVisible[field]}
          onClose={() => handleVisibility(false)}
          label={label}
          data={data}
          keyExtractor={(item, index) => index?.toString() as string}
          renderItem={({ item, index }) => (
            <TouchableHighlight
              underlayColor={colors.buttonActionSheet}
              style={[
                {
                  paddingVertical: 15,
                  paddingHorizontal: 16,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.light,
                },
                // item?.toLowerCase() === value?.toLowerCase() && {
                //   backgroundColor: colors.buttonActionSheet,
                // },
                (isArrayField
                  ? Array.isArray(value) &&
                    value[0]?.toLowerCase() === item?.toLowerCase()
                  : value?.toLowerCase() === item?.toLowerCase()) && {
                  backgroundColor: colors.buttonActionSheet,
                },
              ]}
              onPress={() => {
                // formik.setFieldValue(field, item);
                if (isArrayField) {
                  formik.setFieldValue(field, [item]);
                } else {
                  formik.setFieldValue(field, item);
                }
                handleVisibility(false);
              }}
            >
              <AppText
                fontFamily="Medium"
                fontSize={15}
                color="textBold"
                style={{ flex: 1 }}
              >
                {item}
              </AppText>
            </TouchableHighlight>
          )}
          ListEmptyComponent={
            <AppText
              fontFamily="Medium"
              fontSize={15}
              color="textBold"
              style={{ paddingVertical: "10%", textAlign: "center" }}
            >
              {`No ${field} data available`}
            </AppText>
          }
        />
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
            // useUniversalStore.setState((state) => ({
            //   selectModalVisible: {
            //     ...state.selectModalVisible,
            //     [field]: true,
            //   },
            // }));
            handleVisibility(true);
          }}
        >
          <AppText
            fontSize={17}
            fontFamily="Regular"
            color="formInputText"
            style={{ flex: 1 }}
          >
            {displayValue ? displayValue : placeholder}
          </AppText>
          <Image
            source={icons.arrowDown}
            style={{
              width: 24,
              height: 24,
              tintColor: hasError ? colors.error : colors.formBorder,
            }}
          />
        </Pressable>
      </View>
    </>
  );
};

export default SelectModal;

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
});
