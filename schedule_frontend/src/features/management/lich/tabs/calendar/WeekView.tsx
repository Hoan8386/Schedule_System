import React from "react";
import type { ShiftByDateResponse, SpecialEventResponse } from "@/lib/api";
import { hhmm, localKey, pad, text, timeRange, upper } from "@/lib/format";
import { WEEKDAY_LONG } from "../../constants";
import { useSchedule } from "../../ScheduleContext";
import { shiftDateId } from "../../useScheduleLookups";

interface Props {
  days: Date[];
  shiftsOn: (day: Date) => ShiftByDateResponse[];
  eventsOn: (day: Date) => SpecialEventResponse[];
  /** Ca có nhân viên đang chọn ở bộ lọc (null = không chọn): tô nổi, làm mờ phần còn lại */
  highlight: ((item: ShiftByDateResponse) => boolean) | null;
  onOpen: (day: Date, items: ShiftByDateResponse[]) => void;
}

/** Một dòng của biểu đồ: một ca trong ngày (danh sách nhân viên xem trong chi tiết ca). */
interface TimelineRow {
  key: string;
  item: ShiftByDateResponse;
  start: number;
  end: number;
}

/** Mỗi ngày trong tuần một màu (Thứ Hai → Chủ Nhật), giống mẫu lịch ca in. */
const DAY_COLORS = [
  "bg-blue-200 border-blue-300",
  "bg-rose-200 border-rose-300",
  "bg-orange-200 border-orange-300",
  "bg-stone-300 border-stone-400",
  "bg-lime-200 border-lime-300",
  "bg-violet-200 border-violet-300",
  "bg-slate-300 border-slate-400",
];

const DEFAULT_FROM = 5;
const DEFAULT_TO = 22;

/** "07:30" → 450 phút; null nếu không đọc được. */
const minutesOf = (value: unknown) => {
  const [h, m] = hhmm(value).split(":").map((part) => Number.parseInt(part, 10));
  return Number.isFinite(h) ? h * 60 + (Number.isFinite(m) ? m : 0) : null;
};

/** 480 → "8:00" */
const duration = (minutes: number) => `${Math.floor(minutes / 60)}:${pad(minutes % 60)}`;

