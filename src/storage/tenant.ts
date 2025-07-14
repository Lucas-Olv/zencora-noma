import { create } from "zustand";
import { Tenant } from "@/lib/types";
import { db } from "@/lib/db";

interface TenantState {
  tenant: Tenant | null;
  setTenant: (tenant: Tenant) => Promise<void>;
  clearTenant: () => Promise<void>;
  loadTenant: () => Promise<void>;
}

export const useTenantStorage = create<TenantState>(    (set, get) => ({
      tenant: null,

      setTenant: async (tenant) => {
        await db.clearTenantData();
        await db.updateTenantData(tenant);
        set({ tenant });
      },

      clearTenant: async () => {
        await db.clearTenantData();
        set({ tenant: null });
      },

      loadTenant: async () => {
        const { tenant } = get();
        if (tenant) return;

        const tenantData = await db.getTenantData();
        if (tenantData) {
          set({ tenant: tenantData });
          return;
        }
      },
    }))
