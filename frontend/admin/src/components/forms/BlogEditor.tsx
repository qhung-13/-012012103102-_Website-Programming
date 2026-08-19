"use client";

import { SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import useAuthStore from "@/stores/authStore";
import { apiFetch, apiUpload, ApiError } from "@/lib/api";
import { toast } from "react-toastify";
import { Loader2 } from "lucide-react";

const schema = z.object({
  title: z.string().trim().min(2, "Tiêu đề phải có ít nhất 2 ký tự.").max(200),
  excerpt: z.string().max(500, "Mô tả ngắn quá dài."),
  category: z.string().max(100, "Tên chuyên mục quá dài."),
  content: z.string().max(50000, "Nội dung quá dài."),
  status: z.enum(["draft", "published"]),
  coverImage: z.string(),
});

type BlogPost = {
  id: number;
  title: string;
  excerpt: string | null;
  category: string | null;
  content: string | null;
  status: "draft" | "published";
  cover_image: string | null;
};

export default function BlogEditor({ postId, onSaved }: { postId?: number; onSaved?: () => void }) {
  const token = useAuthStore((state) => state.token);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [loadingPost, setLoadingPost] = useState(Boolean(postId));
  const closeRef = useRef<HTMLButtonElement>(null);
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { title: "", excerpt: "", category: "", content: "", status: "draft", coverImage: "" },
  });

  useEffect(() => {
    if (!postId) return;
    setLoadingPost(true);
    apiFetch<BlogPost>(`/blog-admin/${postId}`, { token })
      .then((response) => form.reset({
        title: response.data.title,
        excerpt: response.data.excerpt ?? "",
        category: response.data.category ?? "",
        content: response.data.content ?? "",
        status: response.data.status,
        coverImage: response.data.cover_image ?? "",
      }))
      .catch((error) => toast.error(error instanceof ApiError ? error.message : "Không thể tải bài viết."))
      .finally(() => setLoadingPost(false));
  }, [postId, token, form]);

  const onSubmit = async (values: z.infer<typeof schema>) => {
    try {
      let coverImage = values.coverImage || null;
      if (coverFile) {
        const uploaded = await apiUpload([{ file: coverFile }], "blog", token);
        coverImage = uploaded[0]?.path ?? coverImage;
      }
      await apiFetch(postId ? `/blog/${postId}` : "/blog", {
        method: postId ? "PUT" : "POST",
        token,
        body: {
          title: values.title,
          excerpt: values.excerpt || null,
          category: values.category || null,
          content: values.content,
          status: values.status,
          cover_image: coverImage,
        },
      });
      toast.success(postId ? "Đã cập nhật bài viết." : "Đã tạo bài viết.");
      onSaved?.();
      window.dispatchEvent(new Event("trendlama:blog-changed"));
      closeRef.current?.click();
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Không thể lưu bài viết.");
    }
  };

  return (
    <SheetContent className="overflow-y-auto">
      <ScrollArea className="h-screen pr-4">
        <SheetHeader>
          <SheetTitle>{postId ? "Sửa bài viết" : "Thêm bài viết"}</SheetTitle>
          <SheetDescription>Nội dung hỗ trợ các thẻ HTML định dạng cơ bản; mã nguy hiểm sẽ bị máy chủ loại bỏ.</SheetDescription>
        </SheetHeader>
        {loadingPost ? (
          <div className="flex items-center gap-2 py-16 justify-center text-sm text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /> Đang tải...</div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 mt-6 pb-8">
              <FormField control={form.control} name="title" render={({ field }) => <FormItem><FormLabel>Tiêu đề</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
              <FormField control={form.control} name="excerpt" render={({ field }) => <FormItem><FormLabel>Mô tả ngắn</FormLabel><FormControl><Textarea rows={3} {...field} /></FormControl><FormMessage /></FormItem>} />
              <FormField control={form.control} name="category" render={({ field }) => <FormItem><FormLabel>Chuyên mục</FormLabel><FormControl><Input {...field} placeholder="Cẩm nang phong cách" /></FormControl><FormMessage /></FormItem>} />
              <FormField control={form.control} name="content" render={({ field }) => <FormItem><FormLabel>Nội dung</FormLabel><FormControl><Textarea rows={12} {...field} placeholder="<p>Nội dung bài viết...</p>" /></FormControl><FormMessage /></FormItem>} />
              <FormField control={form.control} name="status" render={({ field }) => <FormItem><FormLabel>Trạng thái</FormLabel><Select value={field.value} onValueChange={field.onChange}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="draft">Bản nháp</SelectItem><SelectItem value="published">Đã xuất bản</SelectItem></SelectContent></Select><FormMessage /></FormItem>} />
              <FormField control={form.control} name="coverImage" render={({ field }) => <FormItem><FormLabel>Đường dẫn ảnh bìa hiện tại</FormLabel><FormControl><Input {...field} readOnly /></FormControl><FormMessage /></FormItem>} />
              <FormItem><FormLabel>Chọn ảnh bìa mới</FormLabel><FormControl><Input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(event) => { const file = event.target.files?.[0] ?? null; if (file && file.size > 5 * 1024 * 1024) { toast.error("Ảnh không được vượt quá 5 MB."); event.target.value = ""; return; } setCoverFile(file); }} /></FormControl></FormItem>
              <Button type="submit" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? "Đang lưu..." : "Lưu bài viết"}</Button>
            </form>
          </Form>
        )}
      </ScrollArea>
      <SheetClose ref={closeRef} className="hidden" />
    </SheetContent>
  );
}
