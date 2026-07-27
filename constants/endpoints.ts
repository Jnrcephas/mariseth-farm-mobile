const base = "consumer/mobile";
const authBase = `${base}/auth`;
export const endpoints = {
  // AUTH ENDPOINTS
  signIn: `${authBase}/login`,
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

  // WEATHER - farms need a `boundary` set (see myfarmers/addfarm.tsx and
  // myfarm/editfarmdetails.tsx) before this returns anything for them.
  weather: (farmId: number | string) => `weather/${farmId}`,
};




