import {
  changePinHeaderHandler,
  editLeadershipHeaderHandler,
  editProfileHeaderHandler,
} from "@/utils/layoutmethods";
import { Stack } from "expo-router";
import React from "react";

export default function MoreLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="profileinformation"
        options={{ headerShown: false }}
      />
      <Stack.Screen name="changepin" options={changePinHeaderHandler()} />
      <Stack.Screen
        name="profileedit"
        options={editProfileHeaderHandler()}
      />
      <Stack.Screen
        name="leadershipinfoedit"
        options={editLeadershipHeaderHandler()}
      />
      <Stack.Screen
        name="helpsupport"
        options={{ headerShown: false }}
      />
    </Stack>
  );
}
