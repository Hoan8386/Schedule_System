"use client";

import React from "react";
import { CalendarCheck, Plus, RefreshCw, Store, Users, Wallet } from "lucide-react";
import { Alert, Button, FullPageLoader, PageHeader } from "@/components/ui";
import { statisticsApi } from "@/lib/api";
import { StatCard } from "@/features/statistics/components";
import { AttendanceTrendCard, TodoCard, useDashboard } from "@/features/statistics/dashboard";
import { formatHours, formatPercent, formatVnd, rangeLabel } from "@/features/statistics/utils";
import { RequestStatusChart, StaffByStoreChart } from "./Charts";
import { RecentRequestsTable, RecentViolations } from "./Widgets";

/** Tổng quan hoạt động toàn chuỗi cho quản lý. */
export default function DashboardPage({ onNavigate }: { onNavigate?: (page: string) => void }) {
  const { data, loading, error, reload } = useDashboard(statisticsApi.getManagerDashboard);

  if (!data && loading) return <FullPageLoader label="Đang tải tổng quan toàn chuỗi..." />;

  return (
    <div className="page">
      <PageHeader
        title="Tổng quan hệ thống"
        subtitle={
          data
            ? `Toàn chuỗi BLOAN · ${data.totalStores} cửa hàng · ${data.activeEmployees} nhân sự · ${rangeLabel(data.from, data.to)}`
            : "Toàn chuỗi BLOAN"
        }
        actions={
          <>
            <Button variant="secondary" size="sm" onClick={reload} disabled={loading}>
              <RefreshCw className={loading ? "h-3.5 w-3.5 animate-spin" : "h-3.5 w-3.5"} />
              Làm mới
            </Button>
            {onNavigate && (
              <Button icon={Plus} onClick={() => onNavigate("lich")}>
                Quản lý kỳ ca
              </Button>
            )}
          </>
        }
      />

      {error && <Alert>{error}</Alert>}

      {data && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Cửa hàng hoạt động"
              value={`${data.activeStores} / ${data.totalStores}`}
              hint={`${data.byStore.filter((store) => store.completedShifts > 0).length} cửa hàng có ca hoàn thành tháng này`}
              icon={Store}
              tone="blue"
            />
            <StatCard
              label="Tổng nhân sự chuỗi"
              value={`${data.activeEmployees} nhân sự`}
              hint={`Chuyên cần tháng này ${formatPercent(data.month.attendanceRate)}`}
              icon={Users}
              tone="emerald"
            />
            <StatCard
              label="Ca làm hôm nay"
              value={`${data.todayShifts} ca`}
              hint={`${data.pendingAssignments} đăng ký ca · ${data.pendingRequests} yêu cầu đang chờ duyệt`}
              icon={CalendarCheck}
            />
            <StatCard
              label="Tiền công tháng này"
              value={formatVnd(data.month.totalWage)}
              hint={`${formatHours(data.month.totalHours)} · tạm tính theo chấm công`}
              icon={Wallet}
              tone="emerald"
            />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <AttendanceTrendCard data={data.attendanceTrend} className="lg:col-span-2" />
            <RequestStatusChart data={data.requestStatus} />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <StaffByStoreChart data={data.byStore} />
            <TodoCard todos={data.todos} />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <RecentRequestsTable requests={data.recentRequests} onViewAll={onNavigate && (() => onNavigate("yeucau"))} />
            <RecentViolations violations={data.recentViolations} newCount={data.newViolations} />
          </div>
        </>
      )}
    </div>
  );
}
