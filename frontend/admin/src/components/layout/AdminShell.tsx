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
  const { user, hasHydrated } = useAuthStore();
  const isLoginPage = pathname === "/login";

  useEffect(() => {
    if (!hasHydrated) return;
    if (!user && !isLoginPage) {
      router.replace("/login");
    }
    if (user && isLoginPage) {
      router.replace("/");
    }
  }, [hasHydrated, user, isLoginPage, router]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (!hasHydrated || !user) {
    // Avoid flashing the dashboard chrome before we know whether the
    // visitor is authenticated.
    return (
      <div className="w-full min-h-screen flex items-center justify-center text-sm text-muted-foreground">
        Loading...
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar />
      <main className="w-full">
        <Navbar />
        <div className="px-4">{children}</div>
      </main>
    </SidebarProvider>
  );
};

export default AdminShell;
