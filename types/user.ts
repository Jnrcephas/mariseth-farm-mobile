// type region = {
//   code: string;
//   id: number;
//   name: string;
// };

type district = {
  id: number;
  name: string;
};

export interface region {
  id: number;
  name: string;
  code: string;
  districts: district[];
}
type createdBy = {
  avatar: string | null;
  date_created: string;
  email: string;
  first_name: string;
  gender: string;
  id: number;
  last_name: string;
  phone_number: string;
  user_type: string;
  username: string;
};

type supportAssistance = {
  areas_of_needed_assistance: string;
  has_received_support: boolean;
};

type leadershipExperience = {
  farming_type: string;
  has_farming_membership: boolean;
  has_received_farming_leadership_training: boolean;
  is_mentoring_other_farmers: boolean;
  number_of_farmers_mentoring: string;
};

type farm = {
  areas_of_assistance: any[];
  created_by: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    gender: "m" | "f";
    phone_number: string;
    user_type: string;
  };
  crops: Array<{
    id: number;
    product: {
      id: 1;
      name: string;
      type: string;
      status: string;
    };
    is_main_product: boolean;
  }>;
  date_created: string;
  district: {
    id: number;
    name: string;
  };
  farm_id: string;
  farm_type: string;
  farmer: any[] | null;
  farming_methods: any[];
  government_ngo_support: boolean;
  has_access_to_market: boolean;
  id: number;
  irrigation: boolean;
  land_ownership: string;
  livestock: Array<{
    id: number;
    product: {
      id: number;
      name: string;
      type: string;
      status: string;
    };
    is_main_product: true;
  }>;
  livestock_kept: string | null;
  location: string;
  name: string;
  other_specification: string | null;
  provide_training: boolean;
  region: { id: number; name: string; code: string };
  size: number;
  size_metric: {
    id: number;
    name: string;
    category_name: string;
    description: string;
    category_type: string;
    is_default: boolean;
  };
  specify_support: string | null;
  type: string | null;
  use_of_fertilizers: any[];
};

type smallFarmer = {
  access_token: string;
  email: string;
  farmer: {
    address: string;
    country: string;
    created_by: createdBy;
    date_created: string;
    date_of_birth: string;
    district: district;
    email: string;
    farm: farm;
    farmer_id: string;
    first_name: string;
    gender: string;
    id: number;
    id_number: string;
    id_type: string;
    last_name: string;
    lead_farmer: {
      first_name: string;
      id: number;
      last_name: string;
      type: "lead";
    };
    leadership_experience: null;
    other_names: string;
    phone_number: string;
    region: region;
    support_assistance: supportAssistance;
    type: "smallholder";
    village: string;
  };
  first_name: string;
  id: number;
  is_verified: boolean;
  last_name: string;
  phone_number: string;
  refresh_token: string;
  status: string;
  other_names: string;
  user_type: string;
};

type leadFarmer = {
  access_token: string;
  email: string;
  farmer: {
    address: string;
    country: string;
    created_by: createdBy;
    date_created: string;
    date_of_birth: string;
    district: district;
    email: string;
    farm: farm;
    farmer_id: string;
    first_name: string;
    gender: string;
    id: number;
    id_number: string;
    id_type: string;
    last_name: string;
    lead_farmer: null;
    leadership_experience: leadershipExperience;
    other_names: string;
    phone_number: string;
    region: region;
    support_assistance: supportAssistance;
    type: "lead";
    village: string;
  };
  first_name: string;
  id: number;
  is_verified: boolean;
  last_name: string;
  other_names: string;
  phone_number: string;
  refresh_token: string;
  status: string;
  user_type: string;
};

export type user = smallFarmer | leadFarmer;

export type metrics = {
  category_name: string;
  category_type: string;
  description: string | null;
  id: number;
  is_default: boolean;
  name: string;
}[];
