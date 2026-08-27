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

/**
 * Field officer: staff account whose only job is onboarding farmers/farms
 * in the field. Backend does NOT issue a distinct `field_officer` user_type -
 * per the backend team, field officers are just given regular admin
 * credentials, and the mobile app is expected to show them the same
 * onboarding-focused UI regardless. `isFieldOfficerUser` is kept (and still
 * checked first everywhere) in case a real `field_officer` user_type shows
 * up later, but `isFieldOfficerExperience` - which folds in admin - is what
 * actually drives the mobile UI now.
 */
export function isFieldOfficerUser(userData?: user | null) {
  return userData?.user_type?.toLowerCase() === "field_officer";
}

/**
 * True for anyone who should see the field-officer mobile experience: the
 * cards-based Home tab, "My Farmers" onboarding tab, and no Credits/My
 * Farm/Finance tabs. Currently that's admins (reused for field officers per
 * the backend) and true field officers, should the backend ever add that
 * user_type back.
 */
export function isFieldOfficerExperience(userData?: user | null) {
  return isAdminUser(userData) || isFieldOfficerUser(userData);
}

/**
 * Anyone allowed to onboard farmers/farms from the "My Farmers" tab and its
 * Add Farmer / Add Farm flows: admins, lead farmers, and field officers.
 * Centralised here so the tab-bar gating and the Home-tab cards agree on
 * exactly who counts.
 */
export function canManageFarmersAndFarms(userData?: user | null) {
  if (isAdminUser(userData)) return true;
  if (isFieldOfficerUser(userData)) return true;
  return shouldShowLeadFarmerHome(userData);
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

/** Home tab header (Home + bell + avatar) for the field-officer-style experience (admins + field officers). */
export function shouldShowFieldOfficerHomeHeader(userData?: user | null) {
  return isFieldOfficerExperience(userData);
}

/** Farm Details / Farm Products edit on My Farm tab. */
export function canEditOwnFarm(userData?: user | null) {
  if (!userData?.farmer || isAdminUser(userData)) return false;
  return isLeadFarmerUser(userData) || isSmallholderUser(userData);
}
