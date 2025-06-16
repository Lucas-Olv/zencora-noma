import { create } from "zustand";
import { Product } from "@/lib/types";
import { db } from "@/lib/db";
import { getCoreApiPublic } from "@/lib/apiHelpers";

const productCode = import.meta.env.VITE_PRODUCT_CODE;

interface ProductState {
  product: Product | null;
  setProduct: (product: Product) => Promise<void>;
  clearProduct: () => Promise<void>;
  loadProduct: () => Promise<void>;
}

export const useProductStore = create<ProductState>((set, get) => ({
  product: null,

  setProduct: async (product) => {
    await db.clearProductData();
    await db.saveProductData(product);
    set({ product });
  },

  clearProduct: async () => {
    await db.clearProductData();
    set({ product: null });
  },

  loadProduct: async () => {
    const { product } = get();
    if (product) return;

    const productData = await db.getProductData();
    if (productData) {
      set({ product: productData });
      return;
    }

    try {
      const response = await getCoreApiPublic(`/api/core/v1/product/${productCode}`);

      if (response?.data) {
        await db.clearProductData();
        await db.saveProductData(response.data);
        set({ product: response.data });
      } else {
        set({ product: null });
      }
    } catch (err) {
      console.error("Erro ao buscar produtos:", err);
      set({ product: null });
    }
  },
}));
