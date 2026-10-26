"use client";

import React from "react";
import { ArrowRight, Calendar, Clock, Inbox, RefreshCw, Users, Wallet } from "lucide-react";
import { Alert, Badge, Button, Card, CardHeader, EmptyState, FullPageLoader, PageHeader } from "@/components/ui";
import { statisticsApi } from "@/lib/api";
import { StatCard } from "@/features/statistics/components";
import {
  AttendanceTrendCard,
  OpenRoundsNotice,
  REQUEST_TYPE_LABEL,
  ShiftTile,
  TodoCard,
  greeting,
  requestShiftLabel,
  todayLabel,
  useDashboard,
} from "@/features/statistics/dashboard";
import { formatHours, formatPercent, formatVnd, rangeLabel } from "@/features/statistics/utils";

interface StoreManagerDashboardProps {
  onGoToRequests: () => void;
  onGoToMyShift: () => void;
  onGoToTodos?: () => void;
}

/** Tổng quan vận hành các cửa hàng trưởng cửa hàng đang quản lý. */
export default function StoreManagerDashboard({ onGoToRequests, onGoToMyShift, onGoToTodos }: StoreManagerDashboardProps) {
  const { data, loading, error, reload } = useDashboard(statisticsApi.getStoreManagerDashboard);

  if (!data && loading) return <FullPageLoader label="Đang tải tổng quan cửa hàng..." />;

  const storeNames = data?.stores.map((store) => store.storeName).join(", ");
  const pendingTotal = data ? data.pendingRegistrations + data.pendingChanges + data.pendingCancels : 0;

  return (
    <div className="page">
      <PageHeader
        title={greeting(data?.managerName)}
        subtitle={`${todayLabel()} · ${storeNames || "Chưa được phân công cửa hàng"}`}
        actions={
          <>
            <Button variant="secondary" size="sm" onClick={reload} disabled={loading}>
              <RefreshCw className={loading ? "h-3.5 w-3.5 animate-spin" : "h-3.5 w-3.5"} />
              Làm mới
            </Button>
            <Button icon={Inbox} onClick={onGoToRequests}>
              Xử lý yêu cầu ca
            </Button>
          </>
        }
      />

      {error && <Alert>{error}</Alert>}

      {data && (
        <>
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-slate-600">Tháng này · {rangeLabel(data.from, data.to)}</span>
            <span className="rounded-md bg-slate-100 px-2 py-0.5 font-semibold text-slate-600">Phạm vi: {data.stores.length} cửa hàng</span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Nhân viên tại cửa hàng"
              value={`${data.month.employees} nhân viên`}
              hint={`${data.todayShifts} ca làm hôm nay`}
              icon={Users}
              tone="violet"
            />
            <StatCard
              label="Ca đã hoàn thành"
              value={`${data.month.completedShifts} ca`}
              hint={`${data.month.upcomingShifts} ca sắp tới · chuyên cần ${formatPercent(data.month.attendanceRate)}`}
              icon={Calendar}
            />
            <StatCard
              label="Tổng giờ nhân viên"
              value={formatHours(data.month.totalHours)}
              hint={`${data.month.lateCount} lượt trễ · ${data.month.absentCount} vắng`}
              icon={Clock}
              tone="blue"
            />
            <StatCard
              label="Tiền công nhân viên"
              value={formatVnd(data.month.totalWage)}
              hint="Tạm tính theo chấm công · chưa đối soát"
              icon={Wallet}
              tone="emerald"
            />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card className="flex flex-col">
              <CardHeader title="Hàng đợi yêu cầu" actions={<Badge tone="warning">{pendingTotal} chờ duyệt</Badge>} />
              <div className="flex-1 space-y-4 p-5">
                <div className="grid grid-cols-3 gap-3">
                  {[
                    ["Đăng ký ca", data.pendingRegistrations],
                    ["Đổi ca", data.pendingChanges],
                    ["Hủy ca", data.pendingCancels],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                      <span className="text-[11px] font-medium text-slate-400">{label}</span>
                      <p className="mt-1 text-xl font-black text-slate-800">{value}</p>
                    </div>
                  ))}
                </div>

                {data.requestQueue.length === 0 ? (
                  <EmptyState>Không có yêu cầu nào đang chờ</EmptyState>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-slate-100">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50 text-[11px] font-semibold text-slate-400">
                          <th className="px-3 py-2.5">Nhân viên</th>
                          <th className="px-3 py-2.5">Yêu cầu</th>
                          <th className="px-3 py-2.5 text-right">Xử lý</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {data.requestQueue.map((request) => (
                          <tr key={`${request.requestType}-${request.id}`}>
                            <td className="px-3 py-3">
                              <p className="font-bold text-slate-800">{request.employeeName ?? "—"}</p>
                              <p className="text-[10px] text-slate-400">{request.employeeCode ?? `#${request.employeeId}`}</p>
                            </td>
                            <td className="px-3 py-3">
                              <p className="font-bold text-slate-800">{REQUEST_TYPE_LABEL[request.requestType] ?? request.requestType}</p>
                              <p className="text-[10px] text-slate-400">{requestShiftLabel(request)}</p>
                            </td>
                            <td className="px-3 py-3 text-right">
                              <button onClick={onGoToRequests} className="rounded-lg border border-slate-200 px-3 py-1 font-bold text-slate-700 hover:bg-slate-50">
                                Xem
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 text-xs">
                <span className="text-[11px] text-slate-400">Ưu tiên yêu cầu gần ngày làm</span>
                <button onClick={onGoToRequests} className="inline-flex items-center gap-1 font-bold text-brand-600 hover:underline">
                  <span>Xem toàn bộ {pendingTotal} yêu cầu</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader title="Ca làm sắp tới của bạn" />
                <div className="p-5">
                  {data.myNextShift ? <ShiftTile shift={data.myNextShift} /> : <EmptyState>Bạn chưa có ca nào trong 30 ngày tới</EmptyState>}
                </div>
                <div className="flex items-center justify-end border-t border-slate-100 px-5 py-3">
                  <Button variant="secondary" size="sm" onClick={onGoToMyShift}>
                    Đăng ký ca của tôi
                  </Button>
                </div>
              </Card>

              <TodoCard todos={data.todos} onViewAll={onGoToTodos} />
            </div>
          </div>

          <AttendanceTrendCard data={data.attendanceTrend} />

          <OpenRoundsNotice rounds={data.openRounds} />
        </>
      )}
    </div>
  );
}
