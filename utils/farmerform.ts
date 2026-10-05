import {
  DEFAULT_COUNTRY,
  FARMER_TYPE_LABEL,
  FarmerType,
  NUMBER_OF_FARMS_API_KEY,
} from "@/constants/farmerform";
import { smallHolder } from "@/types/farmers";
import { region as regionType } from "@/types/user";
import { normalizeFarmerPhone, toLocalPhone } from "./farmerhelpers";

/**
 * Everything the farmer registration form (add + edit) needs to turn API data
 * into form values and form values back into an API payload. Field names and
 * rules mirror the web admin app's AddSmallholderFarmer form
 * (src/modules/FarmManagement/Farmers/AddSmallholderFarmer.tsx).
 *
 * All number-ish inputs are kept as strings while editing (that's what
 * TextInputs give us) and converted only in buildFarmerPayload.
 */

export type FarmerFormValues = {
  /** "smallholder" or "commercial" - sent to the API as `type`. */
  farmer_type: FarmerType;
  // Personal information
  project: string;
  /** Display-only (never sent): lets the selector show a name for `project`. */
  project_label: string;
  first_name: string;
  last_name: string;
  other_names: string;
  gender: string;
  date_of_birth: string;
  id_type: string;
  id_number: string;
  phone_number: string;
  email: string;
  address: string;
  village: string;
  has_disability: boolean | null;
  disability_details: string;
  /** Yes/No, defaults to No so it never blocks a registration. */
  is_refugee: boolean;
  region: number | string;
  district: number | string;
  country: string;
  farm: number | string;
  lead_farmer: string;
  /** Display-only (never sent). */
  lead_farmer_label: string;
  // Profile details
  nationality: string;
  marital_status: string;
  education_level: string;
  alternative_phone_number: string;
  average_income: string;
  years_of_experience: string;
  number_of_households: string;
  number_of_dependents: string;
  number_of_farms: string;
  consent: boolean;
  // Support & assistance
  has_received_support: boolean | null;
  support_received: string;
  areas_of_needed_assistance: string;
};

const LEGACY_ID_TYPES: Record<string, string> = {
  ghana_card: "Ghana Card",
  passport: "Passport ID",
};

/**
 * Older mobile registrations saved "ghana_card" / "passport"; the web (and now
 * mobile) saves the readable name. Map the old ones so edit shows them.
 */
export const normalizeIdType = (raw?: string | null) =>
  LEGACY_ID_TYPES[String(raw)] ?? raw ?? "";

/** "Commercial Farmer" etc. Unknown / missing types read as smallholder (like the web). */
export const farmerTypeLabel = (type?: string | null) =>
  FARMER_TYPE_LABEL[String(type)] ?? FARMER_TYPE_LABEL.smallholder;

/**
 * The registration form only knows how to save smallholders and commercial
 * farmers. A field officer's mixed list also contains lead farmers, who have
 * a different form on the web - editing one here would overwrite their type.
 * A missing type is treated as smallholder, as everywhere else.
 */
export const isEditableFarmerType = (type?: string | null) =>
  !type || type === "smallholder" || type === "commercial";

const str = (v: unknown) => (v === undefined || v === null ? "" : String(v));
const idOf = (v: any) => v?.id ?? v ?? "";

const toBoolOrNull = (v: unknown): boolean | null => {
  if (v === true || v === "true") return true;
  if (v === false || v === "false") return false;
  return null;
};

// lead_farmer is an object, a number, or (on some admin responses) a display
// name string. Only an actual id is usable as a form value.
const leadFarmerId = (v: any) => {
  const candidate = typeof v === "object" && v ? v.id : v;
  return /^\d+$/.test(str(candidate)) ? str(candidate) : "";
};
const leadFarmerLabel = (v: any) =>
  typeof v === "object" && v
    ? [v.first_name, v.last_name].filter(Boolean).join(" ")
    : "";

