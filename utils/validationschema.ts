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

export const addFarmerSchema = yup.object().shape({
  name: yup.string().required("Name is required"),
  type: yup.string().required("Type is required"),
  gender: yup
    .string()
    .oneOf(["m", "f"], "Please select gender")
    .required("Gender is required"),
  date_of_birth: yup.string().required("Date of Birth is required"),
  id_number: yup.string().required("National ID/Passport Number is required"),

  phone_number: yup.string().when("type", {
    is: (type: string) => type !== "profile",
    then: (schema) =>
      schema
        .required("Contact Number is required")
        .matches(farmerPhoneRegExp, "Contact Number must contain only digits")
        .test("valid-length", "Contact Number must be 9 or 10 digits", (value) => {
          const digits = value?.replace(/\s/g, "") ?? "";
          return digits.length === 9 || digits.length === 10;
        }),
    otherwise: (schema) => schema.notRequired(),
  }),
  email: yup.string().notRequired().email("Invalid email address"),

  address: yup.string().required("Address is required"),
  village: yup.string().required("Village/Community is required"),
  district: yup.string().required("District is required"),
  region: yup.string().required("Region is required"),

  farm: yup.string().notRequired(),
});

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

export const addFarmSchema = yup.object().shape({
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
  farm_type: yup.string().required("Farm Type is required"),
  name: yup.string().required("Farm Name  is required"),
  location: yup.string().required("Farm Location is required"),
  region: yup.string().required("Region is required"),
  district: yup.string().required("District is required"),
  size: yup
    .string()
    .required("Total Land Size is required")
    .matches(
      /^\d+(\.\d+)?$/,
      "Total Land Size must be a number"
    ),

  size_metric: yup.string(),

  land_ownership: yup.string().required("Land Owndership is required"),
  // main_crops: yup.string().required("Main Crops is required"),
  // livestock_kept: yup.string().required("This is a required field"),
  crops: yup.array().of(yup.string().required()).optional(),

  //  crops: yup
  // .array()
  // .of(yup.string().required())
  // .min(1, "Please select at least one crop")
  // .required("Main Crops is required"),

  livestock: yup.array().of(yup.string().required()).optional(),
  // livestock: yup
  //   .array()
  //   .of(yup.string().required())
  //   .min(1, "Please select at least one livestock option")
  //   .required("Livestock is required"),
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
});

export const adddFarmerSchema = yup.object().shape({
  farm_type: yup.string().required("Farm Type is required"),
  name: yup.string().required("Farm Name  is required"),
  location: yup.string().required("Farm Location is required"),
  region: yup.string().required("Region is required"),
  district: yup.string().required("District is required"),
  size: yup
    .string()
    .required("Total Land Size is required")
    .matches(
      /^\d+(\.\d+)?$/,
      "Total Land Size must be a number"
    ),

  size_metric: yup.string(),

  land_ownership: yup.string().required("Land Owndership is required"),
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
});
