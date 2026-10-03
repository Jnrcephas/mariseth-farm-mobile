import { smallHolder } from "@/types/farmers";

/** "024 123 4567" / "0241234567" / "241234567" -> "233241234567" */
export const normalizeFarmerPhone = (phone: string) => {
  const digits = phone.replace(/\s/g, "");
  const withoutLeadingZero = digits.startsWith("0") ? digits.slice(1) : digits;
  return withoutLeadingZero.startsWith("233")
    ? withoutLeadingZero
    : `233${withoutLeadingZero}`;
};

/** Inverse of the above, for pre-filling the form: "233241234567" -> "241234567" */
export const toLocalPhone = (phone?: string | null) => {
  const digits = (phone ?? "").replace(/\s/g, "").replace(/^\+/, "");
  return digits.startsWith("233") ? digits.slice(3) : digits;
};

/** The form has one "Name" box; the API wants first / last / other names. */
export const splitFullName = (name: string) => {
  const parts = name.trim().split(/\s+/);
  return {
    first_name: parts[0] || "",
    last_name: parts[1] || "",
    other_names: parts.slice(2).join(" ") || "",
  };
};

export const joinFullName = (
  farmer?: Pick<smallHolder, "first_name" | "last_name" | "other_names"> | null
) =>
  [farmer?.first_name, farmer?.last_name, farmer?.other_names]
    .filter(Boolean)
    .join(" ");
