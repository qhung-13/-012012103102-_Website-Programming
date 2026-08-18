import ProductList from "@/components/product/ProductList";

const ProductsPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ category: string; sort?: string; page?: string }>;
}) => {
  const { category, sort, page } = await searchParams;
  return (
    <div className="mt-8">
      <div className="mb-6">
        <span className="tag-mark text-xs uppercase tracking-[0.2em] text-muted font-mono">
          Shop
        </span>
        <h1 className="font-display text-4xl tracking-wide mt-1 capitalize">
          {category && category !== "all"
            ? category.replace("-", " ")
            : "All Products"}
        </h1>
      </div>
      <ProductList
        category={category}
        sort={sort}
        page={page}
        params="products"
      />
    </div>
  );
};

export default ProductsPage;
