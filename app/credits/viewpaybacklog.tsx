import AppText from "@/components/ui/apptext";
import PaybackLogField from "@/components/ui/paybacklogfield";
import PaybackLogTabs, { PaybackLogTab } from "@/components/ui/paybacklogtabs";
import { colors } from "@/constants/colors";
import { endpoints } from "@/constants/endpoints";
import { icons } from "@/constants/icons";
import { useFetchQuery } from "@/hooks/usefetchquery";
import { credit } from "@/types/credit";
import { dataDecoder } from "@/utils/commonmethods";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type PaybackEntry = {
  input_credit?: string;
  quantity?: number | string;
  quantity_metric_name?: string;
  payment_method?: string;
  total_amount?: string;
};

const formatQuantity = (quantity?: number | string, metric?: string) => {
  if (quantity == null || quantity === "") return "-";
  const metricLabel = metric?.toLowerCase().includes("bag") ? "Bags" : metric;
  return metricLabel ? `${quantity} ${metricLabel}` : String(quantity);
};

const formatAmount = (amount?: string | number) => {
  if (amount == null || amount === "") return "-";
  return `GH₵ ${amount}`;
};

const ViewPaybackLog = () => {
  const params = useLocalSearchParams<{ data: string }>();
  const creditItem = (dataDecoder(params?.data) ?? {}) as credit;
  const creditId = creditItem?.credit_id ?? "";
  const topInset = useSafeAreaInsets().top;
  const [selectedTab, setSelectedTab] =
    React.useState<PaybackLogTab>("Payback Log");

  const { data: paybackData } = useFetchQuery(
    creditId ? `${endpoints.paybackHistory}?credit_id=${creditId}` : "",
    `payback-history-${creditId}`,
    { enabled: !!creditId }
  );

  const paybackEntries: PaybackEntry[] = React.useMemo(() => {
    const results = paybackData?.results ?? paybackData?.paybacks ?? paybackData;
    if (Array.isArray(results) && results.length > 0) {
      return results;
    }

    if (creditItem?.input_credits || (creditItem as any)?.input_credit) {
      return [
        {
          input_credit:
            (creditItem as any)?.input_credit ?? creditItem.input_credits,
          quantity: creditItem.quantity,
          quantity_metric_name: creditItem.quantity_metric_name,
        },
      ];
    }

    return [];
  }, [paybackData, creditItem]);

  const totalAmount =
    paybackData?.total_amount ??
    paybackEntries[paybackEntries.length - 1]?.total_amount ??
    creditItem?.credit_amount;

  const paymentMethod =
    paybackData?.payment_method ??
    paybackEntries[paybackEntries.length - 1]?.payment_method ??
    "-";

  const renderPaybackLogTab = () => (
    <View style={styles.fieldGroup}>
      <PaybackLogField
        label="Phone"
        value={paybackData?.phone_number ?? "-"}
      />
      <PaybackLogField
        label="Beneficiary"
        value={paybackData?.beneficiary_name ?? "-"}
        highlightLabel
      />
      <PaybackLogField
        label="Input Type"
        value={creditItem?.type ?? paybackData?.input_type ?? "-"}
        highlightLabel
      />

      {paybackEntries.map((entry, index) => (
        <View key={`${entry.input_credit}-${index}`} style={styles.entryGroup}>
          <PaybackLogField
            label="Input Credit"
            value={entry.input_credit ?? "-"}
            highlightLabel
          />
          <PaybackLogField
            label="Quantity"
            value={formatQuantity(entry.quantity, entry.quantity_metric_name)}
            highlightLabel
          />
        </View>
      ))}

      <PaybackLogField
        label="Credit Amount"
        value={formatAmount(creditItem?.credit_amount)}
        highlightLabel
      />
      <PaybackLogField
        label="Interest Rate"
        value={creditItem?.interest_rate ? `${creditItem.interest_rate}%` : "-"}
        highlightLabel
      />
      <PaybackLogField
        label="Extra Information"
        value={creditItem?.notes?.trim() ? creditItem.notes : "-"}
        highlightLabel
      />
      <PaybackLogField
        label="Payment Method"
        value={paymentMethod}
        highlightLabel
      />
      <PaybackLogField
        label="Total Amount"
        value={formatAmount(totalAmount)}
        highlightLabel
      />
    </View>
  );

  const renderCreditDetailsTab = () => (
    <View style={styles.fieldGroup}>
      <PaybackLogField
        label="Business Registration"
        value={paybackData?.business_registration ?? "-"}
      />
      <PaybackLogField
        label="Has Business Registration"
        value={
          paybackData?.has_business_registration != null
            ? paybackData.has_business_registration
              ? "Yes"
              : "No"
            : "-"
        }
      />
    </View>
  );

  const renderSummaryTab = () => (
    <View style={styles.fieldGroup}>
      <PaybackLogField
        label="Status"
        value={
          creditItem?.payment_status
            ? creditItem.payment_status.charAt(0).toUpperCase() +
              creditItem.payment_status.slice(1)
            : "-"
        }
      />
      <PaybackLogField
        label="Credit ID"
        value={creditId || "-"}
      />
      <PaybackLogField
        label="Outstanding Amount"
        value={formatAmount(creditItem?.outstanding_amount)}
      />
    </View>
  );

  return (
    <View style={[styles.screen, { paddingTop: topInset }]}>
      <View style={styles.header}>
        <AppText
          fontFamily="SemiBold"
          fontSize={16}
          color="textBold"
          numberOfLines={1}
          style={styles.headerTitle}
        >
          {`View Payback Log - ${creditId || "-"}`}
        </AppText>

        <View style={styles.headerActions}>
          <Pressable style={styles.headerIconButton}>
            <Image
              source={icons.edit}
              style={styles.headerIcon}
              tintColor={colors.primary}
            />
          </Pressable>
          <Pressable
            style={styles.headerIconButton}
            onPress={() => router.back()}
          >
            <Image
              source={icons.close}
              style={styles.headerIcon}
              tintColor={colors.error}
            />
          </Pressable>
        </View>
      </View>

      <View style={styles.contentCard}>
        <PaybackLogTabs selected={selectedTab} onSelect={setSelectedTab} />

        <View style={styles.accountField}>
          <AppText fontFamily="Medium" fontSize={12} color="formLabelText">
            Loan Account
          </AppText>
          <Pressable style={styles.accountSelector}>
            <AppText
              fontFamily="Medium"
              fontSize={14}
              color="textBold"
              numberOfLines={1}
              style={styles.accountText}
            >
              {paybackData?.loan_account ??
                "Welfare Loan Account - #9233239321212"}
            </AppText>
            <Image
              source={icons.arrowDown}
              style={styles.accountArrow}
              tintColor={colors.textPrimary}
            />
          </Pressable>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {selectedTab === "Payback Log" && renderPaybackLogTab()}
          {selectedTab === "Credit Details" && renderCreditDetailsTab()}
          {selectedTab === "Summary" && renderSummaryTab()}
        </ScrollView>

        <TouchableOpacity style={styles.filterButton} activeOpacity={0.85}>
          <Image
            source={icons.dialog}
            style={styles.filterIcon}
            tintColor={colors.white}
          />
          <AppText fontFamily="SemiBold" fontSize={14} color="white">
            Filter
          </AppText>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <AppText fontFamily="Regular" fontSize={14} color="textPrimary">
          Powered by
        </AppText>
        <AppText fontFamily="SemiBold" fontSize={14} color="textPrimary">
          Mesh Suite
        </AppText>
      </View>
    </View>
  );
};

