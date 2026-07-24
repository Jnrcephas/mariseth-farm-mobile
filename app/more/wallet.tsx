import AppButton from "@/components/ui/appbutton";
import AppText from "@/components/ui/apptext";
import ListEmptyComponent from "@/components/ui/listemptycomponent";
import { colors } from "@/constants/colors";
import { icons } from "@/constants/icons";
import { isIOS } from "@/constants/generalconstants";
import { Image } from "expo-image";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";

// NOTE: There is no wallet/ledger endpoint wired up in the API yet
// (see constants/endpoints.ts - nothing like "wallet" exists there). Per
// SRD section 4.4.3 (Farmer Wallet / Ledger System) and the mobile screens
// table (8.3), this screen uses illustrative placeholder data so the
// screen/flow can be reviewed and the UI is ready to receive real data.
// SWAP OUT walletBalance/transactions for a real useFetchQuery /
// usePaginatedInfiniteQuery hook once a wallet endpoint exists - search
// "walletBalance" to find this again.
const walletBalance = {
  amount: 4280.5,
  currency: "GHS",
  lastUpdated: "22 Jul 2026, 9:14 AM",
};

type WalletTransaction = {
  id: string;
  type: "credit" | "debit";
  title: string;
  reference: string;
  date: string;
  amount: number;
};

const walletTransactions: WalletTransaction[] = [
  {
    id: "1",
    type: "credit",
    title: "Harvest Settlement - Maize",
    reference: "MF-SET-1042",
    date: "20 Jul 2026",
    amount: 850,
  },
  {
    id: "2",
    type: "debit",
    title: "Input Purchase - Fertiliser",
    reference: "MF-TXN-3391",
    date: "18 Jul 2026",
    amount: 220,
  },
  {
    id: "3",
    type: "credit",
    title: "Harvest Settlement - Cassava",
    reference: "MF-SET-1038",
    date: "12 Jul 2026",
    amount: 1120,
  },
  {
    id: "4",
    type: "credit",
    title: "Harvest Settlement - Tomatoes",
    reference: "MF-SET-1029",
    date: "05 Jul 2026",
    amount: 640.5,
  },
  {
    id: "5",
    type: "debit",
    title: "Input Purchase - Seeds",
    reference: "MF-TXN-3350",
    date: "29 Jun 2026",
    amount: 150,
  },
];

const formatAmount = (value: number) =>
  value.toLocaleString("en-GH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const TransactionRow = ({ item }: { item: WalletTransaction }) => {
  const isCredit = item.type === "credit";

  return (
    <View style={styles.transactionRow}>
      <View
        style={[
          styles.transactionIconWrap,
          { backgroundColor: isCredit ? colors.secondaryLight : "#FEF2F2" },
        ]}
      >
        <Image
          source={icons.money}
          style={styles.transactionIcon}
          tintColor={isCredit ? colors.primary : colors.error}
        />
      </View>

      <View style={styles.transactionDetails}>
        <AppText
          fontFamily="Medium"
          fontSize={14}
          color="textBold"
          numberOfLines={1}
        >
          {item.title}
        </AppText>
        <AppText fontFamily="Regular" fontSize={12} color="formPlaceholderText">
          {item.reference} · {item.date}
        </AppText>
      </View>

      <AppText
        fontFamily="SemiBold"
        fontSize={14}
        color={isCredit ? "primary" : "error"}
      >
        {isCredit ? "+" : "-"}
        {formatAmount(item.amount)}
      </AppText>
    </View>
  );
};

const Wallet = () => {
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ paddingBottom: isIOS ? "20%" : "12%" }}
    >
      <View style={styles.balanceCard}>
        <AppText fontFamily="Medium" fontSize={13} color="white">
          Wallet Balance
        </AppText>
        <AppText fontFamily="Bold" fontSize={32} color="white" style={styles.balanceAmount}>
          {walletBalance.currency} {formatAmount(walletBalance.amount)}
        </AppText>
        <AppText fontFamily="Regular" fontSize={12} color="white" style={styles.balanceUpdated}>
          Last updated {walletBalance.lastUpdated}
        </AppText>
      </View>

      <View style={styles.smsRow}>
        <View style={styles.smsTextWrap}>
          <AppText fontFamily="SemiBold" fontSize={14} color="textBold">
            SMS Statement
          </AppText>
          <AppText fontFamily="Regular" fontSize={12} color="formPlaceholderText">
            Get your last 5 transactions sent to your registered number
          </AppText>
        </View>
        <AppButton
          title="Request"
          textColor="primary"
          btnColor="secondaryLight"
          width={100}
          height={38}
          fontSize={13}
          borderRadius={100}
          onPress={() => {
            // TODO: wire up to real "send SMS statement" endpoint once available
          }}
        />
      </View>

      <View style={styles.transactionsSection}>
        <AppText fontFamily="SemiBold" fontSize={16} color="black" style={styles.transactionsTitle}>
          Recent Transactions
        </AppText>

        {walletTransactions.length > 0 ? (
          <View style={styles.transactionsList}>
            {walletTransactions.map((item) => (
              <TransactionRow key={item.id} item={item} />
            ))}
          </View>
        ) : (
          <ListEmptyComponent type="credits" variant="inline" />
        )}
      </View>
    </ScrollView>
  );
};

export default Wallet;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
  balanceCard: {
    marginHorizontal: 16,
    marginTop: 20,
    padding: 20,
    borderRadius: 16,
    backgroundColor: colors.primary,
  },
  balanceAmount: {
    marginTop: 8,
  },
  balanceUpdated: {
    marginTop: 12,
    opacity: 0.85,
  },
  smsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 16,
    padding: 14,
    borderRadius: 12,
    backgroundColor: colors.backgroundTertiary,
    gap: 12,
  },
  smsTextWrap: {
    flex: 1,
    gap: 2,
  },
  transactionsSection: {
    marginTop: 28,
    paddingHorizontal: 16,
  },
  transactionsTitle: {
    marginBottom: 8,
  },
  transactionsList: {
    borderTopWidth: 1,
    borderTopColor: colors.light,
  },
  transactionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: colors.light,
    gap: 12,
  },
  transactionIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  transactionIcon: {
    width: 20,
    height: 20,
  },
  transactionDetails: {
    flex: 1,
    gap: 2,
  },
});
