import React from "react";
import { Clock3 } from "lucide-react";
import type { SchedulePeriodResponse, ShiftByDateResponse } from "@/lib/api";
import { Card, CardHeader, EmptyState } from "@/components/ui";
import { dayKey, formatDate, text, timeRange } from "@/lib/format";
import { periodStatusLabel } from "../../constants";
import { useSchedule } from "../../ScheduleContext";
import { shiftDateId } from "../../useScheduleLookups";
import { PeriodTimeline } from "./PeriodTimeline";

interface Props {
  period: SchedulePeriodResponse | undefined;
  periodId: number;
  entries: ShiftByDateResponse[];
}

/** Bảng bên phải tab Kỳ: thông tin, mốc thời gian và các ca làm việc của kỳ. */
export function PeriodDetail({ period, periodId, entries }: Props) {
  const { lookups, openShiftDetail, roundsOfPeriod } = useSchedule();

  if (!period) {
    return (
      <Card>
        <CardHeader title="Chi tiết kỳ" icon={Clock3} iconClassName="text-blue-600" />
        <div className="p-5 text-xs text-slate-500">Chọn một kỳ để xem các ca làm việc.</div>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader title={`Ca làm việc trong ${text(period.periodName)}`} icon={Clock3} iconClassName="text-blue-600" />
      <div className="space-y-4 p-4 sm:p-5">
        <div className="flex flex-wrap gap-2 text-[11px] text-slate-500">
          <span className="rounded-full bg-slate-100 px-2 py-1">{periodStatusLabel(period.status)}</span>
          <span className="rounded-full bg-blue-50 px-2 py-1 text-blue-700">{entries.length} ca làm việc</span>
        </div>
        {period.description && <p className="text-xs text-slate-600">{period.description}</p>}

        <PeriodTimeline
          periodId={periodId}
          periodStart={period.startDate}
          periodEnd={period.endDate}
          effectiveStart={period.effectiveStartDate}
          effectiveEnd={period.effectiveEndDate}
          rounds={roundsOfPeriod(periodId)}
        />

        <div className="space-y-3">
          {entries.length === 0 ? (
            <EmptyState>Chưa có ca làm việc nào trong kỳ này.</EmptyState>
          ) : (
            entries.map((entry) => {
              const entryId = shiftDateId(entry);
              const roundId = lookups.roundIdOf(entry);
              const count = lookups.activeAssignmentsOf(entry).length;
              const capacity = lookups.capacityOf(entry);
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
                    <span className="shrink-0 rounded-full bg-white px-2 py-1 text-[10px] font-bold text-slate-600">
                      {count}
                      {capacity > 0 ? `/${capacity}` : ""} NV
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </Card>
  );
}
