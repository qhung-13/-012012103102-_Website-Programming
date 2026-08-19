import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <p className="text-sm text-muted-foreground">Lỗi 404</p>
      <h1 className="text-3xl font-semibold mt-2">Không tìm thấy trang</h1>
      <p className="text-sm text-muted-foreground mt-3">
        Mục quản trị này không tồn tại hoặc đã được di chuyển.
      </p>
      <Button asChild className="mt-6">
        <Link href="/">Về bảng điều khiển</Link>
      </Button>
    </main>
  );
}
