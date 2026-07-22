import { district, myFarm, region } from "./farm";

type supportAssistance = {
  has_received_support: boolean;
  areas_of_needed_assistance: string;
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
};
