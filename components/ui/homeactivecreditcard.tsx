import { colors } from "@/constants/colors";
import { endpoints } from "@/constants/endpoints";
import { icons } from "@/constants/icons";
import { useFetchQuery } from "@/hooks/usefetchquery";
import { dueDateFormat } from "@/utils/commonmethods";
import { Image } from "expo-image";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import AppText from "./apptext";

type ActiveCreditData = {
  due_date?: string;
  input_credits?: string;
  credit_amount?: string | number;
};

const formatCreditAmount = (amount?: string | number | null) => {
  if (amount === undefined || amount === null || amount === "") return "—";
  const numeric = Number(String(amount).replace(/,/g, ""));
  if (Number.isNaN(numeric)) return String(amount);
  return numeric.toLocaleString("en-GH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const HomeActiveCreditCard = () => {
  const { data, isLoading, error } = useFetchQuery(
    endpoints.activeCredit,
    "activecredit"
  );

  if (isLoading) {
    return (
      <View style={{ paddingHorizontal: 16 }}>
        <View
          style={{
            backgroundColor: colors.skeletonPlaceholder,
            height: 125,
            borderRadius: 16,
          }}
        />
      </View>
    );
  }

  const creditData = (data ?? null) as ActiveCreditData | null;
  const hasActiveCredit = !!creditData && error?.status !== 404;
  const dueDate = creditData?.due_date
    ? dueDateFormat(creditData.due_date)
    : null;

  return (
    <View style={{ paddingHorizontal: 16 }}>
      <View style={styles.activeCreditContainer}>
        <View style={styles.activeCreditHeader}>
          <Image source={icons.arrowCorner} style={{ height: 30, width: 30 }} />
          <View style={styles.activeCreditHeaderText}>
            <AppText fontFamily="SemiBold" fontSize={14} color="textBold">
              Active Credit
            </AppText>

            <AppText fontFamily="Medium" fontSize={10} style={styles.dueDateText}>
              {dueDate ? `due ${dueDate}` : "No active credit"}
            </AppText>
          </View>
          <TouchableOpacity
            style={styles.viewButton}
            onPress={() => router.navigate("/credits")}
          >
            <AppText fontFamily="SemiBold" fontSize={12} color="primary">
              View
            </AppText>
          </TouchableOpacity>
        </View>
        <View style={styles.activeCreditDetails}>
          <View style={styles.activeCreditColumn}>
            <AppText
              fontFamily="Medium"
              fontSize={12}
              color="primary"
              style={styles.activeCreditLabel}
            >
              Input Credit
            </AppText>
            <AppText fontFamily="SemiBold" fontSize={12} color="formLabelText">
              {hasActiveCredit ? creditData?.input_credits ?? "N/A" : "—"}
            </AppText>
          </View>
          <View style={styles.activeCreditColumn}>
            <AppText
              fontFamily="Medium"
              fontSize={12}
              color="primary"
              style={styles.activeCreditLabel}
            >
              Total amount
            </AppText>
            <View style={styles.amountRow}>
              <AppText
                fontFamily="Medium"
                fontSize={10}
                color="formLabelText"
                style={styles.currencyText}
              >
                GHC
              </AppText>
              <AppText fontFamily="SemiBold" fontSize={12} color="formLabelText">
                {hasActiveCredit
                  ? formatCreditAmount(creditData?.credit_amount)
                  : "—"}
              </AppText>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

export default HomeActiveCreditCard;

const styles = StyleSheet.create({
  activeCreditContainer: {
    backgroundColor: colors.backgroundPrimary,
    paddingVertical: 16,
    paddingHorizontal: 15,
    boxShadow: "0px 4px 19px 0px rgba(63, 30, 87, 0.10)",
    borderRadius: 16,
  },
  activeCreditHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  activeCreditHeaderText: {
    flexDirection: "column",
    marginLeft: 12,
    flex: 1,
  },
  dueDateText: {
    color: "rgba(22, 163, 74, 0.75)",
  },
  viewButton: {
    paddingHorizontal: 26,
    paddingVertical: 8,
    backgroundColor: colors.secondaryLight,
    borderRadius: 49,
    alignItems: "center",
  },
  activeCreditDetails: {
    flexDirection: "row",
    width: "100%",
    gap: 73,
  },
  activeCreditColumn: {
    flexDirection: "column",
  },
  activeCreditLabel: {
    marginBottom: 11,
  },
  amountRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 6,
  },
  currencyText: {
    marginBottom: 1,
  },
});
