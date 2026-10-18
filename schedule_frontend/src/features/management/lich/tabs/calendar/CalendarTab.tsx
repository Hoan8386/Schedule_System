import React from "react";
import { CalendarRange, ChevronLeft, ChevronRight } from "lucide-react";
import { Spinner } from "@/components/ui";
import { dayKey, fromDayKey, localKey, relId, text } from "@/lib/format";
import { shiftDateStyle, SHIFT_DATE_STATUS, STATUS_OPTIONS, type CalendarView } from "../../constants";
import { useSchedule } from "../../ScheduleContext";
import { roundIdOfRound, shiftDateId } from "../../useScheduleLookups";
import { AddButton } from "../../components/EntityActions";
import { FilterSelect } from "../../components/FilterSelect";
import { StoreFilter } from "../../components/StoreFilter";
import { EMPTY_CALENDAR_FILTERS, useCalendar } from "./useCalendar";
import { MonthView } from "./MonthView";
import { WeekView } from "./WeekView";

export function CalendarTab() {
  const { shiftDates, rounds, loading, lookups, openShiftDetail, storeFilter } = useSchedule();
  // Thời khóa biểu luôn xem theo một cửa hàng: chưa chọn thì mặc định cửa hàng đầu tiên
  const storeId = storeFilter || String(lookups.options.stores[0]?.value ?? "");
  const calendar = useCalendar(storeId);
  const { filters, setFilters, view, stats } = calendar;

  const openDetail = (day: Date, items: typeof shiftDates) => openShiftDetail(localKey(day), items.map(shiftDateId));

  const selectPeriod = (periodId: string) => {
    setFilters((current) => ({ ...current, periodId, roundId: "" }));
    // Nhảy tới tháng bắt đầu áp dụng của kỳ được chọn
    const period = lookups.maps.period.get(Number(periodId));
    const start = dayKey(period?.effectiveStartDate ?? period?.startDate);
    if (start) calendar.setCursor(fromDayKey(start));
  };

  const roundOptions = rounds
    .filter((round) => !storeId || relId(round, "store") === Number(storeId))
    .filter((round) => !filters.periodId || relId(round, "schedulePeriod") === Number(filters.periodId))
    .map((round) => ({ value: roundIdOfRound(round), label: text(round.roundName, `Đợt #${roundIdOfRound(round)}`) }));

  return (
    <section className="card p-4 sm:p-5">
      <div className="flex flex-col gap-4 border-b border-slate-100 pb-4">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
          <div>
            <div className="flex items-center gap-2">
              <CalendarRange className="h-5 w-5 text-brand-500" />
              <h2 className="text-xl font-black tracking-tight text-slate-900">Thời khóa biểu ca làm</h2>
            </div>
            <p className="mt-1 text-xs text-slate-500">Bấm vào một ca để xem, duyệt và phân bổ nhân viên.</p>
          </div>
          <AddButton kind="shiftDate" />
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
          <StoreFilter className="min-w-48" allowAll={false} value={storeId} />
          <FilterSelect label="Kỳ lập lịch" allLabel="Tất cả kỳ" value={filters.periodId} onChange={selectPeriod} options={lookups.options.periods} />
          <FilterSelect
            label="Đợt đăng ký"
            allLabel="Tất cả đợt"
            value={filters.roundId}
            onChange={(roundId) => setFilters((current) => ({ ...current, roundId }))}
            options={roundOptions}
          />
          <FilterSelect
            label="Trạng thái ca"
            allLabel="Tất cả trạng thái"
            className="min-w-44"
            value={filters.status}
            onChange={(status) => setFilters((current) => ({ ...current, status }))}
            options={STATUS_OPTIONS.shiftDate.map((status) => ({ value: status, label: shiftDateStyle(status).label }))}
          />
          {calendar.hasFilters && (
            <button type="button" onClick={() => setFilters(EMPTY_CALENDAR_FILTERS)} className="btn btn-secondary btn-sm">
              Bỏ lọc
            </button>
          )}
          <div className="flex items-center gap-1 rounded-xl border border-slate-200 p-1 lg:ml-auto">
            {(["week", "month"] as CalendarView[]).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => calendar.setView(option)}
                className={`rounded-lg px-4 py-2 text-xs font-bold transition ${view === option ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-50"}`}
              >
                {option === "week" ? "Tuần" : "Tháng"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-between gap-3 border-b border-slate-100 py-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => calendar.move(-1)} aria-label={view === "month" ? "Tháng trước" : "Tuần trước"} className="btn-icon border border-slate-200 text-slate-600 hover:bg-slate-50">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => calendar.move(1)} aria-label={view === "month" ? "Tháng sau" : "Tuần sau"} className="btn-icon border border-slate-200 text-slate-600 hover:bg-slate-50">
            <ChevronRight className="h-4 w-4" />
          </button>
          <h3 className="ml-1 text-base font-black text-slate-800">{calendar.title}</h3>
          <button type="button" onClick={() => calendar.setCursor(new Date())} className="btn btn-secondary btn-sm">
            Hôm nay
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-[11px]">
          <span className="rounded-full bg-slate-100 px-2.5 py-1 font-bold text-slate-700">{stats.total} ca</span>
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 font-bold text-emerald-700">
            {stats.assigned}{stats.capacity > 0 ? `/${stats.capacity}` : ""} lượt phân bổ
          </span>
          {stats.pending > 0 && <span className="rounded-full bg-brand-50 px-2.5 py-1 font-bold text-brand-700">{stats.pending} chờ duyệt</span>}
          {stats.missing > 0 && <span className="rounded-full bg-rose-50 px-2.5 py-1 font-bold text-rose-700">{stats.missing} ca thiếu người</span>}
        </div>
      </div>

      {loading && shiftDates.length === 0 ? (
        <Spinner label="Đang tải lịch..." className="mt-4 h-64 rounded-xl border border-dashed border-slate-200" />
      ) : view === "month" ? (
        <MonthView days={calendar.days} month={calendar.cursor.getMonth()} shiftsOn={calendar.shiftsOn} eventsOn={calendar.eventsOn} onOpen={openDetail} />
      ) : (
        <WeekView days={calendar.days} shiftsOn={calendar.shiftsOn} eventsOn={calendar.eventsOn} onOpen={openDetail} />
      )}

      {!loading && stats.total === 0 && (
        <p className="mt-3 text-center text-xs text-slate-400">
          Không có ca nào trong {view === "month" ? "tháng" : "tuần"} này{calendar.hasFilters ? " với bộ lọc hiện tại" : ""}.
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2 text-[10px] font-semibold text-slate-500">
        {Object.entries(SHIFT_DATE_STATUS).map(([key, style]) => (
          <span key={key} className={`rounded-md border px-2 py-1 ${style.card}`}>{style.label}</span>
        ))}
        <span className="rounded-md bg-rose-50 px-2 py-1 text-rose-600">★ Sự kiện đặc biệt</span>
        <span className="ml-auto">Số trên ca = nhân viên đã phân bổ / số người tối đa</span>
      </div>
    </section>
  );
}
