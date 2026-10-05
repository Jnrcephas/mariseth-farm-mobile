import * as yup from "yup";
const phoneRegExp = /^(0\d{9}|\d{9})$/;
export const signInSchema = yup.object().shape({
  phone_number: yup
    .string()
    .matches(phoneRegExp, "Invalid Phone Number")
    .test(
      "no-leading-zero",
      "Phone Number must not  start with 0",
      (value) => !value?.startsWith("0")
    )
    .required("Phone Number is required"),

  pin: yup
    .string()
    .required("Pin is required")
    .matches(/^\d{4}$/, "Pin must be exactly 4 digits")
    .min(4, "Pin must be 4 digits")
    .max(4, "Pin must be 4 digits"),
});

// For field officers / other staff signing in with the same email+password
// admin accounts used on web - see endpoints.adminSignIn.
export const emailSignInSchema = yup.object().shape({
  email: yup
    .string()
    .email("Enter a valid email address")
    .required("Email is required"),

  password: yup.string().required("Password is required"),
});

// For field officers / staff changing their real password (not a 4-digit
// PIN) - see endpoints.updatePassword and app/more/changepassword.tsx.
export const changePasswordSchema = yup.object().shape({
  old_password: yup.string().required("Current password is required"),
  new_password: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .required("New password is required"),
  confirm_password: yup
    .string()
    .oneOf([yup.ref("new_password")], "Passwords do not match")
    .required("Please confirm your new password"),
});

export const phoneNumberSchema = yup.object().shape({
  phone_number: yup
    .string()
    .matches(phoneRegExp, "Invalid Phone Number")
    .test(
      "no-leading-zero",
      "Phone Number must not  start with 0",
      (value) => !value?.startsWith("0")
    )
    .required("Phone Number is required"),
});

export const otpverificationSchema = yup.object().shape({
  phone_number: yup.string(),
  code: yup
    .string()
    .required("Verification code is required")
    .matches(/^\d{4}$/, "verification code must be a 4-digit number"),
});

export const createPinSchema = yup.object().shape({
  pin: yup
    .string()
    .required("Pin is required")
    .matches(/^\d{4}$/, "Pin must be a 4-digit number"),
});

export const confirmPinSchema = yup.object().shape({
  phone_number: yup.string(),
  pin: yup
    .string()
    .required("Pin is required")
    .matches(/^\d{4}$/, "Pin must be a 4-digit number"),

  confirm_pin: yup
    .string()
    .required("Confirm pin is required")
    .oneOf([yup.ref("pin")], "Pins must match")
    .matches(/^\d{4}$/, "Confirm pin must be a 4-digit number"),
});

export const pinUpdateSchema = yup.object().shape({
  old_pin: yup
    .string()
    .required("Old pin is required")
    .matches(/^\d{4}$/, "Old pin must be a 4-digit number"),
  new_pin: yup
    .string()
    .required("New pin is required")
    .matches(/^\d{4}$/, "New pin must be a 4-digit number"),
  confirm_new_pin: yup
    .string()
    .required("Confirm new pin is required")
    .oneOf([yup.ref("new_pin")], "Pins must match")
    .matches(/^\d{4}$/, "Confirm pin must be a 4-digit number"),
});

export const resetPinSchema = yup.object().shape({
  code: yup
    .string()
    .required("Verification code is required")
    .matches(/^\d{4}$/, "verification code must be a 4-digit number"),

  pin: yup
    .string()
    .required("New pin is required")
    .matches(/^\d{4}$/, "New pin must be a 4-digit number"),

  new_pin: yup
    .string()
    .required("Confirm pin is required")
    .oneOf([yup.ref("pin")], "Pins must match")
    .matches(/^\d{4}$/, "Confirm pin must be a 4-digit number"),
});

