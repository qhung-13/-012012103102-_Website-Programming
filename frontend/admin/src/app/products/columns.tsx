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
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import Image from "next/image";
import { resolveImageUrl } from "@/lib/api";
import { Sheet } from "@/components/ui/sheet";
import EditProduct from "@/components/forms/EditProduct";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import type { ProductGalleryImage } from "@/components/forms/ProductImageManager";

export type Product = {
  id: string | number;
  price: number;
  name: string;
  shortDescription: string;
  description: string;
  stock: number;
  category_name: string | null;
  sizes: string[];
  colors: string[];
  images: Record<string, string>;
  image_gallery: ProductGalleryImage[];
  category_id: number | null;
  status: "active" | "draft";
};

const ProductActions = ({
  product,
  onDelete,
  onUpdated,
}: {
  product: Product;
  onDelete: (product: Product) => void;
  onUpdated: () => void;
}) => {
  const [editOpen, setEditOpen] = useState(false);

  return (
    <>
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
            onClick={() => navigator.clipboard.writeText(product.id.toString())}
          >
            Sao chép mã sản phẩm
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => setEditOpen(true)}>
            Sửa sản phẩm
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            onClick={() => onDelete(product)}
          >
            Xóa sản phẩm
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Sheet open={editOpen} onOpenChange={setEditOpen}>
        <EditProduct product={product} onUpdated={onUpdated} />
      </Sheet>
    </>
  );
};

export const getColumns = (
  onDelete: (product: Product) => void,
  onUpdated: () => void,
): ColumnDef<Product>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        aria-label="Chọn tất cả sản phẩm trên trang"
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        aria-label={`Chọn sản phẩm ${row.original.name}`}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        checked={row.getIsSelected()}
      />
    ),
  },
  {
    accessorKey: "image",
    header: "Ảnh",
    cell: ({ row }) => {
      const product = row.original;
      const firstImage =
        product.images[product.colors[0]] ?? Object.values(product.images)[0];
      return (
        <div className="relative h-11 w-11 overflow-hidden rounded-lg border bg-muted">
          <Image
            src={resolveImageUrl(firstImage)}
            alt={product.name}
            fill
            className="object-cover"
          />
        </div>
      );
    },
  },
  {
    accessorKey: "name",
    header: "Tên",
    cell: ({ row }) => (
      <div className="min-w-44">
        <p className="font-medium">{row.original.name}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          #{row.original.id} · {row.original.image_gallery.length} ảnh
        </p>
      </div>
    ),
  },
  {
    accessorKey: "category_name",
    header: "Danh mục",
    cell: ({ row }) => row.original.category_name ?? "—",
  },
  {
    accessorKey: "price",
    header: "Giá",
    cell: ({ row }) => `$${Number(row.original.price).toFixed(2)}`,
  },
  {
    accessorKey: "stock",
    header: "Tồn kho",
  },
  {
    accessorKey: "status",
    header: "Trạng thái",
    cell: ({ row }) => (
      <Badge
        variant={row.original.status === "active" ? "default" : "secondary"}
      >
        {row.original.status === "active" ? "Đang bán" : "Bản nháp"}
      </Badge>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const product = row.original;

      return (
        <ProductActions
          product={product}
          onDelete={onDelete}
          onUpdated={onUpdated}
        />
      );
    },
  },
];
