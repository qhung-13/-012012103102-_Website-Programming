import ProductInteraction from "@/components/product/ProductInteraction";
import { apiFetch, resolveImageUrl } from "@/lib/api";
import { ApiProductType, mapApiProduct } from "@/types";
import Image from "next/image";
import { notFound } from "next/navigation";

async function getProduct(idOrSlug: string) {
  try {
    const res = await apiFetch<ApiProductType>(`/products/${idOrSlug}`);
    return mapApiProduct(res.data);
  } catch {
    return null;
  }
}

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) return {};
  return {
    title: `${product.name} — Roxbusi`,
    description: product.description,
  };
};

const ProductPage = async ({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ color: string; size: string }>;
}) => {
  const { id } = await params;
  const { size, color } = await searchParams;

  const product = await getProduct(id);

  if (!product) return notFound();

  const selectedSize = size || product.sizes[0] || "";
  const selectedColor = color || product.colors[0] || "";

  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:gap-16 mt-8">
      {/* IMAGE */}
      <div className="w-full lg:w-1/2 relative aspect-[4/5] rounded-3xl overflow-hidden bg-paper-dim">
        <Image
          src={resolveImageUrl(
            product.images[selectedColor] ?? Object.values(product.images)[0],
          )}
          alt={product.name}
          fill
          className="object-contain p-6"
        />
        <span className="absolute top-4 left-4 bg-paper/95 backdrop-blur rounded-full px-3 py-1.5 text-sm font-mono font-medium tag-mark">
          ${product.price.toFixed(2)}
        </span>
      </div>
      {/* DETAILS */}
      <div className="w-full lg:w-1/2 flex flex-col gap-4">
        <span className="tag-mark text-xs uppercase tracking-[0.2em] text-muted font-mono">
          Sản phẩm chính hãng Roxbusi
        </span>
        <h1 className="font-display text-4xl tracking-wide">{product.name}</h1>
        <p className="text-muted text-sm leading-relaxed">
          {product.description}
        </p>
        <h2 className="font-mono text-2xl font-semibold">
          ${product.price.toFixed(2)}
        </h2>
        <div className="h-px bg-line" />
        <ProductInteraction
          product={product}
          selectedSize={selectedSize}
          selectedColor={selectedColor}
        />
        <p className="text-muted text-xs leading-relaxed">
          Khi đặt hàng, bạn đồng ý với{" "}
          <a href="/terms" className="underline hover:text-ink">
            Điều khoản sử dụng
          </a>
          ,{" "}
          <a href="/privacy" className="underline hover:text-ink">
            Chính sách quyền riêng tư
          </a>{" "}
          và{" "}
          <a href="/shipping" className="underline hover:text-ink">
            Chính sách giao hàng, đổi trả
          </a>
          .
        </p>
      </div>
    </div>
  );
};

export default ProductPage;
