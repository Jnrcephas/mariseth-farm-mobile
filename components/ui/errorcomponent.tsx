import { colors } from "@/constants/colors";
import React from "react";
import { StyleSheet, View } from "react-native";
import AppButton from "./appbutton";
import AppText from "./apptext";

type ErrorType =
  | "NETWORK_ERROR"
  | "TIMEOUT_ERROR"
  | "CONNECTION_ERROR"
  | "SERVER_ERROR"
  | "CLIENT_ERROR";

const ErrorComponent = ({
  type,
  refetch,
  message,
  title,
  btnTitle,
}: {
  type: ErrorType;
  refetch: () => void;
  message?: string;
  title?: string;
  btnTitle?: string;
}) => {
  const types: Record<
    ErrorType,
    {
      title: string;
      subtitle: string;
      btnTitle: string;
      btnAction: () => void;
    }
  > = {
    NETWORK_ERROR: {
      title: "Network Error",
      subtitle:
        "Looks like you’re not connected to the internet. Check your connection and tap retry when you're back online.",
      btnTitle: "Retry",
      btnAction: () => {
        refetch();
      },
    },

    TIMEOUT_ERROR: {
      title: "Request Timed Out",
      subtitle:
        "The request took too long to respond. Please ensure you have a stable connection and try again.",
      btnTitle: "Try Again",
      btnAction: () => {
        refetch();
      },
    },

    CONNECTION_ERROR: {
      title: "Connection Lost",
      subtitle:
        "Something went wrong while trying to connect to the server. Please check your internet connection and  try again.",
      btnTitle: "Reconnect",
      btnAction: () => {
        refetch();
      },
    },

    SERVER_ERROR: {
      title: "Server Error",
      subtitle:
        "We're unable to process your request right now. Please try again in a moment.",
      btnTitle: "Retry",
      btnAction: () => {
        refetch();
      },
    },

    CLIENT_ERROR: {
      title: title ? title : "Error",
      subtitle: message
        ? message
        : "Something went wrong while trying to connect to the server.Try again later.",
      btnTitle: btnTitle ? btnTitle : "Retry",
      btnAction: () => {
        refetch();
      },
    },
  };
  return (
    <View style={{ flex: 1, backgroundColor: colors.backgroundPrimary }}>
      <View style={styles.errorContainer}>
        <AppText
          color="formLabelText"
          fontFamily="Medium"
          fontSize={15}
          style={{ marginBottom: 12, textAlign: "center" }}
        >
          {types[type]?.title}
        </AppText>

        <AppText
          color="formInputText"
          fontFamily="Medium"
          fontSize={14}
          style={{ textAlign: "center", lineHeight: 22 }}
        >
          {types[type]?.subtitle}
        </AppText>

        {types[type]?.btnTitle && (
          <AppButton
            title={types[type]?.btnTitle}
            textColor="white"
            style={{ marginTop: 36 }}
            btnColor="buttonPrimary"
            width={"50%"}
            height={43}
            onPress={() => types[type]?.btnAction?.()}
          />
        )}
      </View>
    </View>
  );
};
export default ErrorComponent;

const styles = StyleSheet.create({
  errorContainer: {
    paddingHorizontal: 30,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: "40%",
  },
});
