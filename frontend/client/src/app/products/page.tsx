import ProductList from "@/components/product/ProductList";

const ProductsPage = async ({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string;
    sort?: string;
    page?: string;
    search?: string;
  }>;
}) => {
  const { category, sort, page, search } = await searchParams;
  return (
    <div className="mt-8">
      <div className="mb-6">
        <span className="tag-mark text-xs uppercase tracking-[0.2em] text-muted font-mono">
          Cửa hàng
        </span>
        <h1 className="font-display text-4xl tracking-wide mt-1 capitalize">
          {search ? `Kết quả cho “${search}”` : "Tất cả sản phẩm"}
        </h1>
      </div>
      <ProductList
        category={category}
        sort={sort}
        page={page}
        search={search}
        params="products"
      />
    </div>
  );
};

export default ProductsPage;
