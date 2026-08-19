"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { BadgeCheck, Shield, Loader2 } from "lucide-react";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import EditUser from "@/components/forms/EditUser";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import useAuthStore from "@/stores/authStore";
import { apiFetch, ApiError, resolveImageUrl } from "@/lib/api";
import { toast } from "react-toastify";

type ApiUser = {
  id: number;
  name: string;
  email: string;
  role: "admin" | "customer";
  phone: string | null;
  address: string | null;
  status: "active" | "blocked";
  avatar: string | null;
  created_at: string;
};

const SingleUserPage = () => {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuthStore();
  const [user, setUser] = useState<ApiUser | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch<ApiUser>(`/users/${id}`, { token });
      setUser(res.data);
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Không thể tải người dùng.",
      );
    } finally {
      setLoading(false);
    }
  }, [id, token]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground py-16 justify-center">
        <Loader2 className="w-4 h-4 animate-spin" /> Đang tải người dùng...
      </div>
    );
  }

  if (!user) {
    return (
      <p className="text-sm text-muted-foreground text-center py-16">
        Không tìm thấy người dùng.
      </p>
    );
  }

  const initials = user.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Tổng quan</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/users">Người dùng</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{user.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      {/* CONTAINER */}
      <div className="mt-4 flex flex-col xl:flex-row gap-8">
        {/* LEFT */}
        <div className="w-full max-w-2xl space-y-6">
          {/* USER BADGES CONTAINER */}
          <div className="bg-card border p-4 rounded-2xl">
            <h1 className="text-xl font-semibold">Trạng thái tài khoản</h1>
            <div className="flex gap-4 mt-4">
              <HoverCard>
                <HoverCardTrigger>
                  <BadgeCheck
                    size={36}
                    className="rounded-full bg-blue-500/30 border-1 border-blue-500/50 p-2"
                  />
                </HoverCardTrigger>
                <HoverCardContent>
                  <h1 className="font-bold mb-2">
                    {user.status === "active"
                      ? "Tài khoản hoạt động"
                      : "Đã bị khóa"}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Trạng thái hiện tại của tài khoản.
                  </p>
                </HoverCardContent>
              </HoverCard>
              {user.role === "admin" && (
                <HoverCard>
                  <HoverCardTrigger>
                    <Shield
                      size={36}
                      className="rounded-full bg-green-800/30 border-1 border-green-800/50 p-2"
                    />
                  </HoverCardTrigger>
                  <HoverCardContent>
                    <h1 className="font-bold mb-2">Quản trị viên</h1>
                    <p className="text-sm text-muted-foreground">
                      Quản trị viên có quyền truy cập các chức năng quản lý.
                    </p>
                  </HoverCardContent>
                </HoverCard>
              )}
            </div>
          </div>
          {/* USER CARD CONTAINER */}
          <div className="bg-card border p-4 rounded-2xl space-y-2">
            <div className="flex items-center gap-2">
              <Avatar className="size-12">
                <AvatarImage
                  src={user.avatar ? resolveImageUrl(user.avatar) : undefined}
                />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <h1 className="text-xl font-semibold">{user.name}</h1>
            </div>
            <p className="text-sm text-muted-foreground capitalize">
              {user.role === "admin" ? "Quản trị viên" : "Khách hàng"} ·{" "}
              {user.status === "active" ? "Hoạt động" : "Đã khóa"}
            </p>
          </div>
          {/* INFORMATION CONTAINER */}
          <div className="bg-card border p-4 rounded-2xl">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-semibold">Thông tin người dùng</h1>
              <Sheet>
                <SheetTrigger asChild>
                  <Button>Sửa thông tin</Button>
                </SheetTrigger>
                <EditUser
                  userId={user.id}
                  defaultValues={{
                    fullName: user.name,
                    phone: user.phone ?? "",
                    address: user.address ?? "",
                    role: user.role,
                    status: user.status,
                    password: "",
                  }}
                  onUpdated={load}
                />
              </Sheet>
            </div>
            <div className="space-y-4 mt-4">
              <div className="flex items-center gap-2">
                <span className="font-bold">Họ và tên:</span>
                <span>{user.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold">Email:</span>
                <span>{user.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold">Điện thoại:</span>
                <span>{user.phone || "—"}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold">Địa chỉ:</span>
                <span>{user.address || "—"}</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Tham gia ngày{" "}
              {new Date(user.created_at).toLocaleDateString("vi-VN")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleUserPage;
