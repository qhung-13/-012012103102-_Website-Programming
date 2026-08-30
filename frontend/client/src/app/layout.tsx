import type { Metadata } from "next";
import { Geist, Geist_Mono, Bebas_Neue } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { ToastContainer } from "react-toastify";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const bebasNeue = Bebas_Neue({
  variable: "--font-bebas",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Roxbusi — Thời trang cho mỗi ngày",
  description:
    "Khám phá thời trang hiện đại, thoải mái và bền vững tại Roxbusi.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${bebasNeue.variable} antialiased font-sans bg-paper text-ink`}
      >
        <div className="mx-auto px-4 sm:px-6 sm:max-w-xl md:max-w-2xl lg:max-w-3xl xl:max-w-6xl">
          <Navbar />
          <main>{children}</main>
          <Footer />
        </div>
        <ToastContainer position="bottom-right" />
      </body>
    </html>
  );
}
