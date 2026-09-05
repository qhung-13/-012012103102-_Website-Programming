"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch, ApiError } from "@/lib/api";
import useAuthStore from "@/stores/authStore";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import AddCategory from "@/components/forms/AddCategory";
import { Loader2, Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

type Category = {
  id: number;
  name: string;
  slug: string;
  product_count: number | string;
};

export default function CategoriesPage() {
  const token = useAuthStore((state) => state.token);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setCategories((await apiFetch<Category[]>("/categories")).data);
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : "Không thể tải danh mục.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);
  useEffect(() => {
    window.addEventListener("roxbusi:categories-changed", load);
    return () => window.removeEventListener("roxbusi:categories-changed", load);
  }, [load]);

  const save = async (category: Category) => {
    if (editingName.trim().length < 2)
      return toast.error("Tên danh mục phải có ít nhất 2 ký tự.");
    try {
      await apiFetch(`/categories/${category.id}`, {
        method: "PUT",
        token,
        body: { name: editingName.trim() },
      });
      toast.success("Đã cập nhật danh mục.");
      setEditingId(null);
      await load();
    } catch (error) {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Không thể cập nhật danh mục.",
      );
    }
  };

  const remove = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await apiFetch(`/categories/${deleteTarget.id}`, {
        method: "DELETE",
        token,
      });
      toast.success("Đã xóa danh mục.");
      setCategories((items) =>
        items.filter((item) => item.id !== deleteTarget.id),
      );
      setDeleteTarget(null);
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : "Không thể xóa danh mục.",
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="py-4">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Danh mục sản phẩm
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Quản lý tên và đường dẫn của từng nhóm sản phẩm.
          </p>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button>
              <Plus className="w-4 h-4" /> Thêm danh mục
            </Button>
          </SheetTrigger>
          <AddCategory onCreated={load} />
        </Sheet>
      </div>
      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" /> Đang tải danh mục...
        </div>
      ) : categories.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-16">
          Chưa có danh mục.
        </p>
      ) : (
        <div className="border rounded-xl overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3">Tên</th>
                <th className="text-left p-3">Đường dẫn</th>
                <th className="text-right p-3">Sản phẩm</th>
                <th className="p-3">
                  <span className="sr-only">Thao tác</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id} className="border-t">
                  <td className="p-3 min-w-56">
                    {editingId === category.id ? (
                      <Input
                        value={editingName}
                        onChange={(event) => setEditingName(event.target.value)}
                        autoFocus
                      />
                    ) : (
                      category.name
                    )}
                  </td>
                  <td className="p-3 font-mono text-xs text-muted-foreground">
                    {category.slug}
                  </td>
                  <td className="p-3 text-right">
                    {Number(category.product_count).toLocaleString("vi-VN")}
                  </td>
                  <td className="p-3">
                    <div className="flex justify-end gap-2">
                      {editingId === category.id ? (
                        <>
                          <Button
                            size="icon"
                            variant="outline"
                            aria-label="Lưu danh mục"
                            onClick={() => save(category)}
                          >
                            <Save className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            aria-label="Hủy sửa"
                            onClick={() => setEditingId(null)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            size="icon"
                            variant="ghost"
                            aria-label={`Sửa ${category.name}`}
                            onClick={() => {
                              setEditingId(category.id);
                              setEditingName(category.name);
                            }}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            aria-label={`Xóa ${category.name}`}
                            onClick={() => setDeleteTarget(category)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={`Xóa “${deleteTarget?.name ?? "danh mục"}”?`}
        description="Sản phẩm vẫn được giữ lại và sẽ chuyển sang trạng thái chưa phân loại."
        confirmLabel="Xóa danh mục"
        pending={deleting}
        onConfirm={remove}
      />
    </div>
  );
}
