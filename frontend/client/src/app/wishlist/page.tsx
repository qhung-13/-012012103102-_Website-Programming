"use client";

import ProductCard from "@/components/product/ProductCard";
import useWishlistStore from "@/stores/wishlistStore";
import { Heart } from "lucide-react";
import Link from "next/link";

const WishlistPage = () => {
  const { wishlist, hasHydrated } = useWishlistStore();

  if (!hasHydrated) return null;

  return (
    <div className="mt-8 mb-16">
      <div className="mb-6">
        <span className="tag-mark text-xs uppercase tracking-[0.2em] text-muted font-mono">
          Saved for later
        </span>
        <h1 className="font-display text-4xl tracking-wide mt-1">
          Your Wishlist
        </h1>
      </div>

      {wishlist.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <Heart className="w-8 h-8 text-muted" />
          <p className="text-sm text-muted">
            You haven&apos;t saved any products yet.
          </p>
          <Link
            href="/products"
            className="text-sm font-medium underline hover:text-gold-dark"
          >
            Browse products
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
