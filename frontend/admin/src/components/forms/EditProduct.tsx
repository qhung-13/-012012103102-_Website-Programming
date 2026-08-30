"use client";

import {
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import useAuthStore from "@/stores/authStore";
import { apiFetch, ApiError } from "@/lib/api";
import { toast } from "react-toastify";

const schema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Tên sản phẩm phải có ít nhất 2 ký tự.")
    .max(200),
  shortDescription: z.string().max(500, "Mô tả ngắn quá dài."),
  description: z.string().max(50000, "Mô tả chi tiết quá dài."),
  price: z
    .number()
    .min(0, "Giá không được âm.")
    .max(99999999.99, "Giá vượt quá giới hạn."),
  stock: z
    .number()
    .int()
    .min(0, "Tồn kho không được âm.")
    .max(4294967295, "Tồn kho vượt quá giới hạn."),
  categoryId: z.string(),
  status: z.enum(["active", "draft"]),
});

type EditableProduct = {
  id: string | number;
  name: string;
  shortDescription: string;
  description: string;
  price: number;
  stock: number;
  category_id: number | null;
  status: "active" | "draft";
};

const EditProduct = ({
  product,
  onUpdated,
}: {
  product: EditableProduct;
  onUpdated?: () => void;
}) => {
  const token = useAuthStore((state) => state.token);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>(
    [],
  );
  const closeRef = useRef<HTMLButtonElement>(null);
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: product.name,
      shortDescription: product.shortDescription,
      description: product.description,
      price: product.price,
      stock: product.stock,
      categoryId: product.category_id ? String(product.category_id) : "none",
      status: product.status,
    },
  });

  useEffect(() => {
    apiFetch<{ id: number; name: string }[]>("/categories")
      .then((response) => setCategories(response.data))
      .catch(() => toast.error("Không thể tải danh mục."));
  }, []);

  const onSubmit = async (values: z.infer<typeof schema>) => {
    try {
      await apiFetch(`/products/${product.id}`, {
        method: "PUT",
        token,
        body: {
          name: values.name,
          short_description: values.shortDescription,
          description: values.description,
          price: values.price,
          stock: values.stock,
          category_id:
            values.categoryId === "none" ? null : Number(values.categoryId),
          status: values.status,
        },
      });
      toast.success("Đã cập nhật sản phẩm.");
      onUpdated?.();
      window.dispatchEvent(new Event("roxbusi:products-changed"));
      closeRef.current?.click();
    } catch (error) {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Không thể cập nhật sản phẩm.",
      );
    }
  };

  return (
    <SheetContent className="overflow-y-auto">
      <ScrollArea className="h-screen pr-4">
        <SheetHeader>
          <SheetTitle>Sửa sản phẩm</SheetTitle>
          <SheetDescription>
            Cập nhật thông tin bán hàng; ảnh và biến thể hiện tại được giữ
            nguyên.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-5 mt-6 pb-8"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên sản phẩm</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="shortDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả ngắn</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả chi tiết</FormLabel>
                  <FormControl>
                    <Textarea rows={5} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Giá (USD)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        onChange={(event) =>
                          field.onChange(parseFloat(event.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tồn kho</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(event) =>
                          field.onChange(parseInt(event.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Danh mục</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">Chưa phân loại</SelectItem>
                      {categories.map((category) => (
                        <SelectItem
                          key={category.id}
                          value={String(category.id)}
                        >
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Trạng thái</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active">Đang bán</SelectItem>
                      <SelectItem value="draft">Bản nháp</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </form>
        </Form>
      </ScrollArea>
      <SheetClose ref={closeRef} className="hidden" />
    </SheetContent>
  );
};

export default EditProduct;
