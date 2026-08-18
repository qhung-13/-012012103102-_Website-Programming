"use client";

import { useEffect, useState } from "react";
import AppAreaChart from "@/components/dashboard/AppAreaChart";
import AppBarChart from "@/components/dashboard/AppBarChart";
import AppPieChart from "@/components/dashboard/AppPieChart";
import CardList from "@/components/dashboard/CardList";
import TodoList from "@/components/dashboard/TodoList";
import StatCard from "@/components/dashboard/StatCard";
import { DollarSign, Package, ShoppingCart, Users } from "lucide-react";
import useAuthStore from "@/stores/authStore";
import { apiFetch } from "@/lib/api";

type OrderRow = { total: number; status: string };

const Homepage = () => {
  const { token } = useAuthStore();
  const [stats, setStats] = useState({
    revenue: 0,
    orders: 0,
    users: 0,
    products: 0,
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [productsRes, usersRes, ordersRes] = await Promise.all([
          apiFetch<unknown[]>("/products?limit=1"),
          apiFetch<unknown[]>("/users?limit=1", { token }),
          apiFetch<OrderRow[]>("/orders?limit=100", { token }),
        ]);

        const revenue = ordersRes.data
          .filter((o) => o.status === "success")
          .reduce((sum, o) => sum + Number(o.total), 0);

        setStats({
          revenue,
          orders: ordersRes.meta?.total ?? ordersRes.data.length,
          users: usersRes.meta?.total ?? 0,
          products: productsRes.meta?.total ?? 0,
        });
      } catch {
        // Keep zeros if the request fails — widgets below handle their own errors.
      }
    };
    load();
  }, [token]);

  const statCards = [
    {
      title: "Total Revenue",
      value: `$${stats.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      subtitle: "From successful orders",
      icon: DollarSign,
    },
    {
      title: "Total Orders",
      value: stats.orders.toLocaleString(),
      subtitle: "All time",
      icon: ShoppingCart,
    },
    {
      title: "Total Users",
      value: stats.users.toLocaleString(),
      subtitle: "Registered accounts",
      icon: Users,
    },
    {
      title: "Total Products",
      value: stats.products.toLocaleString(),
      subtitle: "Active in catalog",
      icon: Package,
    },
  ];

  return (
    <div className="flex flex-col gap-4 py-4">
      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* CHARTS & LISTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-4 gap-4">
        <div className="bg-card border p-4 rounded-2xl lg:col-span-2 xl:col-span-1 2xl:col-span-2">
          <AppBarChart />
        </div>
        <div className="bg-card border p-4 rounded-2xl">
          <CardList title="Latest Transactions" />
        </div>
        <div className="bg-card border p-4 rounded-2xl">
          <AppPieChart />
        </div>
        <div className="bg-card border p-4 rounded-2xl">
          <TodoList />
        </div>
        <div className="bg-card border p-4 rounded-2xl lg:col-span-2 xl:col-span-1 2xl:col-span-2">
          <AppAreaChart />
        </div>
        <div className="bg-card border p-4 rounded-2xl">
          <CardList title="Popular Products" />
        </div>
      </div>
    </div>
  );
};

export default Homepage;
