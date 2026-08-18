import { z } from "zod";

export type ProductType = {
  id: string | number;
  name: string;
  slug?: string;
  shortDescription: string;
  description: string;
  price: number;
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
  name: z.string().min(1, "Name is required!"),
  email: z.email().min(1, "Email is required!"),
  phone: z
    .string()
    .min(7, "Phone number must be between 7 and 10 digits!")
    .max(10, "Phone number must be between 7 and 10 digits!")
    .regex(/^\d+$/, "Phone number must contain only numbers!"),
  address: z.string().min(1, "Address is required!"),
  city: z.string().min(1, "City is required!"),
});

export type ShippingFormInputs = z.infer<typeof shippingFormSchema>;

export const paymentFormSchema = z.object({
  cardHolder: z.string().min(1, "Card holder is required!"),
  cardNumber: z
    .string()
    .min(16, "Card Number is required!")
    .max(16, "Card Number is required!"),
  expirationDate: z
    .string()
    .regex(
      /^(0[1-9]|1[0-2])\/\d{2}$/,
      "Expiration date must be in MM/YY format!",
    ),
  cvv: z.string().min(3, "CVV is required!").max(3, "CVV is required!"),
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
