"use client";

import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";

const Newsletter = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: hook up to newsletter API once backend is ready
    toast.info("Backend chưa kết nối — đăng ký nhận tin đang chờ API.");
    setEmail("");
  };

  return (
    <section className="my-20 bg-ink text-paper rounded-3xl px-6 sm:px-12 py-12 sm:py-16 flex flex-col items-center text-center gap-4">
      <span className="tag-mark text-xs uppercase tracking-[0.2em] text-gold font-mono justify-center">
        Stay in the loop
      </span>
      <h2 className="font-display text-3xl sm:text-4xl tracking-wide max-w-md text-balance">
        Get 10% off your first order
      </h2>
      <p className="text-paper/60 text-sm max-w-sm">
        Subscribe for early access to new drops, restocks, and member-only
        pricing.
      </p>
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm flex items-center gap-2 mt-2"
      >
        <input
          type="email"
          required
          placeholder="Your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 rounded-full bg-paper/10 border border-paper/20 px-4 py-2.5 text-sm text-paper placeholder:text-paper/40 outline-none focus:border-gold"
        />
        <button
          type="submit"
          aria-label="Subscribe"
          className="w-10 h-10 rounded-full bg-gold text-ink flex items-center justify-center shrink-0 hover:bg-gold-dark transition-colors cursor-pointer"
        >
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </section>
  );
};

export default Newsletter;
