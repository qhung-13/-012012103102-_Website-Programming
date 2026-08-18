import { ProductType } from "@/types";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type WishlistStateType = {
  wishlist: ProductType[];
  hasHydrated: boolean;
};

type WishlistActionsType = {
  toggleWishlist: (product: ProductType) => void;
  isWishlisted: (id: ProductType["id"]) => boolean;
  clearWishlist: () => void;
};

const useWishlistStore = create<WishlistStateType & WishlistActionsType>()(
  persist(
    (set, get) => ({
      wishlist: [],
      hasHydrated: false,
      toggleWishlist: (product) =>
        set((state) => {
          const exists = state.wishlist.some((p) => p.id === product.id);
          return {
            wishlist: exists
              ? state.wishlist.filter((p) => p.id !== product.id)
              : [...state.wishlist, product],
          };
        }),
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
