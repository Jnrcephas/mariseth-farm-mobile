import { colors } from "@/constants/colors";
import { icons } from "@/constants/icons";
import { useUniversalStore } from "@/stores/useuniversalstore";
import { inputCredit, inputCreditCategory } from "@/types/credit";
import { Image } from "expo-image";
import { FormikProps } from "formik";
import React from "react";
import { Pressable, StyleSheet, TouchableHighlight, View } from "react-native";
import AppText from "./apptext";
import ModalSelector from "./modalselector";

interface inputCreditSelectorProps {
  label: string;
  placeholder: string;
  data: inputCredit[] | inputCreditCategory[];
  field: string;
  formik: FormikProps<any>;
  value: number | string;
  required?: boolean;
  disabled?: boolean;
}

const InputCreditSelector: React.FC<inputCreditSelectorProps> = ({
  label,
  placeholder,
  data,
  field,
  formik,
  required = true,
  disabled = false,
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

  const handleSelection = (item: number) => {
    formik.setFieldValue(field, item);
    if (field === "input_credit_category") {
      formik.setFieldValue("input_credit", "");
    }
    handleVisibility(false);
  };

  const selectedItem = React.useMemo(() => {
    return data?.find(
      (item: inputCredit | inputCreditCategory) =>
        item.id === formik.values[field]
    );
  }, [formik.values[field], data]);

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
                item.id === formik.values[field] && {
                  backgroundColor: colors.buttonActionSheet,
                },
              ]}
              onPress={() => handleSelection(item.id)}
            >
              <AppText
                fontFamily="Medium"
                fontSize={15}
                color="textBold"
                style={{ flex: 1 }}
              >
                {item.name}
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
      <View style={styles.field}>
        <View style={styles.labelRow}>
          <AppText
            fontSize={14}
            fontFamily="SemiBold"
            color="formLabelText"
          >
            {label}
          </AppText>

          {required ? (
            <AppText
              fontSize={14}
              color="error"
              fontFamily="SemiBold"
              style={{ marginLeft: 4 }}
            >
              *
            </AppText>
          ) : null}
        </View>

        <Pressable
          style={[
            styles.selectButton,
            {
              borderColor: hasError ? colors.error : colors.formBorder,
              opacity: disabled ? 0.6 : 1,
            },
          ]}
          disabled={disabled}
          onPress={() => handleVisibility(true)}
        >
          <AppText
            fontSize={17}
            fontFamily="Regular"
            color={selectedItem ? "textBold" : "formInputText"}
            style={{ flex: 1 }}
          >
            {selectedItem ? selectedItem?.name : placeholder}
          </AppText>
          <Image
            source={icons.arrowDown}
            style={styles.arrowIcon}
            tintColor={hasError ? colors.error : colors.primary}
          />
        </Pressable>
      </View>
    </>
  );
};

export default InputCreditSelector;

const styles = StyleSheet.create({
  field: {
    width: "100%",
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  selectButton: {
    width: "100%",
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    backgroundColor: colors.white,
  },
  arrowIcon: {
    width: 20,
    height: 20,
  },
});
