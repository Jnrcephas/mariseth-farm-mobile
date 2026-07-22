import { moreLink } from "@/types/more";
import { Dimensions, Platform } from "react-native";
import { colors } from "./colors";
import { icons } from "./icons";
export const isIOS = Platform.OS === "ios";

export const { height, width } = Dimensions.get("window");
export const largeScreen = height > 700;
export const universalBlurhash = "U8PQNp9GIU~W00WBRjoLRj?H%L9G-;s:%2WB";
export const permissionContent = {
  title: "Permission Denied",
  notification:
    "Notification permission is required to use this feature. Kindly enable it in settings to stay updated.",
};

// export function hasHomeButton(): boolean {
//   if (!isIOS) return false;
//   const homeButtonModels: string[] = [
//     "iPhone 5",
//     "iPhone 5s",
//     "iPhone SE (1st generation)",
//     "iPhone SE (2nd generation)",
//     "iPhone SE (3rd generation)",
//     "iPhone 6",
//     "iPhone 6 Plus",
//     "iPhone 6s",
//     "iPhone 6s Plus",
//     "iPhone 7",
//     "iPhone 7 Plus",
//     "iPhone 8",
//     "iPhone 8 Plus",
//   ];
//   const model: string | null = Device.modelName;
//   return model ? homeButtonModels.includes(model) : false;
// }

export const helpSupportContact = [
  {
    id: "phone",
    label: "Call Us",
    value: "+233 30 000 0000",
    actionUrl: "tel:+233300000000",
  },
  {
    id: "email",
    label: "Email Us",
    value: "support@marisethfarms.com",
    actionUrl: "mailto:support@marisethfarms.com",
  },
  {
    id: "hours",
    label: "Support Hours",
    value: "Mon–Fri, 8:00 AM – 5:00 PM",
  },
];

export const helpSupportFaqs = [
  {
    id: "apply-credit",
    question: "How do I apply for input credit?",
    answer:
      "Open the Credits tab, tap Apply for Credit, choose the input category and credit type, enter the quantity, and submit your application.",
  },
  {
    id: "change-pin",
    question: "How do I change my PIN or password?",
    answer:
      "Go to More, select Change Pin or Change Password, enter your current PIN, then set and confirm your new PIN.",
  },
  {
    id: "update-profile",
    question: "How do I update my personal information?",
    answer:
      "Open More → My Information, then tap Edit on the My Information or Leadership & Experience card to update your details.",
  },
  {
    id: "update-farm",
    question: "How do I update my farm details?",
    answer:
      "Open the My Farm tab, switch between Farm Details and Farm Products, then tap Edit to update your farm information or crops.",
  },
  {
    id: "credit-status",
    question: "How can I check my credit application status?",
    answer:
      "Your active credit appears on the Home and Credits screens. Credit history and payback details are available under the Credits tab.",
  },
];

export const moreLinks: Array<moreLink> = [
  {
    name: "My Information",
    icon: icons.user,
    route: "/more/profileinformation",
  },
  {
    name: "Change Pin",
    icon: icons.password,
    route: "/more/changepin",
  },
  {
    name: "Help & Support",
    icon: icons.dialog,
    route: "/more/helpsupport",
  },
  {
    name: "Log out",
    icon: icons.logout,
    variant: "logout",
  },
];

export const weatherBackgrounds = {
  heavyRain: {
    colors: ["#62B8F6", "#2C79C1"],
    start: { x: 0.5, y: 0 },
    end: { x: 0.5, y: 1 },
  },
  cloudy: {
    colors: ["#919191", "#4C5156"],
    start: { x: 0.25, y: 0 },
    end: { x: 0.75, y: 1 },
  },
  thunderStorm: {
    colors: ["#235A82", "#123556"],
    start: { x: 0.2, y: 0 },
    end: { x: 0.8, y: 1 },
  },
  windy: {
    colors: ["#97D3FF", "#4F99DE"],
    start: { x: 0.3, y: 0 },
    end: { x: 0.8, y: 1 }, // ~120deg
  },
  rainy: {
    colors: ["#57B9FF", "#014788"],
    start: { x: 0.5, y: 0 },
    end: { x: 0.5, y: 1 }, // 180deg
  },
  sunny: {
    colors: ["#62B8F6", "#2C79C1"],
    start: { x: 0.5, y: 0 },
    end: { x: 0.5, y: 1 },
  },
};

