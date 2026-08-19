import { z } from "zod";

export type ProductType = {
  id: string | number;
  name: string;
  slug?: string;
  shortDescription: string;
  description: string;
  price: number;
  stock: number;
  sizes: string[];
  colors: string[];
  images: Record<string, string>;
  category: string;
};

/** Raw shape returned by the PHP backend for a product (snake_case). */
export type ApiProductType = {
  id: number;
  name: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  price: number;
  stock: number;
  sizes: string[];
  colors: string[];
  status: string;
  category_id: number | null;
  category_name: string | null;
  category_slug: string | null;
  images: Record<string, string>;
  created_at: string;
  updated_at: string;
};

/** Adapts a backend product row into the shape the UI components expect. */
export function mapApiProduct(p: ApiProductType): ProductType {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    shortDescription: p.short_description ?? "",
    description: p.description ?? "",
    price: Number(p.price),
    stock: Number(p.stock),
    sizes: p.sizes ?? [],
    colors: p.colors ?? [],
    images: p.images ?? {},
    category: p.category_slug ?? "",
  };
}

export type ProductsType = ProductType[];

export type CartItemType = ProductType & {
  quantity: number;
  selectedSize: string;
  selectedColor: string;
};

export type CartItemsType = CartItemType[];

export const shippingFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Vui lòng nhập họ tên.")
    .max(150, "Họ tên quá dài."),
  email: z.email("Email không hợp lệ."),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+() .-]{8,20}$/, "Số điện thoại không hợp lệ."),
  address: z
    .string()
    .trim()
    .min(5, "Vui lòng nhập địa chỉ.")
    .max(200, "Địa chỉ quá dài."),
  city: z
    .string()
    .trim()
    .min(2, "Vui lòng nhập tỉnh/thành phố.")
    .max(50, "Tên tỉnh/thành phố quá dài."),
});

export type ShippingFormInputs = z.infer<typeof shippingFormSchema>;

export const paymentFormSchema = z.object({
  paymentMethod: z.enum(["cod", "bank_transfer"]),
});

export type PaymentFormInputs = z.infer<typeof paymentFormSchema>;

export type CartStoreStateType = {
  cart: CartItemsType;
  hasHydrated: boolean;
};

export type CartStoreActionsType = {
  addToCart: (product: CartItemType) => void;
  removeFromCart: (product: CartItemType) => void;
  clearCart: () => void;
};
