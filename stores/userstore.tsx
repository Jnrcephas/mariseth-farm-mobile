import { inputCredit } from "@/types/credit";
import { productCatalogItem } from "@/types/farm";
import { metrics, region, user } from "@/types/user";
import { MMKV } from "react-native-mmkv";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const key = process.env.EXPO_PUBLIC_LOCAL_DB_KEY;

const storage = new MMKV({
  id: "auth-storage",
  encryptionKey: key,
});

export interface userStoreProps {
  user: user | null;
  notificationEnabled: boolean;
  soundEnabled: boolean;
  notifications: any[];
  unreadNotificationCount: number;
  fcmToken: string;
  metrics: metrics;
  regions: region[];
  farmProducts: productCatalogItem[];
  farms: any[];
  inputCredits: inputCredit[];
  // Tracks whether zustand's persist middleware has finished reading the
  // saved session back out of MMKV. Even though MMKV itself reads
  // synchronously, zustand's persist middleware always applies the
  // rehydrated state through a microtask, so `user` can briefly still be
  // null on the very first render after a cold start/reload even when a
  // valid session IS saved. Consumers that decide "logged in vs logged
  // out" (see app/_layout.tsx) must wait for this to be true before
  // trusting `user === null` to mean "not logged in" - otherwise a
  // logged-in person gets bounced to the login screen on every reload.
  hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
}

const zustandStorage = {
  setItem: (name: string, value: string) => {
    return storage.set(name, value);
  },
  getItem: (name: string) => {
    const value = storage.getString(name);
    return value ?? null;
  },
  removeItem: (name: string) => {
    return storage.delete(name);
  },
};
export const userStore = create(
  persist<userStoreProps>(
    (set) => ({
      user: null,
      notificationEnabled: true,
      soundEnabled: true,
      notifications: [],
      unreadNotificationCount: 0,
      fcmToken: "",
      metrics: [],
      regions: [],
      farmProducts: [],
      farms: [],
      inputCredits: [],
      hasHydrated: false,
      setHasHydrated: (value: boolean) => set({ hasHydrated: value }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => zustandStorage),
      onRehydrateStorage: () => (state, error) => {
        // Fires once the persisted state has actually been applied to the
        // store - either way (including on error, or nothing to
        // restore) this is the earliest point it's safe to trust `user`.
        // Falls back to a direct setState in case `state` comes back
        // undefined (e.g. a read/decrypt error), so this can never get
        // stuck forever leaving the app on the splash screen.
        if (state) {
          state.setHasHydrated(true);
        } else {
          if (error) {
            console.log("[userStore] rehydration failed", error);
          }
          userStore.setState({ hasHydrated: true });
        }
      },
    }
  )
);