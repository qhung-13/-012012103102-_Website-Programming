"use client";

import Image from "next/image";
import Link from "next/link";
import SearchBar from "./SearchBar";
import { Heart, User } from "lucide-react";
import ShoppingCartIcon from "./ShoppingCartIcon";
import useWishlistStore from "@/stores/wishlistStore";

const Navbar = () => {
  const { wishlist, hasHydrated } = useWishlistStore();
  const wishlistCount = hasHydrated ? wishlist.length : 0;

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
          <SearchBar />
          <Link
            href="/products"
            className="hidden md:block text-sm text-ink hover:text-gold-dark transition-colors"
          >
            Shop
          </Link>
          <Link
            href="/blog"
            className="hidden md:block text-sm text-ink hover:text-gold-dark transition-colors"
          >
            Blog
          </Link>
          <Link
            href="/about"
            className="hidden md:block text-sm text-ink hover:text-gold-dark transition-colors"
          >
            About
          </Link>
          <Link href="/wishlist" aria-label="Wishlist" className="hidden sm:block relative">
            <Heart className="w-[18px] h-[18px] text-ink/70 hover:text-gold-dark transition-colors" />
            {wishlistCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-gold text-ink rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center text-[10px] font-semibold font-mono">
                {wishlistCount}
              </span>
            )}
          </Link>
          <ShoppingCartIcon />
          <Link
            href="/login"
            className="flex items-center gap-1.5 text-sm font-medium border border-ink rounded-full pl-3 pr-3.5 py-1.5 hover:bg-ink hover:text-paper transition-colors"
          >
            <User className="w-[14px] h-[14px]" />
            <span className="hidden sm:inline">Sign in</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
