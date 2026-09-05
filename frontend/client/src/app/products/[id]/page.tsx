import ProductInteraction from "@/components/product/ProductInteraction";
import ProductGallery from "@/components/product/ProductGallery";
import { apiFetch } from "@/lib/api";
import { ApiProductType, mapApiProduct } from "@/types";
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
    description: product.description
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
  };
};

const ProductPage = async ({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ color?: string; size?: string }>;
}) => {
  const { id } = await params;
  const { size, color } = await searchParams;

  const product = await getProduct(id);

  if (!product) return notFound();

  const selectedSize =
    (size && product.sizes.includes(size) ? size : undefined) ??
    product.sizes[0] ??
    "";
  const selectedColor =
    (color && product.colors.includes(color) ? color : undefined) ??
    product.colors[0] ??
    "";

  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:gap-16 mt-8">
      {/* IMAGE GALLERY */}
      <div className="w-full lg:w-1/2">
        <ProductGallery
          images={product.imageGallery}
          selectedColor={selectedColor}
          productName={product.name}
          price={product.price}
        />
      </div>
      {/* DETAILS */}
      <div className="w-full lg:w-1/2 flex flex-col gap-4">
        <span className="tag-mark text-xs uppercase tracking-[0.2em] text-muted font-mono">
          Sản phẩm chính hãng Roxbusi
        </span>
        <h1 className="font-display text-4xl tracking-wide">{product.name}</h1>
        <div
          className="text-muted text-sm leading-relaxed [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-gold [&_blockquote]:pl-3 [&_h2]:mt-4 [&_h2]:font-semibold [&_li]:ml-5 [&_ol]:list-decimal [&_p]:mb-2 [&_ul]:list-disc"
          dangerouslySetInnerHTML={{ __html: product.description }}
        />
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
