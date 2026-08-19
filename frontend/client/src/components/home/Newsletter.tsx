"use client";

import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";
import { apiFetch, ApiError } from "@/lib/api";

const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await apiFetch("/newsletter", {
        method: "POST",
        body: { email, website },
      });
      toast.success(response.message);
      setEmail("");
      setWebsite("");
    } catch (error) {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Không thể đăng ký nhận tin.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="my-20 bg-ink text-paper rounded-3xl px-6 sm:px-12 py-12 sm:py-16 flex flex-col items-center text-center gap-4">
      <span className="tag-mark text-xs uppercase tracking-[0.2em] text-gold font-mono justify-center">
        Đừng bỏ lỡ xu hướng
      </span>
      <h2 className="font-display text-3xl sm:text-4xl tracking-wide max-w-md text-balance">
        Nhận ưu đãi 10% cho đơn đầu tiên
      </h2>
      <p className="text-paper/60 text-sm max-w-sm">
        Đăng ký để biết sớm về sản phẩm mới, hàng vừa về và ưu đãi dành riêng
        cho thành viên.
      </p>
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm flex items-center gap-2 mt-2"
      >
        <label
          htmlFor="newsletter-website"
          className="sr-only"
          aria-hidden="true"
        >
          Trang web
        </label>
        <input
          id="newsletter-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(event) => setWebsite(event.target.value)}
          className="sr-only"
          aria-hidden="true"
        />
        <input
          type="email"
          required
          maxLength={150}
          placeholder="Địa chỉ email của bạn"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 rounded-full bg-paper/10 border border-paper/20 px-4 py-2.5 text-sm text-paper placeholder:text-paper/40 outline-none focus:border-gold"
        />
        <button
          type="submit"
          disabled={loading}
          aria-label="Đăng ký nhận tin"
          className="w-10 h-10 rounded-full bg-gold text-ink flex items-center justify-center shrink-0 hover:bg-gold-dark transition-colors cursor-pointer disabled:opacity-60"
        >
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </section>
  );
};

export default Newsletter;
