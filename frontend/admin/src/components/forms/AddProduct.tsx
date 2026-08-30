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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useRef, useState } from "react";
import useAuthStore from "@/stores/authStore";
import { apiFetch, apiUpload, ApiError } from "@/lib/api";
import { toast } from "react-toastify";
import { Loader2 } from "lucide-react";

const colors = [
  "blue",
  "green",
  "red",
  "yellow",
  "purple",
  "orange",
  "pink",
  "brown",
  "gray",
  "black",
  "white",
] as const;

const sizes = [
  "xs",
  "s",
  "m",
  "l",
  "xl",
  "xxl",
  "34",
  "35",
  "36",
  "37",
  "38",
  "39",
  "40",
  "41",
  "42",
  "43",
  "44",
  "45",
  "46",
  "47",
  "48",
] as const;

const colorLabels: Record<(typeof colors)[number], string> = {
  blue: "Xanh dương",
  green: "Xanh lá",
  red: "Đỏ",
  yellow: "Vàng",
  purple: "Tím",
  orange: "Cam",
  pink: "Hồng",
  brown: "Nâu",
  gray: "Xám",
  black: "Đen",
  white: "Trắng",
};

const formSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: "Tên sản phẩm phải có ít nhất 2 ký tự." })
    .max(200, "Tên sản phẩm quá dài."),
  shortDescription: z
    .string()
    .min(1, { message: "Vui lòng nhập mô tả ngắn." })
    .max(500, "Mô tả ngắn quá dài."),
  description: z
    .string()
    .min(1, { message: "Vui lòng nhập mô tả sản phẩm." })
    .max(50000, "Mô tả chi tiết quá dài."),
  price: z
    .number()
    .min(0.01, { message: "Giá phải lớn hơn 0." })
    .max(99999999.99, "Giá vượt quá giới hạn."),
  stock: z
    .number()
    .int("Tồn kho phải là số nguyên.")
    .min(0)
    .max(4294967295)
    .optional(),
  categoryId: z.string().min(1, { message: "Vui lòng chọn danh mục." }),
  sizes: z
    .array(z.enum(sizes))
    .min(1, { message: "Chọn ít nhất một kích cỡ." }),
  colors: z.array(z.enum(colors)).min(1, { message: "Chọn ít nhất một màu." }),
});

type Category = { id: number; name: string };

