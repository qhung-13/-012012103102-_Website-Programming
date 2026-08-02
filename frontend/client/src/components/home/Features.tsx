import { Truck, ShieldCheck, RotateCcw, Headphones } from "lucide-react";

const features = [
  {
    icon: <Truck className="w-5 h-5" />,
    title: "Free Shipping",
    desc: "On all orders over $50",
  },
  {
    icon: <RotateCcw className="w-5 h-5" />,
    title: "Easy Returns",
    desc: "30-day return window",
  },
  {
    icon: <ShieldCheck className="w-5 h-5" />,
    title: "Secure Payment",
    desc: "100% protected checkout",
  },
  {
    icon: <Headphones className="w-5 h-5" />,
    title: "24/7 Support",
    desc: "We're here to help anytime",
  },
];

const Features = () => {
  return (
    <section className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 py-10 border-y border-line my-16">
      {features.map((feature) => (
        <div key={feature.title} className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-gold-soft text-gold-dark flex items-center justify-center shrink-0">
            {feature.icon}
          </div>
          <div>
            <p className="text-sm font-medium leading-tight">
              {feature.title}
            </p>
            <p className="text-xs text-muted mt-0.5">{feature.desc}</p>
          </div>
        </div>
      ))}
    </section>
  );
};

export default Features;
