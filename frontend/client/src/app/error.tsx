"use client";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <h1 className="font-display text-4xl tracking-wide">Đã xảy ra lỗi</h1>
      <p className="text-sm text-muted mt-3 max-w-md">
        Không thể tải nội dung lúc này. Vui lòng thử lại sau ít phút.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 rounded-full bg-ink text-paper px-5 py-2.5 text-sm hover:opacity-90"
      >
        Thử lại
      </button>
    </main>
  );
}