const AddProduct = ({ onCreated }: { onCreated?: () => void }) => {
  const { token } = useAuthStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [files, setFiles] = useState<Record<string, File>>({});
  const [submitting, setSubmitting] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    apiFetch<Category[]>("/categories")
      .then((res) => setCategories(res.data))
      .catch(() => toast.error("Không thể tải danh mục."));
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      shortDescription: "",
      description: "",
      price: 0,
      stock: 0,
      categoryId: "",
      sizes: [],
      colors: [],
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setSubmitting(true);
    try {
      // 1) Upload any images selected per color first.
      const filesToUpload = values.colors
        .filter((color) => files[color])
        .map((color) => ({ file: files[color], color }));

      const uploaded = filesToUpload.length
        ? await apiUpload(filesToUpload, "products", token)
        : [];

      // 2) Create the product with the uploaded image paths attached.
      await apiFetch("/products", {
        method: "POST",
        token,
        body: {
          name: values.name,
          short_description: values.shortDescription,
          description: values.description,
          price: values.price,
          stock: values.stock ?? 0,
          category_id: Number(values.categoryId),
          sizes: values.sizes,
          colors: values.colors,
          images: uploaded.map((u) => ({ color: u.color, path: u.path })),
        },
      });

      toast.success("Đã tạo sản phẩm.");
      form.reset();
      setFiles({});
      onCreated?.();
      window.dispatchEvent(new Event("roxbusi:products-changed"));
      closeRef.current?.click();
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Không thể tạo sản phẩm.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SheetContent>
      <ScrollArea className="h-screen">
        <SheetHeader>
          <SheetTitle className="mb-4">Thêm sản phẩm</SheetTitle>
          <SheetDescription>
            Nhập thông tin, biến thể và ảnh của sản phẩm mới.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8 mt-6 pb-8 pr-4"
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
                  <FormDescription>
                    Nhập tên hiển thị của sản phẩm.
                  </FormDescription>
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
                  <FormDescription>
                    Tóm tắt nổi bật của sản phẩm, tối đa 500 ký tự.
                  </FormDescription>
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
                    <Textarea {...field} />
                  </FormControl>
                  <FormDescription>
                    Nhập thông tin chi tiết về chất liệu, phom dáng và cách sử
                    dụng.
                  </FormDescription>
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
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value) || 0)
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
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || 0)
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
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn danh mục" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={String(cat.id)}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormDescription>
                    Chọn danh mục phù hợp với sản phẩm.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sizes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kích cỡ</FormLabel>
                  <FormControl>
                    <div className="grid grid-cols-3 gap-4 my-2">
                      {sizes.map((size) => (
                        <div className="flex items-center gap-2" key={size}>
                          <Checkbox
                            id={`size-${size}`}
                            checked={field.value?.includes(size)}
                            onCheckedChange={(checked) => {
                              const currentValues = field.value || [];
                              if (checked) {
                                field.onChange([...currentValues, size]);
                              } else {
                                field.onChange(
                                  currentValues.filter((v) => v !== size),
                                );
                              }
                            }}
                          />
                          <label htmlFor={`size-${size}`} className="text-xs">
                            {size}
                          </label>
                        </div>
                      ))}
                    </div>
                  </FormControl>
                  <FormDescription>Chọn các kích cỡ đang bán.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="colors"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Màu sắc</FormLabel>
                  <FormControl>
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-4 my-2">
                        {colors.map((color) => (
                          <div className="flex items-center gap-2" key={color}>
                            <Checkbox
                              id={`color-${color}`}
                              checked={field.value?.includes(color)}
                              onCheckedChange={(checked) => {
                                const currentValues = field.value || [];
                                if (checked) {
                                  field.onChange([...currentValues, color]);
                                } else {
                                  field.onChange(
                                    currentValues.filter((v) => v !== color),
                                  );
                                  setFiles((prev) => {
                                    const next = { ...prev };
                                    delete next[color];
                                    return next;
                                  });
                                }
                              }}
                            />
                            <label
                              htmlFor={`color-${color}`}
                              className="text-xs flex items-center gap-2"
                            >
                              <div
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: color }}
                              />
                              {colorLabels[color]}
                            </label>
                          </div>
                        ))}
                      </div>
                      {field.value && field.value.length > 0 && (
                        <div className="mt-8 space-y-4">
                          <p className="text-sm font-medium">
                            Tải một ảnh cho mỗi màu đã chọn:
                          </p>
                          {field.value.map((color) => (
                            <div
                              className="flex items-center gap-2"
                              key={color}
                            >
                              <div
                                className="w-2 h-2 rounded-full shrink-0"
                                style={{ backgroundColor: color }}
                              />
                              <span className="text-sm min-w-[60px]">
                                {colorLabels[color]}
                              </span>
                              <Input
                                type="file"
                                accept="image/jpeg,image/png,image/webp,image/gif"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file && file.size <= 5 * 1024 * 1024) {
                                    setFiles((prev) => ({
                                      ...prev,
                                      [color]: file,
                                    }));
                                  } else if (file)
                                    toast.error(
                                      "Mỗi ảnh không được vượt quá 5 MB.",
                                    );
                                }}
                              />
                              {files[color] && (
                                <span className="text-xs text-muted-foreground shrink-0">
                                  ✓
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormDescription>
                    Chọn các màu đang bán; ảnh hỗ trợ JPEG, PNG, WEBP hoặc GIF.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                "Tạo sản phẩm"
              )}
            </Button>
          </form>
        </Form>
      </ScrollArea>
      <SheetClose ref={closeRef} className="hidden" />
    </SheetContent>
  );
};

export default AddProduct;
