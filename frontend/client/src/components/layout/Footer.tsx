import Image from "next/image";
import Link from "next/link";

const linkGroups = [
  {
    title: "Shop",
    links: [
      { label: "All Products", href: "/products" },
      { label: "New Arrivals", href: "/products" },
      { label: "Wishlist", href: "/wishlist" },
      { label: "Cart", href: "/cart" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Blog", href: "/blog" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Terms of Service", href: "/" },
      { label: "Privacy Policy", href: "/" },
      { label: "Shipping & Returns", href: "/" },
    ],
  },
];

const Footer = () => {
  return (
    <footer className="mt-24 -mx-4 sm:-mx-6 px-4 sm:px-6 bg-ink text-paper/70 rounded-t-3xl">
      <div className="max-w-6xl mx-auto py-14 flex flex-col gap-12 md:flex-row md:justify-between">
        {/* BRAND */}
        <div className="flex flex-col gap-4 max-w-xs">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="TrendLama" width={32} height={32} />
            <p className="font-display text-xl tracking-wide text-paper">
              TRENDLAMA
            </p>
          </Link>
          <p className="text-sm leading-relaxed">
            Streetwear-inspired basics, cut for everyday movement. Small
            batches, shipped worldwide.
          </p>
          <span className="tag-mark text-xs text-paper/50">
            © 2026 Trendlama. All rights reserved.
          </span>
        </div>

        {/* LINKS */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 flex-1 md:max-w-xl">
          {linkGroups.map((group) => (
            <div key={group.title} className="flex flex-col gap-3">
              <p className="tag-mark text-xs uppercase tracking-widest text-gold">
                {group.title}
              </p>
              {group.links.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-sm hover:text-paper transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
