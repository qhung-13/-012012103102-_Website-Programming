"use client";

import { Label, Pie, PieChart } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
  orders: { label: "Đơn hàng" },
  pending: { label: "Chờ xác nhận", color: "var(--chart-1)" },
  processing: { label: "Đang xử lý", color: "var(--chart-2)" },
  success: { label: "Hoàn tất", color: "var(--chart-3)" },
  failed: { label: "Thất bại", color: "var(--chart-4)" },
  cancelled: { label: "Đã hủy", color: "var(--chart-5)" },
} satisfies ChartConfig;

type StatusPoint = {
  status: string;
  label: string;
  orders: number;
  fill: string;
};

const AppPieChart = ({ data }: { data: StatusPoint[] }) => {
  const totalOrders = data.reduce((sum, item) => sum + item.orders, 0);
  return (
    <div>
      <h2 className="text-lg font-medium mb-6">Trạng thái đơn hàng</h2>
      {totalOrders === 0 ? (
        <p className="text-sm text-muted-foreground py-20 text-center">
          Chưa có đơn hàng.
        </p>
      ) : (
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[280px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel nameKey="label" />}
            />
            <Pie
              data={data}
              dataKey="orders"
              nameKey="status"
              innerRadius={60}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (!viewBox || !("cx" in viewBox) || !("cy" in viewBox))
                    return null;
                  return (
                    <text
                      x={viewBox.cx}
                      y={viewBox.cy}
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      <tspan
                        x={viewBox.cx}
                        y={viewBox.cy}
                        className="fill-foreground text-3xl font-bold"
                      >
                        {totalOrders.toLocaleString("vi-VN")}
                      </tspan>
                      <tspan
                        x={viewBox.cx}
                        y={(viewBox.cy || 0) + 24}
                        className="fill-muted-foreground"
                      >
                        Đơn hàng
                      </tspan>
                    </text>
                  );
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      )}
    </div>
  );
};

export default AppPieChart;
