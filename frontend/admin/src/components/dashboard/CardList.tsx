"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import useAuthStore from "@/stores/authStore";
import { apiFetch, resolveImageUrl } from "@/lib/api";

type ApiProduct = {
  id: number;
  name: string;
  price: number;
  images: Record<string, string>;
};

type ApiOrder = {
  id: number;
  shipping_name: string;
  status: string;
  total: number;
};

const statusLabels: Record<string, string> = {
  pending: "Chờ xác nhận",
  processing: "Đang xử lý",
  success: "Hoàn tất",
  failed: "Thất bại",
  cancelled: "Đã hủy",
};

const CardList = ({
  title,
  type,
}: {
  title: string;
  type: "products" | "orders";
}) => {
  const { token } = useAuthStore();
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        if (type === "products") {
          const res = await apiFetch<ApiProduct[]>(
            "/products?limit=5&sort=newest",
          );
          setProducts(res.data);
        } else {
          const res = await apiFetch<ApiOrder[]>("/orders?limit=5", { token });
          setOrders(res.data);
        }
        setLoadError(false);
      } catch {
        setLoadError(true);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [type, token]);

  return (
    <div className="">
      <h1 className="text-lg font-medium mb-6">{title}</h1>
      <div className="flex flex-col gap-2">
        {loading ? (
          <p className="text-sm text-muted-foreground">Đang tải...</p>
        ) : loadError ? (
          <p className="text-sm text-destructive">Không thể tải dữ liệu.</p>
        ) : type === "products" ? (
          products.length === 0 ? (
            <p className="text-sm text-muted-foreground">Chưa có sản phẩm.</p>
          ) : (
            products.map((item) => (
              <Card
                key={item.id}
                className="flex-row items-center justify-between gap-4 p-3 hover:bg-accent/40 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl relative overflow-hidden bg-muted shrink-0">
                  {Object.values(item.images)[0] && (
                    <Image
                      src={resolveImageUrl(Object.values(item.images)[0])}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  )}
                </div>
                <CardContent className="flex-1 p-0">
                  <CardTitle className="text-sm font-medium">
                    {item.name}
                  </CardTitle>
                </CardContent>
                <CardFooter className="p-0 font-mono text-sm">
                  ${Number(item.price).toFixed(2)}
                </CardFooter>
              </Card>
            ))
          )
        ) : orders.length === 0 ? (
          <p className="text-sm text-muted-foreground">Chưa có đơn hàng.</p>
        ) : (
          orders.map((item) => (
            <Card
              key={item.id}
              className="flex-row items-center justify-between gap-4 p-3 hover:bg-accent/40 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-muted shrink-0 flex items-center justify-center text-xs font-mono text-muted-foreground">
                #{item.id}
              </div>
              <CardContent className="flex-1 p-0">
                <CardTitle className="text-sm font-medium">
                  Đơn hàng #{item.id}
                </CardTitle>
                <Badge variant="secondary" className="capitalize">
                  {item.shipping_name} ·{" "}
                  {statusLabels[item.status] ?? item.status}
                </Badge>
              </CardContent>
              <CardFooter className="p-0 font-mono text-sm">
                ${Number(item.total).toFixed(2)}
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default CardList;
