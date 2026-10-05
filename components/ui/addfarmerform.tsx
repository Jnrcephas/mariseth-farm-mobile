import { colors } from "@/constants/colors";
import { endpoints } from "@/constants/endpoints";
import {
  AREAS_OF_NEED_OPTIONS,
  EDUCATION_LEVEL_OPTIONS,
  FARMER_TYPE_OPTIONS,
  ID_TYPE_OPTIONS,
  MARITAL_STATUS_OPTIONS,
  NATIONALITY_OPTIONS,
} from "@/constants/farmerform";
import { userStore } from "@/stores/userstore";
import { myFarm1 } from "@/types/farm";
import { farmerTypeLabel } from "@/utils/farmerform";
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
import CheckboxField from "./checkboxfield";
import FormErrorMessage from "./formerrormessage";
import GenderSelector from "./genderselector";
import IDSelector from "./idselector";
import RegionSelector from "./regionselector";
import RemoteSelector from "./remoteselector";
import SectionHeader from "./sectionheader";
import YesNoSelector from "./yesnoselector";

interface AddFarmerFormProps {
  formik: FormikProps<any>;
  isLoading: boolean;
  farms: myFarm1[];
  /** "add" registers a new farmer, "edit" updates an existing one. Both use
   * the same fields so the form can only ever drift in one place. */
  mode?: "add" | "edit";
  /** Field officers / admins must say which lead farmer the farmer belongs
   * to (required when adding). Lead farmers never see this - the backend
   * infers it from their token. */
  isFieldOfficer?: boolean;
  /** Add mode only: show the Smallholder / Commercial choice. When false the
   * farmer is registered as a smallholder, as before. */
  canChooseFarmerType?: boolean;
}

