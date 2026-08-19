"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";

export type Payment = {
  id: string;
  amount: number;
  fullName: string;
  email: string;
  status: "pending" | "processing" | "success" | "failed" | "cancelled";
};

const statusColor: Record<Payment["status"], string> = {
  pending: "bg-yellow-500/40",
  processing: "bg-blue-500/40",
  success: "bg-green-500/40",
  failed: "bg-red-500/40",
  cancelled: "bg-gray-400/40",
};
const statusLabels: Record<Payment["status"], string> = {
  pending: "Chờ xác nhận",
  processing: "Đang xử lý",
  success: "Hoàn tất",
  failed: "Thất bại",
  cancelled: "Đã hủy",
};

export const getColumns = (
  onStatusChange: (payment: Payment, status: Payment["status"]) => void,
  onDelete: (payment: Payment) => void,
): ColumnDef<Payment>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        aria-label="Chọn tất cả đơn hàng trên trang"
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        aria-label={`Chọn đơn hàng ${row.original.id}`}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        checked={row.getIsSelected()}
      />
    ),
  },
  {
    accessorKey: "fullName",
    header: "Khách hàng",
  },
  {
    accessorKey: "email",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Email
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Trạng thái",
    cell: ({ row }) => {
      const payment = row.original;
      return (
        <Select
          value={payment.status}
          onValueChange={(value) =>
            onStatusChange(payment, value as Payment["status"])
          }
        >
          <SelectTrigger
            className={cn(
              "h-7 w-[130px] text-xs capitalize",
              statusColor[payment.status],
            )}
          >
            <SelectValue>{statusLabels[payment.status]}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Chờ xác nhận</SelectItem>
            <SelectItem value="processing">Đang xử lý</SelectItem>
            <SelectItem value="success">Hoàn tất</SelectItem>
            <SelectItem value="failed">Thất bại</SelectItem>
            <SelectItem value="cancelled">Đã hủy</SelectItem>
          </SelectContent>
        </Select>
      );
    },
  },
  {
    accessorKey: "amount",
    header: () => <div className="text-right">Tổng tiền</div>,
    cell: ({ row }) => {
      const amount = row.original.amount;
      const formatted = new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "USD",
      }).format(amount);

      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const payment = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Mở menu thao tác</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(payment.id)}
            >
              Sao chép mã đơn hàng
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => onDelete(payment)}
            >
              Xóa đơn hàng
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
