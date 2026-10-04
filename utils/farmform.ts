import { LAND_OWNERSHIP_WEB_OPTIONS } from "@/constants/farmform";

/**
 * Shared helpers for the farm registration (add) and edit screens: turning a
 * stored land-ownership value into something the form can show, and turning
 * form values into the request body. Mirrors the web admin app's external
 * farm form (src/modules/FarmManagement/Farms/Modals/AddExternalFarm.tsx).
 */

const capitalise = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s);

/**
 * Stored value -> what the form shows. The API only allows
 * owned/leased/communal/other. Older mobile records can say "Rented" (an
 * option the mobile form used to offer that the API doesn't have): rather
 * than lose that, it is shown as "Other" with "Rented" as the specification.
 */
export const normalizeLandOwnership = (
  raw?: string | null,
  otherSpecification?: string | null
): { land_ownership: string; other_specification: string } => {
  const value = String(raw ?? "").trim();
  const lower = value.toLowerCase();
  const spec = otherSpecification ?? "";

  if (!lower) return { land_ownership: "", other_specification: spec };
  if (LAND_OWNERSHIP_WEB_OPTIONS.map((o) => o.toLowerCase()).includes(lower)) {
    return { land_ownership: capitalise(lower), other_specification: spec };
  }
  return { land_ownership: "Other", other_specification: spec || capitalise(value) };
};

const num = (v: unknown) => {
  if (v === "" || v === undefined || v === null) return undefined;
  const n = Number(v);
  return Number.isNaN(n) ? undefined : n;
};
const text = (v: unknown) => {
  const t = typeof v === "string" ? v.trim() : v;
  return t === "" || t === undefined || t === null ? undefined : (t as string);
};
const asArray = (v: unknown) => (Array.isArray(v) ? v : v ? [v] : []);
const withoutUndefined = <T extends Record<string, any>>(obj: T): T => {
  Object.keys(obj).forEach((k) => obj[k] === undefined && delete obj[k]);
  return obj;
};

type FarmPayloadOptions = {
  /**
   * true  -> body for the admin `farm-management/farm` endpoint, exactly as
   *          the web sends it (field officers adding; everyone editing).
   * false -> the unchanged lead-farmer "add farm" body.
   */
  webFormat: boolean;
  /** The farmer the farm belongs to (admin endpoint, add only). */
  farmerId?: number | null;
  /** GeoJSON from pointsToGeoJSON, if a boundary was drawn. */
  boundary?: unknown;
};

/** Form values (minus `boundary`, passed separately) -> request body. */
export const buildFarmPayload = (
  values: Record<string, any>,
  { webFormat, farmerId, boundary }: FarmPayloadOptions
) => {
  const labour = {
    labor_force_total: num(values.labor_force_total),
    labor_force_male: num(values.labor_force_male),
    labor_force_female: num(values.labor_force_female),
  };

  if (!webFormat) {
    // Lead-farmer add: same body as before, plus labour force, minus the
    // form-only fields the old endpoint never saw.
    const {
      farmer,
      farmer_label,
      other_specification,
      labor_force_total,
      labor_force_male,
      labor_force_female,
      ...legacy
    } = values;
    return withoutUndefined({
      ...legacy,
      ...labour,
      ...(boundary ? { boundary } : {}),
    });
  }

  const landOwnership = String(values.land_ownership ?? "").toLowerCase();
  return withoutUndefined({
    farm_type: "external",
    name: String(values.name ?? "").trim(),
    farmer: farmerId ?? undefined,
    location: String(values.location ?? "").trim(),
    region: Number(values.region),
    district: Number(values.district),
    size: Number(values.size),
    size_metric: num(values.size_metric),
    land_ownership: landOwnership,
    other_specification:
      landOwnership === "other" ? text(values.other_specification) : undefined,
    crops: values.crops ?? [],
    livestock: values.livestock ?? [],
    use_of_fertilizers: asArray(values.use_of_fertilizers),
    farming_methods: asArray(values.farming_methods),
    irrigation: values.irrigation === true,
    has_access_to_market: values.has_access_to_market === true,
    ...labour,
    ...(boundary ? { boundary } : {}),
  });
};

/** "Owned" / "Other: Rented" for showing a stored land-ownership value. */
export const formatLandOwnership = (
  landOwnership?: string | null,
  otherSpecification?: string | null
) => {
  const { land_ownership, other_specification } = normalizeLandOwnership(
    landOwnership,
    otherSpecification
  );
  if (!land_ownership) return "";
  return land_ownership === "Other" && other_specification
    ? `Other: ${other_specification}`
    : land_ownership;
};

/** "10 (6 male, 4 female)" - or "" when nothing was recorded. */
export const formatLabourForce = (farm?: {
  labor_force_total?: number | null;
  labor_force_male?: number | null;
  labor_force_female?: number | null;
} | null) => {
  if (!farm) return "";
  const { labor_force_total: total, labor_force_male: m, labor_force_female: f } = farm;
  const parts = [
    m != null ? `${m} male` : "",
    f != null ? `${f} female` : "",
  ].filter(Boolean);
  if (total == null && parts.length === 0) return "";
  return total != null
    ? `${total}${parts.length ? ` (${parts.join(", ")})` : ""}`
    : parts.join(", ");
};