/** Blank form for "Add Farmer", or pre-filled from an existing farmer for "Edit". */
export const getFarmerInitialValues = (
  farmer?: Partial<smallHolder> | null
): FarmerFormValues => {
  const f: any = farmer ?? {};
  const support: any = f.support_assistance ?? {};
  const project = f.project;

  return {
    farmer_type: f.type === "commercial" ? "commercial" : "smallholder",
    project: str(idOf(project)),
    project_label: typeof project === "object" && project ? project.name ?? "" : "",
    first_name: str(f.first_name),
    last_name: str(f.last_name),
    other_names: str(f.other_names),
    gender: str(f.gender),
    date_of_birth: str(f.date_of_birth),
    id_type: normalizeIdType(f.id_type),
    id_number: str(f.id_number),
    phone_number: toLocalPhone(f.phone_number),
    email: str(f.email),
    address: str(f.address),
    village: str(f.village),
    has_disability: toBoolOrNull(f.has_disability),
    disability_details: str(f.disability_details),
    // Missing/null (new farmer, or a record from before this field) -> No.
    is_refugee: toBoolOrNull(f.is_refugee) === true,
    region: idOf(f.region),
    district: idOf(f.district),
    country: str(f.country) || DEFAULT_COUNTRY,
    farm: idOf(f.farm),
    lead_farmer: leadFarmerId(f.lead_farmer),
    lead_farmer_label: leadFarmerLabel(f.lead_farmer),
    nationality: str(f.nationality),
    marital_status: str(f.marital_status),
    education_level: str(f.education_level),
    alternative_phone_number: toLocalPhone(f.alternative_phone_number),
    average_income: str(f.average_income),
    years_of_experience: str(f.years_of_experience),
    number_of_households: str(f.number_of_households),
    number_of_dependents: str(f.number_of_dependents),
    number_of_farms: str(f[NUMBER_OF_FARMS_API_KEY] ?? f.number_of_farms),
    consent: Boolean(f.consent),
    has_received_support: toBoolOrNull(
      support.has_received_support ?? support.received_support
    ),
    support_received: str(
      support.support_received ?? support.specify_support_received
    ),
    areas_of_needed_assistance: str(support.areas_of_needed_assistance),
  };
};

const text = (v: unknown) => {
  const t = typeof v === "string" ? v.trim() : v;
  return t === "" || t === undefined || t === null ? undefined : (t as string);
};
const num = (v: unknown) => {
  if (v === "" || v === undefined || v === null) return undefined;
  const n = Number(v);
  return Number.isNaN(n) ? undefined : n;
};
const withoutUndefined = <T extends Record<string, any>>(obj: T): T => {
  Object.keys(obj).forEach((k) => obj[k] === undefined && delete obj[k]);
  return obj;
};

type PayloadOptions = {
  /**
   * Set for lead farmers: their own farmer id. The admin endpoint can't infer
   * the lead farmer from the token, so it is sent explicitly. Field officers /
   * admins leave this out and choose a lead farmer in the form instead.
   */
  leadFarmerId?: number | null;
};

/**
 * Form values -> API body (for `farm-management/farmer`, add and edit). Empty optional values are left out (same as the
 * web's cleanJsonData), except `email` and `farm`, which the mobile endpoints
 * already received as explicit null when blank.
 */
