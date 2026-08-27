"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { ArrowRight, Lock, Mail } from "lucide-react";
import useAuthStore, { ApiError } from "@/stores/authStore";
import { getSafeRedirect } from "@/lib/authRedirect";

const LoginPage = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success("Đăng nhập thành công!");
      const redirect =
        typeof window === "undefined"
          ? "/"
          : getSafeRedirect(
              new URLSearchParams(window.location.search).get("redirect"),
            );
      router.replace(redirect);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Đã xảy ra lỗi. Vui lòng thử lại.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6 mb-16 grid grid-cols-1 lg:grid-cols-2 gap-6 rounded-3xl overflow-hidden border border-line">
      {/* BRAND PANEL */}
      <div className="hidden lg:flex relative bg-ink text-paper flex-col justify-between p-10">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="TrendLama" width={32} height={32} />
          <p className="font-display text-xl tracking-wide">TRENDLAMA</p>
        </Link>
        <div>
          <span className="tag-mark text-xs uppercase tracking-[0.2em] text-gold font-mono">
            Chào mừng trở lại
          </span>
          <h2 className="font-display text-4xl tracking-wide mt-2 leading-[0.95]">
            TỦ ĐỒ CỦA BẠN
            <br />
            ĐANG CHỜ BẠN.
          </h2>
          <p className="text-paper/60 text-sm mt-3 max-w-xs">
            Đăng nhập để theo dõi đơn hàng, lưu sản phẩm yêu thích và mua sắm
            nhanh hơn.
          </p>
        </div>
        <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden">
          <Image src="/featured.png" alt="" fill className="object-cover" />
        </div>
      </div>

      {/* FORM */}
      <div className="flex flex-col justify-center gap-6 p-8 sm:p-12 bg-white">
        <div>
          <h1 className="font-display text-3xl tracking-wide">Đăng nhập</h1>
          <p className="text-sm text-muted mt-1">
            Chưa có tài khoản?{" "}
            <Link
              href="/register"
              className="text-ink font-medium underline hover:text-gold-dark"
            >
              Đăng ký ngay
            </Link>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-xs text-muted font-medium">
              Email
            </label>
            <div className="flex items-center gap-2 border border-line rounded-xl px-3 py-2.5 focus-within:border-gold-dark transition-colors">
              <Mail className="w-4 h-4 text-muted shrink-0" />
              <input
                id="email"
                type="email"
                required
                maxLength={150}
                placeholder="johndoe@gmail.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="text-sm outline-none w-full"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="text-xs text-muted font-medium"
              >
                Mật khẩu
              </label>
              <Link
                href="/contact"
                className="text-xs text-muted hover:text-ink"
              >
                Cần hỗ trợ đăng nhập?
              </Link>
            </div>
            <div className="flex items-center gap-2 border border-line rounded-xl px-3 py-2.5 focus-within:border-gold-dark transition-colors">
              <Lock className="w-4 h-4 text-muted shrink-0" />
              <input
                id="password"
                type="password"
                required
                maxLength={72}
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="text-sm outline-none w-full"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full bg-ink hover:bg-gold-dark transition-colors text-paper p-3 rounded-full cursor-pointer flex items-center justify-center gap-2 text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
