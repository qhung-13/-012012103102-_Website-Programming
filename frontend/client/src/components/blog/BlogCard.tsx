import { BlogPostType } from "@/data/blogPosts";
import Image from "next/image";
import Link from "next/link";

const BlogCard = ({ post }: { post: BlogPostType }) => {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col gap-4 bg-white border border-line rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
    >
      <div className="relative aspect-[16/10] bg-paper-dim">
        <Image
          src={post.cover}
          alt={post.title}
          fill
          className="object-contain p-6 group-hover:scale-105 transition-transform duration-300"
        />
        <span className="absolute top-3 left-3 bg-paper/90 backdrop-blur rounded-full px-2.5 py-1 text-[11px] font-mono font-medium tag-mark">
          {post.category}
        </span>
      </div>
      <div className="flex flex-col gap-2 px-5 pb-5">
        <p className="text-xs text-muted font-mono">
          {new Date(post.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}{" "}
          · {post.readTime}
        </p>
        <h3 className="font-medium leading-snug group-hover:text-gold-dark transition-colors">
          {post.title}
        </h3>
        <p className="text-xs text-muted line-clamp-2">{post.excerpt}</p>
      </div>
    </Link>
  );
};

export default BlogCard;
