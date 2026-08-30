"use client";

import { useCallback, useEffect, useState } from "react";
import { Payment, getColumns } from "./columns";
import { DataTable } from "./data-table";
import useAuthStore from "@/stores/authStore";
import { apiFetch, apiFetchAll, ApiError } from "@/lib/api";
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
const statusLabels: Record<Payment["status"], string> = {
  pending: "Chờ xác nhận",
  processing: "Đang xử lý",
  success: "Hoàn tất",
  failed: "Thất bại",
  cancelled: "Đã hủy",
};

const PaymentsPage = () => {
  const { token } = useAuthStore();
  const [data, setData] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const orders = await apiFetchAll<ApiOrder>("/orders?limit=100", {
        token,
      });
      setData(orders.map(mapOrder));
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Không thể tải đơn hàng.",
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    window.addEventListener("roxbusi:orders-changed", load);
    return () => window.removeEventListener("roxbusi:orders-changed", load);
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
      toast.success(
        `Đơn #${payment.id} đã chuyển sang “${statusLabels[status]}”.`,
      );
    } catch (err) {
      setData(previous);
      toast.error(
        err instanceof ApiError ? err.message : "Không thể cập nhật đơn hàng.",
      );
    }
  };

  const handleDelete = async (payment: Payment) => {
    if (
      !confirm(`Xóa đơn hàng #${payment.id}? Thao tác này không thể hoàn tác.`)
    )
      return;
    try {
      await apiFetch(`/orders/${payment.id}`, { method: "DELETE", token });
      toast.success("Đã xóa đơn hàng.");
      setData((prev) => prev.filter((p) => p.id !== payment.id));
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Không thể xóa đơn hàng.",
      );
    }
  };

  const handleBulkDelete = async (payments: Payment[]) => {
    if (!confirm(`Xóa ${payments.length} đơn hàng đã chọn?`)) return;
    const results = await Promise.allSettled(
      payments.map((payment) =>
        apiFetch(`/orders/${payment.id}`, { method: "DELETE", token }),
      ),
    );
    const failed = results.filter(
      (result) => result.status === "rejected",
    ).length;
    await load();
    if (failed) toast.error(`Không thể xóa ${failed} đơn hàng.`);
    else toast.success(`Đã xóa ${payments.length} đơn hàng.`);
  };

  return (
    <div className="py-4">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          Tất cả đơn hàng
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Có {data.length} đơn hàng được ghi nhận.
        </p>
      </div>
      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground py-12 justify-center">
          <Loader2 className="w-4 h-4 animate-spin" /> Đang tải đơn hàng...
        </div>
      ) : (
        <DataTable
          columns={getColumns(handleStatusChange, handleDelete)}
          data={data}
          onDeleteSelected={handleBulkDelete}
        />
      )}
    </div>
  );
};

export default PaymentsPage;
