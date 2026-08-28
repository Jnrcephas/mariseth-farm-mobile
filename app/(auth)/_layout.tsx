import { headerHandler } from "@/utils/layoutmethods";
import { Stack } from "expo-router";
import React from "react";

export default function AuthLayout() {
  return (
    <Stack initialRouteName="index" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="signin" options={{ headerShown: false }} />
      <Stack.Screen name="staffsignin" options={{ headerShown: false }} />
      <Stack.Screen name="signup" options={{ headerShown: false }} />
      <Stack.Screen name="confirmpin" options={{ headerShown: false }} />
      <Stack.Screen name="createpin" options={{ headerShown: false }} />
      <Stack.Screen
        name="forgotpin"
        options={{
          presentation: "modal",
          animation: "slide_from_bottom",
          ...headerHandler(""),
          headerShown: true,
        }}
      />
      <Stack.Screen name="otpverification" options={{ headerShown: false }} />
      <Stack.Screen name="resetpin" options={{ headerShown: false }} />
    </Stack>
  );

}