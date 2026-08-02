import Features from "@/components/home/Features";
import Testimonials from "@/components/home/Testimonials";
import { Instagram, Twitter, Facebook } from "lucide-react";
import Image from "next/image";

export const metadata = {
  title: "About — TRENDLAMA",
  description: "The story behind Trendlama.",
};

const values = [
  {
    title: "Made to move",
    desc: "Every cut is tested for everyday movement, not just how it looks on a hanger.",
  },
  {
    title: "Small batches",
    desc: "We produce in limited runs to cut down on overstock and waste.",
  },
  {
    title: "Built to last",
    desc: "Heavier fabrics and reinforced seams so pieces outlive the trend cycle.",
  },
];

const AboutPage = () => {
  return (
    <div className="mt-8 mb-16">
      {/* HERO */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center mb-16">
        <div className="md:col-span-6 flex flex-col gap-4">
          <span className="tag-mark text-xs uppercase tracking-[0.2em] text-muted font-mono">
            Our Story
          </span>
          <h1 className="font-display text-5xl sm:text-6xl tracking-wide leading-[0.95] text-balance">
            CLOTHES FOR
            <br />
            REAL DAYS.
          </h1>
          <p className="text-muted text-sm leading-relaxed max-w-md">
            Trendlama started in 2021 as a small streetwear line out of a
            single studio. Today it&apos;s grown into a full wardrobe — but the
            goal hasn&apos;t changed: make pieces good enough to wear on repeat,
            priced fairly, and built to actually last.
          </p>
        </div>
        <div className="md:col-span-6 relative aspect-[4/3] rounded-3xl overflow-hidden bg-paper-dim">
          <Image src="/featured.png" alt="Trendlama studio" fill className="object-cover" />
        </div>
      </section>

      {/* VALUES */}
      <section className="mb-16">
        <h2 className="tag-mark font-display text-3xl tracking-wide mb-6">
          What We Stand For
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {values.map((v) => (
            <div
              key={v.title}
              className="bg-white border border-line rounded-2xl p-6"
            >
              <p className="font-medium mb-1.5">{v.title}</p>
              <p className="text-sm text-muted leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <Features />
      <Testimonials />

      {/* SOCIAL */}
      <section className="text-center mt-16">
        <p className="text-sm text-muted mb-3">Follow the drops</p>
        <div className="flex items-center justify-center gap-4">
          <a
            href="#"
            aria-label="Instagram"
            className="w-9 h-9 rounded-full border border-line flex items-center justify-center hover:border-ink/40 transition-colors"
          >
            <Instagram className="w-4 h-4" />
          </a>
          <a
            href="#"
            aria-label="Twitter"
            className="w-9 h-9 rounded-full border border-line flex items-center justify-center hover:border-ink/40 transition-colors"
          >
            <Twitter className="w-4 h-4" />
          </a>
          <a
            href="#"
            aria-label="Facebook"
            className="w-9 h-9 rounded-full border border-line flex items-center justify-center hover:border-ink/40 transition-colors"
          >
            <Facebook className="w-4 h-4" />
          </a>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
