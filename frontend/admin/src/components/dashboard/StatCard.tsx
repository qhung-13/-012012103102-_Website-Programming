import { LucideIcon } from "lucide-react";

type StatCardProps = {
  title: string;
  value: string;
  subtitle: string;
  icon: LucideIcon;
};

const StatCard = ({ title, value, subtitle, icon: Icon }: StatCardProps) => {
  return (
    <div className="bg-card border rounded-2xl p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{title}</p>
        <div className="w-8 h-8 rounded-full bg-gold/15 flex items-center justify-center">
          <Icon className="w-4 h-4" style={{ color: "var(--gold)" }} />
        </div>
      </div>
      <p className="text-2xl font-semibold font-mono">{value}</p>
      <p className="text-xs text-muted-foreground">{subtitle}</p>
    </div>
  );
};

export default StatCard;
