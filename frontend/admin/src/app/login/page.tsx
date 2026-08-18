"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "react-toastify";
import { Lock, Mail, ArrowRight } from "lucide-react";
import useAuthStore, { ApiError } from "@/stores/authStore";
import { Button } from "@/components/ui/button";

const AdminLoginPage = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success("Welcome back!");
      router.push("/");
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Something went wrong.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-sidebar px-4">
      <div className="w-full max-w-sm bg-card border rounded-2xl p-8 flex flex-col gap-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="w-10 h-10 rounded-full bg-gold flex items-center justify-center">
            <Image src="/logo.svg" alt="TrendLama" width={22} height={22} />
          </div>
          <h1 className="text-lg font-semibold tracking-tight">
            TRENDLAMA Admin
          </h1>
          <p className="text-sm text-muted-foreground">
            Sign in to manage your store
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="email"
              className="text-xs font-medium text-muted-foreground"
            >
              Email
            </label>
            <div className="flex items-center gap-2 border rounded-md px-3 py-2 focus-within:ring-1 focus-within:ring-ring">
              <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
              <input
                id="email"
                type="email"
                required
                placeholder="admin@trendlama.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="text-sm outline-none w-full bg-transparent"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="password"
              className="text-xs font-medium text-muted-foreground"
            >
              Password
            </label>
            <div className="flex items-center gap-2 border rounded-md px-3 py-2 focus-within:ring-1 focus-within:ring-ring">
              <Lock className="w-4 h-4 text-muted-foreground shrink-0" />
              <input
                id="password"
                type="password"
                required
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="text-sm outline-none w-full bg-transparent"
              />
            </div>
          </div>
          <Button type="submit" disabled={loading} className="mt-2 gap-2">
            {loading ? "Signing in..." : "Sign in"}
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </form>

        <p className="text-xs text-muted-foreground text-center">
          Demo account: admin@trendlama.com / Admin@123
        </p>
      </div>
    </div>
  );
};

export default AdminLoginPage;
