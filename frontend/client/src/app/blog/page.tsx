import BlogCard from "@/components/blog/BlogCard";
import { ApiResponse, apiFetch } from "@/lib/api";
import { ApiBlogPostType, mapApiBlogPost } from "@/data/blogPosts";
import Link from "next/link";

export const metadata = {
  title: "Bài viết — RUZBOX",
  description:
    "Cẩm nang phong cách, bí quyết bảo quản và câu chuyện từ RUZBOX.",
};

const BlogPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) => {
  const params = await searchParams;
  const currentPage = Math.max(1, Number(params.page) || 1);
  let posts: ReturnType<typeof mapApiBlogPost>[] = [];
  let meta: ApiResponse<unknown>["meta"];
  let hasError = false;

  try {
    const res = await apiFetch<ApiBlogPostType[]>(
      `/blog?limit=12&page=${currentPage}`,
    );
    posts = res.data.map(mapApiBlogPost);
    meta = res.meta;
  } catch {
    hasError = true;
  }

  return (
    <div className="mt-8 mb-16">
      <div className="mb-8 text-center">
        <span className="tag-mark text-xs uppercase tracking-[0.2em] text-muted font-mono justify-center">
          Góc RUZBOX
        </span>
        <h1 className="font-display text-4xl sm:text-5xl tracking-wide mt-1">
          Câu chuyện & Cẩm nang phong cách
        </h1>
        <p className="text-muted text-sm max-w-md mx-auto mt-3">
          Bí quyết bảo quản, cách phối đồ và câu chuyện phía sau mỗi sản phẩm.
        </p>
      </div>
      {hasError ? (
        <p className="text-sm text-muted text-center py-12">
          Không thể tải bài viết lúc này. Vui lòng thử lại sau.
        </p>
      ) : posts.length === 0 ? (
        <p className="text-sm text-muted text-center py-12">
          Chưa có bài viết nào được xuất bản. Hãy quay lại sau nhé.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {posts.map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>
          {meta && meta.totalPages > 1 && (
            <nav
              className="mt-10 flex items-center justify-center gap-4 text-sm"
              aria-label="Phân trang bài viết"
            >
              {meta.page > 1 ? (
                <Link
                  href={`/blog?page=${meta.page - 1}`}
                  className="underline hover:text-gold-dark"
                >
                  Trang trước
                </Link>
              ) : (
                <span className="text-muted/50">Trang trước</span>
              )}
              <span className="font-mono text-muted">
                Trang {meta.page}/{meta.totalPages}
              </span>
              {meta.page < meta.totalPages ? (
                <Link
                  href={`/blog?page=${meta.page + 1}`}
                  className="underline hover:text-gold-dark"
                >
                  Trang sau
                </Link>
              ) : (
                <span className="text-muted/50">Trang sau</span>
              )}
            </nav>
          )}
        </>
      )}
    </div>
  );
};

export default BlogPage;
