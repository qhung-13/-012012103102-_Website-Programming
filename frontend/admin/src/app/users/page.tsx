"use client";

import { useCallback, useEffect, useState } from "react";
import { User, getColumns } from "./columns";
import { DataTable } from "./data-table";
import useAuthStore from "@/stores/authStore";
import { apiFetch, ApiError } from "@/lib/api";
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
  avatar:
    u.avatar ??
    `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=d8a93a&color=171416`,
});

const UsersPage = () => {
  const { token } = useAuthStore();
  const [data, setData] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch<ApiUser[]>("/users?limit=100", { token });
      setData(res.data.map(mapUser));
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Failed to load users.",
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (user: User) => {
    if (!confirm(`Delete "${user.fullName}"? This cannot be undone.`)) return;
    try {
      await apiFetch(`/users/${user.id}`, { method: "DELETE", token });
      toast.success("User deleted.");
      setData((prev) => prev.filter((u) => u.id !== user.id));
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Failed to delete user.",
      );
    }
  };

  return (
    <div className="py-4">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">All Users</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {data.length} registered users.
        </p>
      </div>
      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground py-12 justify-center">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading users...
        </div>
      ) : (
        <DataTable columns={getColumns(handleDelete)} data={data} />
      )}
    </div>
  );
};

export default UsersPage;