/** Chế độ tuần dạng biểu đồ thời gian: mỗi ngày một khối, mỗi dòng một ca, thanh ca theo giờ bắt đầu – kết thúc. */
export function WeekView({ days, shiftsOn, eventsOn, highlight, onOpen }: Props) {
  const { lookups } = useSchedule();
  const todayKey = localKey(new Date());

  const rowsOf = (day: Date): TimelineRow[] =>
    shiftsOn(day).flatMap((item) => {
      const start = minutesOf(item.startTime ?? lookups.templateOf(item)?.startTime);
      let end = minutesOf(item.endTime ?? lookups.templateOf(item)?.endTime);
      if (start === null || end === null) return [];
      if (end <= start) end += 24 * 60; // ca qua nửa đêm
      return [{ key: `s-${shiftDateId(item)}`, item, start, end }];
    }).sort((a, b) => a.start - b.start || a.end - b.end);

  const week = days.map((day) => ({ day, rows: rowsOf(day) }));
  const all = week.flatMap(({ rows }) => rows);
  // Trục giờ: mặc định 5h – 22h, nới ra nếu có ca sớm / muộn hơn
  const from = Math.min(DEFAULT_FROM, ...all.map((row) => Math.floor(row.start / 60)));
  const to = Math.max(DEFAULT_TO, ...all.map((row) => Math.ceil(row.end / 60)));
  const hours = Array.from({ length: to - from + 1 }, (_, index) => from + index);
  const span = (to - from) * 60;
  const position = (minutes: number) => `${((minutes - from * 60) / span) * 100}%`;

  /** Đường kẻ dọc theo từng giờ, đặt dưới các thanh ca */
  const gridLines = (
    <div className="pointer-events-none absolute inset-0">
      {hours.map((hour) => (
        <span key={hour} className="absolute inset-y-0 border-l border-slate-200" style={{ left: position(hour * 60) }} />
      ))}
    </div>
  );

  return (
    <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200">
      <div className="min-w-240">
        {/* Trục giờ */}
        <div className="flex border-b-2 border-slate-300 bg-slate-50">
          <div className="w-52 shrink-0 border-r border-slate-200" />
          <div className="relative h-10 flex-1">
            {hours.map((hour) => (
              <span
                key={hour}
                className="absolute bottom-1.5 -translate-x-1/2 text-[10px] font-bold text-slate-500"
                style={{ left: position(hour * 60) }}
              >
                {pad(hour % 24)}:00
              </span>
            ))}
          </div>
        </div>

        {week.map(({ day, rows }, dayIndex) => {
          const isToday = localKey(day) === todayKey;
          const color = DAY_COLORS[(day.getDay() + 6) % 7];
          const events = eventsOn(day);
          return (
            <div key={localKey(day)} className={`flex ${dayIndex < week.length - 1 ? "border-b border-slate-300" : ""}`}>
              {/* Nhãn ngày dựng đứng */}
              <div className={`flex w-10 shrink-0 items-center justify-center border-r border-slate-200 py-2 ${isToday ? "bg-brand-50" : "bg-slate-50/60"}`}>
                <span className={`whitespace-nowrap text-[11px] font-black [writing-mode:vertical-rl] rotate-180 ${isToday ? "text-brand-700" : "text-slate-700"}`}>
                  {WEEKDAY_LONG[day.getDay()]} {pad(day.getDate())}/{pad(day.getMonth() + 1)}
                </span>
              </div>

              <div className="min-w-0 flex-1">
                {events.length > 0 && (
                  <div className="flex flex-wrap gap-1 border-b border-dashed border-slate-200 px-2 py-1">
                    {events.map((event) => (
                      <span key={Number(event.eventId ?? event.id)} className="rounded bg-rose-50 px-1.5 py-0.5 text-[9px] font-bold text-rose-600" title={text(event.description, "")}>
                        ★ {text(event.eventName)}
                      </span>
                    ))}
                  </div>
                )}

                {rows.length === 0 ? (
                  <div className="flex">
                    <div className="w-42 shrink-0 border-r border-slate-200" />
                    <div className="relative h-9 flex-1">
                      {gridLines}
                      <span className="absolute inset-0 flex items-center pl-3 text-[10px] italic text-slate-400">Không có ca</span>
                    </div>
                  </div>
                ) : (
                  rows.map((row) => {
                    const marked = highlight?.(row.item) ?? false;
                    const dimmed = Boolean(highlight) && !marked;
                    const cap = lookups.capacityOf(row.item);
                    const count = lookups.activeAssignmentsOf(row.item).length;
                    const pending = lookups.allAssignmentsOf(row.item).filter((assignment) => upper(assignment.status) === "PENDING").length;
                    const empty = count === 0;
                    const cancelled = upper(row.item.status) === "CANCELLED";
                    const shiftCode = text(lookups.templateOf(row.item)?.shiftCode, "");
                    const title = `${text(row.item.shiftName, "")} · ${timeRange(row.item.startTime, row.item.endTime)} · ${count}/${cap} người${
                      pending ? ` · ${pending} chờ duyệt` : ""
                    } — bấm để xem nhân viên`;
                    return (
                      <div key={row.key} className={`flex ${dimmed ? "opacity-35" : ""}`}>
                        <div className="w-42 shrink-0 truncate border-r border-slate-200 px-2 py-1.5 text-right text-[11px]">
                          <span className={`font-bold ${marked ? "text-accent" : "text-slate-800"}`}>{text(row.item.shiftName, `Ca #${shiftDateId(row.item)}`)}</span>
                          {shiftCode && <span className="ml-1 text-[10px] text-slate-400">{shiftCode}</span>}
                        </div>
                        <div className="relative h-8 flex-1">
                          {gridLines}
                          {/* Đường gạch nối từ tên ca tới thanh ca, như mẫu */}
                          <span className="absolute top-1/2 border-t border-dashed border-slate-300" style={{ left: 0, width: position(row.start) }} />
                          <button
                            type="button"
                            onClick={() => onOpen(day, [row.item])}
                            title={title}
                            className={`absolute top-1 bottom-1 flex items-center justify-between gap-2 overflow-hidden rounded border px-2 text-[10px] font-semibold text-slate-700 transition hover:brightness-95 ${
                              empty ? "border-dashed border-rose-300 bg-rose-50 text-rose-500" : color
                            } ${cancelled ? "line-through opacity-50" : ""} ${marked ? "ring-2 ring-accent" : ""}`}
                            style={{ left: position(row.start), width: `calc(${position(row.end)} - ${position(row.start)})` }}
                          >
                            <span className="truncate">
                              {duration(row.end - row.start)}
                              <span className="font-normal text-slate-500"> · {timeRange(row.item.startTime, row.item.endTime)}</span>
                            </span>
                            <span className="flex shrink-0 items-center gap-1">
                              {pending > 0 && <span className="rounded bg-white/70 px-1 text-[9px] font-bold text-brand-700">{pending} chờ</span>}
                              <span className={`font-bold ${cap > 0 && count >= cap ? "text-blue-700" : empty ? "text-rose-500" : "text-slate-700"}`}>
                                {count}
                                {cap > 0 ? `/${cap}` : ""} NV
                              </span>
                            </span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
