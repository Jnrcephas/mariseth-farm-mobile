import { universalStore } from "@/types/universal";
import { create } from "zustand";

export const useUniversalStore = create<universalStore>((set, get) => ({
  logoutModalVisible: false,
  datePickerVisible: false,
  selectModalVisible: {},
  enabled: false,

  selectedSegmentedOption: {
    myFarm: "Farm Details",
    myFarmers: "Farmers",
    myFarmerDetails: "Personal",
  },
  setSegmentedOption: (key, option) => {
    set((state) => ({
      selectedSegmentedOption: {
        ...state.selectedSegmentedOption,
        [key]: option,
      },
    }));
  },
}));