export const profileEditSchema = yup.object().shape({
  name: yup.string().required("Name is required"),
  type: yup.string().required("Type is required"),
  gender: yup
    .string()
    .oneOf(["m", "f"], "Please select gender")
    .required("Gender is required"),
  date_of_birth: yup.string().required("Date of Birth is required"),
  id_type: yup.string().required("This field is required"),
  id_number: yup.string().required("This field is required"),
  // phone_number: yup
  //   .string()
  //   .required("Contact Number is required")
  //   .matches(phoneRegExp, "Contact Number must be at least 9 digits")
  //   .test(
  //     "no-leading-zero",
  //     "Phone Number must not  start with 0",
  //     (value) => !value?.startsWith("0")
  //   ),
  phone_number: yup.string().when("type", {
    is: (type: string) => type !== "profile",
    then: (schema) =>
      schema
        .required("Contact Number is required")
        .matches(phoneRegExp, "Contact Number must be at least 9 digits")
        .test(
          "no-leading-zero",
          "Phone Number must not start with 0",
          (value) => !value?.startsWith("0")
        ),
    otherwise: (schema) => schema.notRequired(),
  }),
  email: yup.string().notRequired().email("Invalid email address"),
  // .required("Email is required"),
  address: yup.string().required("Address is required"),
  village: yup.string().required("Village/Community is required"),
  district: yup.string().required("District is required"),
  region: yup.string().required("Region is required"),
  // farm: yup.string().required("Farm is required"),

  //  farm: yup.string().when("type", {
  //   is: (type) => type !== "profile",
  //   then: yup.string().required("Farm is required"),
  //   otherwise: yup.string().notRequired(),
  // }),

  farm: yup.string().when("type", {
    is: (type: string) => type !== "profile",
    then: (schema) => schema.required("Farm is required"),
    otherwise: (schema) => schema.notRequired(),
  }),

  // areas_of_needed_assistance: yup.string().when("type", {
  //   is: (type: string) => type !== "profile",
  //   then: (schema) =>
  //     schema.required("Please select area of needed assistance"),
  //   otherwise: (schema) => schema.notRequired(),
  // }),

  // has_received_support: yup.boolean().when("type", {
  //   is: (type: string) => type !== "profile",
  //   then: (schema) => schema.required("This is a required field"),
  //   otherwise: (schema) => schema.notRequired(),
  // }),
});

const farmerPhoneRegExp = /^[\d\s]+$/;

// Optional phone: blank is fine, but if something is typed it must be a
// plausible Ghana number (9 or 10 digits, spaces allowed).
const optionalPhone = (label: string) =>
  yup
    .string()
    .notRequired()
    .test(
      "phone-digits",
      `${label} must contain only digits`,
      (value) => !value || farmerPhoneRegExp.test(value)
    )
    .test("phone-length", `${label} must be 9 or 10 digits`, (value) => {
      if (!value) return true;
      const digits = value.replace(/\s/g, "");
      return digits.length === 9 || digits.length === 10;
    });

const optionalWholeNumber = (label: string) =>
  yup.string().notRequired().matches(/^\d+$/, {
    message: `${label} must be a whole number`,
    excludeEmptyString: true,
  });

/**
 * Farmer registration (add + edit). Mirrors the web admin form's
 * smallholderFarmerSchema (src/modules/FarmManagement/utils/validations.ts):
 * names, gender, date of birth, address, village, region, district and
 * country are required; ID, phone, email and everything under "Profile
 * Details" / "Support & Assistance" are optional.
 *
 * `requireLeadFarmer`: the web form requires picking a lead farmer for a
 * smallholder (not for a commercial farmer). Lead farmers don't pick one (their
 * own id is sent automatically), so it's only turned on for a field officer /
 * admin adding a new farmer.
 */
export const getAddFarmerSchema = ({
  requireLeadFarmer = false,
}: { requireLeadFarmer?: boolean } = {}) =>
  yup.object().shape({
    first_name: yup
      .string()
      .trim()
      .min(2, "First name must be at least 2 characters")
      .required("First name is required"),
    last_name: yup
      .string()
      .trim()
      .min(2, "Last name must be at least 2 characters")
      .required("Last name is required"),
    other_names: yup.string().notRequired(),
    gender: yup
      .string()
      .oneOf(["m", "f"], "Please select gender")
      .required("Gender is required"),
    date_of_birth: yup.string().required("Date of Birth is required"),

    id_type: yup.string().notRequired(),
    id_number: yup.string().notRequired(),
    phone_number: optionalPhone("Contact Number"),
    email: yup.string().notRequired().email("Invalid email address"),

    address: yup.string().trim().required("Address is required"),
    village: yup.string().trim().required("Village/Community is required"),

    has_disability: yup
      .boolean()
      .nullable()
      .required("Please select Yes or No"),
    disability_details: yup.string().notRequired(),
    is_refugee: yup.boolean().notRequired(),

    region: yup.string().required("Region is required"),
    district: yup.string().required("District is required"),
    country: yup.string().required("Country is required"),

    farm: yup.string().notRequired(),
    project: yup.string().notRequired(),
    farmer_type: yup
      .string()
      .oneOf(["smallholder", "commercial"], "Please select a farmer type")
      .required("Farmer type is required"),
    // Commercial farmers have no lead farmer, so it is never required for them.
    lead_farmer: yup.string().when("farmer_type", {
      is: "commercial",
      then: (schema) => schema.notRequired(),
      otherwise: (schema) =>
        requireLeadFarmer
          ? schema.required("Please select a lead farmer")
          : schema.notRequired(),
    }),

    nationality: yup.string().notRequired(),
    marital_status: yup.string().notRequired(),
    education_level: yup.string().notRequired(),
    alternative_phone_number: optionalPhone("Alternative Phone Number"),
    average_income: yup.string().notRequired().matches(/^\d+(\.\d{1,2})?$/, {
      message: "Enter a valid amount, e.g. 1500 or 1500.50",
      excludeEmptyString: true,
    }),
    years_of_experience: optionalWholeNumber("Years of experience"),
    number_of_households: optionalWholeNumber("Number of households"),
    number_of_dependents: optionalWholeNumber("Number of dependents"),
    number_of_farms: optionalWholeNumber("Number of farms"),
    consent: yup.boolean().notRequired(),

    has_received_support: yup.boolean().nullable().notRequired(),
    support_received: yup.string().notRequired(),
    areas_of_needed_assistance: yup.string().notRequired(),
  });

