import BlogCard from "@/components/blog/BlogCard";
import { blogPosts } from "@/data/blogPosts";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) return {};
  return {
    title: `${post.title} — TRENDLAMA Journal`,
    description: post.excerpt,
  };
};

const BlogPostPage = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) return notFound();

  const relatedPosts = blogPosts
    .filter((p) => p.slug !== post.slug)
    .slice(0, 2);

  return (
    <article className="mt-8 mb-16 max-w-2xl mx-auto">
      <Link
        href="/blog"
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink transition-colors mb-6"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to journal
      </Link>

      <span className="tag-mark text-xs uppercase tracking-[0.2em] text-muted font-mono">
        {post.category}
      </span>
      <h1 className="font-display text-4xl sm:text-5xl tracking-wide mt-2 leading-[1.02]">
        {post.title}
      </h1>
      <p className="text-xs text-muted font-mono mt-3">
        {new Date(post.date).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })}{" "}
        · {post.readTime}
      </p>

      <div className="relative aspect-[16/9] rounded-3xl overflow-hidden bg-paper-dim mt-6">
        <Image
          src={post.cover}
          alt={post.title}
          fill
          className="object-contain p-8"
        />
      </div>

      <div className="flex flex-col gap-4 mt-8">
        {post.content.map((paragraph, i) => (
          <p key={i} className="text-sm sm:text-base text-ink/80 leading-relaxed">
            {paragraph}
          </p>
        ))}
      </div>

      {relatedPosts.length > 0 && (
        <div className="mt-16">
          <h2 className="tag-mark font-display text-2xl tracking-wide mb-5">
            Keep Reading
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {relatedPosts.map((related) => (
              <BlogCard key={related.slug} post={related} />
            ))}
          </div>
        </div>
      )}
    </article>
  );
};

export default BlogPostPage;
