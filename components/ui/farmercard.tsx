import { colors } from "@/constants/colors";
import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import { Image } from "expo-image";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import AppText from "./apptext";
interface farmerCard {
  type: "small" | "big";
  item?: any;
  onPress?: () => void;
  count?: number | string;
  isLoading?: boolean;
}
const FarmerCard: React.FC<farmerCard> = ({
  type = "big",
  item,
  onPress,
  count,
  isLoading,
}) => {
  const name = [item?.first_name, item?.last_name, item?.other_names]
    .filter(Boolean)
    .join(" ");
  const farmerCount = Number(count);
  const farmerLabel =
    !Number.isNaN(farmerCount) && farmerCount === 1 ? "Farmer" : "Farmers";

  const cardTypes = {
    small: {
      title: name,
      phone: `+${item?.phone_number}`,
      count: "",
      subtitle: "Smallholder Farmer",
      abstractImage: images.otherLooper,
      abtractStyle: styles.otherLooper,
    },
    big: {
      title: "My Smallholder Farmers",
      count: isLoading ? "..." : count,
      phone: "",
      subtitle: farmerLabel,
      abstractImage: images.looper,
      abtractStyle: styles.looper,
    },
  };
  return (
    <View style={{ paddingHorizontal: 16 }}>
      <View style={styles.farmerCardContainer}>
        <Image
          source={cardTypes[type]?.abstractImage}
          style={cardTypes[type]?.abtractStyle}
        />
        <View style={styles.farmerCardTitleContainer}>
          <Image
            source={icons.farmer}
            style={{ width: 24, height: 24, marginRight: 12 }}
            tintColor={colors.primary}
          />
          <AppText
            fontFamily="SemiBold"
            fontSize={14}
            color="textBold"
            style={{ flex: 1 }}
          >
            {cardTypes[type]?.title}
          </AppText>
          {onPress ? (
            <Pressable style={styles.viewAllButton} onPress={onPress}>
              <AppText fontFamily="Medium" fontSize={10} color="primary">
                View all
              </AppText>
            </Pressable>
          ) : null}
        </View>
        <View
          style={[
            styles.farmerCardCountContainer,
            type === "small" && styles.farmerCardCountContainerSmall,
          ]}
        >
          {type === "big" && (
            <AppText
              fontFamily="SemiBold"
              fontSize={18}
              color="formLabelText"
            >
              {cardTypes[type]?.count}
            </AppText>
          )}

          {type === "big" ? (
            <AppText fontFamily="SemiBold" fontSize={12} color="primary">
              {cardTypes[type]?.subtitle}
            </AppText>
          ) : (
            <AppText fontFamily="Medium" fontSize={12} color="textPrimary">
              {`${cardTypes[type]?.subtitle} · ${cardTypes[type]?.phone}`}
            </AppText>
          )}
        </View>
      </View>
    </View>
  );
};

export default FarmerCard;

const styles = StyleSheet.create({
  farmerCardContainer: {
    backgroundColor: colors.backgroundPrimary,
    boxShadow: "0px 4px 19px 0px rgba(63, 30, 87, 0.10)",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 16,
    flexDirection: "column",
    overflow: "hidden",
  },
  farmerCardTitleContainer: {
    flexDirection: "row",
    width: "100%",
    marginBottom: 22,
    alignItems: "center",
  },
  farmerCardCountContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    overflow: "hidden",
    gap: 11,
    paddingHorizontal: 9,
    paddingVertical: 8,
  },
  farmerCardCountContainerSmall: {
    paddingHorizontal: 0,
    paddingVertical: 0,
    gap: 0,
  },
  looper: {
    width: 180,
    height: "100%",
    position: "absolute",
    right: 0,
    bottom: 0,
  },

  otherLooper: {
    width: 225 / 2.1,
    height: 190 / 2.15,
    position: "absolute",
    right: 0,
    top: 0,
  },
  viewAllButton: {
    paddingHorizontal: 25,
    paddingVertical: 8,
    borderRadius: 49,
    backgroundColor: colors.secondaryLight,
  },
});
