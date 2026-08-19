import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Pagination = ({
  currentPage,
  totalPages,
  category,
  sort,
  search,
}: {
  currentPage: number;
  totalPages: number;
  category?: string;
  sort?: string;
  search?: string;
}) => {
  const buildHref = (page: number) => {
    const params = new URLSearchParams();
    if (category && category !== "all") params.set("category", category);
    if (sort) params.set("sort", sort);
    if (search) params.set("search", search);
    params.set("page", String(page));
    return `?${params.toString()}`;
  };

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1,
  );

  return (
    <nav className="flex items-center justify-center gap-1.5 mt-10">
      <PageLink
        href={buildHref(currentPage - 1)}
        disabled={currentPage <= 1}
        aria-label="Trang trước"
      >
        <ChevronLeft className="w-4 h-4" />
      </PageLink>

      {pages.map((page, i) => (
        <span key={page} className="flex items-center gap-1.5">
          {i > 0 && pages[i - 1] !== page - 1 && (
            <span className="text-muted text-sm px-1">…</span>
          )}
          <PageLink href={buildHref(page)} active={page === currentPage}>
            {page}
          </PageLink>
        </span>
      ))}

      <PageLink
        href={buildHref(currentPage + 1)}
        disabled={currentPage >= totalPages}
        aria-label="Trang sau"
      >
        <ChevronRight className="w-4 h-4" />
      </PageLink>
    </nav>
  );
};

const PageLink = ({
  href,
  active,
  disabled,
  children,
  ...rest
}: {
  href: string;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  [key: string]: unknown;
}) => {
  if (disabled) {
    return (
      <span className="w-9 h-9 rounded-full flex items-center justify-center text-sm text-muted/40">
        {children}
      </span>
    );
  }

  return (
    <Link
      href={href}
      scroll={false}
      className={`w-9 h-9 rounded-full flex items-center justify-center text-sm transition-colors ${
        active
          ? "bg-ink text-paper"
          : "text-ink hover:bg-paper-dim border border-line"
      }`}
      {...rest}
    >
      {children}
    </Link>
  );
};

export default Pagination;
