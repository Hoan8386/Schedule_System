"use client";

import React, { useState } from "react";
import { AlertTriangle, CalendarCheck, Clock, Download, Info, UserCheck, Wallet } from "lucide-react";
import { Alert, Button, FullPageLoader, PageHeader } from "@/components/ui";
import { statisticsApi, type StatEmployee, type StatOverview, type StatShift } from "@/lib/api";
import { DailyHoursChart, EmployeeStatTable, ShiftHistoryTable, StatCard, StatFilterBar } from "@/features/statistics/components";
import { useKeyedLoad, useStatData, useStatFilters } from "@/features/statistics/useStatistics";
import { downloadCsv, formatHours, formatPercent, formatVnd, rangeLabel } from "@/features/statistics/utils";

function exportEmployees(data: StatOverview) {
  downloadCsv(
    `thong-ke-cua-hang_${data.from}_${data.to}.csv`,
    ["Mã NV", "Họ tên", "Ca được xếp", "Ca hoàn thành", "Giờ làm", "Tiền công", "Đi trễ", "Vắng", "Vi phạm", "Chuyên cần (%)"],
    data.employees.map((item) => [
      item.employeeCode,
      item.fullName,
      item.scheduledShifts,
      item.completedShifts,
      item.totalHours,
      item.totalWage,
      item.lateCount,
      item.absentCount,
      item.violationCount,
      item.attendanceRate,
    ])
  );
}

/** Thống kê ca làm & tiền công của nhân viên trong các cửa hàng trưởng cửa hàng quản lý. */
export default function StoreManagerStatsPage() {
  const { preset, setPreset, range, setCustomRange, storeId, setStoreId, filters } = useStatFilters();
  const { data, loading, error, version, reload } = useStatData(statisticsApi.getStoreManager, filters);

  // Nhân viên đang xem lịch sử ca: lựa chọn của người dùng, mặc định là người đầu danh sách.
  const [pickedId, setPickedId] = useState<number | null>(null);
  const employees = data?.employees ?? [];
  const selected: StatEmployee | null = employees.find((item) => item.employeeId === pickedId) ?? employees[0] ?? null;
  const selectedId = selected?.employeeId;

  const { from, to } = filters;
  const shiftKey = selectedId ? `${selectedId}|${from}|${to}|${storeId ?? ""}|${version}` : null;
  const shiftResult = useKeyedLoad(
    shiftKey,
    () => statisticsApi.getEmployeeShifts(selectedId as number, { from, to, storeId }),
    "Không thể tải lịch sử ca"
  );
  const shifts: StatShift[] = shiftResult.data ?? [];

  if (!data && loading) return <FullPageLoader label="Đang tải thống kê cửa hàng..." />;

  const summary = data?.summary;
  const storeNames = data?.stores.map((store) => store.storeName).join(", ");

  return (
    <div className="page">
      <PageHeader
        title="Thống kê ca làm & tiền công"
        subtitle={`${storeNames || "Cửa hàng của bạn"} · ${rangeLabel(data?.from, data?.to)}`}
        actions={
          <Button variant="secondary" icon={Download} onClick={() => data && exportEmployees(data)} disabled={!data?.employees.length}>
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
        allStoresLabel="Tất cả cửa hàng quản lý"
        loading={loading}
        onReload={reload}
      />

      {error && <Alert>{error}</Alert>}
      {data && data.stores.length === 0 && <Alert>Tài khoản chưa được phân công quản lý cửa hàng nào.</Alert>}

      {summary && data && (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard
              label="Ca hoàn thành"
              value={`${summary.completedShifts} ca`}
              hint={`${summary.employees} nhân viên · ${summary.upcomingShifts} ca sắp tới`}
              icon={CalendarCheck}
            />
            <StatCard label="Tổng giờ làm" value={formatHours(summary.totalHours)} hint="Theo chấm công thực tế" icon={Clock} tone="blue" />
            <StatCard label="Tổng tiền công" value={formatVnd(summary.totalWage)} hint="Giờ làm × đơn giá ca · chưa đối soát" icon={Wallet} tone="emerald" />
            <StatCard
              label="Chuyên cần"
              value={formatPercent(summary.attendanceRate)}
              hint={`${summary.lateCount} trễ · ${summary.absentCount} vắng · ${summary.violationCount} vi phạm`}
              icon={summary.violationCount ? AlertTriangle : UserCheck}
              tone={summary.violationCount ? "rose" : "emerald"}
            />
          </div>

          <DailyHoursChart data={data.daily} title="Giờ làm của cửa hàng theo ngày" />

          <EmployeeStatTable
            employees={data.employees}
            showStore={data.stores.length > 1 && !storeId}
            selectedId={selectedId}
            onSelect={(employee) => setPickedId(employee.employeeId)}
            title="Thống kê nhân viên · bấm vào dòng để xem lịch sử ca"
          />

          {shiftResult.error && <Alert>{shiftResult.error}</Alert>}
          {selected && (
            <ShiftHistoryTable
              shifts={shifts}
              loading={shiftResult.loading}
              title={`Lịch sử ca · ${selected.employeeCode ?? ""} ${selected.fullName ?? ""}`}
            />
          )}

          <div className="flex items-center gap-3 rounded-2xl border border-brand-200/80 bg-brand-50/70 p-4 text-xs text-brand-900">
            <Info className="h-4 w-4 shrink-0 text-brand-600" />
            <p>
              Tiền công được tính tạm theo giờ chấm công × đơn giá ca, chưa gồm thưởng/phạt và chưa đối soát. Ca không có chấm
              công sau ngày làm được tính là vắng mặt.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
