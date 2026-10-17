import React from "react";
import { ArrowRight, ShieldAlert } from "lucide-react";
import { Badge, Card, CardHeader, EmptyState } from "@/components/ui";
import type { DashRequest, DashViolation } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import { REQUEST_TYPE_LABEL, RequestStatusBadge, requestShiftLabel } from "@/features/statistics/dashboard";
import { formatVnd } from "@/features/statistics/utils";

const initials = (name?: string | null) =>
  (name ?? "NV").trim().split(/\s+/).slice(-1)[0].slice(0, 2).toUpperCase();

export function RecentRequestsTable({ requests, onViewAll }: { requests: DashRequest[]; onViewAll?: () => void }) {
  return (
    <Card className="lg:col-span-2">
      <CardHeader
        title="Yêu cầu đổi / hủy ca mới nhất"
        actions={
          onViewAll && (
            <button onClick={onViewAll} className="flex items-center gap-1 text-xs font-bold text-brand-600 hover:underline">
              <span>Xem tất cả</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )
        }
      />
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50 text-[11px] font-semibold text-slate-400">
              <th className="px-4 py-2.5">Nhân viên</th>
              <th className="px-4 py-2.5">Cửa hàng</th>
              <th className="px-4 py-2.5">Yêu cầu</th>
              <th className="px-4 py-2.5">Ngày gửi</th>
              <th className="px-4 py-2.5 text-right">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {requests.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-slate-400">Chưa có yêu cầu nào</td>
              </tr>
            )}
            {requests.map((request) => (
              <tr key={`${request.requestType}-${request.id}`} className="transition-colors hover:bg-slate-50/70">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-100 text-xs font-bold text-brand-800">
                      {initials(request.employeeName)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{request.employeeName ?? "—"}</p>
                      <p className="text-[10px] text-slate-400">{request.employeeCode ?? `#${request.employeeId}`}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 font-medium text-slate-600">{request.storeName ?? "—"}</td>
                <td className="px-4 py-3">
                  <p className="font-bold text-slate-800">{REQUEST_TYPE_LABEL[request.requestType] ?? request.requestType}</p>
                  <p className="text-[10px] text-slate-400">{requestShiftLabel(request)}</p>
                </td>
                <td className="px-4 py-3 text-slate-400">{formatDateTime(request.requestedAt)}</td>
                <td className="px-4 py-3 text-right">
                  <RequestStatusBadge status={request.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export function RecentViolations({ violations, newCount }: { violations: DashViolation[]; newCount: number }) {
  return (
    <Card>
      <CardHeader title="Vi phạm gần đây" actions={newCount > 0 && <span className="text-xs font-bold text-rose-600">{newCount} trong 7 ngày</span>} />
      <div className="space-y-3.5 p-5 text-xs">
        {violations.length === 0 && <EmptyState>Chưa ghi nhận vi phạm</EmptyState>}
        {violations.map((violation) => (
          <div key={violation.id} className="flex items-start gap-3 border-b border-slate-100 pb-3 last:border-0 last:pb-0">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
              <ShieldAlert className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate font-bold text-slate-800">{violation.employeeName ?? "—"}</p>
                <span className="shrink-0 text-[10px] text-slate-400">{formatDateTime(violation.violationTime)}</span>
              </div>
              <p className="mt-0.5 text-[11px] leading-snug text-slate-500">
                {violation.title ?? "Vi phạm"}
                {violation.storeName ? ` · ${violation.storeName}` : ""}
                {violation.description ? ` — ${violation.description}` : ""}
              </p>
              {violation.penaltyAmount ? (
                <Badge tone="danger" className="mt-1.5">Phạt {formatVnd(violation.penaltyAmount)}</Badge>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
