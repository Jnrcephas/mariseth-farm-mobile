import { district, myFarm, region } from "./farm";

type supportAssistance = {
  has_received_support: boolean;
  areas_of_needed_assistance: string;
  support_received?: string | null;
};

export type smallHolder = {
  id: number;
  type: string;
  first_name: string;
  last_name: string;
  other_names: string;
  gender: "m" | "f";
  date_of_birth: string;
  id_number: string;
  id_type: string;
  phone_number: string;
  email: string;
  address: string;
  village: string;
  region: region;
  district: district;
  country: string;
  farm: myFarm;
  lead_farmer: number;
  leadership_experience: string | null;
  support_assistance: supportAssistance;

  // --- Added with the updated registration form (mirrors the web admin app).
  // All optional: records created before the update, or endpoints that don't
  // return them yet, simply won't have them.
  project?: number | { id: number; name: string } | null;
  nationality?: string | null;
  marital_status?: "married" | "single" | "divorced" | "widowed" | null;
  education_level?:
    | "no_formal_education"
    | "basic"
    | "secondary"
    | "tertiary"
    | "vocational"
    | null;
  alternative_phone_number?: string | null;
  average_income?: number | string | null;
  years_of_experience?: number | null;
  number_of_households?: number | null;
  number_of_dependents?: number | null;
  // Backend spells this "number_of_falls" (see NUMBER_OF_FARMS_API_KEY).
  number_of_falls?: number | null;
  consent?: boolean;
  has_disability?: boolean | null;
  disability_details?: string | null;
  is_refugee?: boolean | null;
};
