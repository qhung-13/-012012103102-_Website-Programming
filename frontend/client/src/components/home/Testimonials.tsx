import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Minh Anh",
    role: "Khách hàng đã mua",
    quote:
      "Vải dày dặn, form áo đúng như hình, giao hàng nhanh hơn dự kiến 2 ngày. Chắc chắn sẽ quay lại mua tiếp.",
  },
  {
    name: "Duy Khang",
    role: "Khách hàng đã mua",
    quote:
      "Đôi giày mình đặt đi êm chân, đóng gói cẩn thận. Đổi size cũng nhanh gọn không rườm rà.",
  },
  {
    name: "Thu Trang",
    role: "Khách hàng đã mua",
    quote:
      "Thích nhất là phần theo dõi đơn hàng rõ ràng, và chất lượng sản phẩm đúng như mô tả trên web.",
  },
];

const Testimonials = () => {
  return (
    <section className="my-20">
      <div className="text-center mb-10">
        <span className="tag-mark text-xs uppercase tracking-[0.2em] text-muted font-mono justify-center">
          Được khách hàng yêu thích
        </span>
        <h2 className="font-display text-3xl sm:text-4xl tracking-wide mt-1">
          Khách hàng nói gì
        </h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {testimonials.map((t) => (
          <div
            key={t.name}
            className="bg-white border border-line rounded-2xl p-6 flex flex-col gap-4"
          >
            <div className="flex gap-0.5 text-gold">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-gold text-gold" />
              ))}
            </div>
            <p className="text-sm text-ink/80 leading-relaxed">
              &ldquo;{t.quote}&rdquo;
            </p>
            <div className="mt-auto pt-2 border-t border-line">
              <p className="text-sm font-medium">{t.name}</p>
              <p className="text-xs text-muted">{t.role}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Testimonials;
