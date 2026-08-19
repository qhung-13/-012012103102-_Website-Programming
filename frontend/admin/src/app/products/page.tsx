"use client";

import { useEffect, useState, useCallback } from "react";
import { Product, getColumns } from "./columns";
import { DataTable } from "./data-table";
import useAuthStore from "@/stores/authStore";
import { apiFetch, apiFetchAll, ApiError } from "@/lib/api";
import { toast } from "react-toastify";
import { Loader2 } from "lucide-react";

type ApiProduct = {
  id: number;
  name: string;
  short_description: string | null;
  description: string | null;
  price: number;
  stock: number;
  category_name: string | null;
  category_id: number | null;
  status: "active" | "draft";
  sizes: string[];
  colors: string[];
  images: Record<string, string>;
};

const mapProduct = (p: ApiProduct): Product => ({
  id: p.id,
  name: p.name,
  shortDescription: p.short_description ?? "",
  description: p.description ?? "",
  price: Number(p.price),
  stock: p.stock,
  category_name: p.category_name,
  category_id: p.category_id,
  status: p.status,
  sizes: p.sizes ?? [],
  colors: p.colors ?? [],
  images: p.images ?? {},
});

const ProductsPage = () => {
  const { token } = useAuthStore();
  const [data, setData] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const products = await apiFetchAll<ApiProduct>(
        "/products?limit=100&admin=1",
        { token },
      );
      setData(products.map(mapProduct));
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Không thể tải sản phẩm.",
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    window.addEventListener("trendlama:products-changed", load);
    return () => window.removeEventListener("trendlama:products-changed", load);
  }, [load]);

  const handleDelete = async (product: Product) => {
    if (!confirm(`Xóa “${product.name}”? Thao tác này không thể hoàn tác.`))
      return;
    try {
      await apiFetch(`/products/${product.id}`, { method: "DELETE", token });
      toast.success("Đã xóa sản phẩm.");
      setData((prev) => prev.filter((p) => p.id !== product.id));
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Không thể xóa sản phẩm.",
      );
    }
  };

  const handleBulkDelete = async (products: Product[]) => {
    if (
      !confirm(
        `Xóa ${products.length} sản phẩm đã chọn? Thao tác này không thể hoàn tác.`,
      )
    )
      return;
    const results = await Promise.allSettled(
      products.map((product) =>
        apiFetch(`/products/${product.id}`, { method: "DELETE", token }),
      ),
    );
    const failed = results.filter(
      (result) => result.status === "rejected",
    ).length;
    await load();
    if (failed) toast.error(`Không thể xóa ${failed} sản phẩm.`);
    else toast.success(`Đã xóa ${products.length} sản phẩm.`);
  };

  return (
    <div className="py-4">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          Tất cả sản phẩm
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Quản lý danh mục hàng hóa — tổng cộng {data.length} sản phẩm.
        </p>
      </div>
      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground py-12 justify-center">
          <Loader2 className="w-4 h-4 animate-spin" /> Đang tải sản phẩm...
        </div>
      ) : (
        <DataTable
          columns={getColumns(handleDelete, load)}
          data={data}
          onDeleteSelected={handleBulkDelete}
        />
      )}
    </div>
  );
};

export default ProductsPage;
