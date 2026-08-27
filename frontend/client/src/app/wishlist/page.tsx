"use client";

import ProductCard from "@/components/product/ProductCard";
import useWishlistStore from "@/stores/wishlistStore";
import { Heart } from "lucide-react";
import Link from "next/link";
import useAuthStore from "@/stores/authStore";
import { getLoginRedirect } from "@/lib/authRedirect";

const WishlistPage = () => {
  const { wishlist, hasHydrated } = useWishlistStore();
  const { user, hasHydrated: authHydrated } = useAuthStore();

  if (!hasHydrated || !authHydrated) return null;

  if (!user) {
    return (
      <div className="mt-16 mb-16 flex flex-col items-center gap-3 text-center">
        <Heart className="w-8 h-8 text-muted" />
        <p className="text-sm text-muted">
          Đăng nhập để sử dụng danh sách yêu thích.
        </p>
        <Link
          href={getLoginRedirect("/wishlist")}
          className="text-sm font-medium underline hover:text-gold-dark"
        >
          Đăng nhập
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-8 mb-16">
      <div className="mb-6">
        <span className="tag-mark text-xs uppercase tracking-[0.2em] text-muted font-mono">
          Để dành xem sau
        </span>
        <h1 className="font-display text-4xl tracking-wide mt-1">
          Danh sách yêu thích
        </h1>
      </div>

      {wishlist.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <Heart className="w-8 h-8 text-muted" />
          <p className="text-sm text-muted">Bạn chưa lưu sản phẩm nào.</p>
          <Link
            href="/products"
            className="text-sm font-medium underline hover:text-gold-dark"
          >
            Xem sản phẩm
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
          {wishlist.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
