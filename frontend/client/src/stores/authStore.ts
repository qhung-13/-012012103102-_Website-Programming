import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { apiFetch, ApiError } from "@/lib/api";

export type AuthUserType = {
  id: number;
  name: string;
  email: string;
  role: "admin" | "customer";
  phone: string | null;
  address: string | null;
  avatar: string | null;
};

type AuthStateType = {
  user: AuthUserType | null;
  token: string | null;
  hasHydrated: boolean;
};

type AuthActionsType = {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (
    data: Partial<Pick<AuthUserType, "name" | "phone" | "address">>,
  ) => Promise<void>;
  validateSession: () => Promise<boolean>;
};

const useAuthStore = create<AuthStateType & AuthActionsType>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      hasHydrated: false,

      login: async (email, password) => {
        const res = await apiFetch<{ user: AuthUserType; token: string }>(
          "/auth/login",
          {
            method: "POST",
            body: { email, password },
          },
        );
        set({ user: res.data.user, token: res.data.token });
      },

      register: async (name, email, password) => {
        const res = await apiFetch<{ user: AuthUserType; token: string }>(
          "/auth/register",
          {
            method: "POST",
            body: { name, email, password },
          },
        );
        set({ user: res.data.user, token: res.data.token });
      },

      logout: () => set({ user: null, token: null }),

      updateProfile: async (data) => {
        const token = get().token;
        const res = await apiFetch<AuthUserType>("/auth/profile", {
          method: "PUT",
          body: data,
          token,
        });
        set({ user: res.data });
      },

      validateSession: async () => {
        const token = get().token;
        if (!token) return false;
        try {
          const res = await apiFetch<AuthUserType>("/auth/me", { token });
          set({ user: res.data });
          return true;
        } catch {
          set({ user: null, token: null });
          return false;
        }
      },
    }),
    {
      name: "auth",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) state.hasHydrated = true;
      },
    },
  ),
);

export { ApiError };
export default useAuthStore;
