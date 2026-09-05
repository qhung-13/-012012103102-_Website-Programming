"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ImagePlus, RotateCcw, Trash2, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { resolveImageUrl } from "@/lib/api";
import { toast } from "react-toastify";

export type ProductGalleryImage = {
  id: number;
  color: string | null;
  image_path: string;
  sort_order: number;
};

export type PendingProductImage = {
  key: string;
  file: File;
  color: string | null;
};

type ProductImageManagerProps = {
  selectedColors: string[];
  colorLabels: Partial<Record<string, string>>;
  pendingImages: PendingProductImage[];
  onPendingImagesChange: (images: PendingProductImage[]) => void;
  existingImages?: ProductGalleryImage[];
  onRemoveExisting?: (image: ProductGalleryImage) => void;
  removedCount?: number;
  onRestoreRemoved?: () => void;
  maxImages?: number;
};

const ACCEPTED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const PendingPreview = ({ image }: { image: PendingProductImage }) => {
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    const url = URL.createObjectURL(image.file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [image.file]);

  if (!previewUrl) return <div className="h-full w-full animate-pulse bg-muted" />;

  return (
    <Image
      src={previewUrl}
      alt={`Ảnh xem trước ${image.file.name}`}
      fill
      unoptimized
      className="object-cover"
    />
  );
};

const createKey = (file: File, index: number) =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${file.name}-${file.size}-${file.lastModified}-${Date.now()}-${index}`;

export default function ProductImageManager({
  selectedColors,
  colorLabels,
  pendingImages,
  onPendingImagesChange,
  existingImages = [],
  onRemoveExisting,
  removedCount = 0,
  onRestoreRemoved,
  maxImages = 20,
}: ProductImageManagerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const totalImages = existingImages.length + pendingImages.length;

  const addFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    const availableSlots = Math.max(0, maxImages - totalImages);
    const accepted: PendingProductImage[] = [];

    for (const [index, file] of Array.from(fileList).entries()) {
      if (accepted.length >= availableSlots) break;
      if (!ACCEPTED_TYPES.has(file.type)) {
        toast.error(`${file.name}: chỉ nhận JPEG, PNG, WEBP hoặc GIF.`);
        continue;
      }
      if (file.size <= 0 || file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name}: dung lượng phải từ 1 byte đến 5 MB.`);
        continue;
      }
      const duplicate = [...pendingImages, ...accepted].some(
        (item) =>
          item.file.name === file.name &&
          item.file.size === file.size &&
          item.file.lastModified === file.lastModified,
      );
      if (duplicate) continue;

      accepted.push({
        key: createKey(file, index),
        file,
        color: selectedColors[0] ?? null,
      });
    }

    if (fileList.length > availableSlots) {
      toast.info(`Mỗi sản phẩm có tối đa ${maxImages} ảnh.`);
    }
    if (accepted.length > 0) {
      onPendingImagesChange([...pendingImages, ...accepted]);
    }
    if (inputRef.current) inputRef.current.value = "";
  };

  const updatePendingColor = (key: string, color: string) => {
    onPendingImagesChange(
      pendingImages.map((item) =>
        item.key === key ? { ...item, color: color || null } : item,
      ),
    );
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-dashed bg-muted/20 p-4 text-center">
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="sr-only"
          id="product-images"
          onChange={(event) => addFiles(event.target.files)}
          disabled={totalImages >= maxImages}
        />
        <UploadCloud className="mx-auto mb-2 h-7 w-7 text-muted-foreground" />
        <p className="text-sm font-medium">Chọn nhiều ảnh sản phẩm</p>
        <p className="mt-1 text-xs text-muted-foreground">
          JPEG, PNG, WEBP hoặc GIF · tối đa 5 MB/ảnh · {totalImages}/{maxImages}
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-3"
          disabled={totalImages >= maxImages}
          onClick={() => inputRef.current?.click()}
        >
          <ImagePlus className="h-4 w-4" /> Chọn ảnh
        </Button>
      </div>

      {removedCount > 0 && onRestoreRemoved && (
        <div className="flex items-center justify-between rounded-lg border border-amber-300/60 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:bg-amber-950/30 dark:text-amber-100">
          <span>{removedCount} ảnh sẽ bị xóa khi lưu.</span>
          <Button type="button" variant="ghost" size="sm" onClick={onRestoreRemoved}>
            <RotateCcw className="h-4 w-4" /> Hoàn tác
          </Button>
        </div>
      )}

      {totalImages > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {existingImages.map((image, index) => (
            <div key={`existing-${image.id}`} className="overflow-hidden rounded-xl border bg-card">
              <div className="relative aspect-square bg-muted">
                <Image
                  src={resolveImageUrl(image.image_path)}
                  alt={`Ảnh sản phẩm hiện tại ${index + 1}`}
                  fill
                  className="object-cover"
                />
                {index === 0 && (
                  <span className="absolute left-2 top-2 rounded-full bg-primary px-2 py-1 text-[10px] font-medium text-primary-foreground">
                    Ảnh chính
                  </span>
                )}
                {onRemoveExisting && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute right-2 top-2 h-7 w-7"
                    aria-label={`Xóa ảnh hiện tại ${index + 1}`}
                    onClick={() => onRemoveExisting(image)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
              <p className="truncate px-2 py-2 text-xs text-muted-foreground">
                {image.color ? colorLabels[image.color] ?? image.color : "Không gắn màu"}
              </p>
            </div>
          ))}

          {pendingImages.map((image) => (
            <div key={image.key} className="overflow-hidden rounded-xl border bg-card">
              <div className="relative aspect-square bg-muted">
                <PendingPreview image={image} />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute right-2 top-2 h-7 w-7"
                  aria-label={`Bỏ ảnh ${image.file.name}`}
                  onClick={() =>
                    onPendingImagesChange(
                      pendingImages.filter((item) => item.key !== image.key),
                    )
                  }
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
              <div className="space-y-1.5 p-2">
                <p className="truncate text-xs" title={image.file.name}>
                  {image.file.name}
                </p>
                <label className="block text-[11px] text-muted-foreground">
                  Màu tương ứng
                  <select
                    value={image.color ?? ""}
                    onChange={(event) => updatePendingColor(image.key, event.target.value)}
                    className="mt-1 h-8 w-full rounded-md border bg-background px-2 text-xs text-foreground outline-none focus:border-ring"
                  >
                    <option value="">Không gắn màu</option>
                    {selectedColors.map((color) => (
                      <option key={color} value={color}>
                        {colorLabels[color] ?? color}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Ảnh đầu tiên là ảnh đại diện. Ảnh mới sẽ được thêm sau ảnh hiện có.
      </p>
    </div>
  );
}
