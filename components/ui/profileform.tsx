import { colors } from "@/constants/colors";
import { userStore } from "@/stores/userstore";
import { myFarm1 } from "@/types/farm";
import { subYears } from "date-fns";
import { FormikProps } from "formik";
import React from "react";
import { StyleSheet, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AppButton from "./appbutton";
import AppDatePicker from "./appdatepicker";
import AppText from "./apptext";
import AppTextInput from "./apptextinput";
import FormErrorMessage from "./formerrormessage";
import GenderSelector from "./genderselector";
import IDSelector from "./idselector";
import RegionSelector from "./regionselector";
interface profileFormProps {
  formik: FormikProps<any>;
  isLoading: boolean;
  type?: "profile" | "farmer";
  districts?: { id: number; name: string }[];
  farms?: myFarm1[];
  required?: boolean;
}
const ProfileForm: React.FC<profileFormProps> = ({
  formik,
  isLoading,
  type = "profile",
  districts = [],
  farms = [],
  required = true,
}) => {
  const regions = userStore((state) => state.regions);
  const isFarmerForm = type === "farmer";
  const bottomInset = useSafeAreaInsets().bottom;

  return (
    <View style={styles.screen}>
      <KeyboardAwareScrollView
        extraHeight={150}
        extraScrollHeight={50}
        enableOnAndroid={true}
        keyboardShouldPersistTaps="always"
        keyboardDismissMode="none"
        bounces={false}
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          styles.formScrollContent,
        ]}
      >
        <AppTextInput
          error={formik.errors.name}
          label="Name"
          placeholder="Enter full name"
          style={{
            backgroundColor: isLoading
              ? colors.backgroundTertiary
              : colors.backgroundPrimary,
          }}
          required
          value={formik.values.name}
          autoCapitalize="none"
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
        />

        <FormErrorMessage
          error={(formik.touched.gender && formik.errors.gender) as string}
        />

        <AppDatePicker
          formik={formik}
          field="date_of_birth"
          value={formik.values.date_of_birth}
          initialDate={
            formik?.values?.date_of_birth
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

        <IDSelector
          label={"ID Type"}
          placeholder={"Select ID Type"}
          data={[
            { name: "Ghana Card", value: "ghana_card" },
            { name: "Passport", value: "passport" },
          ]}
          field={"id_type"}
          formik={formik}
          // value={formik.values.id_type}
        />
        <FormErrorMessage
          error={(formik.touched.id_type && formik.errors.id_type) as string}
        />
        <AppTextInput
          error={formik.touched.id_number && formik.errors.id_number}
          label="ID Number"
          placeholder="type here"
          style={{
            backgroundColor: isLoading
              ? colors.backgroundTertiary
              : colors.backgroundPrimary,
          }}
          required
          autoCapitalize="none"
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

        {type === "farmer" && (
          <>
            <AppTextInput
              error={formik.touched.phone_number && formik.errors.phone_number}
              label="Contact Number"
              placeholder="type here"
              style={{
                backgroundColor: isLoading
                  ? colors.backgroundTertiary
                  : colors.backgroundPrimary,
              }}
              required
              autoCapitalize="none"
              value={formik.values.phone_number}
              autoCorrect={false}
              // phoneEntry={true}
              leftComponent={
                <AppText
                  color="formInputText"
                  fontFamily="Regular"
                  fontSize={17}
                  style={{ marginRight: 10 }}
                >
                  +233
                </AppText>
              }
              maxLength={10}
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
          </>
        )}

        <AppTextInput
          error={formik.touched.email && formik.errors.email}
          label="Email"
          placeholder="type here"
          style={{
            backgroundColor: isLoading
              ? colors.backgroundTertiary
              : colors.backgroundPrimary,
          }}
          // required
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
          style={{
            backgroundColor: isLoading
              ? colors.backgroundTertiary
              : colors.backgroundPrimary,
          }}
          required
          autoCapitalize="none"
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
          style={{
            backgroundColor: isLoading
              ? colors.backgroundTertiary
              : colors.backgroundPrimary,
          }}
          required
          autoCapitalize="none"
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
          label="Region"
          placeholder="Select region"
          data={regions}
          field="region"
          formik={formik}
          value={formik.values.region}
        />

        <FormErrorMessage
          error={(formik.touched.region && formik.errors.region) as string}
        />

        {/* <SelectModal
          label={"District"}
          placeholder={"Select District"}
          data={districts}
          field={"district"}
          formik={formik}
          value={formik.values.district}
        />

        <FormErrorMessage
          error={(formik.touched.district && formik.errors.district) as string}
        /> */}

        <RegionSelector
          label="District"
          placeholder="Select District"
          data={districts}
          field="district"
          formik={formik}
          value={formik.values.district}
        />

        <FormErrorMessage error={formik.errors.district} />

        {type === "farmer" ? (
          <>
            {/* <SelectModal
              label={"Select Farm Here"}
              placeholder={"Select Farm"}
              data={["Gaharwa", "Gaharw", "Gaha", "Gah"]}
              field={"farm"}
              formik={formik}
              value={formik.values.farm}
            />
            <FormErrorMessage
              error={(formik.touched.farm && formik.errors.farm) as string}
            /> */}

            <RegionSelector
              label="Select Farm Here"
              placeholder="Select farm"
              data={farms}
              field="farm"
              formik={formik}
              value={formik.values.farm}
              required={required}
            />

            <FormErrorMessage
              error={(formik.touched.farm && formik.errors.farm) as string}
            />
          </>
        ) : null}
      </KeyboardAwareScrollView>

      <View
        style={[styles.formFooter, { paddingBottom: bottomInset + 23 }]}
      >
        <AppButton
          title={
            type === "profile"
              ? "Save Changes"
              : isFarmerForm
                ? "Add Farmer"
                : "Create Farmer"
          }
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

export default ProfileForm;

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
    paddingBottom: 150,
  },
  formScrollContent: {
    gap: 24,
    paddingBottom: 120,
  },
  formFooter: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    paddingTop: 23,
    paddingHorizontal: 18,
  },
});
