"use client";

import { Mail, MapPin, Phone, ArrowRight } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";

const contactInfo = [
  {
    icon: <Mail className="w-4 h-4" />,
    title: "Email",
    value: "support@trendlama.com",
  },
  {
    icon: <Phone className="w-4 h-4" />,
    title: "Phone",
    value: "+84 28 1234 5678",
  },
  {
    icon: <MapPin className="w-4 h-4" />,
    title: "Studio",
    value: "District 1, Ho Chi Minh City, Vietnam",
  },
];

const ContactPage = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: hook up to contact API once backend is ready
    toast.info("Backend chưa kết nối — tin nhắn đang chờ API.");
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <div className="mt-8 mb-16">
      <div className="mb-10 text-center">
        <span className="tag-mark text-xs uppercase tracking-[0.2em] text-muted font-mono justify-center">
          Get in touch
        </span>
        <h1 className="font-display text-4xl sm:text-5xl tracking-wide mt-1">
          We&apos;d Love to Hear From You
        </h1>
        <p className="text-muted text-sm max-w-md mx-auto mt-3">
          Questions about an order, sizing, or a partnership? Send us a message
          and we&apos;ll get back within 1-2 business days.
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="name" className="text-xs text-muted font-medium">
                Name
              </label>
              <input
                id="name"
                type="text"
                required
                placeholder="John Doe"
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
                placeholder="johndoe@gmail.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="border border-line rounded-xl px-3 py-2.5 text-sm outline-none focus:border-gold-dark transition-colors"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="message" className="text-xs text-muted font-medium">
              Message
            </label>
            <textarea
              id="message"
              required
              rows={5}
              placeholder="How can we help?"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="border border-line rounded-xl px-3 py-2.5 text-sm outline-none focus:border-gold-dark transition-colors resize-none"
            />
          </div>
          <button
            type="submit"
            className="w-fit mt-2 bg-ink hover:bg-gold-dark transition-colors text-paper px-5 py-3 rounded-full cursor-pointer flex items-center justify-center gap-2 text-sm font-medium"
          >
            Send message
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ContactPage;
