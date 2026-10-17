"use client";

import React from "react";
import { AlertTriangle, Award, CalendarCheck, Clock, Download, Store, UserCheck, Users, Wallet } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Alert, Button, Card, CardHeader, EmptyState, FullPageLoader, PageHeader } from "@/components/ui";
import { statisticsApi, type StatOverview } from "@/lib/api";
import { chartAxisTick, chartColors, chartTooltipStyle } from "@/lib/theme";
import { DailyHoursChart, EmployeeStatTable, StatCard, StatFilterBar } from "@/features/statistics/components";
import { useStatData, useStatFilters } from "@/features/statistics/useStatistics";
import { downloadCsv, formatHours, formatPercent, formatVnd, rangeLabel } from "@/features/statistics/utils";

function exportOverview(data: StatOverview) {
  downloadCsv(
    `thong-ke-chuoi_${data.from}_${data.to}.csv`,
    ["Mã NV", "Họ tên", "Cửa hàng", "Ca được xếp", "Ca hoàn thành", "Giờ làm", "Tiền công", "Đi trễ", "Vắng", "Vi phạm", "Tiền phạt", "Điểm đánh giá", "Chuyên cần (%)"],
    data.employees.map((item) => [
      item.employeeCode,
      item.fullName,
      item.stores,
      item.scheduledShifts,
      item.completedShifts,
      item.totalHours,
      item.totalWage,
      item.lateCount,
      item.absentCount,
      item.violationCount,
      item.totalPenalty,
      item.averageScore,
      item.attendanceRate,
    ])
  );
}

