"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onDeleteSelected?: (rows: TData[]) => Promise<void>;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  page,
  pageSize,
  total,
  totalPages,
  onPageChange,
  onPageSizeChange,
  onDeleteSelected,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = useState({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onRowSelectionChange: setRowSelection,
    state: { rowSelection },
  });

  useEffect(() => {
    table.resetRowSelection();
  }, [data, table]);

  const selectedRows = table
    .getSelectedRowModel()
    .rows.map((row) => row.original);

  const confirmBulkDelete = async () => {
    if (!onDeleteSelected || selectedRows.length === 0) return;
    setBulkDeleting(true);
    try {
      await onDeleteSelected(selectedRows);
      setConfirmOpen(false);
      table.resetRowSelection();
    } finally {
      setBulkDeleting(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      {selectedRows.length > 0 && (
        <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-3">
          <span className="text-sm text-muted-foreground">
            Đã chọn {selectedRows.length} sản phẩm trên trang này
          </span>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            disabled={!onDeleteSelected}
            onClick={() => setConfirmOpen(true)}
          >
            <Trash2 className="h-4 w-4" /> Xóa đã chọn
          </Button>
        </div>
      )}

      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/40">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="whitespace-nowrap">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-muted/25"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center text-muted-foreground"
                >
                  Không có sản phẩm phù hợp với bộ lọc.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Tổng {total.toLocaleString("vi-VN")} sản phẩm
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-sm">
            <span className="hidden sm:inline">Số dòng</span>
            <Select
              value={String(pageSize)}
              onValueChange={(value) => onPageSizeChange(Number(value))}
            >
              <SelectTrigger className="h-8 w-[72px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 50, 100].map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <span className="min-w-24 text-center text-sm font-medium">
            Trang {Math.min(page, Math.max(totalPages, 1))}/
            {Math.max(totalPages, 1)}
          </span>
          <div className="flex gap-2">
            <Button
              type="button"
              size="icon"
              variant="outline"
              className="h-8 w-8"
              disabled={page <= 1}
              aria-label="Trang trước"
              onClick={() => onPageChange(page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="outline"
              className="h-8 w-8"
              disabled={page >= totalPages}
              aria-label="Trang sau"
              onClick={() => onPageChange(page + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={`Xóa ${selectedRows.length} sản phẩm?`}
        description="Ảnh tải lên của các sản phẩm này cũng sẽ được dọn khỏi máy chủ. Thao tác không thể hoàn tác."
        confirmLabel="Xóa sản phẩm"
        pending={bulkDeleting}
        onConfirm={confirmBulkDelete}
      />
    </div>
  );
}
