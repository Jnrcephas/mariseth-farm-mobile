import { colors } from "@/constants/colors";
import { endpoints } from "@/constants/endpoints";
import useAuthMutation from "@/hooks/usemutation";
import { userStore } from "@/stores/userstore";
import { useUniversalStore } from "@/stores/useuniversalstore";
import { handleGenericApiError } from "@/utils/apierrorhandler";
import { router } from "expo-router";
import React from "react";
import { Modal, StyleSheet, View } from "react-native";
import { useToast } from "react-native-toast-notifications";
import { useStore } from "zustand";
import AppButton from "./appbutton";
import AppText from "./apptext";

const DeleteAccountModal = React.memo(() => {
  const deleteAccountModalVisible = useStore(
    useUniversalStore,
    (state) => state.deleteAccountModalVisible
  );
  const toast = useToast();

  const { mutate, isLoading } = useAuthMutation(
    endpoints.deleteAccount,
    "DELETE",
    "deleteaccount",
    {
      onSuccess: () => {
        userStore.setState({
          user: null,
          notifications: [],
          unreadNotificationCount: 0,
          fcmToken: "",
          metrics: [],
          regions: [],
          farmProducts: [],
          farms: [],
        });
        useUniversalStore.setState({ deleteAccountModalVisible: false });
        router.replace(`/(auth)`);
      },
      onError: (error: any) => {
        handleGenericApiError(error, toast);
      },
    }
  );

  return (
    <Modal
      visible={deleteAccountModalVisible}
      animationType="fade"
      transparent
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.textSection}>
            <AppText
              fontFamily="SemiBold"
              fontSize={16}
              color="formLabelText"
              style={styles.title}
            >
              Delete Account?
            </AppText>

            <AppText
              fontFamily="Regular"
              fontSize={14}
              color="tabBarInactive"
              style={styles.message}
            >
              This will permanently delete your account and all associated data.
              This action cannot be undone.
            </AppText>
          </View>

          <View style={styles.buttonRow}>
            <View style={styles.buttonWrapper}>
              <AppButton
                title="Delete"
                textColor="white"
                btnColor="error"
                height={38}
                borderRadius={8}
                borderWidth={1.2}
                borderColor="error"
                loading={isLoading}
                style={styles.buttonShadow}
                onPress={() => mutate({})}
              />
            </View>

            <View style={styles.buttonWrapper}>
              <AppButton
                title="Cancel"
                textColor="formLabelText"
                btnColor="backgroundPrimary"
                height={38}
                borderRadius={8}
                borderWidth={1.2}
                borderColor="formBorder"
                style={styles.buttonShadow}
                onPress={() =>
                  useUniversalStore.setState({
                    deleteAccountModalVisible: false,
                  })
                }
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
});

export default DeleteAccountModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 16,
    backgroundColor: colors.backgroundTransparent,
  },
  card: {
    backgroundColor: colors.backgroundPrimary,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    paddingHorizontal: 46,
    paddingTop: 28,
    paddingBottom: 24,
  },
  textSection: {
    alignItems: "center",
    gap: 8,
  },
  title: {
    textAlign: "center",
    lineHeight: 19,
  },
  message: {
    textAlign: "center",
    lineHeight: 20,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 25,
  },
  buttonWrapper: {
    flex: 1,
  },
  buttonShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 19,
    elevation: 2,
  },
});
