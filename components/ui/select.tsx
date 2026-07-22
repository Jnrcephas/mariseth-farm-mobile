import { colors } from "@/constants/colors";
import { icons } from "@/constants/icons";
import { Image } from "expo-image";
import { FormikProps } from "formik";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import AppText from "./apptext";
type data = {
  value: string | boolean;
  label: string;
  icon?: any;
};
interface selectProps {
  label: string;
  data: data[];
  formik: FormikProps<any>;
  field: string;
}
const Select: React.FC<selectProps> = ({ label, data, formik, field }) => {
  const selected = formik.values[field];

  const handleSelect = (value: string | boolean) => {
    formik.setFieldValue(field, value);
  };
  return (
    <View style={{}}>
      <AppText
        fontSize={14}
        fontFamily="SemiBold"
        color="formLabelText"
        style={{ marginBottom: 8 }}
      >
        {label}
      </AppText>

      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        {data.map((item: data) => {
          const isSelected = selected === item.value;
          return (
            <Pressable
              key={item.value as string}
              onPress={() => handleSelect(item.value)}
              style={[
                styles.selectButton,
                {
                  borderColor: isSelected ? colors.primary : colors.white,
                },
              ]}
            >
              {item.icon && (
                <Image
                  source={item.icon}
                  style={{ height: 24, width: 24, marginRight: 12 }}
                  contentFit="contain"
                />
              )}

              <AppText
                fontSize={14}
                fontFamily="Medium"
                color="formLabelText"
                style={{ flex: 1 }}
              >
                {item.label}
              </AppText>

              {isSelected && (
                <Image
                  source={icons.checkmark}
                  style={{ height: 24, width: 24 }}
                  contentFit="contain"
                  transition={300}
                />
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

export default Select;
const styles = StyleSheet.create({
  selectButton: {
    width: "48%",
    backgroundColor: colors.backgroundPrimary,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    boxShadow: "0px 4px 19px 0px rgba(63, 30, 87, 0.10)",
  },
});
