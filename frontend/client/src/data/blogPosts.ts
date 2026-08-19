/** Shape returned by GET /api/blog (list) and /api/blog/{id} (detail). */
export type ApiBlogPostType = {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  content?: string | null; // HTML, only present on the detail endpoint
  category: string | null;
  cover_image: string | null;
  author_name?: string;
  published_at: string | null;
};

/** UI-friendly shape used by BlogCard and the blog pages. */
export type BlogPostType = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  date: string;
  cover: string | null;
};

export function mapApiBlogPost(p: ApiBlogPostType): BlogPostType {
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt ?? "",
    content: p.content ?? "",
    category: p.category ?? "Bài viết",
    date: p.published_at ?? "",
    cover: p.cover_image,
  };
}
