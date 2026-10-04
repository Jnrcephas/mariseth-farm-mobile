/**
 * Option lists for the farm registration / edit form.
 *
 * WEB format = what the admin dashboard sends to `farm-management/farm`
 * (src/modules/FarmManagement/utils/constants.ts). The API's land_ownership
 * choices are exactly: owned, leased, communal, other (lowercase).
 *
 * LEGACY format = what the lead-farmer "add farm" endpoint has always
 * received from mobile. Kept as-is so that flow doesn't change under people.
 */
export const LAND_OWNERSHIP_WEB_OPTIONS = ["Owned", "Leased", "Communal", "Other"];
export const LAND_OWNERSHIP_LEGACY_OPTIONS = ["Owned", "Leased", "Communal", "Rented"];
