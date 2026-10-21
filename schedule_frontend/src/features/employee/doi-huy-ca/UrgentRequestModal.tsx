"use client";

import React, { useMemo, useState } from "react";
import {
  ArrowLeftRight,
  CalendarPlus,
  CalendarX,
  Check,
  Info,
  Search,
  Send,
  UserRound,
} from "lucide-react";
import { Button, Field, Modal, Spinner, Textarea } from "@/components/ui";
import { employeeApi, type MyOpenShift, type StatShift } from "@/lib/api";
import { cn } from "@/lib/cn";
import { useKeyedLoad } from "@/features/statistics/useStatistics";
import { useNow } from "@/features/feedback/model";
import { isRegistered } from "../dang-ky-ca/model";
import {
  REQUEST_META,
  shiftLabel,
  startsAfter,
  useGroupShifts,
  useMyShifts,
  type ShiftRequestType,
} from "./model";

const TYPE_OPTIONS: {
  value: ShiftRequestType;
  icon: typeof CalendarPlus;
  hint: string;
}[] = [
  { value: "ADD", icon: CalendarPlus, hint: "Làm thêm ca của nhóm" },
  { value: "CHANGE", icon: ArrowLeftRight, hint: "Đổi người với ca khác" },
  { value: "CANCEL", icon: CalendarX, hint: "Bỏ ca đã được duyệt" },
];

const EMPTY_FILTERS = { from: "", to: "", store: "", q: "" };

const controlClass =
  "rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium outline-hidden";

interface UrgentRequestModalProps {
  open: boolean;
  initialType?: ShiftRequestType;
  /** Ca hiện tại chọn sẵn (Đổi / Hủy ca từ thẻ ca trên lịch) */
  initialAssignmentId?: number;
  onClose: () => void;
  onSent: () => void;
}

/**
 * Đặt lịch khẩn (Thêm / Đổi / Hủy ca) trên lịch làm việc đang dùng – popup chung, chọn loại thì các trường đổi theo.
 * - Chỉ ca thuộc kỳ đã kết thúc đăng ký và bắt đầu sau thời điểm hiện tại.
 * - Đổi ca: chọn ca muốn sang + nhân viên đang làm ca đó để đổi chỗ (giữ nguyên số lượng mỗi ca).
 * - Mỗi danh sách chọn ca / nhân viên có bộ lọc riêng.
 */
export default function UrgentRequestModal({
  open,
  initialType = "ADD",
  initialAssignmentId,
  onClose,
  onSent,
}: UrgentRequestModalProps) {
  if (!open) return null;
  return (
    <UrgentRequestForm
      initialType={initialType}
      initialAssignmentId={initialAssignmentId}
      onClose={onClose}
      onSent={onSent}
    />
  );
}

