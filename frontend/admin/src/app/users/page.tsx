"use client";

import { useCallback, useEffect, useState } from "react";
import { User, getColumns } from "./columns";
import { DataTable } from "./data-table";
import useAuthStore from "@/stores/authStore";
import { apiFetch, apiFetchAll, ApiError, resolveImageUrl } from "@/lib/api";
import { toast } from "react-toastify";
import { Loader2 } from "lucide-react";

type ApiUser = {
  id: number;
  name: string;
  email: string;
  role: "admin" | "customer";
  status: "active" | "blocked";
  avatar: string | null;
};

const mapUser = (u: ApiUser): User => ({
  id: String(u.id),
  fullName: u.name,
  email: u.email,
  role: u.role,
  status: u.status,
  avatar: u.avatar ? resolveImageUrl(u.avatar) : null,
});

const UsersPage = () => {
  const { token } = useAuthStore();
  const [data, setData] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const users = await apiFetchAll<ApiUser>("/users?limit=100", { token });
      setData(users.map(mapUser));
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Không thể tải người dùng.",
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    window.addEventListener("roxbusi:users-changed", load);
    return () => window.removeEventListener("roxbusi:users-changed", load);
  }, [load]);

  const handleDelete = async (user: User) => {
    if (!confirm(`Xóa “${user.fullName}”? Thao tác này không thể hoàn tác.`))
      return;
    try {
      await apiFetch(`/users/${user.id}`, { method: "DELETE", token });
      toast.success("Đã xóa người dùng.");
      setData((prev) => prev.filter((u) => u.id !== user.id));
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Không thể xóa người dùng.",
      );
    }
  };

  const handleBulkDelete = async (users: User[]) => {
    if (!confirm(`Xóa ${users.length} người dùng đã chọn?`)) return;
    const results = await Promise.allSettled(
      users.map((user) =>
        apiFetch(`/users/${user.id}`, { method: "DELETE", token }),
      ),
    );
    const failed = results.filter(
      (result) => result.status === "rejected",
    ).length;
    await load();
    if (failed)
      toast.error(
        `Không thể xóa ${failed} người dùng (tài khoản đang đăng nhập sẽ được bảo vệ).`,
      );
    else toast.success(`Đã xóa ${users.length} người dùng.`);
  };

  return (
    <div className="py-4">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          Tất cả người dùng
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Có {data.length} tài khoản đã đăng ký.
        </p>
      </div>
      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground py-12 justify-center">
          <Loader2 className="w-4 h-4 animate-spin" /> Đang tải người dùng...
        </div>
      ) : (
        <DataTable
          columns={getColumns(handleDelete)}
          data={data}
          onDeleteSelected={handleBulkDelete}
        />
      )}
    </div>
  );
};

export default UsersPage;
