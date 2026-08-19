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
import { cn } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export type User = {
  id: string;
  avatar: string | null;
  fullName: string;
  email: string;
  role: "admin" | "customer";
  status: "active" | "blocked";
};

export const getColumns = (
  onDelete: (user: User) => void,
): ColumnDef<User>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        aria-label="Chọn tất cả người dùng trên trang"
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        aria-label={`Chọn người dùng ${row.original.fullName}`}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        checked={row.getIsSelected()}
      />
    ),
  },
  {
    accessorKey: "avatar",
    header: "Ảnh đại diện",
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="w-9 h-9 relative">
          {user.avatar ? (
            <Image
              src={user.avatar}
              alt={user.fullName}
              fill
              className="rounded-full object-cover"
            />
          ) : (
            <div className="w-full h-full rounded-full bg-gold/30 flex items-center justify-center text-xs font-medium">
              {user.fullName.trim().charAt(0).toUpperCase() || "?"}
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "fullName",
    header: "Người dùng",
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
    accessorKey: "role",
    header: "Vai trò",
    cell: ({ row }) => (
      <div
        className={cn(
          "p-1 rounded-md w-max text-xs capitalize",
          row.original.role === "admin" ? "bg-gold/30" : "bg-muted",
        )}
      >
        {row.original.role === "admin" ? "Quản trị viên" : "Khách hàng"}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Trạng thái",
    cell: ({ row }) => {
      const status = row.getValue("status");

      return (
        <div
          className={cn(
            `p-1 rounded-md w-max text-xs capitalize`,
            status === "active" && "bg-green-500/40",
            status === "blocked" && "bg-red-500/40",
          )}
        >
          {status === "active" ? "Hoạt động" : "Đã khóa"}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original;

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
              onClick={() => navigator.clipboard.writeText(user.id)}
            >
              Sao chép mã người dùng
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/users/${user.id}`}>Xem chi tiết</Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onClick={() => onDelete(user)}
            >
              Xóa người dùng
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
