import { colors } from "@/constants/colors";
import { icons } from "@/constants/icons";
import { smallHolder } from "@/types/farmers";
import { dataEncoder } from "@/utils/commonmethods";
import { Image } from "expo-image";
import { router } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import AppText from "./apptext";
import InitialsAvatar from "./initialsavatar";
interface smallCardFarmer {
  item?: smallHolder;
  showNewBadge?: boolean;
  showCheckbox?: boolean;
  checked?: boolean;
  onCheckToggle?: () => void;
  avatarSize?: number;
}
const SmallFarmerCard: React.FC<smallCardFarmer> = ({
  item,
  showNewBadge = false,
  showCheckbox = false,
  checked = false,
  onCheckToggle,
  avatarSize = 34,
}) => {
  const name = `${item?.first_name} ${item?.last_name} ${item?.other_names}`;

  const handlePress = () => {
    if (showCheckbox) {
      onCheckToggle?.();
      return;
    }

    router.navigate(`/myfarmers/farmerdetails?data=${dataEncoder(item)}`);
  };

  return (
    <Pressable
      style={styles.smallFarmerCardContainer}
      onPress={handlePress}
    >
      {showCheckbox ? (
        <Pressable style={styles.checkbox} onPress={onCheckToggle}>
          <View
            style={[
              styles.checkboxBase,
              checked && styles.checkboxBaseChecked,
            ]}
          >
            {checked ? (
              <Image
                source={icons.checkmark}
                style={styles.checkboxIcon}
                tintColor={colors.white}
              />
            ) : null}
          </View>
        </Pressable>
      ) : null}

      <InitialsAvatar
        name={name}
        containerSize={avatarSize}
        fontSize={avatarSize > 36 ? 14 : 12}
      />
      <View style={styles.textColumn}>
        <AppText fontFamily="SemiBold" fontSize={14} color="textBold">
          {name}
        </AppText>

        <View style={styles.supportingRow}>
          <AppText fontFamily="Medium" fontSize={13} color="textPrimary">
            {item?.phone_number}
          </AppText>

          {item?.farm?.name ? (
            <AppText fontFamily="Medium" fontSize={13} color="primary">
              {` · ${item.farm.name}`}
            </AppText>
          ) : null}
        </View>
      </View>

      {showNewBadge ? (
        <View style={styles.smallFarmerStatusContainer}>
          <AppText fontFamily="Medium" fontSize={10} style={styles.newBadgeText}>
            NEW
          </AppText>
        </View>
      ) : null}
    </Pressable>
  );
};

export default SmallFarmerCard;

const styles = StyleSheet.create({
  smallFarmerCardContainer: {
    width: "100%",
    minHeight: 72,
    flexDirection: "row",
    paddingVertical: 16,
    paddingHorizontal: 0,
    borderBottomWidth: 1,
    borderBottomColor: colors.light,
    alignItems: "center",
  },
  textColumn: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "center",
  },
  supportingRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 2,
  },
  smallFarmerStatusContainer: {
    backgroundColor: colors.secondaryLight,
    paddingHorizontal: 11,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: "center",
  },
  newBadgeText: {
    color: "#14803D",
  },
  checkbox: {
    marginRight: 12,
  },
  checkboxBase: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#D0D5DD",
    backgroundColor: colors.white,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxBaseChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxIcon: {
    width: 12,
    height: 12,
  },
});
