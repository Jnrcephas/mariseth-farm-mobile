import { router } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";
import AppButton from "./appbutton";
import AppText from "./apptext";

const ListEmptyComponent = ({
  type,
  variant = "default",
  btnTitle,
  onPress,
}: {
  type: "farmers" | "crops" | "farms" | "credits" | "new_farmer" | "notifications" | "requests";
  variant?: "default" | "inline";
  btnTitle?: string;
  onPress?: () => void;
}) => {
  const types = {
    farmers: {
      title: "No farmers here yet",
      subtitle:
        "There is nothing to view right now. Click the button below to add a farmer and it to show up here.",
      btnTitle: "Add Farmer",
      btnAction: () => router.navigate(`/myfarmers/addfarmer?data=""`),
    },
    crops: {
      title: "No crops here yet",
      subtitle:
        "There is nothing to view right now. Add some crops and it to show up here.",
      btnTitle: "Add Crops",
      btnAction: null,
    },
    farms: {
      title: "No farms here yet",
      subtitle:
        "There is nothing to view right now. Click the button below to add a new farm and it to show up here.",
      btnTitle: "Add Farm",
      btnAction: () => router.navigate(`/myfarmers/addfarm`),
    },
    credits: {
      title: "No Information to show yet",
      subtitle:
        "There is nothing to view right now. Apply for credit and it to show up here.",
      btnTitle: "Apply for Credit",
      btnAction: () => router.navigate(`/credits/applycredit`),
    },

    new_farmer: {
      title: "No farms yet",
      subtitle:
        "To add a new farmer, you need to create a farm first. Tap the button below to get started.",
      btnTitle: "Create New Farm",
      btnAction: () => router.navigate(`/myfarmers/addfarm`),
    },
    notifications: {
      title: "No notifications yet",
      subtitle:
        "You're all caught up. New alerts about credits, farms, and requests will appear here.",
      btnTitle: "",
      btnAction: null,
    },
    requests: {
      title: "No pending requests",
      subtitle:
        "Input and support requests submitted by farmers in your cluster will show up here for you to review.",
      btnTitle: "",
      btnAction: null,
    },
  };
  const isInline = variant === "inline";
  const actionTitle = btnTitle ?? types[type].btnTitle;
  const actionHandler = onPress ?? types[type].btnAction;

  return (
    <View
      style={[
        styles.listEmptyContainer,
        isInline && styles.listEmptyContainerInline,
      ]}
    >
      <AppText
        color="formLabelText"
        fontFamily="Medium"
        fontSize={isInline ? 18 : 15}
        style={{ marginBottom: 12, textAlign: "center" }}
      >
        {types[type].title}
      </AppText>

      <AppText
        color="formInputText"
        fontFamily="Medium"
        fontSize={14}
        style={{ textAlign: "center" }}
      >
        {types[type].subtitle}
      </AppText>

      {actionTitle && actionHandler ? (
        <AppButton
          title={actionTitle}
          textColor="white"
          style={isInline ? styles.inlineButton : { marginTop: 36 }}
          btnColor="buttonPrimary"
          width={isInline ? 157 : "50%"}
          height={isInline ? 40 : 43}
          borderRadius={isInline ? 8 : 10}
          onPress={actionHandler}
        />
      ) : null}
    </View>
  );
};

export default ListEmptyComponent;

const styles = StyleSheet.create({
  listEmptyContainer: {
    paddingHorizontal: 30,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: "20%",
  },
  listEmptyContainerInline: {
    paddingTop: 32,
    paddingBottom: 24,
    paddingHorizontal: 0,
    maxWidth: 267,
    alignSelf: "center",
  },
  inlineButton: {
    marginTop: 36,
    alignSelf: "center",
  },
});
