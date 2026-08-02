"use client";

import useCartStore from "@/stores/cartStore";
import useWishlistStore from "@/stores/wishlistStore";
import { ProductType } from "@/types";
import { Heart, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { toast } from "react-toastify";

const colorSwatch: Record<string, string> = {
  gray: "#9ca3af",
  purple: "#a855f7",
  green: "#22c55e",
  blue: "#3b82f6",
  black: "#171416",
  white: "#f5f5f4",
  pink: "#ec4899",
  red: "#ef4444",
  orange: "#f97316",
};

const ProductCard = ({ product }: { product: ProductType }) => {
  const [productTypes, setProductTypes] = useState({
    size: product.sizes[0],
    color: product.colors[0],
  });

  const { addToCart } = useCartStore();
  const { toggleWishlist, isWishlisted, hasHydrated } = useWishlistStore();

  const wishlisted = hasHydrated && isWishlisted(product.id);

  const handleToggleWishlist = () => {
    toggleWishlist(product);
    toast.success(
      wishlisted ? "Removed from wishlist" : "Added to wishlist"
    );
  };

  const handleProductType = ({
    type,
    value,
  }: {
    type: "size" | "color";
    value: string;
  }) => {
    setProductTypes((prev) => ({
      ...prev,
      [type]: value,
    }));
  };

  const handleAddToCart = () => {
    addToCart({
      ...product,
      quantity: 1,
      selectedSize: productTypes.size,
      selectedColor: productTypes.color,
    });
    toast.success("Product added to cart");
  };

  return (
    <div className="relative group bg-white rounded-2xl border border-line overflow-hidden hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
      {/* IMAGE */}
      <Link href={`/products/${product.id}`}>
        <div className="relative aspect-[2/3] bg-paper-dim">
          <Image
            src={product.images[productTypes.color]}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <span className="absolute top-3 left-3 bg-paper/90 backdrop-blur rounded-full px-2.5 py-1 text-[11px] font-mono font-medium tag-mark">
            ${product.price.toFixed(2)}
          </span>
        </div>
      </Link>
      <button
        onClick={handleToggleWishlist}
        aria-label="Toggle wishlist"
        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-paper/90 backdrop-blur flex items-center justify-center hover:bg-paper transition-colors cursor-pointer z-10"
      >
        <Heart
          className={`w-4 h-4 transition-colors ${
            wishlisted ? "fill-gold-dark text-gold-dark" : "text-ink/60"
          }`}
        />
      </button>
      {/* PRODUCT DETAIL */}
      <div className="flex flex-col gap-3 p-4">
        <div>
          <h3 className="font-medium leading-snug">{product.name}</h3>
          <p className="text-xs text-muted mt-0.5 line-clamp-2">
            {product.shortDescription}
          </p>
        </div>
        {/* PRODUCT TYPES */}
        <div className="flex items-center justify-between text-xs">
          {/* SIZES */}
          <select
            name="size"
            id="size"
            value={productTypes.size}
            className="border border-line rounded-md px-2 py-1 bg-white outline-none"
            onChange={(e) =>
              handleProductType({ type: "size", value: e.target.value })
            }
          >
            {product.sizes.map((size) => (
              <option key={size} value={size}>
                {size.toUpperCase()}
              </option>
            ))}
          </select>
          {/* COLORS */}
          <div className="flex items-center gap-1.5">
            {product.colors.map((color) => (
              <button
                key={color}
                aria-label={color}
                className={`cursor-pointer w-5 h-5 rounded-full flex items-center justify-center border ${
                  productTypes.color === color
                    ? "border-gold-dark"
                    : "border-transparent"
                }`}
                onClick={() =>
                  handleProductType({ type: "color", value: color })
                }
              >
                <span
                  className="w-3.5 h-3.5 rounded-full ring-1 ring-black/10"
                  style={{
                    backgroundColor: colorSwatch[color] ?? color,
                  }}
                />
              </button>
            ))}
          </div>
        </div>
        {/* ADD TO CART */}
        <button
          onClick={handleAddToCart}
          className="w-full flex items-center justify-center gap-2 rounded-full border border-ink text-sm font-medium py-2 hover:bg-ink hover:text-paper transition-colors cursor-pointer"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
