"use client";

import React from "react";
import { ArrowRight, Bell, Calendar, Clock, Inbox, RefreshCw, Wallet } from "lucide-react";
import { Alert, Badge, Button, Card, CardHeader, EmptyState, FullPageLoader, PageHeader } from "@/components/ui";
import { statisticsApi } from "@/lib/api";
import { formatDate, formatDateTime } from "@/lib/format";
import { cn } from "@/lib/cn";
import { StatCard } from "@/features/statistics/components";
import {
  OpenRoundsNotice,
  REQUEST_TYPE_LABEL,
  RequestStatusBadge,
  ShiftTile,
  greeting,
  requestShiftLabel,
  todayLabel,
  useDashboard,
} from "@/features/statistics/dashboard";
import { WORK_STATUS, formatHours, formatVnd, rangeLabel } from "@/features/statistics/utils";

interface EmployeeDashboardProps {
  onGoToSchedule: () => void;
  onOpenSwap: () => void;
  onOpenCancel: () => void;
}

/** Tổng quan cá nhân của nhân viên: ca sắp tới, lịch tuần, yêu cầu và thông báo. */
export default function EmployeeDashboard({ onGoToSchedule, onOpenSwap, onOpenCancel }: EmployeeDashboardProps) {
  const { data, loading, error, reload } = useDashboard(statisticsApi.getMyDashboard);

  if (!data && loading) return <FullPageLoader label="Đang tải tổng quan của bạn..." />;

  const weekHours = data?.weekShifts.reduce((sum, shift) => sum + shift.plannedHours, 0) ?? 0;

  return (
    <div className="page">
      <PageHeader
        title={greeting(data?.employeeName)}
        subtitle={`${todayLabel()} · Một ngày mới, một ca làm suôn sẻ.`}
        actions={
          <>
            <Button variant="secondary" size="sm" onClick={reload} disabled={loading}>
              <RefreshCw className={loading ? "h-3.5 w-3.5 animate-spin" : "h-3.5 w-3.5"} />
              Làm mới
            </Button>
            <Button variant="secondary" icon={Calendar} onClick={onGoToSchedule}>
              Xem lịch làm việc
            </Button>
          </>
        }
      />

      {error && <Alert>{error}</Alert>}

      {data && (
        <>
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-slate-600">Tháng này · {rangeLabel(data.from, data.to)}</span>
            <span>Giờ và tiền công chỉ tính ca đã hoàn thành</span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Ca đã hoàn thành"
              value={`${data.month.completedShifts} ca`}
              hint={`${data.month.upcomingShifts} ca sắp tới trong tháng`}
              icon={Calendar}
            />
            <StatCard
              label="Tổng giờ làm"
              value={formatHours(data.month.totalHours)}
              hint={`${data.month.lateCount} lần trễ · ${data.month.absentCount} vắng`}
              icon={Clock}
              tone="blue"
            />
            <StatCard label="Tiền công tạm tính" value={formatVnd(data.month.totalWage)} hint="Trước thưởng / khấu trừ" icon={Wallet} tone="emerald" />
            <StatCard
              label="Yêu cầu đang xử lý"
              value={`${data.pendingRequests.length} yêu cầu`}
              hint={summarizeRequests(data.pendingRequests.map((item) => item.requestType))}
              icon={Inbox}
              tone="violet"
            />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card className="flex flex-col">
              <CardHeader title="Ca làm sắp tới" />
              <div className="flex-1 p-5">
                {data.nextShift ? (
                  <ShiftTile shift={data.nextShift} highlight />
                ) : (
                  <EmptyState>Bạn chưa có ca nào trong 30 ngày tới</EmptyState>
                )}
              </div>
              <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 text-xs">
                <span className="text-[11px] text-slate-400">Vui lòng có mặt trước giờ bắt đầu 10 phút.</span>
                <button onClick={onGoToSchedule} className="inline-flex items-center gap-1.5 font-bold text-slate-700 hover:text-brand-600">
                  <span>Lịch làm việc</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </Card>

            <Card className="flex flex-col">
              <CardHeader title="Yêu cầu đang xử lý" actions={<Badge tone="warning">{data.pendingRequests.length} yêu cầu</Badge>} />
              <div className="flex-1 space-y-3 p-5">
                {data.pendingRequests.length === 0 && <EmptyState>Không có yêu cầu nào đang chờ duyệt</EmptyState>}
                {data.pendingRequests.map((request) => (
                  <div key={`${request.requestType}-${request.id}`} className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 p-3">
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-800">{REQUEST_TYPE_LABEL[request.requestType] ?? request.requestType}</div>
                      <div className="mt-0.5 text-[11px] text-slate-500">{requestShiftLabel(request)}</div>
                      <div className="mt-0.5 text-[10px] text-slate-400">
                        {request.storeName ?? ""} {request.requestedAt ? `· Gửi ${formatDateTime(request.requestedAt)}` : ""}
                      </div>
                    </div>
                    <RequestStatusBadge status={request.status} />
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-5 py-3 text-xs">
                <button onClick={onOpenSwap} className="font-semibold text-brand-600 hover:underline">+ Đổi ca</button>
                <button onClick={onOpenCancel} className="font-semibold text-slate-500 hover:underline">+ Báo hủy ca</button>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader
                title="Lịch của bạn tuần này"
                actions={<span className="text-xs font-medium text-slate-400">{data.weekShifts.length} ca · {formatHours(weekHours)}</span>}
              />
              <div className="overflow-x-auto px-5 pb-3">
                {data.weekShifts.length === 0 ? (
                  <EmptyState className="my-4">Tuần này bạn chưa có ca nào</EmptyState>
                ) : (
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400">
                        <th className="py-2.5">Ngày</th>
                        <th className="py-2.5">Ca làm</th>
                        <th className="py-2.5">Cửa hàng</th>
                        <th className="py-2.5 text-right">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {data.weekShifts.map((shift) => {
                        const meta = WORK_STATUS[shift.workStatus] ?? WORK_STATUS.UPCOMING;
                        const weekday = shift.workDate
                          ? new Date(`${shift.workDate}T00:00:00`).toLocaleDateString("vi-VN", { weekday: "long" })
                          : "";
                        return (
                          <tr key={shift.assignmentId} className="hover:bg-slate-50/70">
                            <td className="py-3 font-semibold text-slate-800">
                              {formatDate(shift.workDate).slice(0, 5)} · <span className="capitalize">{weekday}</span>
                            </td>
                            <td className="py-3">
                              {shift.shiftName ?? "Ca"} · {shift.startTime ?? "--:--"} – {shift.endTime ?? "--:--"}
                            </td>
                            <td className="py-3 text-slate-500">{shift.storeName ?? "—"}</td>
                            <td className="py-3 text-right">
                              <Badge tone={meta.tone}>{meta.label}</Badge>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </Card>

            <Card>
              <CardHeader
                title="Thông báo"
                icon={Bell}
                actions={data.unreadNotifications > 0 && <span className="text-xs font-bold text-brand-600">{data.unreadNotifications} chưa đọc</span>}
              />
              <div className="space-y-3.5 p-5 text-xs">
                {data.notifications.length === 0 && <EmptyState>Chưa có thông báo</EmptyState>}
                {data.notifications.map((item) => (
                  <div key={item.id} className="flex items-start gap-3 border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                    <div
                      className={cn(
                        "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
                        item.read ? "bg-slate-100 text-slate-400" : "bg-brand-50 text-brand-600"
                      )}
                    >
                      <Bell className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0 space-y-0.5">
                      <p className={cn("font-bold", item.read ? "text-slate-500" : "text-slate-800")}>{item.title}</p>
                      {item.content && <p className="line-clamp-2 text-[11px] text-slate-500">{item.content}</p>}
                      <p className="text-[10px] text-slate-400">{formatDateTime(item.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <OpenRoundsNotice rounds={data.openRounds} />
        </>
      )}
    </div>
  );
}

function summarizeRequests(types: string[]) {
  if (types.length === 0) return "Không có yêu cầu chờ duyệt";
  const counts = types.reduce<Record<string, number>>((acc, type) => ({ ...acc, [type]: (acc[type] ?? 0) + 1 }), {});
  return Object.entries(counts)
    .map(([type, value]) => `${value} ${(REQUEST_TYPE_LABEL[type] ?? type).toLowerCase()}`)
    .join(" · ");
}
