import { endpoints } from "@/constants/endpoints";
import { user } from "@/types/user";
import { isFieldOfficerExperience } from "./userroles";

/**
 * Lead farmers manage farmers/farms through the consumer/mobile/lead-farmer
 * endpoints, scoped to their own farmer profile. Field officers/admins have
 * no farmer profile at all, so those endpoints 403 for them ("User does not
 * have a farmer profile") - they need the same admin-scoped
 * farm-management endpoints the web admin dashboard uses instead.
 *
 * Every screen that lists or creates farmers/farms should go through these
 * helpers rather than reaching for `endpoints.myFarmers` /
 * `endpoints.leadFarmersFarms` directly, so the right source is always
 * picked and query keys stay consistent for cache invalidation.
 */
export function getFarmerListSource(userData?: user | null) {
  if (isFieldOfficerExperience(userData)) {
    return { endpoint: endpoints.adminFarmers, queryKey: "admin-farmers" };
  }
  return { endpoint: endpoints.myFarmers, queryKey: "smallholders" };
}

export function getFarmListSource(userData?: user | null) {
  if (isFieldOfficerExperience(userData)) {
    return { endpoint: endpoints.adminFarms, queryKey: "admin-farms" };
  }
  return { endpoint: endpoints.leadFarmersFarms, queryKey: "leadfarmersfarms" };
}

export function getAddFarmerSource(userData?: user | null) {
  if (isFieldOfficerExperience(userData)) {
    return { endpoint: endpoints.adminFarmers, queryKey: "admin-farmers" };
  }
  return { endpoint: endpoints.addNewFarmer, queryKey: "smallholders" };
}

export function getAddFarmSource(userData?: user | null) {
  if (isFieldOfficerExperience(userData)) {
    return { endpoint: endpoints.adminFarms, queryKey: "admin-farms" };
  }
  return { endpoint: endpoints.addNewFarm, queryKey: "leadfarmersfarms" };
}
