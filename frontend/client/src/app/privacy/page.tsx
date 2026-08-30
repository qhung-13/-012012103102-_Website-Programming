export const metadata = {
  title: "Chính sách quyền riêng tư — Roxbusi",
  description: "Cách Roxbusi thu thập, sử dụng và bảo vệ thông tin cá nhân.",
};

export default function PrivacyPage() {
  return (
    <article className="max-w-2xl mx-auto mt-10 mb-16 prose-blog text-sm leading-7">
      <h1 className="font-display text-4xl tracking-wide mb-6">
        Chính sách quyền riêng tư
      </h1>
      <p>
        Chúng tôi chỉ thu thập thông tin cần thiết để tạo tài khoản, xử lý đơn
        hàng, hỗ trợ khách hàng và gửi bản tin khi bạn chủ động đăng ký.
      </p>
      <h2 className="font-display text-2xl mt-8 mb-2">Thông tin được lưu</h2>
      <p>
        Thông tin có thể gồm họ tên, email, số điện thoại, địa chỉ giao hàng và
        lịch sử đơn. Website lưu phiên đăng nhập, giỏ hàng và danh sách yêu
        thích trong bộ nhớ trình duyệt để duy trì trải nghiệm giữa các lần truy
        cập.
      </p>
      <h2 className="font-display text-2xl mt-8 mb-2">Mục đích sử dụng</h2>
      <p>
        Dữ liệu được dùng để cung cấp dịch vụ, phòng chống gian lận và cải thiện
        trải nghiệm. Roxbusi không yêu cầu hoặc lưu số thẻ thanh toán trên
        website này.
      </p>
      <h2 className="font-display text-2xl mt-8 mb-2">Yêu cầu về dữ liệu</h2>
      <p>
        Bạn có thể liên hệ để yêu cầu xem, sửa hoặc xóa thông tin cá nhân theo
        quy định áp dụng.
      </p>
    </article>
  );
}
