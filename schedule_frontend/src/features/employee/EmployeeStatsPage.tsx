"use client";

import React from "react";
import { AlertTriangle, CalendarCheck, Clock, Download, UserCheck, Wallet } from "lucide-react";
import { Alert, Button, Card, CardHeader, FullPageLoader, PageHeader } from "@/components/ui";
import { statisticsApi, type StatPersonal } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { DailyHoursChart, ShiftHistoryTable, StatCard, StatFilterBar } from "@/features/statistics/components";
import { useStatData, useStatFilters } from "@/features/statistics/useStatistics";
import { WORK_STATUS, downloadCsv, formatHours, formatPercent, formatVnd, rangeLabel } from "@/features/statistics/utils";

function exportShifts(data: StatPersonal) {
  downloadCsv(
    `ca-lam-cua-toi_${data.from}_${data.to}.csv`,
    ["Ngày", "Ca", "Bắt đầu", "Kết thúc", "Cửa hàng", "Check-in", "Check-out", "Giờ làm", "Đơn giá/giờ", "Tiền công", "Trạng thái"],
    data.shifts.map((item) => [
      formatDate(item.workDate),
      item.shiftName,
      item.startTime,
      item.endTime,
      item.storeName,
      item.checkInAt?.replace("T", " "),
      item.checkOutAt?.replace("T", " "),
      item.hours,
      item.payRate,
      item.wage,
      WORK_STATUS[item.workStatus]?.label ?? item.workStatus,
    ])
  );
}

/** Thống kê cá nhân: số ca, giờ làm, tiền công, chuyên cần và lịch sử ca. */
export default function EmployeeStatsPage() {
  const { preset, setPreset, range, setCustomRange, storeId, setStoreId, filters } = useStatFilters();
  const { data, loading, error, reload } = useStatData(statisticsApi.getMine, filters);

  if (!data && loading) return <FullPageLoader label="Đang tải thống kê của bạn..." />;

  const summary = data?.summary;
  const payroll = data?.payroll;

  return (
    <div className="page">
      <PageHeader
        title="Thống kê ca làm & tiền công"
        subtitle={`Giờ làm và tiền công từ các ca đã hoàn thành · ${rangeLabel(data?.from, data?.to)}`}
        actions={
          <Button variant="secondary" icon={Download} onClick={() => data && exportShifts(data)} disabled={!data?.shifts.length}>
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

      {summary && payroll && data && (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard
              label="Ca hoàn thành"
              value={`${summary.completedShifts} ca`}
              hint={`${summary.upcomingShifts} ca sắp tới · ${summary.pendingShifts} chờ duyệt`}
              icon={CalendarCheck}
            />
            <StatCard label="Tổng giờ làm" value={formatHours(summary.totalHours)} hint="Theo chấm công" icon={Clock} tone="blue" />
            <StatCard label="Tiền công tạm tính" value={formatVnd(summary.totalWage)} hint="Trước thưởng / khấu trừ" icon={Wallet} tone="emerald" />
            <StatCard
              label="Chuyên cần"
              value={formatPercent(summary.attendanceRate)}
              hint={`${summary.lateCount} lần trễ · ${summary.absentCount} vắng · ${summary.violationCount} vi phạm`}
              icon={summary.violationCount || summary.absentCount ? AlertTriangle : UserCheck}
              tone={summary.violationCount || summary.absentCount ? "rose" : "emerald"}
            />
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <DailyHoursChart data={data.daily} />
            </div>
            <Card>
              <CardHeader title="Thông tin tiền công" icon={Wallet} />
              <div className="space-y-1 p-5 text-xs">
                <Row label="Tạm tính từ chấm công" value={formatVnd(payroll.recordedWage)} />
                <Row label="Thưởng (bảng lương)" value={`+${formatVnd(payroll.bonusAmount)}`} valueClass="text-emerald-600" />
                <Row label="Khấu trừ (bảng lương)" value={`-${formatVnd(payroll.penaltyAmount)}`} valueClass="text-rose-600" />
                <Row label="Bảng lương đã duyệt" value={formatVnd(payroll.approvedPayroll)} />
                <Row label="Đã thanh toán" value={formatVnd(payroll.paidPayroll)} />
                <div className="flex items-center justify-between pt-3">
                  <span className="font-bold text-slate-700">Chưa thanh toán</span>
                  <span className="text-lg font-black text-brand-600">
                    {formatVnd(Math.max(0, payroll.approvedPayroll - payroll.paidPayroll))}
                  </span>
                </div>
              </div>
              <p className="border-t border-slate-100 px-5 py-3 text-[11px] leading-relaxed text-slate-400">
                Bảng lương do quản lý lập theo tháng; tiền công tạm tính có thể khác số đã duyệt.
              </p>
            </Card>
          </div>

          <ShiftHistoryTable shifts={data.shifts} title="Lịch sử ca của tôi" />
        </>
      )}
    </div>
  );
}

function Row({ label, value, valueClass = "text-slate-800" }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 py-2">
      <span className="font-medium text-slate-500">{label}</span>
      <span className={`font-bold ${valueClass}`}>{value}</span>
    </div>
  );
}
