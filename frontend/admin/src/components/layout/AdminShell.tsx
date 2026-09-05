"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import AppSidebar from "@/components/layout/AppSidebar";
import Navbar from "@/components/layout/Navbar";
import { SidebarProvider } from "@/components/ui/sidebar";
import useAuthStore from "@/stores/authStore";

/**
 * Wraps the whole app. The /login route renders standalone (no sidebar
 * chrome). Every other route requires a logged-in admin — once the auth
 * store has hydrated from localStorage, unauthenticated visitors are
 * redirected to /login.
 */
const AdminShell = ({
  children,
  defaultOpen,
}: {
  children: React.ReactNode;
  defaultOpen: boolean;
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, hasHydrated, sessionChecked, validateSession } = useAuthStore();
  const isLoginPage = pathname === "/login";

  useEffect(() => {
    if (!hasHydrated) return;
    if (!sessionChecked) {
      validateSession();
      return;
    }
    if ((!user || user.role !== "admin") && !isLoginPage) {
      router.replace("/login");
    }
    if (user && isLoginPage) {
      router.replace("/");
    }
  }, [hasHydrated, sessionChecked, user, isLoginPage, router, validateSession]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (!hasHydrated || !sessionChecked || !user || user.role !== "admin") {
    // Avoid flashing the dashboard chrome before we know whether the
    // visitor is authenticated.
    return (
      <div className="w-full min-h-screen flex items-center justify-center text-sm text-muted-foreground">
        Đang kiểm tra phiên đăng nhập...
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar />
      <main className="min-w-0 flex-1 bg-muted/20">
        <Navbar />
        <div className="mx-auto w-full max-w-[1600px] px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
          {children}
        </div>
      </main>
    </SidebarProvider>
  );
};

export default AdminShell;
