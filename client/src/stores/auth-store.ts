"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import type { AdminUser } from "@/types";

type AuthState = {
  token: string | null;
  user: AdminUser | null;
  sessionChecked: boolean;
  setToken: (token: string) => void;
  setUser: (user: AdminUser | null) => void;
  markSessionChecked: () => void;
  clearAuth: () => void;
};

const memoryStorage: Storage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {},
  key: () => null,
  length: 0,
};

const storage = createJSONStorage(() => {
  if (typeof window !== "undefined") {
    return localStorage;
  }
  return memoryStorage;
});

export const useAuthStore = create<AuthState>()(
  persist(
    immer((set) => ({
      token: null,
      user: null,
      sessionChecked: false,
      setToken: (token) =>
        set((state) => {
          state.token = token;
        }),
      setUser: (user) =>
        set((state) => {
          state.user = user;
        }),
      markSessionChecked: () =>
        set((state) => {
          state.sessionChecked = true;
        }),
      clearAuth: () =>
        set((state) => {
          state.token = null;
          state.user = null;
          state.sessionChecked = true;
        }),
    })),
    {
      name: "hrms-auth",
      storage,
    },
  ),
);

export const getAuthToken = () => useAuthStore.getState().token;
