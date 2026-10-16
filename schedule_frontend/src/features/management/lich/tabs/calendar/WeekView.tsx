import React from "react";
import type { ShiftByDateResponse, SpecialEventResponse } from "@/lib/api";
import { localKey, pad, relId, text, timeRange } from "@/lib/format";
import { shiftDateStyle, SLOTS, WEEKDAY_SHORT } from "../../constants";
import { useSchedule } from "../../ScheduleContext";
import { shiftDateId } from "../../useScheduleLookups";
import { shiftSlot } from "./useCalendar";

interface Props {
  days: Date[];
  shiftsOn: (day: Date) => ShiftByDateResponse[];
  eventsOn: (day: Date) => SpecialEventResponse[];
  onOpen: (day: Date, items: ShiftByDateResponse[]) => void;
}

const GRID = "grid grid-cols-[6.5rem_repeat(7,minmax(0,1fr))]";

export function WeekView({ days, shiftsOn, eventsOn, onOpen }: Props) {
  const { lookups } = useSchedule();
  const todayKey = localKey(new Date());

  return (
    <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200">
      <div className="min-w-220">
        <div className={`${GRID} border-b border-slate-200 bg-slate-50`}>
          <div className="border-r border-slate-200 p-3 text-center text-[10px] font-bold text-slate-500">Khung ca</div>
          {days.map((day, index) => {
            const isToday = localKey(day) === todayKey;
            const weekend = day.getDay() === 0 || day.getDay() === 6;
            return (
              <div key={localKey(day)} className={`p-2 text-center ${index < 6 ? "border-r border-slate-200" : ""} ${isToday ? "bg-brand-50" : ""}`}>
                <p className={`text-[10px] font-semibold ${weekend ? "text-rose-500" : "text-slate-500"}`}>{WEEKDAY_SHORT[day.getDay()]}</p>
                <p className={`mt-0.5 text-lg font-black ${isToday ? "text-brand-600" : "text-slate-800"}`}>{pad(day.getDate())}/{pad(day.getMonth() + 1)}</p>
                {eventsOn(day).map((event) => (
                  <p key={Number(event.eventId ?? event.id)} className="mt-1 truncate rounded bg-rose-50 px-1 py-0.5 text-[9px] font-bold text-rose-600" title={text(event.eventName)}>
                    ★ {text(event.eventName)}
                  </p>
                ))}
              </div>
            );
          })}
        </div>

        {SLOTS.map((slot, slotIndex) => (
          <div key={slot.label} className={`${GRID} min-h-32 ${slotIndex < SLOTS.length - 1 ? "border-b border-slate-200" : ""}`}>
            <div className="border-r border-slate-200 bg-slate-50/60 p-3">
              <p className="text-[11px] font-black text-slate-700">{slot.label}</p>
              <p className="mt-1 text-[9px] text-slate-400">{slot.hint}</p>
            </div>
            {days.map((day, index) => {
              const items = shiftsOn(day).filter((item) => shiftSlot(item, lookups.templateOf(item)?.startTime) === slotIndex);
              return (
                <div key={`${slot.label}-${localKey(day)}`} className={`space-y-2 p-1.5 ${index < 6 ? "border-r border-slate-200" : ""}`}>
                  {items.map((item) => {
                    const style = shiftDateStyle(item.status);
                    const cap = lookups.capacityOf(item);
                    const workers = lookups.activeAssignmentsOf(item);
                    return (
                      <button
                        key={shiftDateId(item)}
                        type="button"
                        onClick={() => onOpen(day, [item])}
                        className={`block w-full rounded-lg border p-2 text-left shadow-xs transition hover:border-brand-400 hover:shadow-sm ${style.card}`}
                      >
                        <p className="truncate text-[10px] font-black text-slate-800">{text(item.shiftName, slot.label)}</p>
                        <p className="mt-0.5 text-[10px] font-bold text-slate-600">{timeRange(item.startTime, item.endTime)}</p>
                        <p className="mt-0.5 truncate text-[9px] text-slate-500">{lookups.storeNameOf(item)}</p>
                        <div className="mt-1.5 flex items-center justify-between gap-1">
                          <span className={`text-[10px] font-bold ${cap > 0 && workers.length >= cap ? "text-blue-600" : workers.length === 0 ? "text-rose-500" : "text-emerald-700"}`}>
                            {workers.length}{cap > 0 ? `/${cap}` : ""} NV
                          </span>
                          <span className={`rounded px-1 py-0.5 text-[8px] font-bold ${style.badge}`}>{style.label}</span>
                        </div>
                        {workers.length > 0 && (
                          <p className="mt-1 truncate text-[9px] text-slate-500">
                            {workers.slice(0, 2).map((assignment) => lookups.employeeName(relId(assignment, "employee"))).join(", ")}
                            {workers.length > 2 ? ` +${workers.length - 2}` : ""}
                          </p>
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
