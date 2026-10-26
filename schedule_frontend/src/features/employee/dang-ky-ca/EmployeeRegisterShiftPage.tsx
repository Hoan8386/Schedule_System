"use client";

import React, { useCallback, useMemo, useState } from "react";
import { CalendarClock, CalendarRange, ChevronDown, ChevronLeft, ChevronRight, Info, RefreshCw } from "lucide-react";
import { Alert, Button, Card, EmptyState, FullPageLoader, PageHeader, Spinner } from "@/components/ui";
import { employeeApi, type MyOpenShift, type RegistrationPeriod } from "@/lib/api";
import { formatDate, localKey, pad } from "@/lib/format";
import { cn } from "@/lib/cn";
import { useKeyedLoad } from "@/features/statistics/useStatistics";
import { formatHours, formatVnd } from "@/features/statistics/utils";
import { RegistrationPeriods } from "../RegistrationPeriods";
import { isRegistered, shiftHours } from "./model";
import { RegisterPeriodGrid, RegisterWeekGrid, cellFor, windowState, type TemplateRow } from "./RegisterTimetable";
import { RegisterShiftModal } from "./RegisterShiftModal";

type ViewMode = "period" | "week";

const addDays = (date: Date, days: number) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
const startOfWeek = (date: Date) => addDays(date, -((date.getDay() + 6) % 7));
const parseDay = (key: string) => new Date(`${key}T00:00:00`);

/** Khoảng ngày áp dụng của kỳ (ưu tiên ngày áp dụng lịch). */
const periodRange = (period: RegistrationPeriod) => ({
  from: period.effectiveStartDate ?? period.startDate ?? localKey(new Date()),
  to: period.effectiveEndDate ?? period.endDate ?? period.effectiveStartDate ?? period.startDate ?? localKey(new Date()),
});

/**
 * Đăng ký ca trên thời khóa biểu của kỳ: mỗi ô là ca mẫu của nhóm × ngày, bấm để đăng ký.
 * Thêm / Đổi / Hủy ca (Đặt lịch khẩn) chỉ áp dụng cho lịch đang dùng nên nằm ở trang Lịch làm việc.
 */
