"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";
import { resolveImageUrl } from "@/lib/api";
import { formatColor } from "@/lib/localization";
import { ProductImageType } from "@/types";

type ProductGalleryProps = {
  images: ProductImageType[];
  selectedColor: string;
  productName: string;
  price: number;
};

const fallbackImage: ProductImageType = {
  id: 0,
  color: null,
  path: "/products/placeholder.svg",
  sortOrder: 0,
};

export default function ProductGallery({
  images,
  selectedColor,
  productName,
  price,
}: ProductGalleryProps) {
  const gallery = useMemo(() => (images.length ? images : [fallbackImage]), [images]);
  const [activeId, setActiveId] = useState(gallery[0].id);
  const [viewerOpen, setViewerOpen] = useState(false);

  useEffect(() => {
    const matchingImage = gallery.find((image) => image.color === selectedColor);
    setActiveId((currentId) =>
      matchingImage?.id ?? (gallery.some((image) => image.id === currentId) ? currentId : gallery[0].id),
    );
  }, [gallery, selectedColor]);

  useEffect(() => {
    if (!viewerOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setViewerOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [viewerOpen]);

  const activeIndex = Math.max(0, gallery.findIndex((image) => image.id === activeId));
  const activeImage = gallery[activeIndex] ?? gallery[0];

  const move = (direction: -1 | 1) => {
    const nextIndex = (activeIndex + direction + gallery.length) % gallery.length;
    setActiveId(gallery[nextIndex].id);
  };

  return (
    <div className="min-w-0">
      <div className="group relative aspect-[4/5] overflow-hidden rounded-3xl border border-line bg-paper-dim">
        <button
          type="button"
          className="absolute inset-0 z-10 cursor-zoom-in"
          aria-label="Mở ảnh sản phẩm kích thước lớn"
          onClick={() => setViewerOpen(true)}
        />
        <Image
          src={resolveImageUrl(activeImage.path)}
          alt={`${productName}${activeImage.color ? ` - màu ${formatColor(activeImage.color)}` : ""}`}
          fill
          priority
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-contain p-5 transition-transform duration-300 group-hover:scale-[1.02] sm:p-8"
        />
        <span className="tag-mark absolute left-4 top-4 z-20 rounded-full bg-paper/95 px-3 py-1.5 font-mono text-sm font-medium shadow-sm backdrop-blur">
          ${price.toFixed(2)}
        </span>
        <span className="absolute bottom-4 right-4 z-20 flex items-center gap-1.5 rounded-full bg-ink/75 px-3 py-1.5 text-xs text-paper backdrop-blur">
          <ZoomIn className="h-3.5 w-3.5" /> {activeIndex + 1}/{gallery.length}
        </span>

        {gallery.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Ảnh trước"
              onClick={() => move(-1)}
              className="absolute left-3 top-1/2 z-30 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-paper/90 text-ink shadow-md backdrop-blur transition-colors hover:bg-paper"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Ảnh sau"
              onClick={() => move(1)}
              className="absolute right-3 top-1/2 z-30 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-paper/90 text-ink shadow-md backdrop-blur transition-colors hover:bg-paper"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}
      </div>

      {gallery.length > 1 && (
        <div className="scrollbar-hide mt-3 flex gap-3 overflow-x-auto pb-1">
          {gallery.map((image, index) => (
            <button
              key={`${image.id}-${image.path}`}
              type="button"
              onClick={() => setActiveId(image.id)}
              aria-label={`Xem ảnh ${index + 1}${image.color ? `, màu ${formatColor(image.color)}` : ""}`}
              aria-current={image.id === activeImage.id ? "true" : undefined}
              className={`relative h-20 w-16 shrink-0 overflow-hidden rounded-xl border-2 bg-paper-dim transition-all sm:h-24 sm:w-20 ${
                image.id === activeImage.id
                  ? "border-gold-dark shadow-sm"
                  : "border-transparent hover:border-line"
              }`}
            >
              <Image
                src={resolveImageUrl(image.path)}
                alt=""
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {viewerOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Ảnh lớn của ${productName}`}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/90 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setViewerOpen(false);
          }}
        >
          <button
            type="button"
            aria-label="Đóng ảnh lớn"
            onClick={() => setViewerOpen(false)}
            className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-paper text-ink"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="relative h-[85vh] w-full max-w-5xl">
            <Image
              src={resolveImageUrl(activeImage.path)}
              alt={`${productName} - ảnh ${activeIndex + 1}`}
              fill
              sizes="100vw"
              className="object-contain"
            />
          </div>
          {gallery.length > 1 && (
            <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-full bg-paper px-2 py-1.5 text-ink shadow-xl">
              <button type="button" aria-label="Ảnh trước" onClick={() => move(-1)} className="p-2">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <span className="min-w-12 text-center font-mono text-xs">{activeIndex + 1}/{gallery.length}</span>
              <button type="button" aria-label="Ảnh sau" onClick={() => move(1)} className="p-2">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
