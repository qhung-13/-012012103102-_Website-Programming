export const metadata = {
  title: "Giao hàng và đổi trả — TRENDLAMA",
  description: "Thông tin giao hàng, kiểm tra và đổi trả sản phẩm TRENDLAMA.",
};

export default function ShippingPage() {
  return (
    <article className="max-w-2xl mx-auto mt-10 mb-16 prose-blog text-sm leading-7">
      <h1 className="font-display text-4xl tracking-wide mb-6">Giao hàng và đổi trả</h1>
      <h2 className="font-display text-2xl mt-8 mb-2">Phí giao hàng</h2>
      <p>Đơn từ 100 USD được miễn phí giao hàng; đơn thấp hơn áp dụng phí 10 USD. Thời gian dự kiến được thông báo khi nhân viên xác nhận đơn.</p>
      <h2 className="font-display text-2xl mt-8 mb-2">Đổi trả trong 30 ngày</h2>
      <p>Sản phẩm chưa qua sử dụng, còn nhãn và bao bì có thể được yêu cầu đổi trả trong vòng 30 ngày kể từ khi nhận. Một số sản phẩm cá nhân hóa hoặc thuộc chương trình thanh lý có thể không áp dụng.</p>
      <h2 className="font-display text-2xl mt-8 mb-2">Sản phẩm lỗi hoặc giao sai</h2>
      <p>Vui lòng liên hệ sớm, kèm mã đơn và hình ảnh tình trạng sản phẩm. Chúng tôi sẽ hướng dẫn phương án xử lý phù hợp.</p>
    </article>
  );
}
