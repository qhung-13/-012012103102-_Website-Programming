"use client";

import { useCallback, useDeferredValue, useEffect, useState } from "react";
import { Product, getColumns } from "./columns";
import { DataTable } from "./data-table";
import useAuthStore from "@/stores/authStore";
import { apiFetch, ApiError } from "@/lib/api";
import { toast } from "react-toastify";
import { Loader2, Plus, Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import AddProduct from "@/components/forms/AddProduct";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

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
  image_gallery: {
    id: number;
    color: string | null;
    image_path: string;
    sort_order: number;
  }[];
};

type Category = { id: number; name: string; slug: string };
type Meta = { page: number; limit: number; total: number; totalPages: number };

const initialMeta: Meta = { page: 1, limit: 20, total: 0, totalPages: 0 };

const mapProduct = (product: ApiProduct): Product => ({
  id: product.id,
  name: product.name,
  shortDescription: product.short_description ?? "",
  description: product.description ?? "",
  price: Number(product.price),
  stock: product.stock,
  category_name: product.category_name,
  category_id: product.category_id,
  status: product.status,
  sizes: product.sizes ?? [],
  colors: product.colors ?? [],
  images: product.images ?? {},
  image_gallery: product.image_gallery ?? [],
});

const ProductsPage = () => {
  const token = useAuthStore((state) => state.token);
  const [data, setData] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search.trim());
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("newest");
  const [meta, setMeta] = useState<Meta>(initialMeta);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const query = new URLSearchParams({
      admin: "1",
      page: String(page),
      limit: String(pageSize),
      sort,
    });
    if (deferredSearch) query.set("search", deferredSearch);
    if (category !== "all") query.set("category", category);
    if (status !== "all") query.set("status", status);

    try {
      const response = await apiFetch<ApiProduct[]>(
        `/products?${query.toString()}`,
        { token },
      );
      setData(response.data.map(mapProduct));
      const nextMeta = response.meta ?? initialMeta;
      setMeta(nextMeta);
      if (nextMeta.totalPages > 0 && page > nextMeta.totalPages) {
        setPage(nextMeta.totalPages);
      }
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : "Không thể tải sản phẩm.",
      );
    } finally {
      setLoading(false);
    }
  }, [token, page, pageSize, deferredSearch, category, status, sort]);

  useEffect(() => {
    apiFetch<Category[]>("/categories")
      .then((response) => setCategories(response.data))
      .catch(() => toast.error("Không thể tải danh mục."));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    window.addEventListener("roxbusi:products-changed", load);
    return () => window.removeEventListener("roxbusi:products-changed", load);
  }, [load]);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await apiFetch(`/products/${deleteTarget.id}`, {
        method: "DELETE",
        token,
      });
      toast.success("Đã xóa sản phẩm và dọn ảnh tải lên.");
      setDeleteTarget(null);
      await load();
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : "Không thể xóa sản phẩm.",
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleBulkDelete = async (products: Product[]) => {
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

  const resetPage = (action: () => void) => {
    setPage(1);
    action();
  };

  return (
    <div className="space-y-6 py-2">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Danh mục hàng hóa
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            Sản phẩm
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Quản lý thông tin, tồn kho và thư viện ảnh của{" "}
            {meta.total.toLocaleString("vi-VN")} sản phẩm.
          </p>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button>
              <Plus className="h-4 w-4" /> Thêm sản phẩm
            </Button>
          </SheetTrigger>
          <AddProduct />
        </Sheet>
      </div>

      <div className="rounded-xl border bg-card p-3 shadow-sm sm:p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative min-w-0 flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) =>
                resetPage(() => setSearch(event.target.value))
              }
              placeholder="Tìm theo tên, danh mục hoặc mã sản phẩm..."
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <SlidersHorizontal className="hidden h-4 w-4 text-muted-foreground sm:block" />
            <select
              value={category}
              onChange={(event) =>
                resetPage(() => setCategory(event.target.value))
              }
              aria-label="Lọc theo danh mục"
              className="h-9 min-w-36 rounded-md border bg-background px-3 text-sm outline-none focus:border-ring"
            >
              <option value="all">Mọi danh mục</option>
              {categories.map((item) => (
                <option key={item.id} value={item.slug}>
                  {item.name}
                </option>
              ))}
            </select>
            <select
              value={status}
              onChange={(event) =>
                resetPage(() => setStatus(event.target.value))
              }
              aria-label="Lọc theo trạng thái"
              className="h-9 min-w-32 rounded-md border bg-background px-3 text-sm outline-none focus:border-ring"
            >
              <option value="all">Mọi trạng thái</option>
              <option value="active">Đang bán</option>
              <option value="draft">Bản nháp</option>
            </select>
            <select
              value={sort}
              onChange={(event) => resetPage(() => setSort(event.target.value))}
              aria-label="Sắp xếp sản phẩm"
              className="h-9 min-w-36 rounded-md border bg-background px-3 text-sm outline-none focus:border-ring"
            >
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
              <option value="asc">Giá tăng dần</option>
              <option value="desc">Giá giảm dần</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 rounded-xl border py-16 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Đang tải sản phẩm...
        </div>
      ) : (
        <DataTable
          columns={getColumns(setDeleteTarget, load)}
          data={data}
          page={meta.page}
          pageSize={pageSize}
          total={meta.total}
          totalPages={meta.totalPages}
          onPageChange={setPage}
          onPageSizeChange={(size) => resetPage(() => setPageSize(size))}
          onDeleteSelected={handleBulkDelete}
        />
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={`Xóa “${deleteTarget?.name ?? "sản phẩm"}”?`}
        description="Sản phẩm, liên kết yêu thích và toàn bộ ảnh tải lên đi kèm sẽ bị xóa. Thao tác này không thể hoàn tác."
        confirmLabel="Xóa sản phẩm"
        pending={deleting}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default ProductsPage;
