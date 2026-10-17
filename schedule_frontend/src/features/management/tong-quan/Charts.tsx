import React from "react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardHeader, EmptyState } from "@/components/ui";
import type { StatStore } from "@/lib/api";
import { chartAxisTick, chartColors, chartTooltipStyle } from "@/lib/theme";
import { REQUEST_STATUS } from "@/features/statistics/dashboard";

const STATUS_COLOR: Record<string, string> = {
  APPROVED: chartColors.success,
  PENDING: chartColors.brand,
  REJECTED: chartColors.danger,
  CANCELLED: chartColors.axis,
};

/** Tỷ lệ yêu cầu đổi / hủy ca trong tháng theo trạng thái. */
export function RequestStatusChart({ data }: { data: Record<string, number> }) {
  const items = Object.entries(data)
    .filter(([, value]) => value > 0)
    .map(([status, value]) => ({
      status,
      name: REQUEST_STATUS[status]?.label ?? status,
      value,
      color: STATUS_COLOR[status] ?? chartColors.info,
    }));
  const total = items.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className="flex flex-col">
      <CardHeader title="Yêu cầu đổi / hủy ca tháng này" />
      {total === 0 ? (
        <EmptyState className="m-5 flex-1">Chưa có yêu cầu nào trong tháng</EmptyState>
      ) : (
        <div className="flex flex-1 flex-col justify-between p-5">
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={items} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value">
                  {items.map((entry) => (
                    <Cell key={entry.status} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={chartTooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 border-t border-slate-100 pt-2 text-xs">
            {items.map((item) => (
              <div key={item.status} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="font-medium text-slate-600">{item.name}</span>
                </div>
                <span className="font-bold text-slate-800">
                  {item.value} <span className="font-normal text-slate-400">({Math.round((item.value * 100) / total)}%)</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

/** Nhân sự và ca hoàn thành theo cửa hàng trong tháng. */
export function StaffByStoreChart({ data }: { data: StatStore[] }) {
  return (
    <Card className="lg:col-span-2">
      <CardHeader title="Phân bổ nhân sự theo cửa hàng" actions={<span className="text-[11px] text-slate-400">Nhân viên đang làm việc · tháng này</span>} />
      <div className="h-60 p-4">
        {data.length === 0 ? (
          <EmptyState className="h-full">Chưa có cửa hàng</EmptyState>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} vertical={false} />
              <XAxis dataKey="storeName" tick={chartAxisTick} axisLine={false} tickLine={false} interval={0} />
              <YAxis tick={chartAxisTick} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={chartTooltipStyle} />
              <Bar dataKey="employees" name="Nhân sự" fill={chartColors.brand} radius={[6, 6, 0, 0]} maxBarSize={44} />
              <Bar dataKey="completedShifts" name="Ca hoàn thành" fill={chartColors.info} radius={[6, 6, 0, 0]} maxBarSize={44} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}
