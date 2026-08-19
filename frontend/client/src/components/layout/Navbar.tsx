"use client";

import Image from "next/image";
import Link from "next/link";
import SearchBar from "./SearchBar";
import { Heart, User, LogOut, Package, Search } from "lucide-react";
import ShoppingCartIcon from "./ShoppingCartIcon";
import useWishlistStore from "@/stores/wishlistStore";
import useAuthStore from "@/stores/authStore";
import { Suspense, useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

const Navbar = () => {
  const {
    wishlist,
    hasHydrated: wishlistHydrated,
    syncWishlist,
    clearWishlist,
  } = useWishlistStore();
  const {
    user,
    token,
    hasHydrated: authHydrated,
    logout,
    validateSession,
  } = useAuthStore();
  const wishlistCount = wishlistHydrated ? wishlist.length : 0;
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!authHydrated || !token) return;
    validateSession().then((valid) => {
      if (valid) syncWishlist(token).catch(() => undefined);
    });
  }, [authHydrated, token, validateSession, syncWishlist]);

  const handleLogout = () => {
    logout();
    clearWishlist();
    setMenuOpen(false);
    toast.success("Đã đăng xuất.");
    router.push("/");
  };

  return (
    <nav className="sticky top-0 z-50 -mx-4 sm:-mx-6 px-4 sm:px-6 bg-paper/85 backdrop-blur-md">
      <div className="w-full flex items-center justify-between border-b border-line py-4">
        {/* LEFT */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Image
            src="/logo.png"
            alt="TrendLama"
            width={36}
            height={36}
            className="w-7 h-7 md:w-9 md:h-9"
          />
          <p className="font-display text-2xl tracking-wide leading-none pt-1">
            TRENDLAMA
          </p>
        </Link>
        {/* RIGHT */}
        <div className="flex items-center gap-4 sm:gap-6">
          <Suspense
            fallback={
              <div className="hidden sm:block w-36 h-9 rounded-full bg-paper-dim animate-pulse" />
            }
          >
            <SearchBar />
          </Suspense>
          <Link
            href="/products"
            className="hidden md:block text-sm text-ink hover:text-gold-dark transition-colors"
          >
            Sản phẩm
          </Link>
          <Link
            href="/blog"
            className="hidden md:block text-sm text-ink hover:text-gold-dark transition-colors"
          >
            Bài viết
          </Link>
          <Link
            href="/about"
            className="hidden md:block text-sm text-ink hover:text-gold-dark transition-colors"
          >
            Giới thiệu
          </Link>
          <Link
            href="/wishlist"
            aria-label="Danh sách yêu thích"
            className="hidden sm:block relative"
          >
            <Heart className="w-[18px] h-[18px] text-ink/70 hover:text-gold-dark transition-colors" />
            {wishlistCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-gold text-ink rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center text-[10px] font-semibold font-mono">
                {wishlistCount}
              </span>
            )}
          </Link>
          <ShoppingCartIcon />

          {!authHydrated ? (
            <div className="w-8 h-8 rounded-full bg-paper-dim animate-pulse" />
          ) : user ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                aria-label="Mở menu tài khoản"
                aria-expanded={menuOpen}
                className="w-8 h-8 rounded-full bg-ink text-paper text-xs font-medium flex items-center justify-center cursor-pointer hover:bg-gold-dark transition-colors"
              >
                {user.name.charAt(0).toUpperCase()}
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-10 w-48 bg-white border border-line rounded-2xl shadow-lg py-2 flex flex-col">
                  <div className="px-4 py-2 border-b border-line">
                    <p className="text-sm font-medium truncate">{user.name}</p>
                    <p className="text-xs text-muted truncate">{user.email}</p>
                  </div>
                  <Link
                    href="/orders"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-paper-dim transition-colors"
                  >
                    <Package className="w-3.5 h-3.5" />
                    Đơn hàng của tôi
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-left hover:bg-paper-dim transition-colors cursor-pointer text-red-500"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 text-sm font-medium border border-ink rounded-full pl-3 pr-3.5 py-1.5 hover:bg-ink hover:text-paper transition-colors"
            >
              <User className="w-[14px] h-[14px]" />
              <span className="hidden sm:inline">Đăng nhập</span>
            </Link>
          )}
        </div>
      </div>
      <div className="flex md:hidden items-center gap-5 overflow-x-auto py-2 text-sm border-b border-line">
        <Link href="/products" className="shrink-0">
          Sản phẩm
        </Link>
        <Link href="/blog" className="shrink-0">
          Bài viết
        </Link>
        <Link href="/about" className="shrink-0">
          Giới thiệu
        </Link>
        <Link href="/contact" className="shrink-0">
          Liên hệ
        </Link>
        <Link
          href="/products"
          aria-label="Tìm sản phẩm"
          className="ml-auto shrink-0"
        >
          <Search className="w-4 h-4" />
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