function UrgentRequestForm({
  initialType,
  initialAssignmentId,
  onClose,
  onSent,
}: Omit<UrgentRequestModalProps, "open"> & { initialType: ShiftRequestType }) {
  const [type, setType] = useState<ShiftRequestType>(initialType);
  const meta = REQUEST_META[type];
  const now = useNow();
  const { shifts: myShifts, loading: loadingMine } = useMyShifts();
  const { shifts: groupShifts, loading: loadingGroup } = useGroupShifts();
  const requests = useKeyedLoad(
    "urgent-requests",
    () => employeeApi.getEmergencyRequests(),
    "Không thể tải yêu cầu",
  );

  const [sourceFilters, setSourceFilters] = useState(EMPTY_FILTERS);
  const [targetFilters, setTargetFilters] = useState(EMPTY_FILTERS);
  const [memberQuery, setMemberQuery] = useState("");
  const [assignmentId, setAssignmentId] = useState<number | undefined>(
    initialAssignmentId,
  );
  const [targetId, setTargetId] = useState<number | undefined>();
  const [swapId, setSwapId] = useState<number | undefined>();
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const changeType = (next: ShiftRequestType) => {
    setType(next);
    setTargetId(undefined);
    setSwapId(undefined);
  };

  const pendingSources = useMemo(
    () =>
      new Set(
        (requests.data ?? [])
          .filter(
            (item) => String(item.status ?? "").toUpperCase() === "PENDING",
          )
          .map((item) => Number(item.assignmentId)),
      ),
    [requests.data],
  );

  // Ca hiện tại (Đổi / Hủy): ca đã duyệt trên lịch đang dùng, chưa bắt đầu, chưa có yêu cầu chờ duyệt
  const allSources = useMemo(
    () =>
      myShifts
        .filter(
          (shift) =>
            shift.scheduleReleased &&
            String(shift.assignmentStatus ?? "").toUpperCase() === "APPROVED" &&
            startsAfter(shift, now) &&
            !pendingSources.has(shift.assignmentId),
        )
        .sort(byStart),
    [myShifts, now, pendingSources],
  );
  const sources = useMemo(
    () => allSources.filter((shift) => matches(shift, sourceFilters)),
    [allSources, sourceFilters],
  );
  const source =
    type === "ADD"
      ? undefined
      : allSources.find((shift) => shift.assignmentId === assignmentId);

  // Ca đích (Thêm / Đổi): ca của nhóm mình trên lịch đang dùng, chưa bắt đầu, mình chưa có.
  // Đổi ca: cùng cửa hàng với ca hiện tại và phải có người để đổi.
  const allTargets = useMemo(
    () =>
      groupShifts
        .filter(
          (shift) =>
            shift.released &&
            startsAfter(shift, now) &&
            !isRegistered(shift) &&
            (type !== "CHANGE" ||
              (source &&
                shift.storeName === source.storeName &&
                shift.shiftByDateId !== source.shiftByDateId &&
                shift.members.length > 0)),
        )
        .sort(byStart),
    [groupShifts, now, type, source],
  );
  const targets = useMemo(
    () => allTargets.filter((shift) => matches(shift, targetFilters)),
    [allTargets, targetFilters],
  );
  const target =
    type === "CANCEL"
      ? undefined
      : allTargets.find((shift) => shift.shiftByDateId === targetId);

  // Đổi ca: nhân viên đang làm ca đích
  const members = useMemo(() => {
    const q = memberQuery.trim().toLowerCase();
    return (target?.members ?? []).filter(
      (member) =>
        !q ||
        `${member.fullName ?? ""} ${member.employeeCode ?? ""}`
          .toLowerCase()
          .includes(q),
    );
  }, [target, memberQuery]);
  const partner =
    type === "CHANGE"
      ? target?.members.find((member) => member.assignmentId === swapId)
      : undefined;

  const ready =
    Boolean(reason.trim()) &&
    (type === "ADD"
      ? Boolean(target)
      : type === "CANCEL"
        ? Boolean(source)
        : Boolean(source && target && partner));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!ready) return;
    setSubmitting(true);
    try {
      await employeeApi.createEmergencyRequest({
        requestType: type,
        assignmentId: source?.assignmentId,
        toAssignmentId: target?.shiftByDateId,
        swapAssignmentId: partner?.assignmentId,
        reason: reason.trim(),
      });
      onSent();
    } catch {
      // Lỗi đã được hiện bằng toast từ HTTP client
    } finally {
      setSubmitting(false);
    }
  };

  const loading = loadingMine || loadingGroup;
  const sourceStores = storesOf(allSources);
  const targetStores = storesOf(allTargets);

  return (
    <Modal
      open
      onClose={onClose}
      size="max-w-3xl"
      className="max-h-[92vh] overflow-y-auto"
      title={
        <span className="flex flex-col">
          <span className="text-[10px] font-bold uppercase tracking-wide text-brand-600">
            Đặt lịch khẩn · lịch đang dùng
          </span>
          <span>{meta.title}</span>
        </span>
      }
    >
      <form onSubmit={submit} className="space-y-4 text-xs">
        <div
          className="grid grid-cols-3 gap-2"
          role="tablist"
          aria-label="Loại yêu cầu"
        >
          {TYPE_OPTIONS.map(({ value, icon: Icon, hint }) => {
            const active = type === value;
            return (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => changeType(value)}
                className={cn(
                  "flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left transition",
                  active
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50",
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4 shrink-0",
                    active ? "text-brand-300" : "text-slate-400",
                  )}
                />
                <span>
                  <span className="block font-black">
                    {REQUEST_META[value].title}
                  </span>
                  <span
                    className={cn(
                      "block text-[10px]",
                      active ? "text-slate-300" : "text-slate-400",
                    )}
                  >
                    {hint}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
        <p className="text-slate-500">{meta.description}</p>

        {loading ? (
          <Spinner className="py-8" label="Đang tải ca..." />
        ) : (
          <>
            {type !== "ADD" && (
              <Field
                label={
                  <span>
                    Ca hiện tại của bạn <span className="text-rose-500">*</span>
                  </span>
                }
              >
                <ShiftFilters
                  value={sourceFilters}
                  onChange={setSourceFilters}
                  stores={sourceStores}
                />
                <ShiftPicker
                  items={sources.map((shift) => ({
                    id: shift.assignmentId,
                    label: shiftLabel(shift),
                  }))}
                  selected={source?.assignmentId}
                  onSelect={(id) => {
                    setAssignmentId(id);
                    setTargetId(undefined);
                    setSwapId(undefined);
                  }}
                  empty={
                    allSources.length
                      ? "Không có ca nào khớp bộ lọc."
                      : "Bạn không có ca đã duyệt nào sắp tới trên lịch đang dùng (hoặc ca đã có yêu cầu chờ duyệt)."
                  }
                />
              </Field>
            )}

            {type !== "CANCEL" && (
              <Field
                label={
                  <span>
                    {type === "ADD" ? "Ca muốn thêm" : "Ca muốn đổi sang"}{" "}
                    <span className="text-rose-500">*</span>
                  </span>
                }
              >
                {type === "CHANGE" && !source ? (
                  <EmptyHint>Chọn ca hiện tại trước.</EmptyHint>
                ) : (
                  <>
                    <ShiftFilters
                      value={targetFilters}
                      onChange={setTargetFilters}
                      stores={targetStores}
                    />
                    <ShiftPicker
                      items={targets.map((shift) => ({
                        id: shift.shiftByDateId,
                        label: shiftLabel(shift),
                        extra: `${shift.shiftGroupName ?? ""} · ${shift.registeredCount}${shift.maxCapacity ? `/${shift.maxCapacity}` : ""} NV`,
                      }))}
                      selected={target?.shiftByDateId}
                      onSelect={(id) => {
                        setTargetId(id);
                        setSwapId(undefined);
                      }}
                      empty={
                        allTargets.length
                          ? "Không có ca nào khớp bộ lọc."
                          : type === "CHANGE"
                            ? "Không có ca nào cùng cửa hàng có nhân viên để đổi."
                            : "Không có ca nào của nhóm bạn trên lịch đang dùng để thêm."
                      }
                    />
                  </>
                )}
              </Field>
            )}

            {type === "CHANGE" && target && (
              <Field
                label={
                  <span>
                    Nhân viên đổi ca cùng bạn{" "}
                    <span className="text-rose-500">*</span>
                  </span>
                }
              >
                <div className="relative mb-2">
                  <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                  <input
                    value={memberQuery}
                    onChange={(event) => setMemberQuery(event.target.value)}
                    placeholder="Lọc theo tên, mã nhân viên..."
                    className={cn(controlClass, "w-full pl-8")}
                  />
                </div>
                <ShiftPicker
                  icon={UserRound}
                  items={members.map((member) => ({
                    id: member.assignmentId,
                    label: member.fullName ?? `Nhân viên #${member.employeeId}`,
                    extra: member.employeeCode ?? undefined,
                  }))}
                  selected={swapId}
                  onSelect={setSwapId}
                  empty="Không có nhân viên nào khớp bộ lọc."
                />
                <p className="mt-1 text-[10px] text-slate-400">
                  Nhân viên được chọn sẽ sang ca hiện tại của bạn – số người mỗi
                  ca giữ nguyên.
                </p>
              </Field>
            )}

            <Field
              label={
                <span>
                  Lý do <span className="text-rose-500">*</span>
                </span>
              }
            >
              <Textarea
                rows={3}
                required
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder={
                  type === "ADD"
                    ? "Vì sao bạn muốn thêm ca này?"
                    : type === "CHANGE"
                      ? "Vì sao bạn cần đổi ca? (đã thỏa thuận với đồng nghiệp chưa?)"
                      : "Vì sao bạn không thể làm ca này?"
                }
                className="resize-y"
              />
            </Field>

            <div className="flex items-start gap-2.5 rounded-xl border border-brand-200/80 bg-brand-50/70 p-3 text-brand-900">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
              <p className="text-[11px] leading-relaxed">
                Chỉ áp dụng cho lịch đang dùng và ca sau thời điểm hiện tại. Khi
                quản lý duyệt, lịch được cập nhật ngay: {meta.applied}.
              </p>
            </div>
          </>
        )}

        <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
          <Button type="button" variant="ghost" onClick={onClose}>
            Đóng
          </Button>
          <Button type="submit" icon={Send} disabled={submitting || !ready}>
            {submitting ? "Đang gửi..." : meta.submit}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

// ------------------------------------------------------------------ Bộ lọc & danh sách chọn

type Filters = typeof EMPTY_FILTERS;

const byStart = (
  a: { workDate: string | null; startTime: string | null },
  b: { workDate: string | null; startTime: string | null },
) => `${a.workDate}${a.startTime}`.localeCompare(`${b.workDate}${b.startTime}`);

function matches(shift: StatShift | MyOpenShift, filters: Filters) {
  const day = shift.workDate ?? "";
  if (filters.from && day < filters.from) return false;
  if (filters.to && day > filters.to) return false;
  if (filters.store && shift.storeName !== filters.store) return false;
  const q = filters.q.trim().toLowerCase();
  if (!q) return true;
  const group = "shiftGroupName" in shift ? shift.shiftGroupName : "";
  return `${shift.shiftName ?? ""} ${group ?? ""} ${shift.startTime ?? ""}`
    .toLowerCase()
    .includes(q);
}

const storesOf = (shifts: { storeName: string | null }[]) =>
  [
    ...new Set(
      shifts.map((shift) => shift.storeName).filter((name): name is string => Boolean(name)),
    ),
  ].sort();

function ShiftFilters({
  value,
  onChange,
  stores,
}: {
  value: Filters;
  onChange: (next: Filters) => void;
  stores: string[];
}) {
  const set = (key: keyof Filters, next: string) =>
    onChange({ ...value, [key]: next });
  const hasFilter = Object.values(value).some(Boolean);
  return (
    <div className="mb-2 flex flex-wrap items-end gap-2">
      <label className="flex flex-col gap-1 text-[10px] font-semibold text-slate-500">
        Từ ngày
        <input
          type="date"
          value={value.from}
          max={value.to || undefined}
          onChange={(event) => set("from", event.target.value)}
          className={controlClass}
        />
      </label>
      <label className="flex flex-col gap-1 text-[10px] font-semibold text-slate-500">
        Đến ngày
        <input
          type="date"
          value={value.to}
          min={value.from || undefined}
          onChange={(event) => set("to", event.target.value)}
          className={controlClass}
        />
      </label>
      {stores.length > 1 && (
        <label className="flex flex-col gap-1 text-[10px] font-semibold text-slate-500">
          Cửa hàng
          <select
            value={value.store}
            onChange={(event) => set("store", event.target.value)}
            className={controlClass}
          >
            <option value="">Tất cả</option>
            {stores.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </label>
      )}
      <label className="flex flex-1 flex-col gap-1 text-[10px] font-semibold text-slate-500">
        Ca / nhóm / giờ
        <input
          value={value.q}
          onChange={(event) => set("q", event.target.value)}
          placeholder="VD: Ca sáng, 08:00..."
          className={cn(controlClass, "min-w-36")}
        />
      </label>
      {hasFilter && (
        <button
          type="button"
          onClick={() => onChange(EMPTY_FILTERS)}
          className="px-1 py-1.5 font-bold text-brand-700 hover:underline"
        >
          Xóa lọc
        </button>
      )}
    </div>
  );
}

function ShiftPicker({
  items,
  selected,
  onSelect,
  empty,
  icon: Icon,
}: {
  items: { id: number; label: string; extra?: string }[];
  selected: number | undefined;
  onSelect: (id: number) => void;
  empty: string;
  icon?: typeof UserRound;
}) {
  if (!items.length) return <EmptyHint>{empty}</EmptyHint>;
  return (
    <div
      role="listbox"
      className="max-h-48 space-y-1 overflow-y-auto rounded-xl border border-slate-200 p-1.5"
    >
      {items.map((item) => {
        const active = item.id === selected;
        return (
          <button
            key={item.id}
            type="button"
            role="option"
            aria-selected={active}
            onClick={() => onSelect(item.id)}
            className={cn(
              "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left transition",
              active
                ? "bg-brand-50 ring-1 ring-brand-300"
                : "hover:bg-slate-50",
            )}
          >
            <span
              className={cn(
                "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
                active
                  ? "border-brand-500 bg-brand-500 text-white"
                  : "border-slate-300",
              )}
            >
              {active && <Check className="h-3 w-3" />}
            </span>
            {Icon && <Icon className="h-3.5 w-3.5 shrink-0 text-slate-400" />}
            <span className="font-semibold text-slate-800">{item.label}</span>
            {item.extra && (
              <span className="ml-auto shrink-0 text-[10px] text-slate-400">
                {item.extra}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function EmptyHint({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-xl border border-dashed border-slate-200 px-3 py-2.5 font-medium text-slate-400">
      {children}
    </p>
  );
}