export const buildFarmerPayload = (
  values: FarmerFormValues,
  { leadFarmerId }: PayloadOptions = {}
) => {
  const hasDisability = values.has_disability === true;
  const hasSupport = values.has_received_support === true;

  return withoutUndefined({
    first_name: values.first_name.trim(),
    last_name: values.last_name.trim(),
    other_names: text(values.other_names),
    gender: values.gender,
    date_of_birth: values.date_of_birth,
    id_type: text(values.id_type),
    id_number: text(values.id_number),
    phone_number: values.phone_number.trim()
      ? normalizeFarmerPhone(values.phone_number)
      : undefined,
    email: values.email.trim() || null,
    address: values.address.trim(),
    village: values.village.trim(),
    region: Number(values.region),
    district: Number(values.district),
    country: values.country || DEFAULT_COUNTRY,
    farm: values.farm || null,
    has_disability: hasDisability,
    disability_details: hasDisability ? text(values.disability_details) : undefined,
    is_refugee: values.is_refugee === true,
    support_assistance: withoutUndefined({
      has_received_support: hasSupport,
      support_received: hasSupport ? text(values.support_received) : undefined,
      areas_of_needed_assistance: text(values.areas_of_needed_assistance),
    }),
    project: num(values.project),
    nationality: text(values.nationality),
    marital_status: text(values.marital_status),
    education_level: text(values.education_level),
    alternative_phone_number: values.alternative_phone_number.trim()
      ? normalizeFarmerPhone(values.alternative_phone_number)
      : undefined,
    average_income: num(values.average_income),
    years_of_experience: num(values.years_of_experience),
    number_of_households: num(values.number_of_households),
    number_of_dependents: num(values.number_of_dependents),
    [NUMBER_OF_FARMS_API_KEY]: num(values.number_of_farms),
    consent: values.consent === true,
    // `farm-management/farmer` (the web's endpoint) needs the type spelled
    // out. Commercial farmers have no lead farmer, so it is left out for them
    // (same rule as the web form).
    type: values.farmer_type,
    lead_farmer:
      values.farmer_type === "commercial"
        ? undefined
        : num(values.lead_farmer) ?? leadFarmerId ?? undefined,
  });
};

/**
 * Form values -> the shape of a farmer as the details screen reads it. Used
 * right after a successful edit so the details screen can show the new values
 * immediately (it only holds a snapshot from its route param). Unlike the
 * payload, cleared fields become empty here so stale values don't linger.
 */
export const valuesToFarmerPatch = (
  values: FarmerFormValues,
  regions: regionType[]
): Partial<smallHolder> => {
  const region = regions.find((r) => r.id === Number(values.region));
  const district = region?.districts.find((d) => d.id === Number(values.district));
  const hasDisability = values.has_disability === true;
  const hasSupport = values.has_received_support === true;

  return {
    type: values.farmer_type,
    first_name: values.first_name.trim(),
    last_name: values.last_name.trim(),
    other_names: values.other_names.trim(),
    gender: values.gender as "m" | "f",
    date_of_birth: values.date_of_birth,
    id_type: values.id_type,
    id_number: values.id_number.trim(),
    phone_number: values.phone_number.trim()
      ? normalizeFarmerPhone(values.phone_number)
      : "",
    email: values.email.trim(),
    address: values.address.trim(),
    village: values.village.trim(),
    country: values.country,
    ...(region ? { region: { id: region.id, name: region.name, code: region.code } } : {}),
    ...(district ? { district: { id: district.id, name: district.name } } : {}),
    project: values.project
      ? { id: Number(values.project), name: values.project_label }
      : null,
    nationality: values.nationality || null,
    marital_status: (values.marital_status || null) as smallHolder["marital_status"],
    education_level: (values.education_level || null) as smallHolder["education_level"],
    alternative_phone_number: values.alternative_phone_number.trim()
      ? normalizeFarmerPhone(values.alternative_phone_number)
      : null,
    average_income: num(values.average_income) ?? null,
    years_of_experience: num(values.years_of_experience) ?? null,
    number_of_households: num(values.number_of_households) ?? null,
    number_of_dependents: num(values.number_of_dependents) ?? null,
    [NUMBER_OF_FARMS_API_KEY]: num(values.number_of_farms) ?? null,
    consent: values.consent === true,
    has_disability: hasDisability,
    disability_details: hasDisability ? values.disability_details.trim() : "",
    is_refugee: values.is_refugee === true,
    support_assistance: {
      has_received_support: hasSupport,
      support_received: hasSupport ? values.support_received.trim() : "",
      areas_of_needed_assistance: values.areas_of_needed_assistance,
    },
  };
};

/** "no_formal_education" -> "No Formal Education" (falls back to the raw value). */
export const optionLabel = (
  options: { name: string; value: string }[],
  value?: string | null
) => options.find((o) => o.value === value)?.name ?? value ?? "";
