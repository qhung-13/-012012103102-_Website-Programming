"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch, ApiError } from "@/lib/api";
import useAuthStore from "@/stores/authStore";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import BlogEditor from "@/components/forms/BlogEditor";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";

type BlogRow = {
  id: number;
  title: string;
  slug: string;
  category: string | null;
  status: "draft" | "published";
  published_at: string | null;
  created_at: string;
};

export default function BlogAdminPage() {
  const token = useAuthStore((state) => state.token);
  const [posts, setPosts] = useState<BlogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    setLoading(true);
    try {
      setPosts((await apiFetch<BlogRow[]>("/blog-admin", { token })).data);
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : "Không thể tải bài viết.",
      );
    } finally {
      setLoading(false);
    }
  }, [token]);
  useEffect(() => {
    load();
  }, [load]);
  useEffect(() => {
    window.addEventListener("roxbusi:blog-changed", load);
    return () => window.removeEventListener("roxbusi:blog-changed", load);
  }, [load]);

  const remove = async (post: BlogRow) => {
    if (!confirm(`Xóa bài viết “${post.title}”?`)) return;
    try {
      await apiFetch(`/blog/${post.id}`, { method: "DELETE", token });
      toast.success("Đã xóa bài viết.");
      setPosts((items) => items.filter((item) => item.id !== post.id));
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : "Không thể xóa bài viết.",
      );
    }
  };

  return (
    <div className="py-4">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Bài viết</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Quản lý bài nháp và nội dung đã xuất bản trên cửa hàng.
          </p>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button>
              <Plus className="w-4 h-4" /> Thêm bài viết
            </Button>
          </SheetTrigger>
          <BlogEditor onSaved={load} />
        </Sheet>
      </div>
      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" /> Đang tải bài viết...
        </div>
      ) : posts.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted-foreground">
          Chưa có bài viết.
        </p>
      ) : (
        <div className="border rounded-xl overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3">Tiêu đề</th>
                <th className="text-left p-3">Chuyên mục</th>
                <th className="text-left p-3">Trạng thái</th>
                <th className="text-left p-3">Ngày tạo</th>
                <th className="p-3">
                  <span className="sr-only">Thao tác</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id} className="border-t">
                  <td className="p-3 min-w-64">
                    <p className="font-medium">{post.title}</p>
                    <p className="font-mono text-xs text-muted-foreground">
                      {post.slug}
                    </p>
                  </td>
                  <td className="p-3">{post.category || "—"}</td>
                  <td className="p-3">
                    {post.status === "published" ? "Đã xuất bản" : "Bản nháp"}
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    {new Date(post.created_at).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="p-3">
                    <div className="flex justify-end gap-2">
                      <Sheet>
                        <SheetTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            aria-label={`Sửa ${post.title}`}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                        </SheetTrigger>
                        <BlogEditor postId={post.id} onSaved={load} />
                      </Sheet>
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label={`Xóa ${post.title}`}
                        onClick={() => remove(post)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
