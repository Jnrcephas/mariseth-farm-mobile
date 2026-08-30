import {
  changePasswordHeaderHandler,
  changePinHeaderHandler,
  editLeadershipHeaderHandler,
  editProfileHeaderHandler,
  helpSupportHeaderHandler,
  marketPricesHeaderHandler,
  profileInformationHeaderHandler,
  staffInformationHeaderHandler,
  walletHeaderHandler,
} from "@/utils/layoutmethods";
import { Stack } from "expo-router";
import React from "react";

export default function MoreLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="profileinformation"
        options={profileInformationHeaderHandler()}
      />
      <Stack.Screen
        name="staffinformation"
        options={staffInformationHeaderHandler()}
      />
      <Stack.Screen name="changepin" options={changePinHeaderHandler()} />
      <Stack.Screen
        name="changepassword"
        options={changePasswordHeaderHandler()}
      />
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
        options={helpSupportHeaderHandler()}
      />
      <Stack.Screen name="wallet" options={walletHeaderHandler()} />
      <Stack.Screen
        name="marketprices"
        options={marketPricesHeaderHandler()}
      />
    </Stack>
  );
}