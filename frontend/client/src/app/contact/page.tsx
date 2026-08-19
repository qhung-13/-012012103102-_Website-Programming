"use client";

import { Mail, MapPin, Phone, ArrowRight } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";
import { apiFetch, ApiError } from "@/lib/api";

const contactInfo = [
  {
    icon: <Mail className="w-4 h-4" />,
    title: "Email",
    value: "support@trendlama.com",
  },
  {
    icon: <Phone className="w-4 h-4" />,
    title: "Điện thoại",
    value: "+84 28 1234 5678",
  },
  {
    icon: <MapPin className="w-4 h-4" />,
    title: "Văn phòng",
    value: "Quận 1, TP. Hồ Chí Minh, Việt Nam",
  },
];

const ContactPage = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    website: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await apiFetch("/contact", {
        method: "POST",
        body: form,
      });
      toast.success(response.message);
      setForm({ name: "", email: "", subject: "", message: "", website: "" });
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : "Không thể gửi lời nhắn.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8 mb-16">
      <div className="mb-10 text-center">
        <span className="tag-mark text-xs uppercase tracking-[0.2em] text-muted font-mono justify-center">
          Liên hệ với chúng tôi
        </span>
        <h1 className="font-display text-4xl sm:text-5xl tracking-wide mt-1">
          TRENDLAMA luôn sẵn sàng lắng nghe
        </h1>
        <p className="text-muted text-sm max-w-md mx-auto mt-3">
          Bạn cần hỗ trợ đơn hàng, kích cỡ hoặc muốn hợp tác? Hãy gửi lời nhắn,
          chúng tôi sẽ phản hồi trong 1–2 ngày làm việc.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* INFO */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {contactInfo.map((info) => (
            <div
              key={info.title}
              className="bg-white border border-line rounded-2xl p-5 flex items-start gap-3"
            >
              <div className="w-9 h-9 rounded-full bg-gold-soft text-gold-dark flex items-center justify-center shrink-0">
                {info.icon}
              </div>
              <div>
                <p className="text-xs text-muted uppercase tracking-wider">
                  {info.title}
                </p>
                <p className="text-sm font-medium mt-0.5">{info.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-8 bg-white border border-line rounded-3xl p-6 sm:p-8 flex flex-col gap-4"
        >
          <div className="sr-only" aria-hidden="true">
            <label htmlFor="website">Trang web</label>
            <input
              id="website"
              name="website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={form.website}
              onChange={(event) =>
                setForm({ ...form, website: event.target.value })
              }
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="name" className="text-xs text-muted font-medium">
                Họ và tên
              </label>
              <input
                id="name"
                type="text"
                required
                minLength={2}
                maxLength={150}
                placeholder="Nguyễn Văn An"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="border border-line rounded-xl px-3 py-2.5 text-sm outline-none focus:border-gold-dark transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-xs text-muted font-medium">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                maxLength={150}
                placeholder="johndoe@gmail.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="border border-line rounded-xl px-3 py-2.5 text-sm outline-none focus:border-gold-dark transition-colors"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label htmlFor="subject" className="text-xs text-muted font-medium">
              Chủ đề
            </label>
            <input
              id="subject"
              type="text"
              required
              minLength={2}
              maxLength={200}
              placeholder="Tôi cần hỗ trợ về đơn hàng"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              className="border border-line rounded-xl px-3 py-2.5 text-sm outline-none focus:border-gold-dark transition-colors"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="message" className="text-xs text-muted font-medium">
              Nội dung
            </label>
            <textarea
              id="message"
              required
              rows={5}
              minLength={10}
              maxLength={5000}
              placeholder="TRENDLAMA có thể hỗ trợ bạn điều gì?"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="border border-line rounded-xl px-3 py-2.5 text-sm outline-none focus:border-gold-dark transition-colors resize-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-fit mt-2 bg-ink hover:bg-gold-dark transition-colors text-paper px-5 py-3 rounded-full cursor-pointer flex items-center justify-center gap-2 text-sm font-medium disabled:opacity-60"
          >
            {loading ? "Đang gửi..." : "Gửi lời nhắn"}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ContactPage;
