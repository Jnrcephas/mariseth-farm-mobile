import { useUniversalStore } from "@/stores/useuniversalstore";
import { smallHolder } from "@/types/farmers";
import { dataDecoder } from "@/utils/commonmethods";
import { joinFullName } from "@/utils/farmerhelpers";
import {
  addFarmHeaderHandler,
  addFarmerHeaderHandler,
  editFarmerHeaderHandler,
  headerHandler,
} from "@/utils/layoutmethods";
import { Stack, useLocalSearchParams } from "expo-router";
import React from "react";

export default function MyFarmersLayout() {
  const params = useLocalSearchParams<{ data: string }>();
  const routeData: smallHolder = dataDecoder(params?.data) ?? "";
  const edited = useUniversalStore((state) =>
    routeData?.id ? state.editedFarmers[routeData.id] : undefined
  );
  const data = { ...routeData, ...edited };
  const name = joinFullName(data);
  return (
    <Stack>
      <Stack.Screen
        name="farmerdetails"
        options={{
          ...headerHandler(name || "Farmer Details"),
        }}
      />

      <Stack.Screen
        name="addfarmer"
        options={addFarmerHeaderHandler()}
      />

      <Stack.Screen
        name="editfarmer"
        options={editFarmerHeaderHandler()}
      />

      <Stack.Screen name="addfarm" options={addFarmHeaderHandler()} />
    </Stack>
  );
}
