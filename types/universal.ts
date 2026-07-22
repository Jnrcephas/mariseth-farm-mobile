export type SegmentedControlState = {
  myFarm: "Farm Details" | "Farm Products";
  myFarmers: "Farmers" | "Farms";
  myFarmerDetails: "Personal" | "Farm";
};

export type universalStore = {
  logoutModalVisible: boolean;
  datePickerVisible: boolean;
  enabled: boolean;
  selectedSegmentedOption: SegmentedControlState;
  selectModalVisible: {
    [key: string]: boolean;
  };
  setSegmentedOption: (
    key: keyof universalStore["selectedSegmentedOption"],
    option: universalStore["selectedSegmentedOption"][keyof universalStore["selectedSegmentedOption"]]
  ) => void;
};
export type SegmentedControlKey = keyof SegmentedControlState;
export type SegmentedControlValue<K extends SegmentedControlKey> =
  SegmentedControlState[K];