export default function EmployeeRegisterShiftPage() {
  const [version, setVersion] = useState(0);
  const [pickedPeriodId, setPickedPeriodId] = useState<number | null>(null);
  const [view, setView] = useState<ViewMode>("period");
  const [weekOffset, setWeekOffset] = useState(0);
  const [submittingKey, setSubmittingKey] = useState<string | null>(null);
  /** Ô đang mở popup đăng ký / hủy đăng ký */
  const [picked, setPicked] = useState<{ row: TemplateRow; dayKey: string } | null>(null);
  /** Ca theo ngày vừa đăng ký (ghi đè dữ liệu tải về cho tới lần tải lại) */
  const [updates, setUpdates] = useState<Record<string, MyOpenShift>>({});

  // 1) Nhóm ca + các kỳ đang mở
  const base = useKeyedLoad(`base|${version}`, () => employeeApi.getMyShiftGroups(), "Không thể tải nhóm ca");
  const periods = useMemo(() => base.data?.periods ?? [], [base.data]);
  const groups = useMemo(() => base.data?.groups ?? [], [base.data]);
  const period = periods.find((item) => item.periodId === pickedPeriodId) ?? periods[0] ?? null;
  const range = period ? periodRange(period) : null;

  // 2) Ca theo ngày (số người đã đăng ký) trong toàn bộ kỳ đang xem
  const shiftsLoad = useKeyedLoad(
    range ? `${range.from}|${range.to}|${version}` : null,
    () => employeeApi.getMyShiftGroups({ from: range?.from, to: range?.to }),
    "Không thể tải ca của kỳ"
  );

  const byKey = useMemo(() => {
    const map = new Map<string, MyOpenShift>();
    (shiftsLoad.data?.openShifts ?? []).forEach((item) => map.set(`${item.shiftId}|${item.workDate}`, item));
    Object.entries(updates).forEach(([key, item]) => map.set(key, item));
    return map;
  }, [shiftsLoad.data, updates]);

  const rows = useMemo<TemplateRow[]>(
    () => groups.flatMap((group) => group.shifts.map((shift) => ({ shift, group }))).sort((a, b) => (a.shift.startTime ?? "").localeCompare(b.shift.startTime ?? "")),
    [groups]
  );
  const windows = useMemo(() => new Map(groups.map((group) => [group.shiftGroupId, windowState(period, group)])), [groups, period]);

  const todayKey = localKey(new Date());
  const inPeriod = useCallback((dayKey: string) => Boolean(range && dayKey >= range.from && dayKey <= range.to), [range]);
  const cellOf = useCallback(
    (row: TemplateRow, dayKey: string) =>
      cellFor(row, dayKey, todayKey, inPeriod, windows.get(row.group.shiftGroupId) ?? { open: false, note: "" }, byKey),
    [todayKey, inPeriod, windows, byKey]
  );

  // Các ngày hiển thị: cả kỳ (đủ các tuần chứa kỳ) hoặc một tuần trong kỳ
  const periodStart = range ? parseDay(range.from) : new Date();
  const periodEnd = range ? parseDay(range.to) : new Date();
  const firstWeek = startOfWeek(periodStart);
  const weekCount = Math.floor((startOfWeek(periodEnd).getTime() - firstWeek.getTime()) / (7 * 86_400_000)) + 1;
  const safeOffset = Math.min(Math.max(weekOffset, 0), weekCount - 1);
  const days =
    view === "period"
      ? Array.from({ length: weekCount * 7 }, (_, index) => addDays(firstWeek, index))
      : Array.from({ length: 7 }, (_, index) => addDays(firstWeek, safeOffset * 7 + index));

  /** Xác nhận trong popup: đăng ký (chờ duyệt) hoặc hủy đăng ký đang chờ duyệt (xóa bản ghi). */
  const submit = async (row: TemplateRow, dayKey: string, action: "register" | "cancel") => {
    const key = `${row.shift.shiftId}|${dayKey}`;
    setSubmittingKey(key);
    try {
      const { data } =
        action === "cancel"
          ? await employeeApi.unregisterMyShift(row.shift.shiftId, dayKey)
          : await employeeApi.registerMyShift(row.shift.shiftId, dayKey);
      setUpdates((current) => ({ ...current, [key]: data }));
      setPicked(null);
    } catch {
      // Lỗi (hết chỗ, ngoài giờ đăng ký...) đã được hiện bằng toast từ HTTP client
    } finally {
      setSubmittingKey(null);
    }
  };

  const reload = () => {
    setUpdates({});
    setVersion((value) => value + 1);
  };

  if (!base.data && base.loading) return <FullPageLoader label="Đang tải kỳ đăng ký..." />;

  // Tổng hợp các ca đã đăng ký trong kỳ
  const mine = [...byKey.values()].filter((item) => isRegistered(item) && inPeriod(item.workDate));
  const minePending = mine.filter((item) => String(item.myAssignmentStatus).toUpperCase() === "PENDING").length;
  const mineHours = mine.reduce((sum, item) => sum + shiftHours(item.startTime, item.endTime), 0);
  const mineWage = mine.reduce((sum, item) => sum + shiftHours(item.startTime, item.endTime) * item.payRate, 0);
  const weekTitle = `${pad(days[0].getDate())}/${pad(days[0].getMonth() + 1)} – ${pad(days[6].getDate())}/${pad(days[6].getMonth() + 1)}/${days[6].getFullYear()}`;

  return (
    <div className="page">
      <PageHeader
        title="Đăng ký ca"
        subtitle="Chọn kỳ đăng ký, bấm vào ô ca để đăng ký hoặc hủy đăng ký. Đăng ký ở trạng thái chờ duyệt cho tới khi quản lý duyệt."
        actions={
          <Button variant="secondary" size="sm" onClick={reload} disabled={base.loading || shiftsLoad.loading}>
            <RefreshCw className={base.loading || shiftsLoad.loading ? "h-3.5 w-3.5 animate-spin" : "h-3.5 w-3.5"} />
            Làm mới
          </Button>
        }
      />

      {base.error && <Alert>{base.error}</Alert>}

      {base.data && groups.length === 0 ? (
        <Card className="p-4 sm:p-6">
          <EmptyState>Bạn chưa được gán vào nhóm ca nào. Vui lòng liên hệ trưởng cửa hàng hoặc quản lý.</EmptyState>
        </Card>
      ) : (
        base.data && (
          <>
            <Card className="p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <label className="text-[11px] font-semibold text-slate-600 sm:min-w-80">
                  <span className="flex items-center gap-1.5">
                    <CalendarClock className="h-3.5 w-3.5 text-brand-500" /> Kỳ đăng ký ca
                  </span>
                  <select
                    value={period?.periodId ?? ""}
                    onChange={(event) => {
                      setPickedPeriodId(Number(event.target.value));
                      setWeekOffset(0);
                    }}
                    disabled={periods.length === 0}
                    className="field-input font-medium"
                  >
                    {periods.length === 0 && <option value="">Chưa có kỳ đăng ký nào đang mở</option>}
                    {periods.map((item) => (
                      <option key={item.periodId} value={item.periodId}>
                        {item.periodName}
                      </option>
                    ))}
                  </select>
                </label>
                {period && range && (
                  <p className="pb-2 text-[11px] text-slate-500">
                    Áp dụng lịch {formatDate(range.from)} – {formatDate(range.to)} · {period.rounds.length} đợt đăng ký
                  </p>
                )}
              </div>
              {period && (
                <details className="group mt-3">
                  <summary className="flex cursor-pointer list-none items-center gap-1 text-[11px] font-bold text-brand-700 hover:underline">
                    <ChevronDown className="h-3.5 w-3.5 transition group-open:rotate-180" /> Xem đợt &amp; phiên đăng ký của kỳ
                  </summary>
                  <div className="mt-2">
                    <RegistrationPeriods periods={[period]} />
                  </div>
                </details>
              )}
            </Card>

            {period && range && (
              <section className="card p-4 sm:p-5">
                <div className="flex flex-col justify-between gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <CalendarRange className="h-5 w-5 text-brand-500" />
                      <h2 className="text-xl font-black tracking-tight text-slate-900">Thời khóa biểu đăng ký · {period.periodName}</h2>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      Các ngày trong kỳ {formatDate(range.from)} – {formatDate(range.to)}. Số trên ô = số người đã đăng ký / sức chứa.
                    </p>
                  </div>
                  <div className="flex items-center gap-1 rounded-xl border border-slate-200 p-1">
                    {(["period", "week"] as ViewMode[]).map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setView(option)}
                        className={cn(
                          "rounded-lg px-4 py-2 text-xs font-bold transition",
                          view === option ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-50"
                        )}
                      >
                        {option === "period" ? "Cả kỳ" : "Tuần"}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col justify-between gap-3 border-b border-slate-100 py-4 sm:flex-row sm:items-center">
                  <div className="flex items-center gap-2">
                    {view === "week" && (
                      <>
                        <button
                          type="button"
                          onClick={() => setWeekOffset(safeOffset - 1)}
                          disabled={safeOffset === 0}
                          aria-label="Tuần trước"
                          className="btn-icon border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setWeekOffset(safeOffset + 1)}
                          disabled={safeOffset >= weekCount - 1}
                          aria-label="Tuần sau"
                          className="btn-icon border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </>
                    )}
                    <h3 className="ml-1 text-base font-black text-slate-800">
                      {view === "week" ? `Tuần ${safeOffset + 1}/${weekCount} · ${weekTitle}` : `${formatDate(range.from)} – ${formatDate(range.to)}`}
                    </h3>
                    {shiftsLoad.loading && <Spinner />}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-[11px]">
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 font-bold text-emerald-700">Đã duyệt {mine.length - minePending} ca</span>
                    <span className="rounded-full bg-amber-50 px-2.5 py-1 font-bold text-amber-700">Chờ duyệt {minePending} ca</span>
                    <span className="rounded-full bg-blue-50 px-2.5 py-1 font-bold text-blue-700">{formatHours(mineHours)}</span>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 font-bold text-slate-700">Dự kiến {formatVnd(Math.round(mineWage))}</span>
                  </div>
                </div>

                {shiftsLoad.error && <Alert className="mt-4">{shiftsLoad.error}</Alert>}

                {rows.length === 0 ? (
                  <EmptyState className="mt-4">Nhóm ca của bạn chưa có ca mẫu nào.</EmptyState>
                ) : view === "period" ? (
                  <RegisterPeriodGrid
                    days={days}
                    rows={rows}
                    todayKey={todayKey}
                    inPeriod={inPeriod}
                    cellOf={cellOf}
                    submittingKey={submittingKey}
                    onRegister={(row, dayKey) => setPicked({ row, dayKey })}
                  />
                ) : (
                  <RegisterWeekGrid
                    days={days}
                    rows={rows}
                    todayKey={todayKey}
                    inPeriod={inPeriod}
                    cellOf={cellOf}
                    submittingKey={submittingKey}
                    onRegister={(row, dayKey) => setPicked({ row, dayKey })}
                  />
                )}

                <div className="mt-4 flex flex-wrap items-center gap-2 text-[10px] font-semibold text-slate-500">
                  <span className="rounded-md border border-brand-200 bg-white px-2 py-1 text-slate-700">Còn chỗ</span>
                  <span className="rounded-md border border-amber-300 bg-amber-50 px-2 py-1 text-amber-800">⏳ Chờ duyệt</span>
                  <span className="rounded-md border border-emerald-300 bg-emerald-50 px-2 py-1 text-emerald-800">✓ Quản lý đã duyệt</span>
                  <span className="rounded-md border border-slate-200 bg-slate-100 px-2 py-1 text-slate-400">Hết chỗ / đã đóng</span>
                  <span className="rounded-md border border-dashed border-slate-200 bg-white px-2 py-1 text-slate-400">Chưa tới / hết giờ đăng ký</span>
                  <span className="ml-auto">Bấm vào ô để đăng ký hoặc hủy đăng ký</span>
                </div>
              </section>
            )}
          </>
        )
      )}

      {picked && (
        <RegisterShiftModal
          row={picked.row}
          dayKey={picked.dayKey}
          cell={cellOf(picked.row, picked.dayKey)}
          submitting={submittingKey === `${picked.row.shift.shiftId}|${picked.dayKey}`}
          onClose={() => setPicked(null)}
          onRegister={() => void submit(picked.row, picked.dayKey, "register")}
          onCancel={() => void submit(picked.row, picked.dayKey, "cancel")}
        />
      )}

      <div className="flex items-center gap-3 rounded-2xl border border-brand-200/80 bg-brand-50/60 p-4 text-xs text-brand-900">
        <Info className="h-4 w-4 shrink-0 text-brand-600" />
        <p>
          Chỉ đăng ký được ca thuộc nhóm ca của bạn, trong thời gian mở của đợt / phiên đăng ký và khi ca còn chỗ. Trong thời gian đăng ký, bạn có
          thể bỏ đăng ký bất kỳ lúc nào (kể cả ca đã duyệt) – đăng ký bị xóa luôn, không cần duyệt. Hết thời gian đăng ký, muốn thêm / đổi / hủy ca
          thì chọn loại tương ứng ở đầu trang để gửi yêu cầu cho quản lý.
        </p>
      </div>
    </div>
  );
}
