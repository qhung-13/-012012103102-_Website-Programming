"use client";

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

const chartConfig = {
  total: { label: "Tổng giá trị đơn", color: "var(--chart-1)" },
  successful: { label: "Doanh thu hoàn tất", color: "var(--chart-4)" },
} satisfies ChartConfig;

type RevenuePoint = { month: string; total: number; successful: number };

const AppBarChart = ({ data }: { data: RevenuePoint[] }) => (
  <div>
    <h2 className="text-lg font-medium mb-6">Doanh thu 6 tháng gần nhất</h2>
    <ChartContainer config={chartConfig} className="min-h-[220px] w-full">
      <BarChart accessibilityLayer data={data}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="month"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
        />
        <YAxis tickLine={false} tickMargin={10} axisLine={false} width={50} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="total" fill="var(--color-total)" radius={4} />
        <Bar dataKey="successful" fill="var(--color-successful)" radius={4} />
      </BarChart>
    </ChartContainer>
  </div>
);

export default AppBarChart;
