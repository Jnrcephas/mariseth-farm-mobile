import { colors } from "@/constants/colors";
import { endpoints } from "@/constants/endpoints";
import { icons } from "@/constants/icons";
import { useFetchQuery } from "@/hooks/usefetchquery";
import { dataEncoder, dueDateFormat } from "@/utils/commonmethods";
import { Image } from "expo-image";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import AppText from "./apptext";

const formatCreditAmount = (amount?: string | number | null) => {
  if (amount === undefined || amount === null || amount === "") return "—";
  const numeric = Number(String(amount).replace(/,/g, ""));
  if (Number.isNaN(numeric)) return String(amount);
  return numeric.toLocaleString("en-GH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const DetailColumn = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => (
  <View style={styles.detailColumn}>
    <AppText fontFamily="Medium" fontSize={12} color="primary" style={styles.label}>
      {label}
    </AppText>
    <AppText fontFamily="SemiBold" fontSize={12} color="formLabelText">
      {value}
    </AppText>
  </View>
);

const ActiveCreditCard = () => {
  const { data, isLoading, error } = useFetchQuery(
    endpoints.activeCredit,
    "activecredit"
  );

  if (error?.status === 404) {
    return null;
  }
  if (isLoading) {
    return (
      <View
        style={{
          backgroundColor: colors.skeletonPlaceholder,
          height: 302,
          borderRadius: 16,
          width: "100%",
        }}
      />
    );
  }
  if (data) {
    const dueDate = dueDateFormat(data?.due_date);
    const issueDate = dueDateFormat(data?.issue_date) || "-";
    const bagsLabel =
      data?.quantity_metric_name?.toLowerCase().includes("bag")
        ? "Number of Bags"
        : "Quantity";

    return (
      <View style={styles.activeCreditContainer}>
        <View style={styles.activeCreditHeaderContainer}>
          <Image source={icons.arrowCorner} style={{ height: 24, width: 24 }} />
          <View style={styles.activeCreditHeaderTextContainer}>
            <AppText fontFamily="SemiBold" fontSize={14} color="textBold">
              Active Credit
            </AppText>
            <AppText
              fontFamily="Medium"
              fontSize={10}
              color="primary"
              style={{ opacity: 0.75 }}
            >
              {dueDate ? `due ${dueDate}` : "due -"}
            </AppText>
          </View>
          <TouchableOpacity
            style={styles.payCreditButton}
            onPress={() =>
              router.navigate(
                `/credits/viewpaybacklog?data=${dataEncoder(data)}`
              )
            }
          >
            <Image
              source={icons.money}
              style={{ width: 20, height: 20, marginRight: 8 }}
              tintColor={colors.white}
            />
            <AppText fontFamily="SemiBold" fontSize={12} color="white">
              Pay Credit
            </AppText>
          </TouchableOpacity>
        </View>

        <View style={styles.twoColumnRow}>
          <DetailColumn label="Input Credit" value={data?.input_credits ?? "-"} />
          <View style={styles.detailColumn}>
            <AppText
              fontFamily="Medium"
              fontSize={12}
              color="primary"
              style={styles.label}
            >
              Total amount
            </AppText>
            <View style={styles.amountRow}>
              <AppText
                fontFamily="Medium"
                fontSize={10}
                color="formLabelText"
                style={{ marginBottom: 2, marginRight: 6 }}
              >
                GHC
              </AppText>
              <AppText fontFamily="SemiBold" fontSize={12} color="formLabelText">
                {formatCreditAmount(data?.credit_amount)}
              </AppText>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.twoColumnRow}>
          <DetailColumn label="Issue Date" value={issueDate} />
          <DetailColumn label="Due Date" value={dueDate || "-"} />
        </View>

        <View style={styles.twoColumnRow}>
          <DetailColumn
            label={bagsLabel}
            value={String(data?.quantity ?? "-")}
          />
          <DetailColumn
            label="Interest Rate"
            value={data?.interest_rate ? `${data.interest_rate}%` : "-"}
          />
        </View>

        <View style={styles.notesSection}>
          <AppText
            fontFamily="Medium"
            fontSize={12}
            color="primary"
            style={styles.label}
          >
            Extra Information/Notes
          </AppText>
          <AppText fontFamily="SemiBold" fontSize={12} color="formLabelText">
            {data?.notes?.trim() ? data.notes : "-"}
          </AppText>
        </View>
      </View>
    );
  }
};

export default ActiveCreditCard;

const styles = StyleSheet.create({
  activeCreditContainer: {
    backgroundColor: colors.backgroundPrimary,
    paddingVertical: 16,
    paddingHorizontal: 15,
    boxShadow: "0px 4px 19px 0px rgba(63, 30, 87, 0.10)",
    marginTop: 4,
    borderRadius: 16,
    gap: 20,
  },
  activeCreditHeaderContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  activeCreditHeaderTextContainer: {
    flexDirection: "column",
    marginLeft: 12,
    flex: 1,
    gap: 6,
  },
  payCreditButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.primary,
    borderRadius: 49,
    flexDirection: "row",
    alignItems: "center",
    minHeight: 34,
  },
  twoColumnRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
  },
  detailColumn: {
    flex: 1,
    gap: 11,
  },
  label: {
    marginBottom: 0,
  },
  amountRow: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  divider: {
    height: 1,
    backgroundColor: colors.activeCreditBorder,
  },
  notesSection: {
    gap: 11,
  },
});
