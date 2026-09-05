"use client";

import { useCallback, useEffect, useState } from "react";
import { Payment, getColumns } from "./columns";
import { DataTable } from "./data-table";
import useAuthStore from "@/stores/authStore";
import { apiFetch, apiFetchAll, ApiError } from "@/lib/api";
import { toast } from "react-toastify";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import AddOrder from "@/components/forms/AddOrder";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

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
  const [deleteTargets, setDeleteTargets] = useState<Payment[]>([]);
  const [deleting, setDeleting] = useState(false);

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

  const handleDelete = (payment: Payment) => setDeleteTargets([payment]);

  const handleBulkDelete = async (payments: Payment[]) => {
    setDeleteTargets(payments);
  };

  const confirmDelete = async () => {
    if (deleteTargets.length === 0) return;
    setDeleting(true);
    const results = await Promise.allSettled(
      deleteTargets.map((payment) =>
        apiFetch(`/orders/${payment.id}`, { method: "DELETE", token }),
      ),
    );
    const failed = results.filter(
      (result) => result.status === "rejected",
    ).length;
    await load();
    if (failed) toast.error(`Không thể xóa ${failed} đơn hàng.`);
    else toast.success(`Đã xóa ${deleteTargets.length} đơn hàng.`);
    setDeleteTargets([]);
    setDeleting(false);
  };

  return (
    <div className="py-4">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Đơn hàng</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Có {data.length} đơn hàng được ghi nhận.
          </p>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button>
              <Plus className="h-4 w-4" /> Thêm đơn hàng
            </Button>
          </SheetTrigger>
          <AddOrder onCreated={load} />
        </Sheet>
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
      <ConfirmDialog
        open={deleteTargets.length > 0}
        onOpenChange={(open) => !open && setDeleteTargets([])}
        title={
          deleteTargets.length === 1
            ? `Xóa đơn hàng #${deleteTargets[0]?.id}?`
            : `Xóa ${deleteTargets.length} đơn hàng?`
        }
        description="Tồn kho sẽ được hoàn lại cho đơn đang chờ hoặc đang xử lý. Thao tác xóa không thể hoàn tác."
        confirmLabel="Xóa đơn hàng"
        pending={deleting}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default PaymentsPage;
