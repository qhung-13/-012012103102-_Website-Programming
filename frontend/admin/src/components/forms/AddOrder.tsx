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
import { apiFetch, apiFetchAll, ApiError } from "@/lib/api";
import { toast } from "react-toastify";
import { formatColor } from "@/lib/localization";

const formSchema = z.object({
  customerName: z
    .string()
    .trim()
    .min(2, "Vui lòng nhập tên khách hàng.")
    .max(150, "Tên khách hàng quá dài."),
  email: z.string().email("Email không hợp lệ.").max(150, "Email quá dài."),
  phone: z.string().regex(/^[0-9+() .-]{8,20}$/, "Số điện thoại không hợp lệ."),
  address: z
    .string()
    .trim()
    .min(5, "Vui lòng nhập địa chỉ giao hàng.")
    .max(255, "Địa chỉ quá dài."),
  productId: z.string().min(1, "Vui lòng chọn sản phẩm."),
  quantity: z
    .number()
    .int()
    .min(1, "Số lượng tối thiểu là 1.")
    .max(100, "Số lượng tối đa là 100."),
  size: z.string(),
  color: z.string(),
  paymentMethod: z.enum(["cod", "bank_transfer"]),
  status: z.enum(["pending", "processing", "success", "failed", "cancelled"]),
});

type Product = {
  id: number;
  name: string;
  price: number;
  stock: number;
  sizes: string[];
  colors: string[];
};

const AddOrder = ({ onCreated }: { onCreated?: () => void }) => {
  const { token } = useAuthStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerName: "",
      email: "",
      phone: "",
      address: "",
      productId: "",
      quantity: 1,
      size: "",
      color: "",
      paymentMethod: "cod",
      status: "pending",
    },
  });
  const selectedProduct = products.find(
    (item) => String(item.id) === form.watch("productId"),
  );

  useEffect(() => {
    apiFetchAll<Product>("/products?limit=48")
      .then(setProducts)
      .catch((error) =>
        toast.error(
          error instanceof ApiError ? error.message : "Không thể tải sản phẩm.",
        ),
      );
  }, []);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    try {
      const response = await apiFetch<{ id: number }>("/orders", {
        method: "POST",
        token,
        body: {
          items: [
            {
              id: Number(values.productId),
              quantity: values.quantity,
              selectedSize: values.size || null,
              selectedColor: values.color || null,
            },
          ],
          shipping: {
            name: values.customerName,
            email: values.email,
            phone: values.phone,
            address: values.address,
          },
          payment_method: values.paymentMethod,
        },
      });
      if (values.status !== "pending") {
        await apiFetch(`/orders/${response.data.id}`, {
          method: "PUT",
          token,
          body: { status: values.status },
        });
      }
      toast.success("Đã tạo đơn hàng.");
      form.reset();
      onCreated?.();
      window.dispatchEvent(new Event("roxbusi:orders-changed"));
      closeRef.current?.click();
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : "Không thể tạo đơn hàng.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SheetContent className="overflow-y-auto">
      <ScrollArea className="h-screen pr-4">
        <SheetHeader>
          <SheetTitle className="mb-4">Thêm đơn hàng</SheetTitle>
          <SheetDescription>
            Giá sản phẩm và tồn kho sẽ được máy chủ xác minh lại.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-5 mt-6 pb-8"
          >
            <FormField
              control={form.control}
              name="customerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên khách hàng</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
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
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Địa chỉ giao hàng</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="productId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sản phẩm</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value);
                      const product = products.find(
                        (item) => String(item.id) === value,
                      );
                      form.setValue("size", product?.sizes[0] ?? "");
                      form.setValue("color", product?.colors[0] ?? "");
                      form.setValue("quantity", 1);
                    }}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn sản phẩm" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem
                          key={product.id}
                          value={String(product.id)}
                          disabled={product.stock < 1}
                        >
                          {product.name} — ${Number(product.price).toFixed(2)} (
                          {product.stock} sản phẩm)
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
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Số lượng</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={Math.min(selectedProduct?.stock ?? 100, 100)}
                      {...field}
                      onChange={(event) =>
                        field.onChange(parseInt(event.target.value) || 1)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {selectedProduct && selectedProduct.sizes.length > 0 && (
              <FormField
                control={form.control}
                name="size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kích cỡ</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {selectedProduct.sizes.map((size) => (
                          <SelectItem key={size} value={size}>
                            {size.toUpperCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            {selectedProduct && selectedProduct.colors.length > 0 && (
              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Màu sắc</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {selectedProduct.colors.map((color) => (
                          <SelectItem key={color} value={color}>
                            {formatColor(color)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phương thức thanh toán</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="cod">
                        Thanh toán khi nhận hàng
                      </SelectItem>
                      <SelectItem value="bank_transfer">
                        Chuyển khoản ngân hàng
                      </SelectItem>
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
                      <SelectItem value="pending">Chờ xác nhận</SelectItem>
                      <SelectItem value="processing">Đang xử lý</SelectItem>
                      <SelectItem value="success">Hoàn tất</SelectItem>
                      <SelectItem value="failed">Thất bại</SelectItem>
                      <SelectItem value="cancelled">Đã hủy</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={loading}>
              {loading ? "Đang lưu..." : "Tạo đơn hàng"}
            </Button>
          </form>
        </Form>
      </ScrollArea>
      <SheetClose ref={closeRef} className="hidden" />
    </SheetContent>
  );
};

export default AddOrder;
