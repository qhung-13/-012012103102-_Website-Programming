import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { apiFetch, ApiError } from "@/lib/api";

export type AdminUserType = {
  id: number;
  name: string;
  email: string;
  role: "admin" | "customer";
};

type AuthStateType = {
  user: AdminUserType | null;
  token: string | null;
  hasHydrated: boolean;
};

type AuthActionsType = {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const useAuthStore = create<AuthStateType & AuthActionsType>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      hasHydrated: false,

      login: async (email, password) => {
        const res = await apiFetch<{ user: AdminUserType; token: string }>("/auth/login", {
          method: "POST",
          body: { email, password },
        });

        if (res.data.user.role !== "admin") {
          throw new ApiError("This account does not have admin access.", 403);
        }

        set({ user: res.data.user, token: res.data.token });
      },

      logout: () => set({ user: null, token: null }),
    }),
    {
      name: "admin-auth",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) state.hasHydrated = true;
      },
    }
  )
);

export { ApiError };
export default useAuthStore;
