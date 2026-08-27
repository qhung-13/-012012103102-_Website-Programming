"use client";

import useCartStore from "@/stores/cartStore";
import useWishlistStore from "@/stores/wishlistStore";
import { ProductType } from "@/types";
import { resolveImageUrl } from "@/lib/api";
import useAuthStore from "@/stores/authStore";
import { Heart, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { toast } from "react-toastify";
import { formatColor } from "@/lib/localization";
import { usePathname, useRouter } from "next/navigation";
import { getLoginRedirect } from "@/lib/authRedirect";

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
  yellow: "#eab308",
  brown: "#92400e",
  navy: "#1e3a8a",
  tortoise: "#8b5e3c",
};

const ProductCard = ({ product }: { product: ProductType }) => {
  const [productTypes, setProductTypes] = useState({
    size: product.sizes[0] ?? "",
    color: product.colors[0] ?? "",
  });

  const { addToCart } = useCartStore();
  const { toggleWishlist, isWishlisted, hasHydrated } = useWishlistStore();
  const { user, token, hasHydrated: authHydrated } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();

  const wishlisted = hasHydrated && isWishlisted(product.id);

  const handleToggleWishlist = async () => {
    if (!authHydrated || !user || !token) {
      toast.info("Vui lòng đăng nhập để lưu sản phẩm yêu thích.");
      router.push(getLoginRedirect(pathname || "/wishlist"));
      return;
    }
    try {
      const added = await toggleWishlist(product, token);
      toast.success(
        added
          ? "Đã thêm vào danh sách yêu thích."
          : "Đã xóa khỏi danh sách yêu thích.",
      );
    } catch {
      toast.error("Không thể cập nhật danh sách yêu thích.");
    }
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
    toast.success("Đã thêm sản phẩm vào giỏ hàng.");
  };

  return (
    <div className="relative group bg-white rounded-2xl border border-line overflow-hidden hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
      {/* IMAGE */}
      <Link href={`/products/${product.slug ?? product.id}`}>
        <div className="relative aspect-[2/3] bg-paper-dim">
          <Image
            src={resolveImageUrl(
              product.images[productTypes.color] ??
                Object.values(product.images)[0],
            )}
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
        aria-label={
          wishlisted
            ? "Xóa khỏi danh sách yêu thích"
            : "Thêm vào danh sách yêu thích"
        }
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
          {product.sizes.length > 0 && (
            <select
              name="size"
              id={`size-${product.id}`}
              aria-label={`Chọn kích cỡ cho ${product.name}`}
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
          )}
          {/* COLORS */}
          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            {product.colors.map((color) => (
              <button
                key={color}
                aria-label={`Chọn màu ${formatColor(color)}`}
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
          disabled={product.stock < 1}
          className="w-full flex items-center justify-center gap-2 rounded-full border border-ink text-sm font-medium py-2 hover:bg-ink hover:text-paper transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          {product.stock < 1 ? "Tạm hết hàng" : "Thêm vào giỏ"}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
