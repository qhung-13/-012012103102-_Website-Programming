"use client";

import { LogOut, Moon, Settings, Sun, User } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { SidebarTrigger } from "@/components/ui/sidebar";
import useAuthStore from "@/stores/authStore";
import { toast } from "react-toastify";

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/products": "Products",
  "/users": "Users",
  "/payments": "Payments",
};

const Navbar = () => {
  const { setTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    toast.success("Signed out.");
    router.push("/login");
  };

  const initials = user?.name
    ?.split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const title =
    pageTitles[pathname] ??
    pathname.split("/").filter(Boolean).pop()?.replace(/-/g, " ") ??
    "Dashboard";

  return (
    <nav className="px-4 py-3 flex items-center justify-between sticky top-0 bg-background/90 backdrop-blur-sm z-10 border-b">
      {/* LEFT */}
      <div className="flex items-center gap-3">
        <SidebarTrigger />
        <h1 className="text-sm font-medium capitalize">{title}</h1>
      </div>
      {/* RIGHT */}
      <div className="flex items-center gap-3">
        {/* THEME MENU */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setTheme("light")}>
              Light
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")}>
              Dark
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")}>
              System
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        {/* USER MENU */}
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Avatar className="ring-2 ring-transparent hover:ring-gold/50 transition-all">
              <AvatarImage src={undefined} />
              <AvatarFallback>{initials || "AD"}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent sideOffset={10} align="end">
            <DropdownMenuLabel>{user?.name ?? "My Account"}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="h-[1.2rem] w-[1.2rem] mr-2" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="h-[1.2rem] w-[1.2rem] mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onClick={handleLogout}>
              <LogOut className="h-[1.2rem] w-[1.2rem] mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
};

export default Navbar;
