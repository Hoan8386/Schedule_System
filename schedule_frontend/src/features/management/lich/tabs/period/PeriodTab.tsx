import React, { useMemo, useState } from "react";
import { CalendarRange } from "lucide-react";
import { Card, CardHeader } from "@/components/ui";
import { dayKey, formatDate, hhmm, text, upper } from "@/lib/format";
import { periodStatusLabel, STATUS_OPTIONS } from "../../constants";
import { useSchedule } from "../../ScheduleContext";
import { AddButton, EntityActions } from "../../components/EntityActions";
import { PeriodDetail } from "./PeriodDetail";
import { StoreFilter } from "../../components/StoreFilter";
import { FilterSelect } from "../../components/FilterSelect";

const EMPTY_FILTERS = { q: "", from: "", to: "", status: "" };

export function PeriodTab() {
  const { periods, shiftDates, lookups, roundsOfPeriod } = useSchedule();
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [pickedId, setPickedId] = useState<number | null>(null);
  const setFilter = (key: keyof typeof EMPTY_FILTERS, value: string) => setFilters((current) => ({ ...current, [key]: value }));

  const filtered = useMemo(() => {
    const q = filters.q.trim().toLowerCase();
    return periods.filter((period) => {
      if (q && !`${period.periodName ?? ""} ${period.status ?? ""}`.toLowerCase().includes(q)) return false;
      if (filters.status && upper(period.status) !== filters.status) return false;
      const start = dayKey(period.effectiveStartDate ?? period.startDate);
      const end = dayKey(period.effectiveEndDate ?? period.endDate) || start;
      if (filters.from && end && end < filters.from) return false;
      if (filters.to && start && start > filters.to) return false;
      return true;
    });
  }, [periods, filters]);

  const periodIdOfItem = (period: (typeof periods)[number]) => Number(period.id ?? period.schedulePeriodId ?? 0);
  const selected = filtered.find((period) => periodIdOfItem(period) === pickedId) ?? filtered[0];
  const activeId = selected ? periodIdOfItem(selected) : 0;

  // Chỉ các ca làm việc (bỏ ca đã hủy), theo ngày rồi giờ bắt đầu
  const entries = useMemo(
    () =>
      shiftDates
        .filter((item) => lookups.periodIdOf(item) === activeId && upper(item.status) !== "CANCELLED")
        .sort((a, b) => `${dayKey(a.workDate)} ${hhmm(a.startTime)}`.localeCompare(`${dayKey(b.workDate)} ${hhmm(b.startTime)}`)),
    [shiftDates, lookups, activeId]
  );

  return (
    <>
      <section className="card flex flex-wrap items-end gap-3 p-4">
        <label className="field-label min-w-56 flex-1">
          Tìm kỳ
          <input value={filters.q} onChange={(event) => setFilter("q", event.target.value)} placeholder="Tên kỳ hoặc trạng thái" className="field-input" />
        </label>
        <label className="field-label">
          Từ ngày
          <input type="date" value={filters.from} onChange={(event) => setFilter("from", event.target.value)} className="field-input" />
        </label>
        <label className="field-label">
          Đến ngày
          <input type="date" value={filters.to} onChange={(event) => setFilter("to", event.target.value)} className="field-input" />
        </label>
        <FilterSelect
          label="Trạng thái"
          allLabel="Tất cả"
          className="field-label min-w-40"
          value={filters.status}
          onChange={(value) => setFilter("status", value)}
          options={STATUS_OPTIONS.period.map((status) => ({ value: status, label: periodStatusLabel(status) }))}
        />
        <StoreFilter className="field-label min-w-48" />
        <button type="button" onClick={() => setFilters(EMPTY_FILTERS)} className="btn btn-secondary btn-sm">
          Đặt lại
        </button>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.1fr_1.3fr]">
        <Card>
          <CardHeader title={`Tất cả kỳ (${filtered.length})`} icon={CalendarRange} actions={<AddButton kind="period" className="" />} />
          <div className="divide-y divide-slate-100">
            {filtered.length === 0 && <div className="p-5 text-xs text-slate-500">Không có kỳ lập lịch phù hợp.</div>}
            {filtered.map((item) => {
              const id = periodIdOfItem(item);
              const select = () => setPickedId(id);
              return (
                <div
                  key={id}
                  role="button"
                  tabIndex={0}
                  onClick={select}
                  onKeyDown={(event) => (event.key === "Enter" || event.key === " ") && select()}
                  className={`flex w-full cursor-pointer items-center justify-between gap-3 px-5 py-4 text-left transition ${id === activeId ? "bg-brand-50" : "hover:bg-slate-50"}`}
                >
                  <div>
                    <p className="text-sm font-black text-slate-800">
                      {text(item.periodName)}
                    </p>
                    <p className="mt-1 text-[11px] text-slate-500">
                      Áp dụng: {item.effectiveStartDate ? `${formatDate(item.effectiveStartDate)} – ${formatDate(item.effectiveEndDate)}` : "chưa thiết lập"}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Kỳ: {formatDate(item.startDate)} – {formatDate(item.endDate)} · {roundsOfPeriod(id).length} đợt
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="badge badge-neutral">{periodStatusLabel(item.status)}</span>
                    <EntityActions kind="period" item={item} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <PeriodDetail period={selected} periodId={activeId} entries={entries} />
      </section>
    </>
  );
}
