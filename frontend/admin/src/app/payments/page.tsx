"use client";

import { useCallback, useEffect, useState } from "react";
import { Payment, getColumns } from "./columns";
import { DataTable } from "./data-table";
import useAuthStore from "@/stores/authStore";
import { apiFetch, ApiError } from "@/lib/api";
import { toast } from "react-toastify";
import { Loader2 } from "lucide-react";

type ApiOrder = {
  id: number;
  status: Payment["status"];
  total: number;
  shipping_name: string;
  shipping_email: string;
};

const mapOrder = (o: ApiOrder): Payment => ({
  id: String(o.id),
  fullName: o.shipping_name,
  email: o.shipping_email,
  status: o.status,
  amount: Number(o.total),
});

const PaymentsPage = () => {
  const { token } = useAuthStore();
  const [data, setData] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch<ApiOrder[]>("/orders?limit=100", { token });
      setData(res.data.map(mapOrder));
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Failed to load orders.",
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const handleStatusChange = async (
    payment: Payment,
    status: Payment["status"],
  ) => {
    const previous = data;
    setData((prev) =>
      prev.map((p) => (p.id === payment.id ? { ...p, status } : p)),
    );
    try {
      await apiFetch(`/orders/${payment.id}`, {
        method: "PUT",
        token,
        body: { status },
      });
      toast.success(`Order #${payment.id} marked as ${status}.`);
    } catch (err) {
      setData(previous);
      toast.error(
        err instanceof ApiError ? err.message : "Failed to update order.",
      );
    }
  };

  const handleDelete = async (payment: Payment) => {
    if (!confirm(`Delete order #${payment.id}? This cannot be undone.`)) return;
    try {
      await apiFetch(`/orders/${payment.id}`, { method: "DELETE", token });
      toast.success("Order deleted.");
      setData((prev) => prev.filter((p) => p.id !== payment.id));
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Failed to delete order.",
      );
    }
  };

  return (
    <div className="py-4">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">All Payments</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {data.length} transactions recorded.
        </p>
      </div>
      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground py-12 justify-center">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading orders...
        </div>
      ) : (
        <DataTable
          columns={getColumns(handleStatusChange, handleDelete)}
          data={data}
        />
      )}
    </div>
  );
};

export default PaymentsPage;