export const districts = [
  "Greater Accra",
  "Ashanti",
  "Eastern",
  "Western",
  "Central",
  "Volta",
  "Northern",
  "Upper East",
  "Upper West",
  "Bono",
  "Bono East",
  "Ahafo",
  "Savannah",
  "North East",
  "Oti",
  "Western North",
];
export const genderOptions = [
  { label: "Male", value: "m", icon: icons.male },
  { label: "Female", value: "f", icon: icons.female },
];

export const booleanOptions = [
  { label: "Yes", value: true, icon: icons.tickSquare },
  { label: "No", value: false, icon: icons.closeSquare },
];
export const cropTagColors = [
  { bgColor: "#FFFBEB", textColor: "#D97706" },
  { bgColor: "#EFF6FF", textColor: "#2563EB" },
  { bgColor: "#FEF2F2", textColor: "#DC2626" },
  { bgColor: "#F0FDF4", textColor: "#16A34A" },
  { bgColor: "#F5F3FF", textColor: "#7C3AED" },
  { bgColor: "#FFF7ED", textColor: "#F97316" },
  { bgColor: "#ECFEFF", textColor: "#0891B2" },
];

export const cropsData = [
  {
    id: 1,
    product: {
      id: 1,
      name: "Cassava",
      type: "crop",
      status: "active",
    },
    is_main_product: false,
  },
  {
    id: 2,
    product: {
      id: 2,
      name: "Maize",
      type: "crop",
      status: "active",
    },
    is_main_product: false,
  },
  {
    id: 3,
    product: {
      id: 3,
      name: "Yam",
      type: "crop",
      status: "active",
    },
    is_main_product: false,
  },
  {
    id: 4,
    product: {
      id: 4,
      name: "Plantain",
      type: "crop",
      status: "active",
    },
    is_main_product: false,
  },
];

export const livestockData = [
  {
    id: 1,
    product: {
      id: 1,
      name: "Honey",
      type: "livestock",
      status: "active",
    },
    is_main_product: false,
  },
  {
    id: 2,
    product: {
      id: 2,
      name: "Cow",
      type: "livestock",
      status: "active",
    },
    is_main_product: false,
  },
  {
    id: 3,
    product: {
      id: 3,
      name: "Goat",
      type: "livestock",
      status: "active",
    },
    is_main_product: false,
  },
  {
    id: 4,
    product: {
      id: 4,
      name: "Chickens",
      type: "livestock",
      status: "active",
    },
    is_main_product: false,
  },
];

export const statusTypes: Record<
  string,
  { text: string; textColor: keyof typeof colors; bgColor: string }
> = {
  //  | "pending" | "denied"

  // paid: {
  //   text: "Paid",
  //   textColor: "primary",
  //   bgColor: colors.secondaryLight,
  // },
  approved: {
    text: "Approved",
    textColor: "primary",
    bgColor: colors.secondaryLight,
  },
  // partial: {
  //   text: "Partial",
  //   textColor: "partialText",
  //   bgColor: colors.partialBg,
  // },

  pending: {
    text: "Pending",
    textColor: "partialText",
    bgColor: colors.partialBg,
  },
  // overdue: {
  //   text: "Overdue",
  //   textColor: "overdueText",
  //   bgColor: colors.overdueBg,
  // },

  denied: {
    text: "Rejected",
    textColor: "overdueText",
    bgColor: colors.overdueBg,
  },

  // active: {
  //   text: "Active",
  //   textColor: "activeText",
  //   bgColor: colors.activeBg,
  // },
};

export const yesNoOptions = [
  { label: "Yes", value: true, icon: null },
  { label: "No", value: false, icon: null },
];
