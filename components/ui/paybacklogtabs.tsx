import AppText from "@/components/ui/apptext";
import { colors } from "@/constants/colors";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";

export type PaybackLogTab = "Payback Log" | "Credit Details" | "Summary";

interface PaybackLogTabsProps {
  selected: PaybackLogTab;
  onSelect: (tab: PaybackLogTab) => void;
}

const tabs: PaybackLogTab[] = ["Payback Log", "Credit Details", "Summary"];

const PaybackLogTabs: React.FC<PaybackLogTabsProps> = ({
  selected,
  onSelect,
}) => {
  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = tab === selected;

        return (
          <Pressable
            key={tab}
            onPress={() => onSelect(tab)}
            style={[styles.tab, isActive && styles.tabActive]}
          >
            <AppText
              fontFamily="SemiBold"
              fontSize={13}
              color={isActive ? "textBold" : "textPrimary"}
              numberOfLines={1}
            >
              {tab}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
};

export default PaybackLogTabs;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#F1F5F9",
    borderRadius: 10,
    padding: 4,
    gap: 5,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 7,
  },
  tabActive: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: "#D0D5DD",
    boxShadow: "0px 2px 8px 0px rgba(100, 116, 139, 0.10)",
  },
});
