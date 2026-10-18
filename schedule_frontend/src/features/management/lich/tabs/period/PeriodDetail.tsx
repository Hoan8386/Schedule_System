import React from "react";
import { Users } from "lucide-react";
import type { SchedulePeriodResponse, ShiftByDateResponse } from "@/lib/api";
import { Card, CardHeader, EmptyState } from "@/components/ui";
import { dayKey, formatDate, relId, text, timeRange } from "@/lib/format";
import { useSchedule } from "../../ScheduleContext";
import { shiftDateId } from "../../useScheduleLookups";
import { PeriodTimeline } from "./PeriodTimeline";

interface Props {
  period: SchedulePeriodResponse | undefined;
  periodId: number;
  entries: ShiftByDateResponse[];
  totalEmployees: number;
}

/** Bảng bên phải tab Kỳ: thông tin, mốc thời gian và các ca của kỳ. */
export function PeriodDetail({ period, periodId, entries, totalEmployees }: Props) {
  const { lookups, openShiftDetail, roundsOfPeriod } = useSchedule();

  if (!period) {
    return (
      <Card>
        <CardHeader title="Chi tiết kỳ" icon={Users} iconClassName="text-blue-600" />
        <div className="p-5 text-xs text-slate-500">Chọn một kỳ để xem nhân viên.</div>
      </Card>
    );
  }

  const effectiveRange = period.effectiveStartDate
    ? `${formatDate(period.effectiveStartDate)} – ${formatDate(period.effectiveEndDate)}`
    : null;

  return (
    <Card>
      <CardHeader title={`Nhân viên trong ${text(period.periodName)}`} icon={Users} iconClassName="text-blue-600" />
      <div className="space-y-4 p-5">
        <div className="flex flex-wrap gap-2 text-[11px] text-slate-500">
          <span className="rounded-full bg-slate-100 px-2 py-1">{text(period.status)}</span>
          <span className="rounded-full bg-emerald-100 px-2 py-1 text-emerald-700">{totalEmployees} nhân viên</span>
          <span className="rounded-full bg-blue-50 px-2 py-1 text-blue-700">{entries.length} ca</span>
        </div>
        {period.description && <p className="text-xs text-slate-600">{period.description}</p>}

        <PeriodTimeline
          periodId={periodId}
          periodRange={`${formatDate(period.startDate)} – ${formatDate(period.endDate)}`}
          effectiveRange={effectiveRange}
          rounds={roundsOfPeriod(periodId)}
        />

        <div className="space-y-3">
          {entries.length === 0 ? (
            <EmptyState>Chưa có ca nào trong kỳ này.</EmptyState>
          ) : (
            entries.map((entry) => {
              const entryId = shiftDateId(entry);
              const roundId = lookups.roundIdOf(entry);
              const names = lookups.activeAssignmentsOf(entry).map((assignment) => lookups.employeeName(relId(assignment, "employee")));
              return (
                <button
                  key={entryId}
                  type="button"
                  onClick={() => openShiftDetail(dayKey(entry.workDate), [entryId])}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-left hover:border-brand-300 hover:bg-brand-50"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-slate-800">{text(entry.shiftName, `Ca #${entryId}`)}</p>
                      <p className="text-[11px] text-slate-500">
                        {formatDate(entry.workDate)} · {timeRange(entry.startTime, entry.endTime)}
                        {roundId ? ` · ${text(entry.roundName ?? lookups.roundNameOf(roundId))}` : ""}
                      </p>
                    </div>
                    <span className="rounded-full bg-white px-2 py-1 text-[10px] font-bold text-slate-600">{names.length} NV</span>
                  </div>
                  <p className="mt-2 text-[11px] text-slate-600">
                    {names.length > 0 ? names.slice(0, 3).join(", ") : "Chưa có nhân viên"}
                    {names.length > 3 ? ` +${names.length - 3}` : ""}
                  </p>
                </button>
              );
            })
          )}
        </div>
      </div>
    </Card>
  );
}
