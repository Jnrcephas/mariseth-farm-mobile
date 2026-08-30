const base = "consumer/mobile";
const authBase = `${base}/auth`;
export const endpoints = {
  // AUTH ENDPOINTS
  signIn: `${authBase}/login`,
  // Field officers log in with the same email+password admin accounts used
  // on web (see accounts/auth/login in the web app's adminApiComponents.ts)
  // - the backend doesn't issue a separate field-officer credential, see
  // isFieldOfficerExperience in utils/userroles.ts. NOT under consumer/mobile
  // - this is the shared accounts auth endpoint, same one web admins use.
  adminSignIn: "accounts/auth/login",
  // Field officer / admin equivalents of the farmer-scoped endpoints below -
  // the lead-farmer endpoints 403 for admin tokens ("User does not have a
  // farmer profile"), since admins aren't farmers. These mirror what the
  // web admin dashboard uses for Farm Management (see
  // useFarmManagementFarmerList / useFarmManagementFarmCreate etc. in the
  // web app's src/apis/adminApiComponents.ts). Picked via
  // utils/farmdatasource.ts rather than used directly - see that file.
  adminFarmers: "farm-management/farmer",
  adminFarms: "farm-management/farm",
  // Field officers/admins change a real password, not a 4-digit PIN - see
  // app/more/changepassword.tsx. Matches web's accounts/auth/update_password.
  updatePassword: "accounts/auth/update_password",
  signup: `${authBase}/register`,
  verify: `${authBase}/verify-phone`,
  forgotPin: `${authBase}/forgot-password`,
  resendOtp: `${authBase}/resend-verification-code`,
  pinSetup: `${authBase}/setup-pin`,
  updateAccount: `${authBase}/update-account`,
  updatePin: `${authBase}/update-pin`,
  logout: `${authBase}/logout`,
  resetPin: `${authBase}/reset-password`,
  updateMyFarmer: `${authBase}/update-my-farmer`,
  getMyFamer: `${authBase}/me`,

  // CREDITS ENDPOINTS
  applyCredit: `${base}/credit/apply-for-credit`,
  activeCredit: `${base}/credit/active-credit`,
  creditHistory: `${base}/credit/credit-history`,
  paybackHistory: `${base}/credit/payback-history`,
  inputCredits: `${base}/credit/list-input-credits`,


  // PRODUCTS - shared farm-management resource, same one the web app
  // uses (GET /api/v1/farm-management/product), so no consumer/mobile
  // prefix here.
  products: `farm-management/product`,

  // FARMS ENDPOINTS
  myFarm: `${base}/farm/my-farm`,

  farmproducts: `${base}/farm/get-products`,

  // LEAD FARMER FARMS ENDPOINTS
  leadFarmersFarms: `${base}/lead-farmer/farms`,
  editMyFarmDetails: `${base}/lead-farmer/edit-farm`,
  addNewFarm: `${base}/lead-farmer/add-new-farm`,
  addNewFarmer: `${base}/lead-farmer/add-new-farmer`,

  myFarmers: `${base}/lead-farmer/smallholders`,

  // NOTIFICATIONS
  notifications: `${base}/notification/list-notifications`,
  unreadNotificationCount: `${base}/notification/unread-count`,
  markNotificationRead: `${base}/notification/mark-notification-read`,
  markAllNotificationsRead: `${base}/notification/mark-all-read`,

  // CUSTOM TYPES
  customType: `custom-type`,

  // REGIONS
  regions: `regions`,

  // WEATHER & SOIL QUALITY - resolved purely from the farm id server-side;
  // no boundary is required (confirmed with backend - see mobile
  // weather/soil-quality fix). Matches the same endpoints the admin web
  // app uses under /api/v1/agro-monitoring/.
  weather: (farmId: number | string) => `agro-monitoring/${farmId}/weather`,
  soilQuality: (farmId: number | string) =>
    `agro-monitoring/${farmId}/soil_quality`,
};