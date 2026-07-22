import { applyCreditHeaderHandler } from "@/utils/layoutmethods";
import { Stack } from "expo-router";
import React from "react";

export default function CreditsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="applycredit"
        options={applyCreditHeaderHandler()}
      />
      <Stack.Screen
        name="viewpaybacklog"
        options={{ headerShown: false }}
      />
    </Stack>
  );
}