/** Thống kê toàn chuỗi cho quản lý: tổng quan, theo cửa hàng, theo ngày và theo nhân viên. */
export default function ThongKePage() {
  const { preset, setPreset, range, setCustomRange, storeId, setStoreId, filters } = useStatFilters();
  const { data, loading, error, reload } = useStatData(statisticsApi.getManager, filters);

  if (!data && loading) return <FullPageLoader label="Đang tải thống kê toàn chuỗi..." />;

  const summary = data?.summary;
  const topEmployees = [...(data?.employees ?? [])]
    .filter((item) => item.completedShifts > 0)
    .sort((a, b) => b.attendanceRate - a.attendanceRate || b.totalHours - a.totalHours)
    .slice(0, 5);

  return (
    <div className="page">
      <PageHeader
        title="Thống kê & báo cáo toàn chuỗi"
        subtitle={`Ca làm, giờ công, tiền công, chuyên cần và vi phạm · ${rangeLabel(data?.from, data?.to)}`}
        actions={
          <Button icon={Download} onClick={() => data && exportOverview(data)} disabled={!data?.employees.length}>
            Xuất CSV
          </Button>
        }
      />

      <StatFilterBar
        preset={preset}
        onPresetChange={setPreset}
        range={range}
        onRangeChange={setCustomRange}
        stores={data?.stores}
        storeId={storeId}
        onStoreChange={setStoreId}
        loading={loading}
        onReload={reload}
      />

      {error && <Alert>{error}</Alert>}

      {summary && data && (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label="Nhân sự" value={summary.employees} hint={`${summary.stores} cửa hàng`} icon={Users} tone="violet" />
            <StatCard
              label="Ca hoàn thành"
              value={`${summary.completedShifts} / ${summary.scheduledShifts}`}
              hint={`${summary.upcomingShifts} sắp tới · ${summary.pendingShifts} chờ duyệt`}
              icon={CalendarCheck}
            />
            <StatCard label="Tổng giờ làm" value={formatHours(summary.totalHours)} hint="Theo chấm công thực tế" icon={Clock} tone="blue" />
            <StatCard label="Tổng tiền công" value={formatVnd(summary.totalWage)} hint="Giờ làm × đơn giá ca" icon={Wallet} tone="emerald" />
            <StatCard
              label="Tỷ lệ chuyên cần"
              value={formatPercent(summary.attendanceRate)}
              hint={`${summary.lateCount} lượt trễ · ${summary.absentCount} vắng`}
              icon={UserCheck}
              tone="emerald"
            />
            <StatCard
              label="Vi phạm"
              value={summary.violationCount}
              hint={`Tổng phạt ${formatVnd(summary.totalPenalty)}`}
              icon={AlertTriangle}
              tone="rose"
            />
            <StatCard label="Điểm đánh giá TB" value={summary.averageScore ?? "—"} hint="Thang điểm đánh giá nhân viên" icon={Award} tone="violet" />
            <StatCard label="Cửa hàng hoạt động" value={data.byStore.filter((item) => item.completedShifts > 0).length} hint={`trên ${summary.stores} cửa hàng`} icon={Store} tone="blue" />
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <DailyHoursChart data={data.daily} />
            </div>
            <Card>
              <CardHeader title="Top 5 chuyên cần" icon={Award} />
              <div className="space-y-3 p-5">
                {topEmployees.length === 0 && <EmptyState>Chưa có ca hoàn thành</EmptyState>}
                {topEmployees.map((item, index) => (
                  <div key={item.employeeId} className="flex items-center gap-3">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-xs font-black text-brand-900">
                      {index + 1}
                    </div>
                    <div className="w-28 shrink-0 truncate">
                      <p className="truncate text-xs font-bold text-slate-800">{item.fullName}</p>
                      <p className="truncate text-[10px] text-slate-400">{formatHours(item.totalHours)}</p>
                    </div>
                    <div className="h-4 flex-1 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="flex h-full items-center justify-end rounded-full bg-brand-500 pr-2"
                        style={{ width: `${Math.max(12, Math.min(100, item.attendanceRate))}%` }}
                      >
                        <span className="text-[9px] font-black text-brand-contrast">{formatPercent(item.attendanceRate)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <Card>
            <CardHeader title="Theo cửa hàng" icon={Store} />
            {data.byStore.length > 1 && (
              <div className="h-64 border-b border-slate-100 p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.byStore} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} vertical={false} />
                    <XAxis dataKey="storeName" tick={chartAxisTick} tickLine={false} interval={0} />
                    <YAxis tick={chartAxisTick} tickLine={false} allowDecimals={false} />
                    <Tooltip contentStyle={chartTooltipStyle} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="completedShifts" name="Ca hoàn thành" fill={chartColors.brand} radius={[6, 6, 0, 0]} maxBarSize={36} />
                    <Bar dataKey="absentCount" name="Vắng" fill={chartColors.danger} radius={[6, 6, 0, 0]} maxBarSize={36} />
                    <Bar dataKey="violationCount" name="Vi phạm" fill={chartColors.warning} radius={[6, 6, 0, 0]} maxBarSize={36} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-[11px] font-semibold uppercase text-slate-400">
                    <th className="px-4 py-3">Cửa hàng</th>
                    <th className="px-4 py-3 text-center">Nhân sự</th>
                    <th className="px-4 py-3 text-center">Ca hoàn thành</th>
                    <th className="px-4 py-3 text-right">Giờ làm</th>
                    <th className="px-4 py-3 text-right">Tiền công</th>
                    <th className="px-4 py-3 text-center">Trễ / Vắng</th>
                    <th className="px-4 py-3 text-center">Vi phạm</th>
                    <th className="px-4 py-3 text-right">Chuyên cần</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {data.byStore.map((store) => (
                    <tr key={store.storeId} className="hover:bg-slate-50/70">
                      <td className="px-4 py-3 font-bold text-slate-800">{store.storeName}</td>
                      <td className="px-4 py-3 text-center">{store.employees}</td>
                      <td className="px-4 py-3 text-center font-bold">
                        {store.completedShifts}
                        <span className="font-normal text-slate-400"> / {store.scheduledShifts}</span>
                      </td>
                      <td className="px-4 py-3 text-right">{formatHours(store.totalHours)}</td>
                      <td className="px-4 py-3 text-right font-bold text-slate-800">{formatVnd(store.totalWage)}</td>
                      <td className="px-4 py-3 text-center">{store.lateCount} / {store.absentCount}</td>
                      <td className="px-4 py-3 text-center">{store.violationCount}</td>
                      <td className="px-4 py-3 text-right font-black text-slate-900">{formatPercent(store.attendanceRate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <EmployeeStatTable employees={data.employees} title="Hiệu suất nhân sự chi tiết" />
        </>
      )}
    </div>
  );
}