const AddFarmerForm: React.FC<AddFarmerFormProps> = ({
  formik,
  isLoading,
  farms,
  mode = "add",
  isFieldOfficer = false,
  canChooseFarmerType = false,
}) => {
  const bottomInset = useSafeAreaInsets().bottom;
  const regions = userStore((state) => state.regions);
  const inputBackground = isLoading
    ? colors.backgroundTertiary
    : colors.backgroundPrimary;

  const districts = React.useMemo(
    () =>
      regions.find((region) => region.id === Number(formik.values.region))
        ?.districts ?? [],
    [regions, formik.values.region]
  );

  // Errors only show once a field has been visited / a submit was attempted.
  const err = (field: string) =>
    (formik.touched[field] && formik.errors[field]) as string | undefined;
  const v = formik.values;

  const text = (
    field: string,
    label: string,
    extra: Partial<React.ComponentProps<typeof AppTextInput>> = {}
  ) => (
    <>
      <AppTextInput
        error={err(field)}
        label={label}
        placeholder="type here"
        style={{ backgroundColor: inputBackground }}
        value={formik.values[field]}
        autoCorrect={false}
        editable={!isLoading}
        keyboardType="default"
        onBlur={() => formik.setFieldTouched(field)}
        onChangeText={formik.handleChange(field)}
        {...extra}
      />
      <FormErrorMessage error={err(field)} />
    </>
  );

  const showSubmitHint = formik.submitCount > 0 && !formik.isValid;

  return (
    <View style={styles.screen}>
      <KeyboardAwareScrollView
        extraHeight={150}
        extraScrollHeight={50}
        enableOnAndroid
        // Without this, the library remembers the scroll offset from the FIRST
        // time the keyboard opened (usually the top of the form) and scrolls
        // back to it every time the keyboard closes - including when a
        // dropdown/date modal opens. That is what was sending Android users
        // back to the top of the form after every input.
        enableResetScrollToCoords={false}
        keyboardShouldPersistTaps="always"
        keyboardDismissMode="none"
        bounces={false}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <SectionHeader title="Personal Information" />

        {/* Smallholder and Commercial farmers share every field below. The
            type only changes what is sent as `type`, and commercial farmers
            have no lead farmer. */}
        {mode === "add" && canChooseFarmerType ? (
          <>
            <IDSelector
              label="Farmer Type"
              placeholder="Select farmer type"
              data={FARMER_TYPE_OPTIONS}
              field="farmer_type"
              formik={formik}
            />
            <FormErrorMessage error={err("farmer_type")} />
          </>
        ) : null}

        {/* A farmer's type can't be changed here (the web keeps separate edit
            pages per type), so on edit it is shown but locked. */}
        {mode === "edit" ? (
          <AppTextInput
            label="Farmer Type"
            value={farmerTypeLabel(v.farmer_type)}
            editable={false}
            style={{ backgroundColor: colors.backgroundTertiary }}
          />
        ) : null}

        {/* Searchable, and new projects can be created inline. Hidden if this
            account isn't allowed to use the projects endpoint. */}
        <RemoteSelector
          label="Project"
          placeholder="Select a project"
          field="project"
          labelField="project_label"
          formik={formik}
          endpoint={endpoints.projects}
          hideWhenUnavailable
          // Same as the web: type a new name and pick "Create project ...".
          createEndpoint={endpoints.projects}
          createLabel={(term) => `Create project "${term}"`}
        />

        {text("first_name", "First Name", {
          required: true,
          placeholder: "Abena",
          autoCapitalize: "words",
          textContentType: "givenName",
        })}
        {text("last_name", "Last Name", {
          required: true,
          placeholder: "Bonsu",
          autoCapitalize: "words",
          textContentType: "familyName",
        })}
        {text("other_names", "Other Names", {
          autoCapitalize: "words",
        })}

        {/* The selection indicator (green border + tick) is what tells the
            user their tap registered. It used to be switched off here, so
            tapping Male/Female updated the form value but looked like
            nothing had happened. */}
        <GenderSelector
          value={v.gender}
          onChange={(value) => {
            formik.setFieldTouched("gender", true, false);
            formik.setFieldValue("gender", value);
          }}
        />
        <FormErrorMessage error={err("gender")} />

        <AppDatePicker
          formik={formik}
          field="date_of_birth"
          value={v.date_of_birth}
          placeholder="dd/mm/yyyy"
          initialDate={
            v.date_of_birth
              ? new Date(v.date_of_birth)
              : subYears(new Date(), 7)
          }
        />
        <FormErrorMessage error={err("date_of_birth")} />

        <IDSelector
          label="Select ID Type"
          placeholder="Select ID type"
          data={ID_TYPE_OPTIONS}
          field="id_type"
          formik={formik}
          required={false}
        />
        <FormErrorMessage error={err("id_type")} />

        {text("id_number", "ID Number", { autoCapitalize: "characters" })}

        {text("phone_number", "Phone Number", {
          placeholder: "023 456 7890",
          keyboardType: "phone-pad",
          autoCapitalize: "none",
        })}

        {text("email", "Email", {
          textContentType: "emailAddress",
          autoCapitalize: "none",
          keyboardType: "email-address",
        })}

        {/* Address, Village/Community, Region and District are required by
            the schema, so each needs the red asterisk. */}
        {text("address", "Address", {
          required: true,
          autoCapitalize: "sentences",
        })}
        {text("village", "Village/Community", {
          required: true,
          autoCapitalize: "words",
        })}

        <YesNoSelector
          label="Does the farmer have any disability?"
          value={v.has_disability as boolean}
          onChange={(value) => {
            formik.setFieldTouched("has_disability", true, false);
            formik.setFieldValue("has_disability", value);
          }}
        />
        <FormErrorMessage error={err("has_disability")} />

        {v.has_disability === true
          ? text("disability_details", "If Yes, Please Specify Here", {
              placeholder: "e.g. Visual impairment, physical disability",
            })
          : null}

        {/* Asked for every farmer type (smallholder and commercial share this
            form). Defaults to No, so there's no asterisk and it never blocks
            submitting. */}
        <YesNoSelector
          label="Is the farmer a refugee?"
          value={v.is_refugee === true}
          required={false}
          onChange={(value) => formik.setFieldValue("is_refugee", value)}
        />

        <RegionSelector
          label="Region"
          placeholder="Select region"
          data={regions}
          field="region"
          formik={formik}
          value={v.region}
          required
        />
        <FormErrorMessage error={err("region")} />

        <RegionSelector
          label="District"
          placeholder={v.region ? "Select district" : "Select a region first"}
          data={districts}
          field="district"
          formik={formik}
          value={v.district}
          required
          searchable
        />
        <FormErrorMessage error={err("district")} />

        {/* Ghana is the only country the web form currently offers. */}
        {text("country", "Country", {
          required: true,
          editable: false,
          style: { backgroundColor: colors.backgroundTertiary },
        })}

        <RegionSelector
          label="Select Farm"
          placeholder="Select farm"
          data={farms}
          field="farm"
          formik={formik}
          value={v.farm}
          required={false}
        />
        <FormErrorMessage error={err("farm")} />

        {isFieldOfficer && v.farmer_type !== "commercial" ? (
          <>
            <RemoteSelector
              label="Select Lead Farmer"
              placeholder="Select lead farmer"
              field="lead_farmer"
              labelField="lead_farmer_label"
              formik={formik}
              endpoint={endpoints.adminFarmers}
              extraParams={{ farmer_type: "lead" }}
              mapItem={(item) => ({
                id: item.id,
                name: [item.first_name, item.last_name].filter(Boolean).join(" "),
              })}
              required={mode === "add"}
            />
            <FormErrorMessage error={err("lead_farmer")} />
          </>
        ) : null}

        <SectionHeader title="Profile Details" marginTop={8} />

        <IDSelector
          label="Nationality"
          placeholder="Select nationality"
          data={NATIONALITY_OPTIONS}
          field="nationality"
          formik={formik}
          required={false}
          searchable
        />
        <FormErrorMessage error={err("nationality")} />

        <IDSelector
          label="Marital Status"
          placeholder="Select marital status"
          data={MARITAL_STATUS_OPTIONS}
          field="marital_status"
          formik={formik}
          required={false}
        />
        <FormErrorMessage error={err("marital_status")} />

        <IDSelector
          label="Education Level"
          placeholder="Select education level"
          data={EDUCATION_LEVEL_OPTIONS}
          field="education_level"
          formik={formik}
          required={false}
        />
        <FormErrorMessage error={err("education_level")} />

        {text("alternative_phone_number", "Alternative Phone Number", {
          placeholder: "023 456 7890",
          keyboardType: "phone-pad",
          autoCapitalize: "none",
        })}

        {text("average_income", "Average Income", {
          placeholder: "e.g. 1500",
          keyboardType: "decimal-pad",
          leftComponent: (
            <AppText
              color="formInputText"
              fontFamily="Regular"
              fontSize={17}
              style={{ marginRight: 10 }}
            >
              GH₵
            </AppText>
          ),
        })}
        {text("years_of_experience", "Years of Farming Experience", {
          placeholder: "e.g. 5",
          keyboardType: "number-pad",
        })}
        {text("number_of_households", "Number of Households", {
          placeholder: "e.g. 1",
          keyboardType: "number-pad",
        })}
        {text("number_of_dependents", "Number of Dependents", {
          placeholder: "e.g. 3",
          keyboardType: "number-pad",
        })}
        {text("number_of_farms", "Number of Farms", {
          placeholder: "e.g. 2",
          keyboardType: "number-pad",
        })}

        <CheckboxField
          label="The farmer has given consent for their data to be collected and used."
          value={v.consent === true}
          onChange={(value) => formik.setFieldValue("consent", value)}
          disabled={isLoading}
        />

        <SectionHeader title="Support & Assistance" marginTop={8} />

        <YesNoSelector
          label="Do you receive any government or NGO support?"
          value={v.has_received_support as boolean}
          required={false}
          onChange={(value) => formik.setFieldValue("has_received_support", value)}
        />

        {v.has_received_support === true
          ? text("support_received", "If Yes, Please Specify Here")
          : null}

        <IDSelector
          label="Areas of Needed Assistance"
          placeholder="Select area"
          data={AREAS_OF_NEED_OPTIONS}
          field="areas_of_needed_assistance"
          formik={formik}
          required={false}
        />
      </KeyboardAwareScrollView>

      <View style={[styles.footer, { paddingBottom: bottomInset + 23 }]}>
        {showSubmitHint ? (
          <AppText
            fontFamily="Medium"
            fontSize={13}
            color="error"
            style={styles.submitHint}
          >
            Some required fields are missing or invalid. Please check the
            fields marked in red.
          </AppText>
        ) : null}
        <AppButton
          title={mode === "edit" ? "Save Changes" : "Create Farmer"}
          textColor="white"
          btnColor="buttonPrimary"
          borderRadius={8}
          height={48}
          onPress={formik.submitForm}
          loading={isLoading}
          // Pressing with missing fields is allowed on purpose: Formik then
          // marks every field as touched, so each problem shows its message.
          // (Disabling the button until valid left people guessing.)
          disabled={mode === "edit" && !formik.dirty}
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
    paddingBottom: 160,
    gap: 24,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    paddingTop: 16,
    paddingHorizontal: 18,
    gap: 10,
  },
  submitHint: {
    textAlign: "center",
  },
});
