"use client";
import {
  Footprints,
  Glasses,
  Briefcase,
  Shirt,
  ShoppingBasket,
  Hand,
  Venus,
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const categories = [
  { name: "All", icon: <ShoppingBasket className="w-4 h-4" />, slug: "all" },
  { name: "T-shirts", icon: <Shirt className="w-4 h-4" />, slug: "t-shirts" },
  { name: "Shoes", icon: <Footprints className="w-4 h-4" />, slug: "shoes" },
  {
    name: "Accessories",
    icon: <Glasses className="w-4 h-4" />,
    slug: "accessories",
  },
  { name: "Bags", icon: <Briefcase className="w-4 h-4" />, slug: "bags" },
  { name: "Dresses", icon: <Venus className="w-4 h-4" />, slug: "dresses" },
  { name: "Jackets", icon: <Shirt className="w-4 h-4" />, slug: "jackets" },
  { name: "Gloves", icon: <Hand className="w-4 h-4" />, slug: "gloves" },
];

const Categories = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const selectedCategory = searchParams.get("category") || "all";

  const handleChange = (value: string | null) => {
    const params = new URLSearchParams(searchParams);
    params.set("category", value || "all");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 -mx-1 px-1 scrollbar-hide">
      {categories.map((category) => {
        const active = category.slug === selectedCategory;
        return (
          <button
            key={category.name}
            onClick={() => handleChange(category.slug)}
            className={`flex items-center gap-2 shrink-0 px-3.5 py-2 rounded-full text-sm border transition-colors cursor-pointer ${
              active
                ? "bg-ink text-paper border-ink"
                : "bg-white text-muted border-line hover:border-ink/40"
            }`}
          >
            {category.icon}
            {category.name}
          </button>
        );
      })}
    </div>
  );
};

export default Categories;
