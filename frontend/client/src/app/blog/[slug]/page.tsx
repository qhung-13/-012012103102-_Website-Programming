import BlogCard from "@/components/blog/BlogCard";
import { apiFetch, resolveImageUrl } from "@/lib/api";
import { ApiBlogPostType, mapApiBlogPost } from "@/data/blogPosts";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

async function getPost(slug: string) {
  try {
    const res = await apiFetch<ApiBlogPostType>(`/blog/${slug}`);
    return mapApiBlogPost(res.data);
  } catch {
    return null;
  }
}

async function getRelatedPosts(excludeSlug: string) {
  try {
    const res = await apiFetch<ApiBlogPostType[]>("/blog?limit=3");
    return res.data
      .map(mapApiBlogPost)
      .filter((p) => p.slug !== excludeSlug)
      .slice(0, 2);
  } catch {
    return [];
  }
}

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;
  const post = await getPost(slug);
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
  const post = await getPost(slug);

  if (!post) return notFound();

  const relatedPosts = await getRelatedPosts(post.slug);

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
      {post.date && (
        <p className="text-xs text-muted font-mono mt-3">
          {new Date(post.date).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </p>
      )}

      <div className="relative aspect-[16/9] rounded-3xl overflow-hidden bg-paper-dim mt-6">
        <Image
          src={post.cover ? resolveImageUrl(post.cover) : "/featured.png"}
          alt={post.title}
          fill
          className="object-contain p-8"
        />
      </div>

      {/* Content is HTML authored by the admin's rich text editor. */}
      <div
        className="prose-blog flex flex-col gap-4 mt-8 text-sm sm:text-base text-ink/80 leading-relaxed [&_p]:mb-4 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:tracking-wide [&_h2]:text-ink [&_a]:underline"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

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
