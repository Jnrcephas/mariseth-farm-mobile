import { colors } from "@/constants/colors";
import { icons } from "@/constants/icons";
import { width } from "@/constants/generalconstants";
import { myFarm } from "@/types/farm";
import { userStore } from "@/stores/userstore";
import { canEditOwnFarm } from "@/utils/userroles";
import { hasValidBoundary } from "./farmboundarycapture";
import { router } from "expo-router";
import { Image } from "expo-image";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import AppText from "./apptext";
import BoundaryPreview from "../boundarypreview";

// Boundary status used to be inferred from the weather endpoint's error
// (via isBoundaryMissingError), on the assumption that weather required
// a boundary to be set. Confirmed with the backend team that this is
// NOT the case - weather/soil quality are resolved purely from the farm
// id and don't depend on boundary at all. That heuristic (and the
// `weather/{farmId}` endpoint it was based on) was wrong - see
// hooks/usefetchquery.ts and constants/endpoints.ts for the fix.
//
// This now reads `farm.boundary` directly off the farm object instead,
// the same way the admin web app's Geofencing tab does. CONFIRMED with
// backend (2026-08-10): `boundary` is now included on the GET my-farm /
// lead-farmer farm responses after being saved, so `hasValidBoundary`
// below reflects real state again.
interface GeofencingProps {
  farm?: myFarm;
}

const Geofencing: React.FC<GeofencingProps> = ({ farm }) => {
  const user = userStore((state) => state.user);
  const canEdit = canEditOwnFarm(user);

  const hasBoundary = hasValidBoundary(farm?.boundary);

  const handleManageBoundary = () => {
    router.navigate("/myfarm/editfarmdetails");
  };

  const statusIcon = hasBoundary ? colors.primary : colors.error;

  return (
    <View style={{ width, paddingHorizontal: 16, gap: 16 }}>
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
            {hasBoundary ? "Boundary set" : "No boundary set"}
          </AppText>
          <AppText
            fontFamily="Regular"
            fontSize={12}
            color="formPlaceholderText"
            style={{ marginTop: 2, lineHeight: 18 }}
          >
            {hasBoundary
              ? "This farm's boundary is mapped, so location-based features are active."
              : "Mark this farm's boundary on the map to enable location-based features."}
          </AppText>
        </View>
      </View>

      {hasBoundary ? (
        <View style={styles.mapPreviewCard}>
          <BoundaryPreview boundary={farm?.boundary} height={160} />
        </View>
      ) : (
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
            No boundary marked yet
          </AppText>
        </View>
      )}

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
  mapPreviewCard: {
    height: 160,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.light,
    backgroundColor: colors.backgroundTertiary,
    overflow: "hidden",
  },
  actionButton: {
    height: 48,
    borderRadius: 10,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
});