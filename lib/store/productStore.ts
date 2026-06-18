import { create } from "zustand";
import { ProductParams } from "@/types";
import { ProductWithDeal } from "@/lib/store/deals";

interface ProductStore {
  products: ProductParams[] | null;
  selectedProduct: ProductWithDeal | null;
  setProducts: (products: ProductParams[]) => void;
  setSelectedProduct: (product: ProductWithDeal | null) => void;
  getProductById: (id: string) => ProductParams | undefined;
}

export const useProductStore = create<ProductStore>((set, get) => ({
  products: null,
  selectedProduct: null,
  setProducts: (products) => set({ products }),
  setSelectedProduct: (product) => set({ selectedProduct: product }),
  getProductById: (id) => {
    const { products } = get();
    return products?.find((p) => p.id === id);
  },
}));