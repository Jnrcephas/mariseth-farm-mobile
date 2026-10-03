import { smallHolder } from "./farmers";

export type SegmentedControlState = {
  myFarm: "Farm Details" | "Farm Products" | "Soil & Air Quality" | "Geofencing";
  myFarmers: "Farmers" | "Farms" | "Requests";
  myFarmerDetails: "Personal" | "Farm";
};

export type universalStore = {
  logoutModalVisible: boolean;
  deleteAccountModalVisible: boolean;
  datePickerVisible: boolean;
  enabled: boolean;
  selectedSegmentedOption: SegmentedControlState;
  selectModalVisible: {
    [key: string]: boolean;
  };
  /**
   * Farmer details are opened from a route param (a snapshot of the farmer at
   * the moment the card was tapped). After a successful edit we keep the new
   * values here, keyed by farmer id, so the details screen can show them
   * straight away instead of the stale snapshot.
   */
  editedFarmers: { [farmerId: number]: Partial<smallHolder> };
  setSegmentedOption: (
    key: keyof universalStore["selectedSegmentedOption"],
    option: universalStore["selectedSegmentedOption"][keyof universalStore["selectedSegmentedOption"]]
  ) => void;
};
export type SegmentedControlKey = keyof SegmentedControlState;
export type SegmentedControlValue<K extends SegmentedControlKey> =
  SegmentedControlState[K];