export interface credit {
  id: number;
  credit_id: string;
  approval_status: "approved" | "pending" | "denied";
  payment_status: "overdue" | "paid" | "partial" | "active" | "inactive";
  credit_amount: string;
  outstanding_amount: string;
  interest_rate: string;
  quantity: number;
  quantity_metric_name: string;
  input_credits: string;
  type: string;
  notes: string | null;
  date_created: string;
  due_date: string;
  issue_date: string | null;
  days_overdue: number;
}

type category = {
  id: number;
  name: string;
  category_name: string;
  description: string;
  category_type: string;
  is_default: boolean;
};

type createdBy = {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  gender: string;
  phone_number: string;
  user_type: string;
};

export type inputCredit = {
  id: number;
  input_credit_id: string;
  category: category;
  name: string;
  price: string;
  weight: number;
  quantity: number;
  date_created: string;
  created_by: createdBy;
};

export type inputCreditCategory = {
  id: number;
  name: string;
  category_name: string;
  description: string;
  category_type: string;
  is_default: boolean;
};
