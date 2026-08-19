import { apiFetch } from "@/lib/api";
import { ShoppingBasket, Tag } from "lucide-react";
import Link from "next/link";

type Category = {
  id: number;
  name: string;
  slug: string;
  product_count: number | string;
};

const Categories = async ({
  activeCategory,
  sort,
  search,
}: {
  activeCategory?: string;
  sort?: string;
  search?: string;
}) => {
  let categories: Category[] = [];
  try {
    categories = (await apiFetch<Category[]>("/categories")).data;
  } catch {
    // Danh sách sản phẩm vẫn dùng được nếu API danh mục tạm thời lỗi.
  }

  const items = [
    { id: 0, name: "Tất cả", slug: "all", product_count: 0 },
    ...categories,
  ];
  const buildHref = (slug: string) => {
    const params = new URLSearchParams();
    if (slug !== "all") params.set("category", slug);
    if (sort) params.set("sort", sort);
    if (search) params.set("search", search);
    return `/products${params.size ? `?${params.toString()}` : ""}`;
  };

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 -mx-1 px-1 scrollbar-hide">
      {items.map((category) => {
        const active = category.slug === (activeCategory || "all");
        return (
          <Link
            key={category.id}
            href={buildHref(category.slug)}
            scroll={false}
            className={`flex items-center gap-2 shrink-0 px-3.5 py-2 rounded-full text-sm border transition-colors ${
              active
                ? "bg-ink text-paper border-ink"
                : "bg-white text-muted border-line hover:border-ink/40"
            }`}
          >
            {category.slug === "all" ? (
              <ShoppingBasket className="w-4 h-4" />
            ) : (
              <Tag className="w-4 h-4" />
            )}
            {category.name}
          </Link>
        );
      })}
    </div>
  );
};

export default Categories;
