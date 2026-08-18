"use client";

import useAuthStore from "@/stores/authStore";
import { apiFetch, ApiError } from "@/lib/api";
import { Package } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

type OrderRow = {
  id: number;
  status: string;
  total: number;
  created_at: string;
};

const statusStyles: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  processing: "bg-blue-100 text-blue-700",
  success: "bg-emerald-100 text-emerald-700",
  failed: "bg-red-100 text-red-700",
  cancelled: "bg-gray-100 text-gray-500",
};

const OrdersPage = () => {
  const { user, token, hasHydrated } = useAuthStore();
  const [orders, setOrders] = useState<OrderRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hasHydrated) return;
    if (!token) {
      setOrders([]);
      return;
    }
    apiFetch<OrderRow[]>("/orders", { token })
      .then((res) => setOrders(res.data))
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : "Failed to load orders.");
        setOrders([]);
      });
  }, [hasHydrated, token]);

  if (hasHydrated && !user) {
    return (
      <div className="mt-16 mb-16 flex flex-col items-center gap-3 text-center">
        <Package className="w-8 h-8 text-muted" />
        <p className="text-sm text-muted">Sign in to see your order history.</p>
        <Link href="/login" className="text-sm font-medium underline hover:text-gold-dark">
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-8 mb-16">
      <div className="mb-6">
        <span className="tag-mark text-xs uppercase tracking-[0.2em] text-muted font-mono">
          Account
        </span>
        <h1 className="font-display text-4xl tracking-wide mt-1">My Orders</h1>
      </div>

      {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

      {orders === null ? (
        <p className="text-sm text-muted">Loading...</p>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <Package className="w-8 h-8 text-muted" />
          <p className="text-sm text-muted">You haven&apos;t placed any orders yet.</p>
          <Link href="/products" className="text-sm font-medium underline hover:text-gold-dark">
            Browse products
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white border border-line rounded-2xl px-5 py-4 flex items-center justify-between"
            >
              <div>
                <p className="font-mono text-sm font-medium">Order #{order.id}</p>
                <p className="text-xs text-muted mt-0.5">
                  {new Date(order.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${
                    statusStyles[order.status] ?? "bg-gray-100 text-gray-500"
                  }`}
                >
                  {order.status}
                </span>
                <span className="font-mono font-medium">${Number(order.total).toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
