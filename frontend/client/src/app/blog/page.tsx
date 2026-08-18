import BlogCard from "@/components/blog/BlogCard";
import { apiFetch } from "@/lib/api";
import { ApiBlogPostType, mapApiBlogPost } from "@/data/blogPosts";

export const metadata = {
  title: "Journal — TRENDLAMA",
  description: "Style guides, care tips and stories from Trendlama.",
};

const BlogPage = async () => {
  let posts: ReturnType<typeof mapApiBlogPost>[] = [];
  let hasError = false;

  try {
    const res = await apiFetch<ApiBlogPostType[]>("/blog?limit=24");
    posts = res.data.map(mapApiBlogPost);
  } catch {
    hasError = true;
  }

  return (
    <div className="mt-8 mb-16">
      <div className="mb-8 text-center">
        <span className="tag-mark text-xs uppercase tracking-[0.2em] text-muted font-mono justify-center">
          The Journal
        </span>
        <h1 className="font-display text-4xl sm:text-5xl tracking-wide mt-1">
          Stories & Style Guides
        </h1>
        <p className="text-muted text-sm max-w-md mx-auto mt-3">
          Care tips, lookbooks, and everything behind the making of Trendlama.
        </p>
      </div>
      {hasError ? (
        <p className="text-sm text-muted text-center py-12">
          Couldn&apos;t load the journal right now. Please try again later.
        </p>
      ) : posts.length === 0 ? (
        <p className="text-sm text-muted text-center py-12">
          No posts published yet — check back soon.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {posts.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </div>
  );
};

export default BlogPage;
