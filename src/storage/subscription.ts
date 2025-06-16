import { create } from "zustand";
import { Subscription } from "@/lib/types";
import { db } from "@/lib/db";
import { getCoreApi } from "@/lib/apiHelpers";
import { useProductStore } from "@/storage/product";
import { useSessionStore } from "./session";

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
    await db.clearProductData();
    set({ subscription: null });
  },

  loadSubscription: async () => {
    const session = useSessionStore.getState().session;
    const product = useProductStore.getState().product;
    console.log(product);

    if (session) {
          const { subscription } = get();
    if (subscription) return;

    const [workspace] = await db.workspace.toArray();
    if (workspace) {
      set({ subscription: workspace.subscription });
      return;
    }

    try {
      const response = await getCoreApi(`/api/core/v1/subscriptions/user/${product.id}`);

      if (response?.data) {
        await db.clearProductData();
        await db.updateProductData(response.data);
        set({ subscription: response.data });
      } else {
        set({ subscription: null });
      }
    } catch (err) {
      console.error("Erro ao buscar produtos:", err);
      set({ subscription: null });
    }
  } else {
        set({ subscription: null });
  }
    }
}));
