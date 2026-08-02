import ProductInteraction from "@/components/product/ProductInteraction";
import { ProductType } from "@/types";
import Image from "next/image";

// TEMPORARY
const product: ProductType = {
  id: 1,
  name: "Adidas CoreFit T-Shirt",
  shortDescription:
    "Lorem ipsum dolor sit amet consect adipisicing elit lorem ipsum dolor sit.",
  description:
    "Lorem ipsum dolor sit amet consect adipisicing elit lorem ipsum dolor sit. Lorem ipsum dolor sit amet consect adipisicing elit lorem ipsum dolor sit. Lorem ipsum dolor sit amet consect adipisicing elit lorem ipsum dolor sit.",
  price: 59.9,
  sizes: ["xs", "s", "m", "l", "xl"],
  colors: ["gray", "purple", "green"],
  images: {
    gray: "/products/1g.png",
    purple: "/products/1p.png",
    green: "/products/1gr.png",
  },
  category: "t-shirts",
};

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  // TODO: get the product from db
  // TEMPORARY
  await params;
  return {
    title: product.name,
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
  const { size, color } = await searchParams;

  const selectedSize = size || (product.sizes[0] as string);
  const selectedColor = color || (product.colors[0] as string);
  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:gap-16 mt-8">
      {/* IMAGE */}
      <div className="w-full lg:w-1/2 relative aspect-[4/5] rounded-3xl overflow-hidden bg-paper-dim">
        <Image
          src={product.images[selectedColor]}
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
          TrendLama Original
        </span>
        <h1 className="font-display text-4xl tracking-wide">
          {product.name}
        </h1>
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
        {/* CARD INFO */}
        <div className="flex items-center gap-2 mt-4">
          <Image
            src="/klarna.png"
            alt="klarna"
            width={50}
            height={25}
            className="rounded-md"
          />
          <Image
            src="/cards.png"
            alt="cards"
            width={50}
            height={25}
            className="rounded-md"
          />
          <Image
            src="/stripe.png"
            alt="stripe"
            width={50}
            height={25}
            className="rounded-md"
          />
        </div>
        <p className="text-muted text-xs leading-relaxed">
          By clicking Pay Now, you agree to our{" "}
          <span className="underline hover:text-ink cursor-pointer">
            Terms & Conditions
          </span>{" "}
          and{" "}
          <span className="underline hover:text-ink cursor-pointer">
            Privacy Policy
          </span>
          . You authorize us to charge your selected payment method for the
          total amount shown. All sales are subject to our return and{" "}
          <span className="underline hover:text-ink cursor-pointer">
            Refund Policies
          </span>
          .
        </p>
      </div>
    </div>
  );
};

export default ProductPage;
