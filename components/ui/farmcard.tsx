import { colors } from "@/constants/colors";
import { getColorForItem } from "@/utils/commonmethods";
import { differenceInDays, parseISO } from "date-fns";
import React from "react";
import { StyleSheet, View } from "react-native";
import AppText from "./apptext";
import InitialsAvatar from "./initialsavatar";

interface farmCard {
  item?: any;
  variant?: "full" | "compact";
  showNewBadge?: boolean;
}

const FarmCard: React.FC<farmCard> = ({
  item,
  variant = "full",
  showNewBadge,
}) => {
  const dateCreated = item?.date_created;
  const isLessThanTwoWeeks =
    dateCreated &&
    differenceInDays(new Date(), parseISO(dateCreated)) < 14;
  const shouldShowNewBadge = showNewBadge ?? isLessThanTwoWeeks;
  const crops = item?.crops ?? [];
  const visibleCrops = crops.slice(0, 2);
  const overflowCount = crops.length - visibleCrops.length;
  const locationParts = [
    item?.location ? `GPS ${item.location}` : null,
    item?.region?.name ?? null,
  ].filter(Boolean);

  return (
    <View style={styles.farmCardContainer}>
      <InitialsAvatar
        name={item?.name ?? ""}
        containerSize={40}
        fontSize={12}
      />

      <View style={styles.farmCardInfoContainer}>
        <AppText fontFamily="SemiBold" fontSize={14} color="textBold">
          {item?.name}
        </AppText>

        {locationParts.length > 0 ? (
          <AppText
            fontFamily="Medium"
            fontSize={13}
            color="textPrimary"
            style={variant === "full" ? styles.supportingText : undefined}
          >
            {locationParts.join(" · ")}
          </AppText>
        ) : null}

        {variant === "full" && visibleCrops.length > 0 ? (
          <View style={styles.farmCropsContainer}>
            {visibleCrops.map((crop: any, index: number) => {
              const { bgColor, textColor } = getColorForItem(
                crop.product.name
              );

              return (
                <View
                  key={index}
                  style={[
                    styles.farmCropContainer,
                    { backgroundColor: bgColor },
                  ]}
                >
                  <AppText
                    fontFamily="SemiBold"
                    fontSize={10}
                    style={{ color: textColor }}
                  >
                    {crop?.product?.name}
                  </AppText>
                </View>
              );
            })}

            {overflowCount > 0 ? (
              <View style={styles.overflowCropContainer}>
                <AppText
                  fontFamily="SemiBold"
                  fontSize={10}
                  color="tabBarInactive"
                >
                  +{overflowCount}
                </AppText>
              </View>
            ) : null}
          </View>
        ) : null}
      </View>

      {shouldShowNewBadge ? (
        <View style={styles.farmCardStatusContainer}>
          <AppText fontFamily="Medium" fontSize={10} style={styles.newBadgeText}>
            New
          </AppText>
        </View>
      ) : null}
    </View>
  );
};

export default FarmCard;

const styles = StyleSheet.create({
  farmCardContainer: {
    width: "100%",
    flexDirection: "row",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.light,
    alignItems: "center",
  },
  farmCardInfoContainer: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "center",
  },
  supportingText: {
    marginTop: 2,
  },
  farmCropContainer: {
    paddingHorizontal: 11,
    paddingVertical: 4,
    borderRadius: 10,
  },
  overflowCropContainer: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: colors.buttonActionSheet,
  },
  farmCropsContainer: {
    flexDirection: "row",
    gap: 5,
    marginTop: 6,
    flexWrap: "wrap",
  },
  farmCardStatusContainer: {
    backgroundColor: colors.secondaryLight,
    paddingHorizontal: 11,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: "center",
  },
  newBadgeText: {
    color: "#14803D",
  },
});
