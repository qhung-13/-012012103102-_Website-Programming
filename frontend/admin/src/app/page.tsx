"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import AppBarChart from "@/components/dashboard/AppBarChart";
import AppPieChart from "@/components/dashboard/AppPieChart";
import CardList from "@/components/dashboard/CardList";
import StatCard from "@/components/dashboard/StatCard";
import { DollarSign, Package, ShoppingCart, Users } from "lucide-react";
import useAuthStore from "@/stores/authStore";
import { apiFetch } from "@/lib/api";

type DashboardData = {
  stats: {
    revenue: number;
    orders: number;
    users: number;
    products: number;
  };
  monthly: { month: string; total: number; successful: number }[];
  statuses: { status: string; orders: number }[];
};

const emptyDashboard: DashboardData = {
  stats: { revenue: 0, orders: 0, users: 0, products: 0 },
  monthly: [],
  statuses: [],
};

const Homepage = () => {
  const token = useAuthStore((state) => state.token);
  const [dashboard, setDashboard] = useState<DashboardData>(emptyDashboard);
  const [loadError, setLoadError] = useState(false);

  const load = useCallback(async () => {
    try {
      const response = await apiFetch<DashboardData>("/dashboard", { token });
      setDashboard(response.data);
      setLoadError(false);
    } catch {
      setLoadError(true);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const events = [
      "roxbusi:products-changed",
      "roxbusi:users-changed",
      "roxbusi:orders-changed",
    ];
    events.forEach((event) => window.addEventListener(event, load));
    return () =>
      events.forEach((event) => window.removeEventListener(event, load));
  }, [load]);

  const revenueChart = useMemo(() => {
    const values = new Map(dashboard.monthly.map((item) => [item.month, item]));
    const now = new Date();
    return Array.from({ length: 6 }, (_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const item = values.get(key);
      return {
        month: date.toLocaleDateString("vi-VN", {
          month: "short",
          year: "2-digit",
        }),
        total: Number(item?.total ?? 0),
        successful: Number(item?.successful ?? 0),
      };
    });
  }, [dashboard.monthly]);

  const statusChart = useMemo(() => {
    const counts = new Map(
      dashboard.statuses.map((item) => [item.status, Number(item.orders)]),
    );
    const labels: Record<string, string> = {
      pending: "Chờ xác nhận",
      processing: "Đang xử lý",
      success: "Hoàn tất",
      failed: "Thất bại",
      cancelled: "Đã hủy",
    };
    const fills = [
      "var(--chart-1)",
      "var(--chart-2)",
      "var(--chart-3)",
      "var(--chart-4)",
      "var(--chart-5)",
    ];
    return Object.entries(labels).map(([status, label], index) => ({
      status,
      label,
      orders: counts.get(status) ?? 0,
      fill: fills[index],
    }));
  }, [dashboard.statuses]);

  const statCards = [
    {
      title: "Tổng doanh thu",
      value: `$${Number(dashboard.stats.revenue).toLocaleString("vi-VN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      subtitle: "Từ các đơn hoàn tất",
      icon: DollarSign,
    },
    {
      title: "Tổng đơn hàng",
      value: Number(dashboard.stats.orders).toLocaleString("vi-VN"),
      subtitle: "Từ trước đến nay",
      icon: ShoppingCart,
    },
    {
      title: "Tổng người dùng",
      value: Number(dashboard.stats.users).toLocaleString("vi-VN"),
      subtitle: "Tài khoản đã đăng ký",
      icon: Users,
    },
    {
      title: "Tổng sản phẩm",
      value: Number(dashboard.stats.products).toLocaleString("vi-VN"),
      subtitle: "Sản phẩm đang bán",
      icon: Package,
    },
  ];

  return (
    <div className="flex flex-col gap-4 py-4">
      {loadError && (
        <p className="text-sm text-destructive">
          Không thể tải đầy đủ số liệu tổng quan. Vui lòng thử tải lại trang.
        </p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-4 gap-4">
        <div className="bg-card border p-4 rounded-2xl lg:col-span-2 2xl:col-span-2">
          <AppBarChart data={revenueChart} />
        </div>
        <div className="bg-card border p-4 rounded-2xl">
          <CardList type="orders" title="Đơn hàng mới nhất" />
        </div>
        <div className="bg-card border p-4 rounded-2xl">
          <AppPieChart data={statusChart} />
        </div>
        <div className="bg-card border p-4 rounded-2xl">
          <CardList type="products" title="Sản phẩm mới" />
        </div>
      </div>
    </div>
  );
};

export default Homepage;
