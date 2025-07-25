import { create } from "zustand";
import { Subscription } from "@/lib/types";
import { db } from "@/lib/db";
import dayjs from "dayjs";

interface SubscriptionState {
  subscription: Subscription | null;
  setSubscription: (subscription: Subscription) => Promise<void>;
  clearSubscription: () => Promise<void>;
  loadSubscription: () => Promise<void>;
}

export const useSubscriptionStorage = create<SubscriptionState>((set, get) => ({
  subscription: null,

  setSubscription: async (subscription) => {
    await db.clearSubscriptionData();
    await db.updateSubscriptionData(subscription);
    set({ subscription });
  },

  clearSubscription: async () => {
    await db.clearSubscriptionData();
    set({ subscription: null });
  },

  loadSubscription: async () => {
    const { subscription } = get();
    if (subscription) return;

    const subscriptionData = await db.getSubscriptionData();
    if (subscriptionData) {
      set({ subscription: subscriptionData });
      return;
    }
  },
}));
