"use client";

import useCartStore from "@/stores/cartStore";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";

const ShoppingCartIcon = () => {
  const { cart, hasHydrated } = useCartStore();

  if (!hasHydrated) return null;

  const count = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <Link href="/cart" className="relative" aria-label="Cart">
      <ShoppingBag className="w-[18px] h-[18px] text-ink/70 hover:text-gold-dark transition-colors" />
      {count > 0 && (
        <span className="absolute -top-2 -right-2 bg-gold text-ink rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center text-[10px] font-semibold font-mono">
          {count}
        </span>
      )}
    </Link>
  );
};

export default ShoppingCartIcon;
