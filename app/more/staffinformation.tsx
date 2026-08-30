import InfoCard from "@/components/ui/infocard";
import ProfileCard from "@/components/ui/profilecard";
import { icons } from "@/constants/icons";
import { userStore } from "@/stores/userstore";
import React from "react";
import { ScrollView, StyleSheet } from "react-native";

const displayValue = (value?: string | number | null) => {
  if (value === undefined || value === null || value === "") {
    return "-";
  }
  return String(value);
};

const formatGender = (gender?: string | null) => {
  if (gender === "m") return "Male";
  if (gender === "f") return "Female";
  return "-";
};

const formatUserType = (userType?: string) => {
  if (!userType) return "-";
  return userType.charAt(0).toUpperCase() + userType.slice(1);
};

// Field officers/staff log in with admin accounts (see
// app/(auth)/staffsignin.tsx) which carry no farmer profile, so
// profileinformation.tsx (built entirely around `user.farmer`) doesn't
// apply to them - this reads the fields that ARE on their account instead,
// all already in hand from sign-in (accounts/auth/login), no extra fetch
// needed. Read-only: there's no mobile edit-account flow for staff, same
// as there's no self-service signup for this account type.
const StaffInformation = () => {
  const user = userStore((state) => state.user);

  const accountInfo = {
    headerTitle: "Account Details",
    headerIcon: icons.user,
    information: [
      { key: "Email", value: displayValue(user?.email) },
      { key: "Gender", value: formatGender((user as any)?.gender) },
      { key: "Account Type", value: formatUserType(user?.user_type) },
    ],
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <ProfileCard item={user} readonly />
      <InfoCard info={accountInfo} />
    </ScrollView>
  );
};

export default StaffInformation;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  container: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 40,
    gap: 20,
  },
});