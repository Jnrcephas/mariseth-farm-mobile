import { colors } from "@/constants/colors";
import { icons } from "@/constants/icons";
import { Image } from "expo-image";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import AppText from "./apptext";

interface infoCardProps {
  headerVisibility?: boolean;
  previewLabel?: string;
  info: {
    headerTitle?: string;
    headerIcon?: any;
    onEditPress?: () => void;
    information: Array<{ key: string; value: string }>;
  };
}

const InfoCard: React.FC<infoCardProps> = ({
  info,
  headerVisibility = true,
  previewLabel,
}) => {
  return (
    <View style={styles.infoCardContainer}>
      {headerVisibility && (
        <View style={styles.infoCardHeaderContainer}>
          <View style={styles.headerTitleRow}>
            {info?.headerIcon ? (
              <Image
                source={info.headerIcon}
                style={styles.headerIcon}
                tintColor={colors.primary}
              />
            ) : null}
            <AppText
              fontFamily="SemiBold"
              fontSize={17}
              color="textBold"
              style={styles.headerTitle}
            >
              {info?.headerTitle}
            </AppText>
          </View>
          {info.onEditPress ? (
            <Pressable
              style={styles.editButton}
              onPress={() => info.onEditPress?.()}
            >
              <Image
                source={icons.edit}
                style={styles.editIcon}
                tintColor={colors.primary}
              />
              <AppText fontFamily="Medium" fontSize={12} color="primary">
                Edit
              </AppText>
            </Pressable>
          ) : null}
        </View>
      )}

      {previewLabel ? (
        <AppText
          fontFamily="SemiBold"
          fontSize={16}
          color="tabBarInactive"
          style={styles.previewLabel}
        >
          {previewLabel}
        </AppText>
      ) : null}

      <View style={styles.infoList}>
        {info?.information.map((item, index) => {
          const isLast = index === info.information.length - 1;
          const isMultiline = item.key.length > 28;

          return (
            <View
              style={[
                styles.info,
                isLast && styles.infoLast,
                isMultiline && styles.infoMultiline,
              ]}
              key={item.key}
            >
              <AppText
                fontFamily="Medium"
                fontSize={14}
                color="primary"
                style={styles.infoKey}
              >
                {item.key}
              </AppText>
              <View style={styles.infoValueContainer}>
                <AppText
                  fontFamily="Medium"
                  fontSize={13}
                  color="formLabelText"
                  style={styles.infoValue}
                >
                  {item.value || "-"}
                </AppText>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

export default InfoCard;

const styles = StyleSheet.create({
  infoCardContainer: {
    padding: 15,
    backgroundColor: colors.backgroundPrimary,
    marginBottom: 18,
    borderRadius: 18,
    width: "100%",
    shadowColor: "rgba(63, 30, 87, 0.10)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 19,
    elevation: 4,
  },
  infoCardHeaderContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
  },
  headerTitleRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginRight: 8,
  },
  headerIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  headerTitle: {
    lineHeight: 20,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 100,
    backgroundColor: colors.secondaryLight,
  },
  editIcon: {
    width: 12,
    height: 12,
    marginRight: 6,
  },
  previewLabel: {
    marginBottom: 12,
  },
  infoList: {
    gap: 6,
  },
  info: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    minHeight: 30,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderColor: "#EAECF0",
  },
  infoLast: {
    borderBottomWidth: 0,
  },
  infoMultiline: {
    alignItems: "flex-start",
    minHeight: 40,
    paddingVertical: 4,
  },
  infoKey: {
    flex: 1,
    maxWidth: "58%",
    lineHeight: 22,
  },
  infoValueContainer: {
    flex: 1,
    alignItems: "flex-end",
    marginLeft: 8,
  },
  infoValue: {
    textAlign: "right",
    lineHeight: 16,
  },
});
