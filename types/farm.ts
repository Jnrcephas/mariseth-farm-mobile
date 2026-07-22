type productType = "livestock" | "crop";

interface product {
  id: number;
  name: string;
  type: productType;
  status: "active" | "inactive";
}

export interface region {
  id: number;
  name: string;
  code: string;
}

export interface district {
  id: number;
  name: string;
}
export interface farmProduct {
  id: number;
  product: product;
  is_main_product: boolean;
}

export interface livestockKept {
  id: number;
  product: product;
  is_main_product: boolean;
}
export interface myFarm {
  id: number;
  farm_id: string;
  farm_type: string;
  type: string | null;
  name: string;
  location: string;
  region: region;
  district: district;
  size: number;
  size_metric: {
    category_name: string;
    category_type: string;
    description: string;
    id: number;
    is_default: boolean;
    name: string;
  };

  livestock_kept: livestockKept[];
  livestock: livestockKept[];
  has_access_to_market: boolean;
  irrigation: boolean;
  use_of_fertilizers: string[];
  farming_methods: string[];
  provide_training: boolean;
  government_ngo_support: boolean;
  specify_support: string | null;
  areas_of_assistance: string[];
  land_ownership: string;
  other_specification: string | null;
  created_by: number;
  date_created: string;
  products: farmProduct[];
}

export interface productCategory {
  id: number;
  name: string;
  description: string;
  category_name: string;
  category_type: string;
  is_default: boolean;
}

export interface user {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  gender: "m" | "f" | string;
  phone_number: string;
  user_type: string;
}

export interface farmProduct {
  id: number;
  name: string;
  description: string | null;
  product_id: string;
  type: "crop" | "livestock" | "other";

  status: "active" | "inactive";
  breed: string | null;

  quantity: string | null;
  quantity_metric: string | null;

  weight: string | null;
  weight_metric: string | null;

  season_start: string | null;
  season_end: string | null;
  season_status: "in" | "out" | null;

  date_created: string;
  last_updated: string;

  category: productCategory;
  created_by: user;
}

type sizeMetric = {
  id: number;
  name: string;
  category_name: string;
  description: string;
  category_type: string;
  is_default: boolean;
};

type crop = {
  id: number;
  product: product;
  is_main_product: boolean;
};

type livestock = {
  id: number;
  product: product;
  is_main_product: boolean;
};

type creator = {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  gender: string;
  phone_number: string;
  user_type: string;
};

type farmer = {
  id: number;
  first_name: string;
  last_name: string;
  type: string;
  phone_number: string;
};

export type myFarm1 = {
  id: number;
  farm_id: string;
  farm_type: string;
  type: string | null;
  name: string;
  location: string;
  region: region;
  district: district;
  size: number;
  size_metric: sizeMetric;
  livestock_kept: any | null;
  has_access_to_market: boolean;
  irrigation: boolean;
  use_of_fertilizers: string[] | any;
  farming_methods: string[] | any;
  provide_training: boolean;
  government_ngo_support: boolean;
  specify_support: string | null;
  areas_of_assistance: any[];
  land_ownership: string;
  other_specification: string | null;
  created_by: creator;
  date_created: string;
  crops: crop[];
  livestock: livestock[];
  farmer: farmer;
};
