import { marketPricesHeaderHandler } from "@/utils/layoutmethods";
import { Stack } from "expo-router";
import React from "react";

export default function _layout() {
  return (
    <Stack>
      <Stack.Screen
        name="marketprices"
        options={marketPricesHeaderHandler()}
      />
    </Stack>
  );
}
