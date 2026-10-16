import React from "react";
import { UserPlus, X } from "lucide-react";
import type { ShiftByDateResponse } from "@/lib/api";
import { Drawer, EmptyState } from "@/components/ui";
import { formatDate, formatMoney, fromDayKey, text, timeRange } from "@/lib/format";
import { shiftDateStyle, WEEKDAY_LONG } from "../constants";
import { useSchedule } from "../ScheduleContext";
import { EntityActions } from "../components/EntityActions";
import { shiftDateId } from "../useScheduleLookups";
import { AssignmentRow } from "./AssignmentRow";

/** Panel chi tiết các ca của một ngày: nhân viên, duyệt và phân bổ. */
export function ShiftDetailDrawer() {
  const { shiftDetail, closeShiftDetail, shiftDates } = useSchedule();
  if (!shiftDetail) return null;

  const items = shiftDetail.ids
    .map((id) => shiftDates.find((item) => shiftDateId(item) === id))
    .filter((item): item is ShiftByDateResponse => Boolean(item));
  const day = fromDayKey(shiftDetail.dateKey);

  return (
    <Drawer open onClose={closeShiftDetail}>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Chi tiết ca</p>
          <h3 className="text-xl font-black text-slate-800">{`${WEEKDAY_LONG[day.getDay()]}, ${formatDate(shiftDetail.dateKey)}`}</h3>
        </div>
        <button type="button" onClick={closeShiftDetail} aria-label="Đóng" className="rounded-full p-2 hover:bg-slate-100">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-4">
        {items.length === 0 && <EmptyState>Ca này không còn tồn tại.</EmptyState>}
        {items.map((item) => (
          <ShiftCard key={shiftDateId(item)} item={item} />
        ))}
      </div>
    </Drawer>
  );
}

function ShiftCard({ item }: { item: ShiftByDateResponse }) {
  const { lookups, openModal } = useSchedule();
  const entryId = shiftDateId(item);
  const style = shiftDateStyle(item.status);
  const cap = lookups.capacityOf(item);
  const all = lookups.allAssignmentsOf(item);
  const activeCount = lookups.activeAssignmentsOf(item).length;
  const period = lookups.maps.period.get(lookups.periodIdOf(item));
  const roundId = lookups.roundIdOf(item);
  const sessionId = lookups.sessionIdOf(item);

  return (
    <div className="tile">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-base font-black text-slate-800">{text(item.shiftName, `Ca #${entryId}`)}</p>
          <p className="text-xs text-slate-500">{timeRange(item.startTime, item.endTime)} · {lookups.storeNameOf(item)}</p>
          <div className="mt-1 flex flex-wrap gap-1 text-[10px]">
            {period && <span className="rounded bg-slate-200/70 px-1.5 py-0.5 text-slate-600">Kỳ: {text(period.periodName)}</span>}
            {roundId > 0 && <span className="rounded bg-brand-100 px-1.5 py-0.5 text-brand-800">{text(item.roundName ?? lookups.roundNameOf(roundId))}</span>}
            {sessionId > 0 && <span className="rounded bg-violet-100 px-1.5 py-0.5 text-violet-700">{text(item.sessionName ?? lookups.sessionNameOf(sessionId))}</span>}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${style.badge}`}>{style.label}</span>
          <EntityActions kind="shiftDate" item={item} />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
        <span className="rounded-full bg-white px-2 py-1 font-bold text-slate-700">{activeCount}{cap > 0 ? `/${cap}` : ""} nhân viên</span>
        {item.payRate != null && <span className="rounded-full bg-white px-2 py-1 text-emerald-700">{formatMoney(item.payRate)}</span>}
        {item.managerNote && <span className="rounded-full bg-white px-2 py-1 text-slate-500">{text(item.managerNote)}</span>}
      </div>

      <div className="mt-4 space-y-2">
        {all.length === 0 ? (
          <EmptyState className="p-3">Chưa có nhân viên được phân bổ.</EmptyState>
        ) : (
          all.map((assignment, index) => <AssignmentRow key={Number(assignment.id ?? assignment.shiftAssignmentId ?? 0) || `${entryId}-${index}`} assignment={assignment} />)
        )}
      </div>

      <button
        type="button"
        onClick={() => openModal("assignment", { shiftByDate: entryId, status: "APPROVED" }, true)}
        className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-brand-300 bg-white px-3 py-2 text-xs font-bold text-brand-700 hover:bg-brand-50"
      >
        <UserPlus className="h-4 w-4" /> Phân bổ nhân viên vào ca
      </button>
    </div>
  );
}
