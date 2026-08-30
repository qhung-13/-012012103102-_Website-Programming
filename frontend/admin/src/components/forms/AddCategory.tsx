"use client";

import {
  SheetContent,
  SheetClose,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import useAuthStore from "@/stores/authStore";
import { apiFetch, ApiError } from "@/lib/api";
import { toast } from "react-toastify";
import { useRef } from "react";

const formSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: "Tên danh mục phải có ít nhất 2 ký tự." })
    .max(100, "Tên danh mục quá dài."),
});

const AddCategory = ({ onCreated }: { onCreated?: () => void }) => {
  const { token } = useAuthStore();
  const closeRef = useRef<HTMLButtonElement>(null);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "" },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await apiFetch("/categories", {
        method: "POST",
        token,
        body: values,
      });
      toast.success("Đã tạo danh mục.");
      form.reset();
      onCreated?.();
      window.dispatchEvent(new Event("roxbusi:categories-changed"));
      closeRef.current?.click();
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Không thể tạo danh mục.",
      );
    }
  };

  return (
    <SheetContent>
      <SheetHeader>
        <SheetTitle className="mb-4">Thêm danh mục</SheetTitle>
        <SheetDescription>
          Tạo một nhóm sản phẩm mới cho cửa hàng.
        </SheetDescription>
      </SheetHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 mt-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tên danh mục</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormDescription>
                  Nhập tên hiển thị của danh mục.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Đang lưu..." : "Tạo danh mục"}
          </Button>
        </form>
      </Form>
      <SheetClose ref={closeRef} className="hidden" />
    </SheetContent>
  );
};

export default AddCategory;
