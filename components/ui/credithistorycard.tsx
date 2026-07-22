import { colors } from "@/constants/colors";
import { statusTypes } from "@/constants/generalconstants";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { ActionSheetRef } from "react-native-actions-sheet";
import AppText from "./apptext";
import CreditActionSheet from "./creditactionsheet";
import InitialsAvatar from "./initialsavatar";

interface creditHistoryCard {
  item?: any;
}

const CreditHistoryCard: React.FC<creditHistoryCard> = ({ item }) => {
  const [selectedItem, setSelectedItem] = React.useState<any>(null);
  const sheetRef = React.useRef<ActionSheetRef>(null);
  const displayName = item?.input_credit ?? "Credit";

  const handlePress = () => {
    setSelectedItem(item);
    sheetRef.current?.show();
  };

  const status = statusTypes[item?.approval_status];

  return (
    <>
      <CreditActionSheet sheetRef={sheetRef} item={selectedItem} />
      <Pressable
        style={styles.creditHistoryCardContainer}
        onPress={handlePress}
      >
        <InitialsAvatar
          name={displayName}
          containerSize={40}
          fontSize={14}
          bgColor="secondary"
        />
        <View style={styles.textContainer}>
          <AppText fontFamily="SemiBold" fontSize={14} color="textBold">
            {displayName}
          </AppText>
          <View style={styles.subtitleRow}>
            <AppText fontFamily="Medium" fontSize={13} color="textPrimary">
              {item?.credit_id}
            </AppText>
            <AppText fontFamily="Medium" fontSize={13} color="primary">
              {` · GH₵ ${item?.credit_amount}`}
            </AppText>
          </View>
        </View>
        {status ? (
          <View
            style={[
              styles.creditHistoryStatusContainer,
              { backgroundColor: status.bgColor },
            ]}
          >
            <AppText
              fontFamily="Medium"
              fontSize={10}
              color={status.textColor}
            >
              {status.text}
            </AppText>
          </View>
        ) : null}
      </Pressable>
    </>
  );
};

export default CreditHistoryCard;

const styles = StyleSheet.create({
  creditHistoryCardContainer: {
    minHeight: 72,
    paddingVertical: 16,
    width: "100%",
    borderBottomWidth: 1,
    borderBottomColor: colors.light,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  textContainer: {
    flex: 1,
    gap: 4,
  },
  subtitleRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  creditHistoryStatusContainer: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: "center",
  },
});
