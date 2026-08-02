import BlogCard from "@/components/blog/BlogCard";
import { blogPosts } from "@/data/blogPosts";
import Link from "next/link";

const BlogPreview = () => {
  const latestPosts = blogPosts.slice(0, 3);

  return (
    <section className="my-20">
      <div className="flex items-end justify-between mb-6">
        <div>
          <span className="tag-mark text-xs uppercase tracking-[0.2em] text-muted font-mono">
            From the journal
          </span>
          <h2 className="font-display text-3xl tracking-wide mt-1">
            Latest Stories
          </h2>
        </div>
        <Link
          href="/blog"
          className="hidden sm:flex items-center gap-1 text-sm font-medium text-ink hover:text-gold-dark transition-colors group"
        >
          View all posts
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
