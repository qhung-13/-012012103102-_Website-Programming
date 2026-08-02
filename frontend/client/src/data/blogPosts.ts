export type BlogPostType = {
  slug: string;
  title: string;
  excerpt: string;
  content: string[];
  category: string;
  date: string;
  readTime: string;
  cover: string;
};

// TEMPORARY — replace with data fetched from the backend once it's ready.
export const blogPosts: BlogPostType[] = [
  {
    slug: "how-to-style-oversized-tees",
    title: "How to Style Oversized Tees for Every Season",
    excerpt:
      "Oversized tees aren't just for lounging anymore. Here's how to dress them up, down, and everywhere in between.",
    content: [
      "Oversized silhouettes have moved from loungewear staple to a genuine wardrobe anchor. The trick is balance: pair volume up top with something fitted below so the outfit reads intentional rather than sloppy.",
      "For colder months, layer a cropped jacket over your tee and let a few inches of fabric peek out underneath. In warmer weather, a half-tuck into wide-leg trousers or denim keeps things breezy without losing shape.",
      "Fabric weight matters more than people think. A heavier cotton drapes cleaner and resists the 'shapeless' look that thinner tees tend to fall into, especially after a few washes.",
    ],
    category: "Style Guide",
    date: "2026-06-02",
    readTime: "4 min read",
    cover: "/products/1g.png",
  },
  {
    slug: "sustainable-fabrics-we-use",
    title: "The Sustainable Fabrics Behind Our Basics",
    excerpt:
      "A closer look at the organic cotton, recycled polyester, and low-impact dyes that go into every Trendlama piece.",
    content: [
      "Every fabric choice starts with a simple question: will this hold up to years of wear, not just one season? That's why most of our core pieces run on organic cotton blends grown with significantly less water than conventional cotton.",
      "Where we use synthetics, we favor recycled polyester made from post-consumer plastic. It performs the same as virgin polyester in stretch and durability, without adding new plastic into the supply chain.",
      "Dyeing is one of the most water-intensive steps in garment production, so we work with low-impact, AZO-free dyes across the board — a small change that adds up fast at scale.",
    ],
    category: "Sustainability",
    date: "2026-05-18",
    readTime: "5 min read",
    cover: "/products/3gr.png",
  },
  {
    slug: "sneaker-care-101",
    title: "Sneaker Care 101: Keep Your Pairs Looking New",
    excerpt:
      "Simple habits that add months, sometimes years, to your favorite sneakers' lifespan.",
    content: [
      "Rotation is the single biggest factor in sneaker longevity. Wearing the same pair every day doesn't let the midsole foam fully decompress between wears, which speeds up breakdown.",
      "Stick to a soft-bristle brush and a mild soap solution for cleaning — harsh detergents and direct sunlight while drying are the two fastest ways to yellow a midsole.",
      "For storage, keep pairs out of direct heat and stuff the toe box with tissue paper to help them hold their shape when you're not wearing them.",
    ],
    category: "Guides",
    date: "2026-04-30",
    readTime: "3 min read",
    cover: "/products/6g.png",
  },
  {
    slug: "spring-summer-26-lookbook",
    title: "Inside the Spring/Summer '26 Lookbook",
    excerpt:
      "A behind-the-scenes look at the mood, colors, and silhouettes driving our newest drop.",
    content: [
      "This season's lookbook leans into lightweight layering — think unlined jackets, breathable fleece, and tees cut a little longer than usual for easy movement.",
      "The palette pulls from sun-bleached neutrals with a few saturated accent colors dropped in per look, echoing the tag-and-label details we use across the site.",
      "We shot the whole set outdoors, on purpose. Every piece in this drop is built to actually be worn outside, not just photographed in a studio.",
    ],
    category: "Lookbook",
    date: "2026-03-11",
    readTime: "4 min read",
    cover: "/featured.png",
  },
];
