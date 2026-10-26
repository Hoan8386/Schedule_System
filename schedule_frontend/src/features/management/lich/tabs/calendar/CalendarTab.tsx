import React, { useState } from "react";
import { CalendarRange, ChevronLeft, ChevronRight, ClipboardList, Search } from "lucide-react";
import { Spinner } from "@/components/ui";
import { localKey } from "@/lib/format";
import { shiftDateStyle, STATUS_OPTIONS, type CalendarView } from "../../constants";
import { DAY_PART_LABEL } from "../../groupColors";
import { useSchedule } from "../../ScheduleContext";
import { shiftDateId } from "../../useScheduleLookups";
import { AddButton } from "../../components/EntityActions";
import { FilterSelect } from "../../components/FilterSelect";
import { StoreFilter } from "../../components/StoreFilter";
import { useCalendar } from "./useCalendar";
import { MonthView } from "./MonthView";
import { WeekView } from "./WeekView";
import { RequestList } from "./RequestList";
import { ListView } from "./ListView";

const VIEW_LABEL: Record<CalendarView, string> = { week: "Tuần", month: "Tháng", list: "Danh sách" };

export function CalendarTab() {
  const { shiftDates, loading, lookups, openShiftDetail, storeFilter } = useSchedule();
  // Thời khóa biểu luôn xem theo một cửa hàng: chưa chọn thì mặc định cửa hàng đầu tiên
  const storeId = storeFilter || String(lookups.options.stores[0]?.value ?? "");
  const calendar = useCalendar(storeId);
  const { filters, draft, setDraft, view, stats } = calendar;
  const [showRequests, setShowRequests] = useState(false);
  // Nhóm ca của cửa hàng đang xem – để chú thích màu
  const legendGroups = calendar.groupOptions.map((option) => ({ id: Number(option.value), name: option.label }));

  const openDetail = (day: Date, items: typeof shiftDates) => openShiftDetail(localKey(day), items.map(shiftDateId));

  return (
    <section className="card p-4 sm:p-5">
      {showRequests && <RequestList periodId={filters.periodId} storeId={storeId} onClose={() => setShowRequests(false)} />}
      <div className="flex flex-col gap-4 border-b border-slate-100 pb-4">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
          <div>
            <div className="flex items-center gap-2">
              <CalendarRange className="h-5 w-5 text-brand-500" />
              <h2 className="text-xl font-black tracking-tight text-slate-900">Thời khóa biểu ca làm</h2>
            </div>
            <p className="mt-1 text-xs text-slate-500">Bấm vào một ca để xem, duyệt và phân bổ nhân viên.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-xl border border-slate-200 p-1">
              {(["week", "month", "list"] as CalendarView[]).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => calendar.setView(option)}
                  className={`rounded-lg px-4 py-2 text-xs font-bold transition ${view === option ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-50"}`}
                >
                  {VIEW_LABEL[option]}
                </button>
              ))}
            </div>
            <button type="button" onClick={() => setShowRequests(true)} className="btn btn-secondary btn-sm">
              <ClipboardList className="h-4 w-4" /> Danh sách yêu cầu
            </button>
            <AddButton kind="shiftDate" />
          </div>
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
          {/* Các ô lọc chia 2 dòng × 3 cột trên màn hình lớn */}
          <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <StoreFilter className="min-w-0" allowAll={false} value={calendar.draftStore} onChange={calendar.setDraftStoreId} />
            <FilterSelect
              label="Kỳ lập lịch"
              allLabel="Tất cả kỳ"
              className="min-w-0"
              value={draft.periodId}
              onChange={(periodId) => setDraft((current) => ({ ...current, periodId }))}
              options={lookups.options.periods}
            />
            <FilterSelect
              label="Nhóm ca"
              allLabel="Tất cả nhóm ca"
              className="min-w-0"
              value={calendar.draftGroupOptions.some((option) => String(option.value) === draft.groupId) ? draft.groupId : ""}
              onChange={(groupId) => setDraft((current) => ({ ...current, groupId }))}
              options={calendar.draftGroupOptions}
            />
            <FilterSelect
              label="Trạng thái ca"
              allLabel="Tất cả trạng thái"
              className="min-w-0"
              value={draft.status}
              onChange={(status) => setDraft((current) => ({ ...current, status }))}
              options={STATUS_OPTIONS.shiftDate.map((status) => ({
                value: status,
                label: shiftDateStyle(status).label,
              }))}
            />
            <div className="flex min-w-0 items-end gap-2">
              <FilterSelect
                label="Nhân viên"
                allLabel="Tất cả nhân viên"
                className="min-w-0 flex-1"
                value={draft.employeeId}
                onChange={(employeeId) => setDraft((current) => ({ ...current, employeeId }))}
                options={calendar.employeeOptions}
              />
              <button type="button" onClick={calendar.search} disabled={loading} className="btn btn-primary btn-sm disabled:cursor-not-allowed disabled:opacity-50">
                <Search className="h-4 w-4" /> Tìm kiếm
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2 lg:ml-auto">
            <button
              type="button"
              onClick={calendar.resetFilters}
              disabled={!calendar.hasFilters && !calendar.hasDraft}
              className="btn btn-secondary btn-sm disabled:cursor-not-allowed disabled:opacity-50"
            >
              Bỏ lọc
            </button>
          </div>
        </div>
      </div>

      {view !== "list" && (
        <div className="flex flex-col justify-between gap-3 border-b border-slate-100 py-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => calendar.move(-1)}
              aria-label={view === "month" ? "Tháng trước" : "Tuần trước"}
              className="btn-icon border border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => calendar.move(1)}
              aria-label={view === "month" ? "Tháng sau" : "Tuần sau"}
              className="btn-icon border border-slate-200 text-slate-600 hover:bg-slate-50"
            >
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
              {stats.assigned}
              {stats.capacity > 0 ? `/${stats.capacity}` : ""} lượt phân bổ
            </span>
            {stats.pending > 0 && <span className="rounded-full bg-brand-50 px-2.5 py-1 font-bold text-brand-700">{stats.pending} chờ duyệt</span>}
            {stats.missing > 0 && <span className="rounded-full bg-rose-50 px-2.5 py-1 font-bold text-rose-700">{stats.missing} ca thiếu người</span>}
          </div>
        </div>
      )}

      {loading && shiftDates.length === 0 ? (
        <Spinner label="Đang tải lịch..." className="mt-4 h-64 rounded-xl border border-dashed border-slate-200" />
      ) : view === "list" ? (
        <ListView
          shifts={calendar.filtered}
          employeeId={filters.employeeId}
          storeName={lookups.maps.store.get(Number(storeId))?.storeName ?? ""}
          onOpen={openDetail}
        />
      ) : view === "month" ? (
        <MonthView
          days={calendar.days}
          month={calendar.cursor.getMonth()}
          shiftsOn={calendar.shiftsOn}
          eventsOn={calendar.eventsOn}
          highlight={calendar.highlight}
          onOpen={openDetail}
        />
      ) : (
        <WeekView
          days={calendar.days}
          shiftsOn={calendar.shiftsOn}
          eventsOn={calendar.eventsOn}
          highlight={calendar.highlight}
          onOpen={openDetail}
        />
      )}

      {view !== "list" && !loading && stats.total === 0 && (
        <p className="mt-3 text-center text-xs text-slate-400">
          Không có ca nào trong {view === "month" ? "tháng" : "tuần"} này
          {calendar.hasFilters ? " với bộ lọc hiện tại" : ""}.
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2 text-[10px] font-semibold text-slate-500">
        {/* Chú thích màu: mỗi nhóm ca một họ màu, Sáng nhạt → Trưa vừa → Tối đậm */}
        {legendGroups.map((group) => (
          <span key={group.id} className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-1.5 py-1">
            <span className="text-slate-600">{group.name}</span>
            {(["07:00", "12:00", "18:00"] as const).map((time, index) => (
              <span key={time} className={`rounded border px-1.5 py-0.5 ${lookups.groupColor(group.id, time)}`}>
                {DAY_PART_LABEL[(["morning", "noon", "evening"] as const)[index]]}
              </span>
            ))}
          </span>
        ))}
        <span className="rounded-md border border-dashed border-rose-300 bg-rose-50 px-2 py-1 text-rose-500">Ca chưa có nhân viên</span>
        <span className="rounded-md border border-slate-200 px-2 py-1 line-through">Ca đã hủy</span>
        <span className="rounded-md bg-rose-50 px-2 py-1 text-rose-600">★ Sự kiện đặc biệt</span>
        {calendar.highlight && <span className="rounded-md px-2 py-1 ring-2 ring-accent">Ca có nhân viên đang chọn</span>}
        <span className="ml-auto">
          {view === "month" ? "Số trên ca = nhân viên đã phân bổ / số người tối đa" : "Thanh ca: giờ bắt đầu – giờ kết thúc (tổng số giờ) · nhân viên đã phân bổ / tối đa — bấm vào để xem danh sách nhân viên"}
        </span>
      </div>
    </section>
  );
}
