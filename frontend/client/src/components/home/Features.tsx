import { Truck, ShieldCheck, RotateCcw, Headphones } from "lucide-react";

const features = [
  {
    icon: <Truck className="w-5 h-5" />,
    title: "Miễn phí giao hàng",
    desc: "Cho đơn từ 100 USD",
  },
  {
    icon: <RotateCcw className="w-5 h-5" />,
    title: "Đổi trả dễ dàng",
    desc: "Trong vòng 30 ngày",
  },
  {
    icon: <ShieldCheck className="w-5 h-5" />,
    title: "Thanh toán minh bạch",
    desc: "COD hoặc chuyển khoản",
  },
  {
    icon: <Headphones className="w-5 h-5" />,
    title: "Hỗ trợ khách hàng",
    desc: "Phản hồi trong ngày làm việc",
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
            <p className="text-sm font-medium leading-tight">{feature.title}</p>
            <p className="text-xs text-muted mt-0.5">{feature.desc}</p>
          </div>
        </div>
      ))}
    </section>
  );
};

export default Features;
