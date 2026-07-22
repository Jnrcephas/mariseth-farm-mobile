import InfoCard from "@/components/ui/infocard";
import ProfileCard, { formatPhoneDisplay } from "@/components/ui/profilecard";
import AppText from "@/components/ui/apptext";
import { colors } from "@/constants/colors";
import { icons } from "@/constants/icons";
import { userStore } from "@/stores/userstore";
import { isLeadFarmerUser, isSmallholderUser } from "@/utils/userroles";
import { format, parseISO } from "date-fns";
import { Image } from "expo-image";
import { router } from "expo-router";
import React from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const displayValue = (value?: string | number | null) => {
  if (value === undefined || value === null || value === "") {
    return "-";
  }

  return String(value);
};

const formatDateOfBirth = (value?: string) => {
  if (!value) return "-";

  try {
    return format(parseISO(value), "do MMMM, yyyy");
  } catch {
    return value;
  }
};

const ProfileInformation = () => {
  const topInset = useSafeAreaInsets().top;
  const user = userStore((state) => state.user);
  const farmer = user?.farmer;
  const isLeaderFarmer = isLeadFarmerUser(user);
  const isSmallholder = isSmallholderUser(user);
  const showLeadershipExperience = isLeaderFarmer || isSmallholder;
  const leaderShipExperience = farmer?.leadership_experience;
  const isMentoring = leaderShipExperience?.is_mentoring_other_farmers;

  const basicProfileInfo = {
    headerTitle: "My Information",
    headerIcon: icons.user,
    onEditPress: () => router.navigate("/more/profileedit"),
    information: [
      {
        key: "Gender",
        value: farmer?.gender === "m" ? "Male" : farmer?.gender === "f" ? "Female" : "-",
      },
      {
        key: "Date of Birth",
        value: formatDateOfBirth(farmer?.date_of_birth),
      },
      {
        key: "National ID/Passport Number",
        value: displayValue(farmer?.id_number),
      },
      {
        key: "Contact Number",
        value: formatPhoneDisplay(farmer?.phone_number) || "-",
      },
      {
        key: "Email",
        value: displayValue(farmer?.email),
      },
      {
        key: "Address",
        value: displayValue(farmer?.address),
      },
      {
        key: "Village/Community",
        value: displayValue(farmer?.village),
      },
      {
        key: "District",
        value: displayValue(farmer?.district?.name),
      },
      {
        key: "Country",
        value: displayValue(farmer?.country),
      },
    ],
  };

  const leadershipExperienceInfo = {
    headerTitle: "Leadership & Experience",
    onEditPress: () => router.navigate("/more/leadershipinfoedit"),
    information: [
      {
        key: "Are you currently mentoring other farmers?",
        value: isMentoring ? "Yes" : "No",
      },
      ...(isMentoring
        ? [
            {
              key: "If Yes, how many farmers are you mentoring",
              value: displayValue(
                leaderShipExperience?.number_of_farmers_mentoring
              ),
            },
          ]
        : []),
      {
        key: "Membership in Farming Cooperatives/Associations",
        value: leaderShipExperience?.has_farming_membership ? "Yes" : "No",
      },
      {
        key: "If Other, Please Specify Here",
        value: displayValue(leaderShipExperience?.farming_type),
      },
      {
        key: "Have you received any leadership or agricultural training?",
        value: leaderShipExperience?.has_received_farming_leadership_training
          ? "Yes"
          : "No",
      },
      {
        key: "Do you provide training to other farmers?",
        value: farmer?.farm?.provide_training ? "Yes" : "No",
      },
    ],
  };

  return (
    <ScrollView
      style={styles.profileInfoContainer}
      contentContainerStyle={[
        styles.contentContainer,
        { paddingTop: topInset + 20 },
      ]}
    >
      <ProfileCard item={user} readonly />

      <Pressable style={styles.backButtonContainer} onPress={() => router.back()}>
        <View style={styles.backIcon}>
          <Image
            source={icons.arrowLeft}
            style={styles.backIconImage}
            tintColor={colors.primary}
          />
        </View>
        <AppText fontFamily="SemiBold" fontSize={14} color="textBold">
          Back
        </AppText>
      </Pressable>

      <InfoCard info={basicProfileInfo} />
      {showLeadershipExperience ? (
        <InfoCard info={leadershipExperienceInfo} />
      ) : null}
    </ScrollView>
  );
};

export default ProfileInformation;

const styles = StyleSheet.create({
  profileInfoContainer: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 60,
  },
  backButtonContainer: {
    flexDirection: "row",
    alignSelf: "flex-start",
    alignItems: "center",
    gap: 8,
    marginTop: 18,
    marginBottom: 18,
  },
  backIcon: {
    width: 34,
    height: 34,
    borderWidth: 0.85,
    borderRadius: 7,
    borderColor: "#E2E8F0",
    backgroundColor: colors.backgroundPrimary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3.4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  backIconImage: {
    width: 17,
    height: 17,
  },
});
