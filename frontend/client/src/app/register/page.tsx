"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { ArrowRight, Lock, Mail, User } from "lucide-react";
import useAuthStore, { ApiError } from "@/stores/authStore";

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
      toast.success("Account created! Welcome to TRENDLAMA.");
      router.push("/");
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Something went wrong. Please try again.";
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
            Join the club
          </span>
          <h2 className="font-display text-4xl tracking-wide mt-2 leading-[0.95]">
            NEW SEASON.
            <br />
            NEW YOU.
          </h2>
          <p className="text-paper/60 text-sm mt-3 max-w-xs">
            Create an account for early drops, order tracking and member
            pricing.
          </p>
        </div>
        <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden">
          <Image src="/featured.png" alt="" fill className="object-cover" />
        </div>
      </div>

      {/* FORM */}
      <div className="flex flex-col justify-center gap-6 p-8 sm:p-12 bg-white">
        <div>
          <h1 className="font-display text-3xl tracking-wide">
            Create account
          </h1>
          <p className="text-sm text-muted mt-1">
            Already a member?{" "}
            <Link
              href="/login"
              className="text-ink font-medium underline hover:text-gold-dark"
            >
              Sign in
            </Link>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="name" className="text-xs text-muted font-medium">
              Full name
            </label>
            <div className="flex items-center gap-2 border border-line rounded-xl px-3 py-2.5 focus-within:border-gold-dark transition-colors">
              <User className="w-4 h-4 text-muted shrink-0" />
              <input
                id="name"
                type="text"
                required
                placeholder="John Doe"
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
              Password
            </label>
            <div className="flex items-center gap-2 border border-line rounded-xl px-3 py-2.5 focus-within:border-gold-dark transition-colors">
              <Lock className="w-4 h-4 text-muted shrink-0" />
              <input
                id="password"
                type="password"
                required
                placeholder="At least 8 characters"
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
            {loading ? "Creating account..." : "Create account"}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <p className="text-xs text-muted text-center leading-relaxed">
            By signing up, you agree to our{" "}
            <span className="underline hover:text-ink cursor-pointer">
              Terms & Conditions
            </span>{" "}
            and{" "}
            <span className="underline hover:text-ink cursor-pointer">
              Privacy Policy
            </span>
            .
          </p>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
