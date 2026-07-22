import { colors } from "@/constants/colors";
import { largeScreen } from "@/constants/generalconstants";
import { icons } from "@/constants/icons";
import { useUniversalStore } from "@/stores/useuniversalstore";
import { myFarm1 } from "@/types/farm";
import { Image } from "expo-image";
import { FormikProps } from "formik";
import React from "react";
import { Pressable, StyleSheet, TouchableHighlight, View } from "react-native";
import AppText from "./apptext";
import ModalSelector from "./modalselector";

interface region {
  id: number;
  name: string;
  code: string;
  districts: { id: number; name: string }[];
}

interface regionSelectorProps {
  label: string;
  placeholder: string;
  data: region[] | region["districts"] | myFarm1[];
  field: string;
  formik: FormikProps<any>;
  value: number | string;
  required?: boolean;
}

const RegionSelector: React.FC<regionSelectorProps> = ({
  label,
  placeholder,
  data,
  field,
  formik,
  required = true,
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

  const handleRegionSelect = (itemId: number) => {
    formik.setFieldValue(field, itemId);
    if (field === "region") {
      formik.setFieldValue("district", "");
    }
    if (field === "district") {
      const selected = data.find(
        (item: region | { id: number; name: string; regionId?: number }) =>
          item.id === itemId
      ) as { regionId?: number } | undefined;
      if (selected?.regionId) {
        formik.setFieldValue("region", selected.regionId);
      }
    }
    handleVisibility(false);
  };

  const selectedItem = React.useMemo(() => {
    return data.find(
      (item: region | { id: number; name: string } | myFarm1) =>
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
              onPress={() => handleRegionSelect(item.id)}
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
          onPress={() => handleVisibility(true)}
        >
          <AppText
            fontSize={17}
            fontFamily="Regular"
            color="formInputText"
            style={{ flex: 1 }}
          >
            {selectedItem ? selectedItem?.name : placeholder}
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

export default RegionSelector;

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
});
