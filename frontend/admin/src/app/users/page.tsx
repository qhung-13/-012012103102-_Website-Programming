"use client";

import { useCallback, useEffect, useState } from "react";
import { User, getColumns } from "./columns";
import { DataTable } from "./data-table";
import useAuthStore from "@/stores/authStore";
import { apiFetch, apiFetchAll, ApiError, resolveImageUrl } from "@/lib/api";
import { toast } from "react-toastify";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import AddUser from "@/components/forms/AddUser";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

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
  const [deleteTargets, setDeleteTargets] = useState<User[]>([]);
  const [deleting, setDeleting] = useState(false);

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

  const handleDelete = (user: User) => setDeleteTargets([user]);

  const handleBulkDelete = async (users: User[]) => {
    setDeleteTargets(users);
  };

  const confirmDelete = async () => {
    if (deleteTargets.length === 0) return;
    setDeleting(true);
    const results = await Promise.allSettled(
      deleteTargets.map((user) =>
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
    else toast.success(`Đã xóa ${deleteTargets.length} người dùng.`);
    setDeleteTargets([]);
    setDeleting(false);
  };

  return (
    <div className="py-4">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Người dùng</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Có {data.length} tài khoản đã đăng ký.
          </p>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button>
              <Plus className="h-4 w-4" /> Thêm người dùng
            </Button>
          </SheetTrigger>
          <AddUser onCreated={load} />
        </Sheet>
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
      <ConfirmDialog
        open={deleteTargets.length > 0}
        onOpenChange={(open) => !open && setDeleteTargets([])}
        title={
          deleteTargets.length === 1
            ? `Xóa “${deleteTargets[0]?.fullName}”?`
            : `Xóa ${deleteTargets.length} người dùng?`
        }
        description="Tài khoản và dữ liệu liên quan sẽ bị xóa. Tài khoản quản trị đang đăng nhập vẫn được backend bảo vệ."
        confirmLabel="Xóa người dùng"
        pending={deleting}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default UsersPage;
