import React from "react";
import { Star } from "lucide-react";
import type { ShiftByDateResponse, SpecialEventResponse } from "@/lib/api";
import { hhmm, localKey, text, upper } from "@/lib/format";
import { MONTH_HEADER, shiftDateStyle } from "../../constants";
import { useSchedule } from "../../ScheduleContext";
import { shiftDateId } from "../../useScheduleLookups";

interface Props {
  days: Date[];
  month: number;
  shiftsOn: (day: Date) => ShiftByDateResponse[];
  eventsOn: (day: Date) => SpecialEventResponse[];
  highlight: ((item: ShiftByDateResponse) => boolean) | null;
  onOpen: (day: Date, items: ShiftByDateResponse[]) => void;
}

const MAX_VISIBLE = 3;

export function MonthView({ days, month, shiftsOn, eventsOn, highlight, onOpen }: Props) {
  const { lookups } = useSchedule();
  const todayKey = localKey(new Date());

  return (
    <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200">
      <div className="min-w-180">
        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
          {MONTH_HEADER.map((label, index) => (
            <div key={label} className={`px-2 py-2 text-center text-[11px] font-bold ${index >= 5 ? "text-rose-500" : "text-slate-500"}`}>{label}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days.map((day, index) => {
            // Khi chọn nhân viên: đưa ca của nhân viên đó lên đầu để không bị ẩn trong "+n ca khác"
            const items = highlight ? [...shiftsOn(day)].sort((a, b) => Number(highlight(b)) - Number(highlight(a))) : shiftsOn(day);
            const inMonth = day.getMonth() === month;
            const isToday = localKey(day) === todayKey;
            const visible = items.slice(0, MAX_VISIBLE);
            return (
              <div
                key={localKey(day)}
                className={`flex min-h-36 flex-col border-b border-slate-200 p-2 ${index % 7 === 6 ? "" : "border-r"} ${index >= 35 ? "border-b-0" : ""} ${inMonth ? "bg-white" : "bg-slate-50/70"}`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span
                    className={`flex h-6 min-w-6 items-center justify-center rounded-full text-xs font-black ${isToday ? "bg-brand-500 text-brand-contrast" : inMonth ? "text-slate-800" : "text-slate-300"}`}
                  >
                    {day.getDate()}
                  </span>
                  {items.length > 0 && (
                    <button type="button" onClick={() => onOpen(day, items)} className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-600 hover:bg-brand-100">
                      {items.length} ca
                    </button>
                  )}
                </div>
                {eventsOn(day).map((event) => (
                  <p
                    key={Number(event.eventId ?? event.id)}
                    title={text(event.description, "")}
                    className="mt-1 flex items-center gap-1 truncate rounded bg-rose-50 px-1.5 py-0.5 text-[9px] font-bold text-rose-600"
                  >
                    <Star className="h-2.5 w-2.5 shrink-0" /> <span className="truncate">{text(event.eventName)}</span>
                  </p>
                ))}
                <div className={`mt-1.5 space-y-1 ${inMonth ? "" : "opacity-60"}`}>
                  {visible.map((item) => {
                    const style = shiftDateStyle(item.status);
                    const cap = lookups.capacityOf(item);
                    const count = lookups.activeAssignmentsOf(item).length;
                    const marked = highlight?.(item);
                    return (
                      <button
                        key={shiftDateId(item)}
                        type="button"
                        onClick={() => onOpen(day, [item])}
                        title={`${text(item.shiftName)} · ${lookups.groupNameOf(lookups.groupIdOf(item))} · ${lookups.storeNameOf(item)} · ${style.label}`}
                        className={`block w-full rounded-md border px-1.5 py-1 text-left transition hover:brightness-95 hover:shadow-sm ${lookups.colorOf(item)} ${upper(item.status) === "CANCELLED" ? "line-through opacity-60" : ""} ${marked ? "ring-2 ring-accent" : highlight ? "opacity-35" : ""}`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="truncate text-[10px] font-bold">{hhmm(item.startTime)}–{hhmm(item.endTime)}</span>
                          <span className={`shrink-0 rounded px-0.5 text-[9px] font-bold ${count === 0 ? "bg-white text-rose-500" : ""}`}>
                            {count}{cap > 0 ? `/${cap}` : ""}{cap > 0 && count >= cap ? " ✓" : ""}
                          </span>
                        </div>
                        <p className="truncate text-[9px] opacity-80">{text(item.shiftName, `Ca #${shiftDateId(item)}`)}</p>
                      </button>
                    );
                  })}
                  {items.length > visible.length && (
                    <button type="button" onClick={() => onOpen(day, items)} className="w-full rounded-md px-1.5 py-0.5 text-left text-[10px] font-bold text-brand-700 hover:bg-brand-50">
                      +{items.length - visible.length} ca khác
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
