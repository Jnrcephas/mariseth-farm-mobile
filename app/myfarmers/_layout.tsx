import { smallHolder } from "@/types/farmers";
import { dataDecoder } from "@/utils/commonmethods";
import {
  addFarmHeaderHandler,
  addFarmerHeaderHandler,
  headerHandler,
} from "@/utils/layoutmethods";
import { Stack, useLocalSearchParams } from "expo-router";
import React from "react";

export default function MyFarmersLayout() {
  const params = useLocalSearchParams<{ data: string }>();
  const data: smallHolder = dataDecoder(params?.data) ?? "";
  const name = `${data?.first_name} ${data?.last_name} ${data?.other_names}`;
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

      <Stack.Screen name="addfarm" options={addFarmHeaderHandler()} />
    </Stack>
  );
}
