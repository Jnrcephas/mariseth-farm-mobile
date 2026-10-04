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

/**
 * Registering a farmer uses the SAME endpoint as the web admin dashboard
 * (`POST farm-management/farmer`) for everyone, lead farmers included - so a
 * farmer registered on mobile and on web goes through identical backend
 * validation and stores identical data. (Lead farmers used to post to
 * `consumer/mobile/lead-farmer/add-new-farmer`, a separate serializer.)
 *
 * That endpoint doesn't infer anything from the token the way the lead-farmer
 * one did, so the request must say `type: "smallholder"` and which lead farmer
 * the farmer belongs to - see buildFarmerPayload in utils/farmerform.ts.
 *
 * A lead farmer's "My Farmers" list is cached under "smallholders" and a
 * field officer's under "admin-farmers", so both are invalidated after a save.
 */
export function getAddFarmerSource(_userData?: user | null) {
  return {
    endpoint: endpoints.adminFarmers,
    queryKeys: ["smallholders", "admin-farmers"],
  };
}

export function getAddFarmSource(userData?: user | null) {
  if (isFieldOfficerExperience(userData)) {
    return { endpoint: endpoints.adminFarms, queryKey: "admin-farms" };
  }
  return { endpoint: endpoints.addNewFarm, queryKey: "leadfarmersfarms" };
}

/**
 * Editing an existing farmer: `PUT farm-management/farmer/{id}`, the same
 * endpoint the web admin dashboard uses (and the one the edit-farm screen
 * already uses for farms, for lead farmers too).
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
