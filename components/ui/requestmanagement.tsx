import { width } from "@/constants/generalconstants";
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import AppButton from "./appbutton";
import AppText from "./apptext";
import { colors } from "@/constants/colors";
import ListEmptyComponent from "./listemptycomponent";

// NOTE: There is no request-management endpoint wired up yet (nothing
// like "requests" in constants/endpoints.ts). Per SRD section 4.3 (USSD
// Input Request workflow) and the mobile screens table (8.3: "My Cluster >
// Requests tab - Pending requests list, approve/assign/reject actions,
// search"), this uses illustrative placeholder data so the screen/flow is
// ready to receive real data. SWAP OUT pendingRequests for a real
// usePaginatedInfiniteQuery hook once a requests endpoint exists - search
// "pendingRequests" to find this again.
type InputRequest = {
  id: string;
  farmerName: string;
  category: "Seeds" | "Fertiliser" | "Pesticides";
  subType: string;
  quantity: string;
  reference: string;
  submittedAt: string;
  status: "pending" | "approved" | "rejected";
};

const initialRequests: InputRequest[] = [
  {
    id: "1",
    farmerName: "Kofi Mensah",
    category: "Seeds",
    subType: "Maize (Hybrid)",
    quantity: "10 kg",
    reference: "MF-REQ-2201",
    submittedAt: "22 Jul 2026, 8:12 AM",
    status: "pending",
  },
  {
    id: "2",
    farmerName: "Ama Boateng",
    category: "Fertiliser",
    subType: "NPK 15-15-15",
    quantity: "5 bags",
    reference: "MF-REQ-2198",
    submittedAt: "21 Jul 2026, 4:40 PM",
    status: "pending",
  },
  {
    id: "3",
    farmerName: "Yaw Owusu",
    category: "Pesticides",
    subType: "Fall Armyworm Control",
    quantity: "2 L",
    reference: "MF-REQ-2190",
    submittedAt: "20 Jul 2026, 11:05 AM",
    status: "pending",
  },
];

const statusMeta = {
  pending: { label: "Pending", bg: colors.activeBg, text: colors.activeText },
  approved: { label: "Approved", bg: colors.secondaryLight, text: colors.primary },
  rejected: { label: "Rejected", bg: colors.overdueBg, text: colors.overdueText },
};

const RequestCard = ({
  item,
  onApprove,
  onReject,
}: {
  item: InputRequest;
  onApprove: () => void;
  onReject: () => void;
}) => {
  const meta = statusMeta[item.status];

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <AppText fontFamily="SemiBold" fontSize={15} color="textBold">
            {item.farmerName}
          </AppText>
          <AppText fontFamily="Regular" fontSize={12} color="formPlaceholderText">
            {item.reference} · {item.submittedAt}
          </AppText>
        </View>
        <View style={[styles.statusPill, { backgroundColor: meta.bg }]}>
          <AppText fontFamily="Medium" fontSize={11} style={{ color: meta.text }}>
            {meta.label}
          </AppText>
        </View>
      </View>

      <View style={styles.detailsRow}>
        <View style={styles.detailItem}>
          <AppText fontFamily="Regular" fontSize={12} color="formPlaceholderText">
            Category
          </AppText>
          <AppText fontFamily="Medium" fontSize={13} color="textBold">
            {item.category}
          </AppText>
        </View>
        <View style={styles.detailItem}>
          <AppText fontFamily="Regular" fontSize={12} color="formPlaceholderText">
            Item
          </AppText>
          <AppText fontFamily="Medium" fontSize={13} color="textBold">
            {item.subType}
          </AppText>
        </View>
        <View style={styles.detailItem}>
          <AppText fontFamily="Regular" fontSize={12} color="formPlaceholderText">
            Quantity
          </AppText>
          <AppText fontFamily="Medium" fontSize={13} color="textBold">
            {item.quantity}
          </AppText>
        </View>
      </View>

      {item.status === "pending" ? (
        <View style={styles.actionsRow}>
          <AppButton
            title="Reject"
            textColor="error"
            btnColor="backgroundPrimary"
            borderWidth={1}
            borderColor="error"
            height={38}
            fontSize={13}
            style={{ flex: 1 }}
            onPress={onReject}
          />
          <AppButton
            title="Approve"
            textColor="white"
            btnColor="buttonPrimary"
            height={38}
            fontSize={13}
            style={{ flex: 1 }}
            onPress={onApprove}
          />
        </View>
      ) : null}
    </View>
  );
};

const RequestManagement = () => {
  const [requests, setRequests] = useState<InputRequest[]>(initialRequests);

  const updateStatus = (id: string, status: InputRequest["status"]) => {
    setRequests((prev) =>
      prev.map((request) =>
        request.id === id ? { ...request, status } : request
      )
    );
  };

  return (
    <View style={{ width, paddingHorizontal: 16, gap: 12 }}>
      {requests.length > 0 ? (
        requests.map((item) => (
          <RequestCard
            key={item.id}
            item={item}
            onApprove={() => updateStatus(item.id, "approved")}
            onReject={() => updateStatus(item.id, "rejected")}
          />
        ))
      ) : (
        <ListEmptyComponent type="requests" variant="inline" />
      )}
    </View>
  );
};

export default RequestManagement;

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.light,
    padding: 14,
    gap: 12,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
  },
  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: colors.light,
    paddingTop: 12,
  },
  detailItem: {
    gap: 2,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 12,
  },
});