export default ViewPaybackLog;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
    paddingHorizontal: 15,
    paddingBottom: 15,
  },
  header: {
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 15,
  },
  headerTitle: {
    flex: 1,
    marginRight: 12,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  headerIconButton: {
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  headerIcon: {
    width: 16,
    height: 16,
  },
  contentCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    borderRadius: 0,
    paddingHorizontal: 18,
    paddingTop: 25,
    paddingBottom: 18,
    gap: 24,
    boxShadow: "0px 8px 24px 0px rgba(0, 0, 0, 0.02)",
  },
  accountField: {
    gap: 12,
  },
  accountSelector: {
    minHeight: 38,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 10,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 8,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  accountText: {
    flex: 1,
  },
  accountArrow: {
    width: 16,
    height: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 8,
  },
  fieldGroup: {
    gap: 15,
  },
  entryGroup: {
    gap: 15,
  },
  filterButton: {
    height: 38,
    borderRadius: 8,
    backgroundColor: "#26A996",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    boxShadow: "0px 1px 4px 0px rgba(30, 41, 59, 0.09)",
  },
  filterIcon: {
    width: 16,
    height: 16,
  },
  footer: {
    minHeight: 41,
    marginTop: 15,
    backgroundColor: "#F1F5F9",
    borderRadius: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
});
