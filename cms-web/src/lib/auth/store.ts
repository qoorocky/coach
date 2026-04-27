"use client";

import { create } from "zustand";
import type { CurrentUser } from "./types";

interface AuthState {
  user: CurrentUser | null;
  setUser: (u: CurrentUser | null) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clear: () => set({ user: null }),
}));
