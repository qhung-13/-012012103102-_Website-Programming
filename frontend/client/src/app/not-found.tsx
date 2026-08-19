import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <p className="font-mono text-sm text-muted">Lỗi 404</p>
      <h1 className="font-display text-4xl sm:text-5xl tracking-wide mt-2">
        Không tìm thấy trang
      </h1>
      <p className="text-sm text-muted mt-3 max-w-md">
        Đường dẫn có thể đã thay đổi hoặc nội dung không còn tồn tại.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-full bg-ink text-paper px-5 py-2.5 text-sm hover:opacity-90"
      >
        Về trang chủ
      </Link>
    </main>
  );
}