// Kept so existing imports keep working.
export const addFarmerSchema = getAddFarmerSchema();

export const leadershipExperienceEditSchema = yup.object().shape({
  is_mentoring_other_farmers: yup.boolean().required("This field is required"),
  // number_of_farmers_mentoring: yup.string().required("This field is required"),

  number_of_farmers_mentoring: yup.string().when("is_mentoring_other_farmers", {
    is: true,
    then: (schema) =>
      schema.required("Please enter the number of farmers you are mentoring"),
    otherwise: (schema) => schema.notRequired(),
  }),

  has_farming_membership: yup.boolean().required("This field is required"),

  has_received_farming_leadership_training: yup
    .boolean()
    .required("This field is required"),
});

export const applyCreditSchema = yup.object().shape({
  apply_for: yup
    .string()
    .oneOf(["myself", "my_farmer"])
    .required("Apply for is required"),
  farmer_ids: yup.array().when("apply_for", {
    is: "my_farmer",
    then: (schema) =>
      schema
        .min(1, "Select at least one farmer")
        .required("Select at least one farmer"),
    otherwise: (schema) => schema.notRequired(),
  }),
  quantity: yup
    .string()
    .required("Quantity is required")
    .matches(/^\d+$/, "Quantity must be a number"),
  notes: yup.string(),
  quantity_metric: yup.string(),

  input_credit_category: yup
    .string()
    .required("Input Credits is required"),
  input_credit: yup.string().required("Type is required"),
});

// Shared by the add and edit farm schemas (web: externalFarmSchema).
const farmCommonFields = {
  farm_type: yup.string().required("Farm Type is required"),
  name: yup
    .string()
    .trim()
    .min(2, "Farm name must be at least 2 characters")
    .required("Farm Name is required"),
  location: yup
    .string()
    .trim()
    .min(2, "Location must be at least 2 characters")
    .required("Farm Location is required"),
  region: yup.string().required("Region is required"),
  district: yup.string().required("District is required"),
  size: yup
    .string()
    .required("Total Land Size is required")
    .matches(/^\d+(\.\d+)?$/, "Total Land Size must be a number"),

  size_metric: yup.string(),

  land_ownership: yup.string().required("Land Ownership is required"),
  // "Other" needs a description (web: other_land_ownership, min 2 chars).
  other_specification: yup.string().when("land_ownership", {
    is: (value: string) => String(value ?? "").toLowerCase() === "other",
    then: (schema) =>
      schema
        .trim()
        .min(2, "Please specify (at least 2 characters)")
        .required("Please specify the land ownership"),
    otherwise: (schema) => schema.notRequired(),
  }),
  crops: yup.array().of(yup.string().required()).optional(),
  livestock: yup.array().of(yup.string().required()).optional(),
  use_of_fertilizers: yup
    .array()
    .of(yup.string().required())
    .required("This is a required field"),
  farming_methods: yup
    .array()
    .of(yup.string().required())
    .required("This is a required field"),
  irrigation: yup.boolean().required("This is a required field"),
  has_access_to_market: yup.boolean().required("This is a required field"),

  labor_force_total: optionalWholeNumber("Total number of workers"),
  labor_force_male: optionalWholeNumber("Number of males"),
  labor_force_female: optionalWholeNumber("Number of females"),
};

/**
 * Add farm. Lead farmers pick "myself" or tick farmers from their list
 * (apply_for / farmer_ids). Field officers / admins don't have that choice:
 * like the web form they must select one farmer to own the farm.
 */
export const getAddFarmSchema = ({
  isFieldOfficer = false,
}: { isFieldOfficer?: boolean } = {}) =>
  yup.object().shape({
    ...farmCommonFields,
    apply_for: isFieldOfficer
      ? yup.string().notRequired()
      : yup
          .string()
          .oneOf(["myself", "my_farmer"])
          .required("Apply for is required"),
    farmer_ids: isFieldOfficer
      ? yup.array().notRequired()
      : yup.array().when("apply_for", {
          is: "my_farmer",
          then: (schema) =>
            schema
              .min(1, "Select at least one farmer")
              .required("Select at least one farmer"),
          otherwise: (schema) => schema.notRequired(),
        }),
    farmer: isFieldOfficer
      ? yup.string().required("Please select a farmer")
      : yup.string().notRequired(),
  });

// Kept so existing imports keep working.
export const addFarmSchema = getAddFarmSchema();

// Edit farm (the schema's name has an extra "d"; it is imported under it).
export const adddFarmerSchema = yup.object().shape(farmCommonFields);
