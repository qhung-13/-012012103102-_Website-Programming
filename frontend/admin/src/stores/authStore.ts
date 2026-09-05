import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { apiFetch, ApiError } from "@/lib/api";

export type AdminUserType = {
  id: number;
  name: string;
  email: string;
  role: "admin" | "customer";
  avatar?: string | null;
};

type AuthStateType = {
  user: AdminUserType | null;
  token: string | null;
  hasHydrated: boolean;
  sessionChecked: boolean;
};

type AuthActionsType = {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  validateSession: () => Promise<boolean>;
};

const useAuthStore = create<AuthStateType & AuthActionsType>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      hasHydrated: false,
      sessionChecked: false,

      login: async (email, password) => {
        const res = await apiFetch<{ user: AdminUserType; token: string }>(
          "/auth/login",
          {
            method: "POST",
            body: { email, password },
          },
        );

        if (res.data.user.role !== "admin") {
          throw new ApiError("Tài khoản này không có quyền quản trị.", 403);
        }

        set({
          user: res.data.user,
          token: res.data.token,
          sessionChecked: true,
        });
      },

      logout: () => set({ user: null, token: null, sessionChecked: true }),

      validateSession: async () => {
        const token = get().token;
        if (!token) {
          set({ user: null, sessionChecked: true });
          return false;
        }
        try {
          const res = await apiFetch<AdminUserType>("/auth/me", { token });
          if (res.data.role !== "admin")
            throw new ApiError("Không có quyền quản trị.", 403);
          set({ user: res.data, sessionChecked: true });
          return true;
        } catch (error) {
          // A temporary 5xx/network failure must not destroy a valid local
          // session. Only authentication/authorization failures invalidate it.
          if (
            error instanceof ApiError &&
            [401, 403, 404].includes(error.status)
          ) {
            set({ user: null, token: null, sessionChecked: true });
            return false;
          }
          set({ sessionChecked: true });
          return Boolean(get().user);
        }
      },
    }),
    {
      name: "admin-auth",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.hasHydrated = true;
          state.sessionChecked = false;
        }
      },
    },
  ),
);

export { ApiError };
export default useAuthStore;
