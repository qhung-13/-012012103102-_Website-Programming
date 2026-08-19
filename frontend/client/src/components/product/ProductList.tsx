import { ApiResponse, apiFetch } from "@/lib/api";
import { ApiProductType, mapApiProduct } from "@/types";
import Categories from "./Categories";
import ProductCard from "./ProductCard";
import Link from "next/link";
import Filter from "./Filter";
import Pagination from "./Pagination";

const ProductList = async ({
  category,
  sort,
  page,
  search,
  params,
}: {
  category?: string;
  sort?: string;
  page?: string;
  search?: string;
  params: "homepage" | "products";
}) => {
  const limit = params === "homepage" ? 8 : 12;
  const currentPage = Math.max(1, Number(page) || 1);

  const query = new URLSearchParams();
  query.set("page", String(currentPage));
  query.set("limit", String(limit));
  if (category && category !== "all") query.set("category", category);
  if (sort) query.set("sort", sort);
  if (search) query.set("search", search);

  let products: ReturnType<typeof mapApiProduct>[] = [];
  let meta: ApiResponse<unknown>["meta"] | undefined;
  let hasError = false;

  try {
    const res = await apiFetch<ApiProductType[]>(
      `/products?${query.toString()}`,
    );
    products = res.data.map(mapApiProduct);
    meta = res.meta;
  } catch {
    hasError = true;
  }

  return (
    <div className="w-full">
      <Categories activeCategory={category} sort={sort} search={search} />
      {params === "products" && <Filter />}
      {hasError ? (
        <p className="text-sm text-muted py-12 text-center">
          Không thể tải sản phẩm lúc này. Vui lòng thử lại sau.
        </p>
      ) : products.length === 0 ? (
        <p className="text-sm text-muted py-12 text-center">
          Không tìm thấy sản phẩm phù hợp.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
      {params === "homepage" && (
        <Link
          href={category ? `/products/?category=${category}` : "/products"}
          className="flex items-center gap-1 justify-end mt-6 text-sm font-medium text-ink hover:text-gold-dark transition-colors group"
        >
          Xem tất cả sản phẩm
          <span className="group-hover:translate-x-0.5 transition-transform">
            →
          </span>
        </Link>
      )}
      {params === "products" && meta && meta.totalPages > 1 && (
        <Pagination
          currentPage={meta.page}
          totalPages={meta.totalPages}
          category={category}
          sort={sort}
          search={search}
        />
      )}
    </div>
  );
};

export default ProductList;
