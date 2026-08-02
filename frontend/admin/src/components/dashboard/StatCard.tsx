import { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

type StatCardProps = {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
  icon: LucideIcon;
};

const StatCard = ({ title, value, change, trend, icon: Icon }: StatCardProps) => {
  return (
    <div className="bg-card border rounded-2xl p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{title}</p>
        <div className="w-8 h-8 rounded-full bg-gold/15 text-gold-foreground flex items-center justify-center">
          <Icon className="w-4 h-4" style={{ color: "var(--gold)" }} />
        </div>
      </div>
      <p className="text-2xl font-semibold font-mono">{value}</p>
      <div
        className={`flex items-center gap-1 text-xs font-medium ${
          trend === "up" ? "text-emerald-600" : "text-red-500"
        }`}
      >
        {trend === "up" ? (
          <ArrowUpRight className="w-3.5 h-3.5" />
        ) : (
          <ArrowDownRight className="w-3.5 h-3.5" />
        )}
        {change}
        <span className="text-muted-foreground font-normal">vs last month</span>
      </div>
    </div>
  );
};

export default StatCard;
