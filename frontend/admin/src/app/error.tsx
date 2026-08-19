"use client";

import { Button } from "@/components/ui/button";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-3xl font-semibold">Đã xảy ra lỗi</h1>
      <p className="text-sm text-muted-foreground mt-3">
        Không thể tải nội dung quản trị. Vui lòng thử lại.
      </p>
      <Button type="button" onClick={reset} className="mt-6">
        Thử lại
      </Button>
    </main>
  );
}
