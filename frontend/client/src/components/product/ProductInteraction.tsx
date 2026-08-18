"use client";

import useCartStore from "@/stores/cartStore";
import { ProductType } from "@/types";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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

const ProductInteraction = ({
  product,
  selectedSize,
  selectedColor,
}: {
  product: ProductType;
  selectedSize: string;
  selectedColor: string;
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [quantity, setQuantity] = useState(1);

  const { addToCart } = useCartStore();

  const handleTypeChange = (type: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(type, value);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleQuantityChange = (type: "increment" | "decrement") => {
    if (type === "increment") {
      setQuantity((prev) => prev + 1);
    } else {
      if (quantity > 1) {
        setQuantity((prev) => prev - 1);
      }
    }
  };

  const handleAddToCart = () => {
    addToCart({
      ...product,
      quantity,
      selectedColor,
      selectedSize,
    });
    toast.success("Product added to cart");
  };
  return (
    <div className="flex flex-col gap-5 mt-2">
      {/* SIZE */}
      <div className="flex flex-col gap-2">
        <span className="text-xs text-muted uppercase tracking-wider">
          Size
        </span>
        <div className="flex items-center gap-2">
          {product.sizes.map((size) => (
            <button
              key={size}
              onClick={() => handleTypeChange("size", size)}
              className={`w-9 h-9 rounded-full text-xs font-medium flex items-center justify-center border transition-colors cursor-pointer ${
                selectedSize === size
                  ? "bg-ink text-paper border-ink"
                  : "bg-white text-ink border-line hover:border-ink/40"
              }`}
            >
              {size.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
      {/* COLOR */}
      <div className="flex flex-col gap-2">
        <span className="text-xs text-muted uppercase tracking-wider">
          Color
        </span>
        <div className="flex items-center gap-2">
          {product.colors.map((color) => (
            <button
              key={color}
              aria-label={color}
              onClick={() => handleTypeChange("color", color)}
              className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-colors cursor-pointer ${
                selectedColor === color
                  ? "border-gold-dark"
                  : "border-transparent"
              }`}
            >
              <span
                className="w-6 h-6 rounded-full ring-1 ring-black/10"
                style={{ backgroundColor: colorSwatch[color] ?? color }}
              />
            </button>
          ))}
        </div>
      </div>
      {/* QUANTITY */}
      <div className="flex flex-col gap-2">
        <span className="text-xs text-muted uppercase tracking-wider">
          Quantity
        </span>
        <div className="flex items-center gap-3">
          <button
            className="cursor-pointer w-8 h-8 rounded-full border border-line flex items-center justify-center hover:border-ink/40 transition-colors"
            onClick={() => handleQuantityChange("decrement")}
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <span className="font-mono w-4 text-center">{quantity}</span>
          <button
            className="cursor-pointer w-8 h-8 rounded-full border border-line flex items-center justify-center hover:border-ink/40 transition-colors"
            onClick={() => handleQuantityChange("increment")}
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      {/* BUTTONS */}
      <button
        onClick={handleAddToCart}
        className="bg-ink text-paper px-4 py-3 rounded-full flex items-center justify-center gap-2 cursor-pointer text-sm font-medium hover:bg-gold-dark transition-colors"
      >
        <ShoppingBag className="w-4 h-4" />
        Add to Cart
      </button>
      <button className="border border-ink text-ink px-4 py-3 rounded-full flex items-center justify-center cursor-pointer gap-2 text-sm font-medium hover:bg-ink hover:text-paper transition-colors">
        Buy this Item
      </button>
    </div>
  );
};

export default ProductInteraction;
