import { endpoints } from "@/constants/endpoints";
import useAuthMutation from "@/hooks/usemutation";
import { handleAuthApiError } from "@/utils/apierrorhandler";
import { FormikProps } from "formik";
import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet } from "react-native";
import { useToast } from "react-native-toast-notifications";
import AppText from "./apptext";

interface ResendTimerProps {
  setOtp: () => void;
  formik: FormikProps<any>;
}

const ResendTimer: React.FC<ResendTimerProps> = ({ setOtp, formik }) => {
  const [resendTimer, setResendTimer] = useState<number>(60);

  const toast = useToast();

  const { mutate, isLoading } = useAuthMutation(
    endpoints.resendOtp,
    "POST",
    "resendotp",
    {
      onSuccess: (data) => {
        console.log(data);
      },
      onError: (error: any) => {
        handleAuthApiError(error, formik, toast);
      },
    }
  );
  useEffect(() => {
    const timerId = setInterval(() => {
      setResendTimer((prev) => {
        if (prev > 0) return prev - 1;
        clearInterval(timerId);
        return prev;
      });
    }, 1000);
    return () => clearInterval(timerId);
  }, [resendTimer]);

  const handleResendCode = async () => {
    if (resendTimer > 0) return;
    formik.setFieldTouched("code", false);
    setOtp();
    mutate({ phone_number: formik?.values?.phone_number });
    setResendTimer(60);
  };

  return (
    <Pressable
      style={styles.resendButton}
      disabled={resendTimer > 0 || isLoading}
      onPress={handleResendCode}
    >
      <AppText fontSize={14} fontFamily="Regular" color="formLabelText">
        Didn&apos;t receive a code?{" "}
      </AppText>

      {isLoading ? (
        <AppText fontSize={14} fontFamily="Regular" color="formLabelText">
          Sending...
        </AppText>
      ) : resendTimer > 0 ? (
        <AppText fontFamily="SemiBold" fontSize={14} color="formLabelText">
          {`${resendTimer}s`}
        </AppText>
      ) : (
        <AppText fontSize={14} fontFamily="SemiBold" color="formLabelText">
          Click to re-send
        </AppText>
      )}
    </Pressable>
  );
};

export default ResendTimer;
const styles = StyleSheet.create({
  resendButton: {
    width: "100%",
    flexDirection: "row",
  },
});
