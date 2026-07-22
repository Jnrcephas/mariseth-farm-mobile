import { colors } from "@/constants/colors";
import { myFarm1 } from "@/types/farm";
import { subYears } from "date-fns";
import { FormikProps } from "formik";
import React from "react";
import { StyleSheet, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AppButton from "./appbutton";
import AppDatePicker from "./appdatepicker";
import AppTextInput from "./apptextinput";
import FormErrorMessage from "./formerrormessage";
import GenderSelector from "./genderselector";
import RegionSelector from "./regionselector";

interface AddFarmerFormProps {
  formik: FormikProps<any>;
  isLoading: boolean;
  districts: { id: number; name: string }[];
  farms: myFarm1[];
}

const AddFarmerForm: React.FC<AddFarmerFormProps> = ({
  formik,
  isLoading,
  districts,
  farms,
}) => {
  const bottomInset = useSafeAreaInsets().bottom;
  const inputBackground = isLoading
    ? colors.backgroundTertiary
    : colors.backgroundPrimary;

  return (
    <View style={styles.screen}>
      <KeyboardAwareScrollView
        extraHeight={150}
        extraScrollHeight={50}
        enableOnAndroid
        keyboardShouldPersistTaps="always"
        keyboardDismissMode="none"
        bounces={false}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <AppTextInput
          error={formik.errors.name}
          label="Name"
          placeholder="Abena Bonsu"
          style={{ backgroundColor: inputBackground }}
          required
          value={formik.values.name}
          autoCapitalize="words"
          textContentType="name"
          autoCorrect={false}
          editable={!isLoading}
          keyboardType="default"
          onBlur={() => formik.setFieldTouched("name")}
          onChangeText={formik.handleChange("name")}
        />
        <FormErrorMessage error={formik.errors.name as string} />

        <GenderSelector
          value={formik.values.gender}
          onChange={(value) => formik.setFieldValue("gender", value)}
          showSelectionIndicator={false}
        />
        <FormErrorMessage
          error={(formik.touched.gender && formik.errors.gender) as string}
        />

        <AppDatePicker
          formik={formik}
          field="date_of_birth"
          value={formik.values.date_of_birth}
          placeholder="dd/mm/yyyy"
          initialDate={
            formik.values.date_of_birth
              ? new Date(formik.values.date_of_birth)
              : subYears(new Date(), 7)
          }
        />
        <FormErrorMessage
          error={
            (formik.touched.date_of_birth &&
              formik.errors.date_of_birth) as string
          }
        />

        <AppTextInput
          error={formik.touched.id_number && formik.errors.id_number}
          label="National ID/Passport Number"
          placeholder="type here"
          style={{ backgroundColor: inputBackground }}
          required
          autoCapitalize="characters"
          value={formik.values.id_number}
          autoCorrect={false}
          editable={!isLoading}
          keyboardType="default"
          onBlur={() => formik.setFieldTouched("id_number")}
          onChangeText={formik.handleChange("id_number")}
        />
        <FormErrorMessage
          error={
            (formik.touched.id_number && formik.errors.id_number) as string
          }
        />

        <AppTextInput
          error={formik.touched.phone_number && formik.errors.phone_number}
          label="Contact Number"
          placeholder="023 456 7890"
          style={{ backgroundColor: inputBackground }}
          required
          autoCapitalize="none"
          value={formik.values.phone_number}
          autoCorrect={false}
          editable={!isLoading}
          keyboardType="phone-pad"
          onBlur={() => formik.setFieldTouched("phone_number")}
          onChangeText={formik.handleChange("phone_number")}
        />
        <FormErrorMessage
          error={
            (formik.touched.phone_number &&
              formik.errors.phone_number) as string
          }
        />

        <AppTextInput
          error={formik.touched.email && formik.errors.email}
          label="Email"
          placeholder="type here"
          style={{ backgroundColor: inputBackground }}
          textContentType="emailAddress"
          autoCapitalize="none"
          value={formik.values.email}
          autoCorrect={false}
          editable={!isLoading}
          keyboardType="email-address"
          onBlur={() => formik.setFieldTouched("email")}
          onChangeText={formik.handleChange("email")}
        />
        <FormErrorMessage
          error={(formik.touched.email && formik.errors.email) as string}
        />

        <AppTextInput
          error={formik.touched.address && formik.errors.address}
          label="Address"
          placeholder="type here"
          style={{ backgroundColor: inputBackground }}
          autoCapitalize="sentences"
          value={formik.values.address}
          autoCorrect={false}
          editable={!isLoading}
          keyboardType="default"
          onBlur={() => formik.setFieldTouched("address")}
          onChangeText={formik.handleChange("address")}
        />
        <FormErrorMessage
          error={(formik.touched.address && formik.errors.address) as string}
        />

        <AppTextInput
          error={formik.touched.village && formik.errors.village}
          label="Village/Community"
          placeholder="type here"
          style={{ backgroundColor: inputBackground }}
          autoCapitalize="words"
          value={formik.values.village}
          autoCorrect={false}
          editable={!isLoading}
          keyboardType="default"
          onBlur={() => formik.setFieldTouched("village")}
          onChangeText={formik.handleChange("village")}
        />
        <FormErrorMessage
          error={(formik.touched.village && formik.errors.village) as string}
        />

        <RegionSelector
          label="District"
          placeholder="type here"
          data={districts}
          field="district"
          formik={formik}
          value={formik.values.district}
          required={false}
        />
        <FormErrorMessage error={formik.errors.district as string} />

        <RegionSelector
          label="Select Farm Here"
          placeholder="select farm"
          data={farms}
          field="farm"
          formik={formik}
          value={formik.values.farm}
          required={false}
        />
        <FormErrorMessage
          error={(formik.touched.farm && formik.errors.farm) as string}
        />
      </KeyboardAwareScrollView>

      <View style={[styles.footer, { paddingBottom: bottomInset + 23 }]}>
        <AppButton
          title="Create Farmer"
          textColor="white"
          btnColor="buttonPrimary"
          borderRadius={8}
          height={48}
          onPress={formik.submitForm}
          loading={isLoading}
          disabled={!(formik.isValid && formik.dirty)}
        />
      </View>
    </View>
  );
};

export default AddFarmerForm;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 120,
    gap: 24,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    paddingTop: 23,
    paddingHorizontal: 18,
  },
});
