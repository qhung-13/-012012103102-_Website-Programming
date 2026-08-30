import Features from "@/components/home/Features";
import Testimonials from "@/components/home/Testimonials";
import Image from "next/image";

export const metadata = {
  title: "Giới thiệu — Roxbusi",
  description: "Câu chuyện và giá trị phía sau Roxbusi.",
};

const values = [
  {
    title: "Sinh ra để chuyển động",
    desc: "Mỗi đường cắt đều được thử nghiệm trong sinh hoạt hằng ngày, không chỉ để đẹp trên móc áo.",
  },
  {
    title: "Sản xuất theo lô nhỏ",
    desc: "Chúng tôi sản xuất với số lượng vừa đủ để hạn chế tồn kho và lãng phí.",
  },
  {
    title: "Bền bỉ theo thời gian",
    desc: "Chất vải chắc chắn và đường may gia cố giúp sản phẩm vượt qua những xu hướng ngắn hạn.",
  },
];

const AboutPage = () => {
  return (
    <div className="mt-8 mb-16">
      {/* HERO */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center mb-16">
        <div className="md:col-span-6 flex flex-col gap-4">
          <span className="tag-mark text-xs uppercase tracking-[0.2em] text-muted font-mono">
            Câu chuyện của chúng tôi
          </span>
          <h1 className="font-display text-5xl sm:text-6xl tracking-wide leading-[0.95] text-balance">
            TRANG PHỤC CHO
            <br />
            MỖI NGÀY THẬT.
          </h1>
          <p className="text-muted text-sm leading-relaxed max-w-md">
            Roxbusi bắt đầu năm 2021 từ một xưởng thời trang đường phố nhỏ. Hôm
            nay, chúng tôi đã phát triển thành một tủ đồ hoàn chỉnh nhưng mục
            tiêu vẫn như ngày đầu: tạo ra sản phẩm dễ mặc nhiều lần, giá hợp lý
            và thật sự bền.
          </p>
        </div>
        <div className="md:col-span-6 relative aspect-[4/3] rounded-3xl overflow-hidden bg-paper-dim">
          <Image
            src="/featured.png"
            alt="Xưởng thiết kế Roxbusi"
            fill
            className="object-cover"
          />
        </div>
      </section>

      {/* VALUES */}
      <section className="mb-16">
        <h2 className="tag-mark font-display text-3xl tracking-wide mb-6">
          Giá trị chúng tôi theo đuổi
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
    </div>
  );
};

export default AboutPage;
