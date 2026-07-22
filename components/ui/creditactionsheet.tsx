import { colors } from "@/constants/colors";
import { statusTypes } from "@/constants/generalconstants";
import { icons } from "@/constants/icons";
import { dataEncoder, dueDateFormat } from "@/utils/commonmethods";
import { Image } from "expo-image";
import { router } from "expo-router";
import React from "react";
import { ImageSourcePropType, StyleSheet, TouchableOpacity, View } from "react-native";
import { ActionSheetRef } from "react-native-actions-sheet";
import AppText from "./apptext";
import CustomActionsheet from "./customactionsheet";

type SheetHeader = {
  title: string;
  icon: ImageSourcePropType;
  iconTint?: string;
  dueColor: keyof typeof colors;
  dueOpacity: number;
  dueText: string;
  showPayCredit: boolean;
};

const getSheetHeader = (item?: any): SheetHeader => {
  const dueDate = dueDateFormat(item?.due_date);
  const dueLine = dueDate ? `due ${dueDate}` : "due -";
  const approvalStatus = item?.approval_status;
  const paymentStatus = item?.payment_status;

  if (approvalStatus === "pending") {
    return {
      title: "Pending Credit",
      icon: icons.arrowCorner,
      iconTint: colors.partialText,
      dueColor: "primary",
      dueOpacity: 0.75,
      dueText: dueLine,
      showPayCredit: true,
    };
  }

  if (approvalStatus === "denied") {
    return {
      title: "Rejected Credit",
      icon: icons.arrowCorner,
      iconTint: colors.overdueText,
      dueColor: "overdueText",
      dueOpacity: 1,
      dueText: dueLine,
      showPayCredit: false,
    };
  }

  const isUnpaid =
    paymentStatus === "overdue" ||
    paymentStatus === "partial" ||
    paymentStatus === "active";

  if (isUnpaid) {
    return {
      title: "Unpaid Credit",
      icon: icons.arrowDown,
      iconTint: colors.overdueText,
      dueColor: "overdueText",
      dueOpacity: 1,
      dueText: dueLine,
      showPayCredit: true,
    };
  }

  if (paymentStatus === "paid") {
    return {
      title: "Paid Credit",
      icon: icons.arrowCorner,
      dueColor: "primary",
      dueOpacity: 0.75,
      dueText: dueLine,
      showPayCredit: true,
    };
  }

  const status = statusTypes[approvalStatus];
  return {
    title: `${status?.text ?? "Approved"} Credit`,
    icon: icons.arrowCorner,
    dueColor: "primary",
    dueOpacity: 0.75,
    dueText: dueLine,
    showPayCredit: true,
  };
};

interface creditActionSheetProps {
  sheetRef: React.RefObject<ActionSheetRef | null>;
  item?: any;
}

const CreditActionSheet: React.FC<creditActionSheetProps> = ({
  sheetRef,
  item,
}) => {
  const header = getSheetHeader(item);
  const dueDate = dueDateFormat(item?.due_date);
  const bagsLabel = item?.quantity_metric_name?.toLowerCase().includes("bag")
    ? "Number of Bags"
    : "Quantity";

  const creditInfo = [
    {
      key: "Input Credit",
      value: item?.input_credit ?? "-",
    },
    {
      key: "Total amount",
      value: item?.credit_amount ? `GH₵ ${item.credit_amount}` : "-",
    },
    {
      key: "Issue Date",
      value: dueDateFormat(item?.issue_date) || "-",
    },
    {
      key: "Due Date",
      value: dueDate || "-",
    },
    {
      key: bagsLabel,
      value:
        item?.quantity != null
          ? `${item.quantity}${item?.quantity_metric_name && !bagsLabel.includes("Bags") ? ` ${item.quantity_metric_name}` : ""}`
          : "-",
    },
    {
      key: "Interest Rate",
      value: item?.interest_rate ? `${item.interest_rate}%` : "-",
    },
    {
      key: "Extra Information/Notes",
      value: item?.notes?.trim() ? item.notes : "-",
    },
  ];

  return (
    <CustomActionsheet actionSheetRef={sheetRef}>
      <View style={styles.container}>
        <View style={styles.handle} />

        <View style={styles.headerCard}>
          <Image
            source={header.icon}
            style={[
              styles.headerIcon,
              header.iconTint ? { tintColor: header.iconTint } : null,
            ]}
            contentFit="contain"
          />
          <View style={styles.headerText}>
            <AppText fontSize={14} color="textBold" fontFamily="SemiBold">
              {header.title}
            </AppText>
            <AppText
              fontSize={10}
              color={header.dueColor}
              fontFamily="Medium"
              style={{ opacity: header.dueOpacity }}
            >
              {header.dueText}
            </AppText>
          </View>
          {header.showPayCredit ? (
            <TouchableOpacity
              style={styles.payCreditButton}
              onPress={() => {
                sheetRef.current?.hide();
                router.navigate(
                  `/credits/viewpaybacklog?data=${dataEncoder(item)}`
                );
              }}
            >
              <Image
                source={icons.money}
                style={styles.payCreditIcon}
                tintColor={colors.white}
              />
              <AppText fontFamily="SemiBold" fontSize={12} color="white">
                Pay Credit
              </AppText>
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={styles.detailsCard}>
          {creditInfo.map((row) => (
            <View style={styles.detailRow} key={row.key}>
              <AppText
                fontFamily="Medium"
                fontSize={12}
                color="formLabelText"
                style={styles.detailLabel}
              >
                {row.key}
              </AppText>
              <AppText
                fontFamily="Medium"
                fontSize={12}
                color="black"
                style={styles.detailValue}
              >
                {row.value}
              </AppText>
            </View>
          ))}
        </View>
      </View>
    </CustomActionsheet>
  );
};

export default CreditActionSheet;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  handle: {
    alignSelf: "center",
    width: 57,
    height: 5,
    borderRadius: 50,
    backgroundColor: colors.segmentedControlBg,
    marginBottom: 21,
  },
  headerCard: {
    padding: 12,
    borderRadius: 16,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 21,
  },
  headerIcon: {
    height: 24,
    width: 24,
  },
  headerText: {
    flex: 1,
    marginLeft: 12,
    gap: 6,
  },
  payCreditButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.primary,
    borderRadius: 49,
    flexDirection: "row",
    alignItems: "center",
  },
  payCreditIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  detailsCard: {
    paddingVertical: 19,
    paddingHorizontal: 12,
    backgroundColor: colors.white,
    borderRadius: 16,
    gap: 16,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 4,
  },
  detailLabel: {
    flex: 1,
  },
  detailValue: {
    textAlign: "right",
    flexShrink: 1,
  },
});
