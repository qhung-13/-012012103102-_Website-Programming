"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { ArrowRight, Lock, Mail, User } from "lucide-react";
import useAuthStore, { ApiError } from "@/stores/authStore";
import { safeRedirect } from "@/lib/authRedirect";

const RegisterPage = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const register = useAuthStore((s) => s.register);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success("Tạo tài khoản thành công. Chào mừng bạn đến với Roxbusi!");
      const requestedRedirect =
        typeof window !== "undefined"
          ? new URLSearchParams(window.location.search).get("redirect")
          : null;
      router.push(safeRedirect(requestedRedirect));
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
          <Image src="/logo.png" alt="Roxbusi" width={32} height={32} />
          <p className="font-display text-xl tracking-wide">Roxbusi</p>
        </Link>
        <div>
          <span className="tag-mark text-xs uppercase tracking-[0.2em] text-gold font-mono">
            Gia nhập cộng đồng
          </span>
          <h2 className="font-display text-4xl tracking-wide mt-2 leading-[0.95]">
            MÙA MỚI.
            <br />
            PHONG CÁCH MỚI.
          </h2>
          <p className="text-paper/60 text-sm mt-3 max-w-xs">
            Tạo tài khoản để nhận tin sản phẩm mới, theo dõi đơn hàng và hưởng
            ưu đãi thành viên.
          </p>
        </div>
        <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden">
          <Image src="/featured.png" alt="" fill className="object-cover" />
        </div>
      </div>

      {/* FORM */}
      <div className="flex flex-col justify-center gap-6 p-8 sm:p-12 bg-white">
        <div>
          <h1 className="font-display text-3xl tracking-wide">Tạo tài khoản</h1>
          <p className="text-sm text-muted mt-1">
            Đã có tài khoản?{" "}
            <Link
              href="/login"
              className="text-ink font-medium underline hover:text-gold-dark"
            >
              Đăng nhập
            </Link>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="name" className="text-xs text-muted font-medium">
              Họ và tên
            </label>
            <div className="flex items-center gap-2 border border-line rounded-xl px-3 py-2.5 focus-within:border-gold-dark transition-colors">
              <User className="w-4 h-4 text-muted shrink-0" />
              <input
                id="name"
                type="text"
                required
                minLength={2}
                maxLength={150}
                placeholder="Nguyễn Văn An"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="text-sm outline-none w-full"
              />
            </div>
          </div>

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
            <label
              htmlFor="password"
              className="text-xs text-muted font-medium"
            >
              Mật khẩu
            </label>
            <div className="flex items-center gap-2 border border-line rounded-xl px-3 py-2.5 focus-within:border-gold-dark transition-colors">
              <Lock className="w-4 h-4 text-muted shrink-0" />
              <input
                id="password"
                type="password"
                required
                minLength={8}
                maxLength={72}
                placeholder="Từ 8 đến 72 ký tự"
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
            {loading ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <p className="text-xs text-muted text-center leading-relaxed">
            Khi đăng ký, bạn đồng ý với{" "}
            <Link href="/terms" className="underline hover:text-ink">
              Điều khoản sử dụng
            </Link>{" "}
            và{" "}
            <Link href="/privacy" className="underline hover:text-ink">
              Chính sách quyền riêng tư
            </Link>
            .
          </p>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
