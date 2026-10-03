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

/**
 * Editing an existing farmer.
 *
 * ASSUMPTION - confirm with the backend team: there is no dedicated
 * "lead-farmer/edit-farmer" endpoint in constants/endpoints.ts. The existing
 * edit-farm screen (app/myfarm/editfarmdetails.tsx) already updates farms with
 * `PUT farm-management/farm/{id}` for lead farmers too, so this follows the
 * same pattern for farmers: `PUT farm-management/farmer/{id}`. If the backend
 * exposes a lead-farmer-scoped endpoint instead, this is the only place to
 * change.
 *
 * Both list query keys are returned because a lead farmer's list lives under
 * "smallholders" and a field officer's under "admin-farmers".
 */
export function getEditFarmerSource(farmerId: number | string) {
  return {
    endpoint: `${endpoints.adminFarmers}/${farmerId}`,
    queryKeys: ["smallholders", "admin-farmers"],
  };
}
