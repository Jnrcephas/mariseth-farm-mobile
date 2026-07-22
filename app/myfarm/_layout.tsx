import { formScreenHeaderHandler } from "@/utils/layoutmethods";
import { Stack } from "expo-router";
import React from "react";

export default function myFarmLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="editfarmdetails"
        options={formScreenHeaderHandler("Edit Farm Details")}
      />
    </Stack>
  );
}
