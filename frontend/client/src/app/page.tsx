import ProductList from "@/components/product/ProductList";
import Features from "@/components/home/Features";
import BlogPreview from "@/components/home/BlogPreview";
import Testimonials from "@/components/home/Testimonials";
import Newsletter from "@/components/home/Newsletter";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const Homepage = async ({
  searchParams,
}: {
  searchParams: Promise<{ category: string }>;
}) => {
  const category = (await searchParams).category;
  return (
    <div>
      {/* HERO */}
      <section className="relative mt-4 mb-16 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        <div className="md:col-span-5 flex flex-col gap-5 order-2 md:order-1">
          <span className="tag-mark text-xs uppercase tracking-[0.2em] text-muted font-mono">
            Bộ sưu tập mới — SS26
          </span>
          <h1 className="font-display text-6xl sm:text-7xl leading-[0.95] tracking-wide text-balance">
            MÙA MỚI.
            <br />
            PHONG CÁCH MỚI.
          </h1>
          <p className="text-muted text-sm max-w-xs leading-relaxed">
            Những thiết kế lấy cảm hứng từ thời trang đường phố, thoải mái trong
            từng chuyển động và được sản xuất theo lô nhỏ.
          </p>
          <Link
            href="/products"
            className="w-fit flex items-center gap-2 bg-ink text-paper text-sm font-medium rounded-full pl-5 pr-4 py-3 hover:bg-gold-dark transition-colors"
          >
            Khám phá ngay
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="md:col-span-7 relative aspect-[4/3] sm:aspect-[3/2] order-1 md:order-2 rounded-3xl overflow-hidden bg-paper-dim">
          <Image
            src="/featured.png"
            alt="Sản phẩm nổi bật của Roxbusi"
            fill
            priority
            className="object-cover"
          />
          {/* SIGNATURE HANG-TAG BADGE */}
          <div className="absolute bottom-5 left-5 bg-paper/95 backdrop-blur rounded-2xl px-4 py-3 flex items-center gap-3 shadow-lg">
            <span className="w-2.5 h-2.5 rounded-full bg-gold shrink-0" />
            <div className="leading-tight">
              <p className="text-[11px] text-muted uppercase tracking-wider">
                Nổi bật
              </p>
              <p className="font-mono text-sm font-medium">Bộ sưu tập Êm Dịu</p>
            </div>
          </div>
        </div>
      </section>

      {/* PRODUCTS */}
      <section>
        <div className="flex items-end justify-between mb-6">
          <h2 className="tag-mark font-display text-3xl tracking-wide">
            Đang được yêu thích
          </h2>
        </div>
        <ProductList category={category} params="homepage" />
      </section>

      <Features />
      <BlogPreview />
      <Testimonials />
      <Newsletter />
    </div>
  );
};

export default Homepage;
