"use client";

import { useEffect, useState, useCallback } from "react";
import { Product, getColumns } from "./columns";
import { DataTable } from "./data-table";
import useAuthStore from "@/stores/authStore";
import { apiFetch, ApiError } from "@/lib/api";
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
      const res = await apiFetch<ApiProduct[]>("/products?limit=48", { token });
      setData(res.data.map(mapProduct));
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Failed to load products.",
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (product: Product) => {
    if (!confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    try {
      await apiFetch(`/products/${product.id}`, { method: "DELETE", token });
      toast.success("Product deleted.");
      setData((prev) => prev.filter((p) => p.id !== product.id));
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Failed to delete product.",
      );
    }
  };

  return (
    <div className="py-4">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">All Products</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your catalog — {data.length} products total.
        </p>
      </div>
      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground py-12 justify-center">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading products...
        </div>
      ) : (
        <DataTable columns={getColumns(handleDelete)} data={data} />
      )}
    </div>
  );
};

export default ProductsPage;
