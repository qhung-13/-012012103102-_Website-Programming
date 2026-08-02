import AppAreaChart from "@/components/dashboard/AppAreaChart";
import AppBarChart from "@/components/dashboard/AppBarChart";
import AppPieChart from "@/components/dashboard/AppPieChart";
import CardList from "@/components/dashboard/CardList";
import TodoList from "@/components/dashboard/TodoList";
import StatCard from "@/components/dashboard/StatCard";
import { DollarSign, Package, ShoppingCart, Users } from "lucide-react";

const stats = [
  {
    title: "Total Revenue",
    value: "$48,290",
    change: "+12.4%",
    trend: "up" as const,
    icon: DollarSign,
  },
  {
    title: "Total Orders",
    value: "1,342",
    change: "+8.1%",
    trend: "up" as const,
    icon: ShoppingCart,
  },
  {
    title: "Total Users",
    value: "3,801",
    change: "+3.6%",
    trend: "up" as const,
    icon: Users,
  },
  {
    title: "Total Products",
    value: "186",
    change: "-1.2%",
    trend: "down" as const,
    icon: Package,
  },
];

const Homepage = () => {
  return (
    <div className="flex flex-col gap-4 py-4">
      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => (
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
