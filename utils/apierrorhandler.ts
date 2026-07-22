import { handleToastShow } from "./commonmethods";

const errorMessages: { [key: number]: { [key: string]: string } } = {
  400: {
    "1003": "No matching location found",
    "1005": "API request URL is invalid.",
    "1006": "No matching location found.",
    "9000": "JSON body passed in bulk request is invalid.",
    "9001": "JSON body contains too many locations for bulk request.",
    "9999": "Internal application error.",
  },
  401: {
    "1002": "API key not provided.",
    "2006": "API key provided is invalid.",
  },
  403: {
    "2007": "API key has exceeded calls per month quota.",
    "2008": "API key has been disabled.",
    "2009": "API key does not have access to the resource.",
  },
};

export function getErrorMessage(status: number, body: string): string {
  const errorCode = Object.keys(errorMessages[status] || {}).find((code) =>
    body.includes(code)
  );
  return errorCode
    ? errorMessages[status][errorCode]
    : body || "Failed to fetch current weather data.";
}

type AuthFieldErrors = Record<string, string | undefined>;
type AuthErrorTarget = { setErrors: (errors: AuthFieldErrors) => void } | null;

function isHtmlNotFoundResponse(message: unknown): boolean {
  if (typeof message !== "string") return false;
  return (
    message.includes("<!doctype") ||
    message.includes("<html") ||
    message.includes("Not Found")
  );
}

function extractAuthFieldErrors(message: unknown): AuthFieldErrors {
  const fieldErrors: AuthFieldErrors = {};

  if (Array.isArray(message) && message[0]) {
    fieldErrors.phone_number = String(message[0]);
    fieldErrors.pin = String(message[0]);
    return fieldErrors;
  }

  if (!message || typeof message !== "object") {
    return fieldErrors;
  }

  const payload = message as Record<string, string[] | string | undefined>;

  if (payload.phone_number) {
    fieldErrors.phone_number = Array.isArray(payload.phone_number)
      ? payload.phone_number[0]
      : String(payload.phone_number);
  }

  if (payload.pin) {
    fieldErrors.pin = Array.isArray(payload.pin)
      ? payload.pin[0]
      : String(payload.pin);
  }

  if (payload.non_field_errors) {
    const apiMessage = Array.isArray(payload.non_field_errors)
      ? payload.non_field_errors[0]
      : String(payload.non_field_errors);
    fieldErrors.phone_number = apiMessage;
    fieldErrors.pin = apiMessage;
    fieldErrors.code = apiMessage;
    fieldErrors.old_pin = apiMessage;
  }

  return fieldErrors;
}

export function handleAuthApiError(
  error: any,
  formik: AuthErrorTarget,
  toast: any
) {
  const { problem, message } = error;

  console.log(JSON.stringify(error));

  if (problem === "CLIENT_ERROR" || problem === "SERVER_ERROR") {
    if (isHtmlNotFoundResponse(message)) {
      handleToastShow(
        toast,
        "Login service not found. The API URL in .env may be wrong — ask your backend team for the correct mobile API address."
      );
      return;
    }

    const fieldErrors = extractAuthFieldErrors(message);
    const firstFieldError = Object.values(fieldErrors).find(Boolean);

    if (formik && Object.keys(fieldErrors).length > 0) {
      formik.setErrors(fieldErrors);
      return;
    }

    handleToastShow(
      toast,
      firstFieldError ||
        "Invalid phone number or PIN. Please check your details and try again."
    );
    return;
  }

  const networkErrorMessages: Record<string, string> = {
    CONNECTION_ERROR:
      "Oops! You're offline. Check your internet and try again.",
    NETWORK_ERROR: "Oops! You're offline. Check your internet and try again.",
    TIMEOUT_ERROR: "Request timed out. Check your connection and try again",
  };

  const toastMessage =
    networkErrorMessages[problem] ||
    "Oops! Something went wrong. Please try again in a moment.";
  handleToastShow(toast, toastMessage);
}
