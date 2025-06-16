import { create } from "zustand";
import { Settings } from "@/lib/types";
import { db } from "@/lib/db";

interface SettingsState {
  settings: Settings | null;
  setSettings: (settings: Settings) => Promise<void>;
  clearSettings: () => Promise<void>;
  loadSettings: () => Promise<void>;
}

export const useSettingsStorage = create<SettingsState>((set, get) => ({
  settings: null,

  setSettings: async (settings) => {
    await db.clearSettingsData();
    await db.updateSettingsData(settings);
    set({ settings });
  },

  clearSettings: async () => {
    await db.clearProductData();
    set({ settings: null });
  },

  loadSettings: async () => {
    const { settings } = get();
    if (settings) return;

    const settingsData = await db.getSettingsData();
    if (settingsData) {
      set({ settings: settingsData });
      return;
    }
  },
}));
