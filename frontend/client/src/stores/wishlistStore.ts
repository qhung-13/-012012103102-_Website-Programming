import { ApiProductType, mapApiProduct, ProductType } from "@/types";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { apiFetch } from "@/lib/api";

type WishlistStateType = {
  wishlist: ProductType[];
  hasHydrated: boolean;
};

type WishlistActionsType = {
  toggleWishlist: (
    product: ProductType,
    token?: string | null,
  ) => Promise<boolean>;
  syncWishlist: (token: string) => Promise<void>;
  isWishlisted: (id: ProductType["id"]) => boolean;
  clearWishlist: () => void;
};

const useWishlistStore = create<WishlistStateType & WishlistActionsType>()(
  persist(
    (set, get) => ({
      wishlist: [],
      hasHydrated: false,
      toggleWishlist: async (product, token) => {
        const exists = get().wishlist.some((p) => p.id === product.id);
        if (token) {
          await apiFetch(exists ? `/wishlist/${product.id}` : "/wishlist", {
            method: exists ? "DELETE" : "POST",
            token,
            ...(exists ? {} : { body: { product_id: product.id } }),
          });
        }
        set((state) => ({
          wishlist: exists
            ? state.wishlist.filter((p) => p.id !== product.id)
            : [...state.wishlist, product],
        }));
        return !exists;
      },
      syncWishlist: async (token) => {
        const res = await apiFetch<ApiProductType[]>("/wishlist", { token });
        set({ wishlist: res.data.map(mapApiProduct) });
      },
      isWishlisted: (id) => get().wishlist.some((p) => p.id === id),
      clearWishlist: () => set({ wishlist: [] }),
    }),
    {
      name: "wishlist",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.hasHydrated = true;
        }
      },
    },
  ),
);

export default useWishlistStore;
