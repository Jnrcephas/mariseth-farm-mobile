import { user } from "@/types/user";

export function isAdminUser(userData?: user | null) {
  return userData?.user_type?.toLowerCase() === "admin";
}

export function isLeadFarmerUser(userData?: user | null) {
  if (!userData?.farmer) return false;

  const farmerType = userData.farmer.type?.toLowerCase();
  if (farmerType === "lead" || farmerType === "lead_farmer") return true;
  if (farmerType === "smallholder") return false;

  const userType = userData.user_type?.toLowerCase();
  if (
    userType === "lead_farmer" ||
    userType === "lead farmer" ||
    userType === "lead"
  ) {
    return true;
  }

  return userData.farmer.lead_farmer === null;
}

export function isSmallholderUser(userData?: user | null) {
  return userData?.farmer?.type?.toLowerCase() === "smallholder";
}

/** Lead-farmer home UI (mockup): not admin, not an explicit smallholder. */
export function shouldShowLeadFarmerHome(userData?: user | null) {
  if (!userData || isAdminUser(userData)) return false;
  if (isSmallholderUser(userData)) return false;
  return isLeadFarmerUser(userData) || !!userData.farmer;
}

/** Farmer home tab header (Home + bell + avatar): lead and smallholder, not admin. */
export function shouldShowFarmerHomeHeader(userData?: user | null) {
  if (!userData || isAdminUser(userData)) return false;
  return isLeadFarmerUser(userData) || isSmallholderUser(userData);
}

/** Farm Details / Farm Products edit on My Farm tab. */
export function canEditOwnFarm(userData?: user | null) {
  if (!userData?.farmer || isAdminUser(userData)) return false;
  return isLeadFarmerUser(userData) || isSmallholderUser(userData);
}
