import { colors } from "@/constants/colors";
import { icons } from "@/constants/icons";
import { width } from "@/constants/generalconstants";
import { myFarm } from "@/types/farm";
import { isBoundaryMissingError, useFarmWeather } from "@/hooks/usefetchquery";
import { userStore } from "@/stores/userstore";
import { canEditOwnFarm } from "@/utils/userroles";
import { router } from "expo-router";
import { Image } from "expo-image";
import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";
import AppText from "./apptext";

// Boundary status is inferred from the weather endpoint's error, the
// same way weathercard.tsx does it (via isBoundaryMissingError in
// hooks/usefetchquery.ts). Confirmed against a real backend response:
// GET weather/{farmId} returns 400 {"message":"No boundary setup for
// farm"} when no boundary is set.
//
// OPEN QUESTION: a regular consumer/mobile-authenticated user currently
// gets a 403 permission error calling this endpoint rather than the
// boundary check itself - confirm with backend whether that's expected
// before relying on this in production. If consumer users can never
// reach the boundary check, this card will show a generic error instead
// of real boundary status for them.
interface GeofencingProps {
  farm?: myFarm;
}

const Geofencing: React.FC<GeofencingProps> = ({ farm }) => {
  const user = userStore((state) => state.user);
  const canEdit = canEditOwnFarm(user);

  const { isLoading, error } = useFarmWeather(farm?.id);
  const boundaryMissing = isBoundaryMissingError(error);
  const hasOtherError = !!error && !boundaryMissing;
  const hasBoundary = !error;

  const handleManageBoundary = () => {
    router.navigate("/myfarm/editfarmdetails");
  };

  const statusIcon = hasBoundary ? colors.primary : colors.error;

  return (
    <View style={{ width, paddingHorizontal: 16, gap: 16 }}>
      {isLoading ? (
        <View style={styles.loadingCard}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <View style={styles.statusCard}>
          <View
            style={[
              styles.statusIconWrap,
              { backgroundColor: statusIcon + "1A" },
            ]}
          >
            <Image
              source={icons.location}
              style={{ width: 22, height: 22 }}
              tintColor={statusIcon}
            />
          </View>
          <View style={{ flex: 1 }}>
            <AppText fontFamily="SemiBold" fontSize={15} color="textBold">
              {hasOtherError
                ? "Couldn't check boundary status"
                : hasBoundary
                ? "Boundary set"
                : "No boundary set"}
            </AppText>
            <AppText
              fontFamily="Regular"
              fontSize={12}
              color="formPlaceholderText"
              style={{ marginTop: 2, lineHeight: 18 }}
            >
              {hasOtherError
                ? "We couldn't confirm the boundary status for this farm right now. You can still manage it below."
                : hasBoundary
                ? "This farm's boundary is mapped, so weather and location-based features are active."
                : "Mark this farm's boundary on the map to enable weather and location-based features."}
            </AppText>
          </View>
        </View>
      )}

      <View style={styles.mapPlaceholder}>
        <Image
          source={icons.location}
          style={{ width: 32, height: 32 }}
          tintColor={colors.light}
        />
        <AppText
          fontFamily="Medium"
          fontSize={13}
          color="formPlaceholderText"
          style={{ marginTop: 8, textAlign: "center", paddingHorizontal: 24 }}
        >
          Map preview coming soon
        </AppText>
      </View>

      {canEdit ? (
        <Pressable style={styles.actionButton} onPress={handleManageBoundary}>
          <AppText fontFamily="SemiBold" fontSize={14} color="white">
            {hasBoundary ? "Edit Boundary" : "Set Farm Boundary"}
          </AppText>
        </Pressable>
      ) : null}
    </View>
  );
};

export default Geofencing;

const styles = StyleSheet.create({
  loadingCard: {
    height: 78,
    borderRadius: 12,
    backgroundColor: colors.backgroundTertiary,
    justifyContent: "center",
    alignItems: "center",
  },
  statusCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    padding: 16,
    borderRadius: 12,
    backgroundColor: colors.backgroundTertiary,
  },
  statusIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  mapPlaceholder: {
    height: 160,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.light,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
  },
  actionButton: {
    height: 48,
    borderRadius: 10,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
});