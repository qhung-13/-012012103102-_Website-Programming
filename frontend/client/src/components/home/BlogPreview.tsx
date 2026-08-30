import BlogCard from "@/components/blog/BlogCard";
import { apiFetch } from "@/lib/api";
import { ApiBlogPostType, mapApiBlogPost } from "@/data/blogPosts";
import Link from "next/link";

const BlogPreview = async () => {
  let latestPosts: ReturnType<typeof mapApiBlogPost>[] = [];

  try {
    const res = await apiFetch<ApiBlogPostType[]>("/blog?limit=3");
    latestPosts = res.data.map(mapApiBlogPost);
  } catch {
    return null; // don't break the homepage if the journal fails to load
  }

  if (latestPosts.length === 0) return null;

  return (
    <section className="my-20">
      <div className="flex items-end justify-between mb-6">
        <div>
          <span className="tag-mark text-xs uppercase tracking-[0.2em] text-muted font-mono">
            Từ góc Roxbusi
          </span>
          <h2 className="font-display text-3xl tracking-wide mt-1">
            Bài viết mới nhất
          </h2>
        </div>
        <Link
          href="/blog"
          className="hidden sm:flex items-center gap-1 text-sm font-medium text-ink hover:text-gold-dark transition-colors group"
        >
          Xem tất cả bài viết
          <span className="group-hover:translate-x-0.5 transition-transform">
            →
          </span>
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {latestPosts.map((post) => (
          <BlogCard key={post.slug} post={post} />
        ))}
      </div>
    </section>
  );
};

export default BlogPreview;
