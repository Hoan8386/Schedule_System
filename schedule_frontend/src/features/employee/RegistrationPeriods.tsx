"use client";

import React from "react";
import { CalendarClock } from "lucide-react";
import { Badge, Card, CardHeader, EmptyState } from "@/components/ui";
import type { RegistrationPeriod } from "@/lib/api";
import { formatDate, formatDateTime } from "@/lib/format";
import { cn } from "@/lib/cn";

type WindowState = { label: string; tone: "success" | "warning" | "neutral" };

/** Trạng thái khung đăng ký theo thời điểm hiện tại. */
function windowState(openAt: string | null, closeAt: string | null): WindowState {
  const now = Date.now();
  if (openAt && new Date(openAt).getTime() > now) return { label: `Mở lúc ${formatDateTime(openAt)}`, tone: "warning" };
  if (closeAt && new Date(closeAt).getTime() < now) return { label: "Đã đóng", tone: "neutral" };
  return { label: closeAt ? `Đang mở · đóng ${formatDateTime(closeAt)}` : "Đang mở", tone: "success" };
}

const periodTypeLabel = (type: string | null) => (type === "WEEK" ? "Tuần" : type === "MONTH" ? "Tháng" : type ?? "");

/** Kỳ lịch đang mở → đợt đăng ký của cửa hàng → phiên đăng ký của nhóm ca nhân viên. */
export function RegistrationPeriods({
  periods,
  loading,
  onRegister,
  onViewPeriod,
  selectedId,
  onSelect,
}: {
  periods: RegistrationPeriod[];
  loading?: boolean;
  onRegister?: () => void;
  /** Nhảy thời khóa biểu tới ngày bắt đầu áp dụng của kỳ */
  onViewPeriod?: (date: string) => void;
  /** Kỳ đang chọn (trang đăng ký ca) */
  selectedId?: number | null;
  onSelect?: (period: RegistrationPeriod) => void;
}) {
  return (
    <Card>
      <CardHeader
        title="Kỳ đăng ký ca"
        icon={CalendarClock}
        actions={
          onRegister && periods.length > 0 ? (
            <button onClick={onRegister} className="text-[11px] font-bold text-brand-600 hover:underline">
              Đăng ký ca
            </button>
          ) : null
        }
      />
      <div className="space-y-3 p-5">
        {!loading && periods.length === 0 && <EmptyState>Hiện chưa có kỳ đăng ký nào đang mở cho nhóm ca của bạn.</EmptyState>}
        {periods.map((period) => (
          <div
            key={period.periodId}
            onClick={onSelect ? () => onSelect(period) : undefined}
            className={cn(
              "rounded-xl border p-4 text-xs transition",
              selectedId === period.periodId ? "border-brand-400 bg-brand-50/70 ring-2 ring-brand-200" : "border-brand-200/80 bg-brand-50/40",
              onSelect && "cursor-pointer hover:border-brand-400"
            )}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm font-black text-slate-800">
                  {period.periodName}
                  {period.periodType && <span className="ml-2 text-[11px] font-semibold text-slate-400">Kỳ {periodTypeLabel(period.periodType).toLowerCase()}</span>}
                </p>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  Áp dụng lịch {formatDate(period.effectiveStartDate ?? period.startDate)} – {formatDate(period.effectiveEndDate ?? period.endDate)}
                  {" · "}Đăng ký &amp; duyệt {formatDate(period.startDate)} – {formatDate(period.endDate)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {onViewPeriod && (period.effectiveStartDate ?? period.startDate) && (
                  <button
                    type="button"
                    onClick={() => onViewPeriod(String(period.effectiveStartDate ?? period.startDate))}
                    className="btn btn-secondary btn-sm"
                  >
                    Xem trên thời khóa biểu
                  </button>
                )}
                {onSelect ? (
                  <Badge tone={selectedId === period.periodId ? "brand" : "neutral"}>
                    {selectedId === period.periodId ? "Đang xem" : "Bấm để xem lịch kỳ"}
                  </Badge>
                ) : (
                  <Badge tone="success">Kỳ đang mở</Badge>
                )}
              </div>
            </div>

            <div className="mt-3 space-y-2">
              {period.rounds.map((round) => {
                const roundWindow = windowState(round.registrationStartAt, round.registrationEndAt);
                return (
                  <div key={round.roundId} className="rounded-lg border border-slate-200 bg-surface p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-bold text-slate-800">
                        Đợt: {round.roundName}
                        {round.storeName && <span className="font-normal text-slate-400"> · {round.storeName}</span>}
                      </p>
                      <Badge tone={roundWindow.tone}>{roundWindow.label}</Badge>
                    </div>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      Đăng ký từ {formatDateTime(round.registrationStartAt)} đến {formatDateTime(round.registrationEndAt)}
                    </p>
                    {round.sessions.length === 0 ? (
                      <p className="mt-2 text-[11px] text-slate-500">Đợt không chia phiên: mọi nhóm ca đăng ký trong cả đợt.</p>
                    ) : (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {round.sessions.map((session) => {
                          const sessionWindow = windowState(session.openAt, session.closeAt);
                          return (
                            <div key={session.sessionId} className="rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-1.5">
                              <p className="font-semibold text-slate-700">
                                Phiên: {session.sessionName}
                                {session.shiftGroupName && <span className="font-normal text-slate-400"> · {session.shiftGroupName}</span>}
                              </p>
                              <p className="mt-0.5 text-[10px] text-slate-500">
                                {formatDateTime(session.openAt)} → {formatDateTime(session.closeAt)}
                              </p>
                              <Badge tone={sessionWindow.tone} className="mt-1">{sessionWindow.label}</Badge>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
