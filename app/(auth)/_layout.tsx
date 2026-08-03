import { headerHandler } from "@/utils/layoutmethods";
import { Stack } from "expo-router";
import React from "react";

export default function AuthLayout() {
  return (
    <Stack initialRouteName="index" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="signin" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="confirmpin" />
      <Stack.Screen name="createpin" />
      <Stack.Screen
        name="forgotpin"
        options={{
          presentation: "modal",
          animation: "slide_from_bottom",
          ...headerHandler(""),
        }}
      />
      <Stack.Screen name="otpverification" />
      <Stack.Screen name="resetpin" />
    </Stack>
  );

}
