"use client";

import {
  SheetClose,
  SheetContent,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRef } from "react";
import useAuthStore from "@/stores/authStore";
import { apiFetch, ApiError } from "@/lib/api";
import { toast } from "react-toastify";

const formSchema = z.object({
  fullName: z
    .string()
    .min(2, { message: "Họ tên phải có ít nhất 2 ký tự." })
    .max(150, "Họ tên quá dài."),
  phone: z
    .string()
    .regex(/^$|^[0-9+() .-]{8,20}$/, "Số điện thoại không hợp lệ.")
    .optional(),
  address: z.string().max(255, "Địa chỉ quá dài.").optional(),
  role: z.enum(["admin", "customer"]),
  status: z.enum(["active", "blocked"]),
  password: z
    .string()
    .max(72, "Mật khẩu quá dài.")
    .refine(
      (value) => value === "" || value.length >= 8,
      "Mật khẩu mới phải có ít nhất 8 ký tự.",
    ),
});

type EditUserProps = {
  userId: string | number;
  defaultValues: {
    fullName: string;
    phone: string;
    address: string;
    role: "admin" | "customer";
    status: "active" | "blocked";
    password: string;
  };
  onUpdated?: () => void;
};

const EditUser = ({ userId, defaultValues, onUpdated }: EditUserProps) => {
  const { token } = useAuthStore();
  const closeRef = useRef<HTMLButtonElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await apiFetch(`/users/${userId}`, {
        method: "PUT",
        token,
        body: {
          name: values.fullName,
          phone: values.phone || null,
          address: values.address || null,
          role: values.role,
          status: values.status,
          ...(values.password ? { password: values.password } : {}),
        },
      });
      toast.success("Đã cập nhật người dùng.");
      onUpdated?.();
      closeRef.current?.click();
    } catch (err) {
      toast.error(
        err instanceof ApiError
          ? err.message
          : "Không thể cập nhật người dùng.",
      );
    }
  };

  return (
    <SheetContent className="overflow-y-auto">
      <SheetHeader>
        <SheetTitle className="mb-4">Sửa người dùng</SheetTitle>
        <SheetDescription>
          Cập nhật thông tin, vai trò và trạng thái tài khoản.
        </SheetDescription>
      </SheetHeader>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 mt-6 pb-8"
        >
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Họ và tên</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vai trò</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="customer">Khách hàng</SelectItem>
                    <SelectItem value="admin">Quản trị viên</SelectItem>
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
                    <SelectItem value="active">Hoạt động</SelectItem>
                    <SelectItem value="blocked">Đã khóa</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mật khẩu mới</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    autoComplete="new-password"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Để trống nếu không muốn đổi mật khẩu.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Số điện thoại</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormDescription>Không bắt buộc.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Địa chỉ</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormDescription>Không bắt buộc.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </form>
      </Form>
      <SheetClose ref={closeRef} className="hidden" />
    </SheetContent>
  );
};

export default EditUser;
