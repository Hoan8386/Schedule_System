import React, { useMemo, useState } from "react";
import { Check, CheckCheck } from "lucide-react";
import { Modal } from "@/components/ui";
import {
  managerApi,
  type ShiftAssignmentResponse,
  type ShiftByDateResponse,
} from "@/lib/api";
import { notify } from "@/lib/toast";
import {
  dayKey,
  formatDate,
  formatDateTime,
  relId,
  text,
  timeRange,
  upper,
} from "@/lib/format";
import { assignmentStyle } from "../../constants";
import { useSchedule } from "../../ScheduleContext";
import { assignmentId, shiftDateId } from "../../useScheduleLookups";
import { FilterSelect } from "../../components/FilterSelect";

/** Loại yêu cầu: đăng ký ca (từ phân ca) và 3 loại yêu cầu khẩn. */
const REQUEST_TYPES = {
  REGISTER: { label: "Đăng ký ca", badge: "bg-blue-100 text-blue-700" },
  ADD: { label: "Thêm ca", badge: "bg-emerald-100 text-emerald-700" },
  CANCEL: { label: "Hủy ca", badge: "bg-rose-100 text-rose-700" },
  CHANGE: { label: "Đổi ca", badge: "bg-violet-100 text-violet-700" },
} as const;
type RequestType = keyof typeof REQUEST_TYPES;

interface RequestRow {
  key: string;
  /** Bảng gốc của yêu cầu: phân ca (đăng ký ca) hoặc yêu cầu khẩn */
  source: "assignment" | "emergency";
  id: number;
  type: RequestType;
  employeeId: number;
  employeeName: string;
  employeeCode: string;
  shift?: ShiftByDateResponse;
  /** Ca đích của yêu cầu đổi ca */
  targetShift?: ShiftByDateResponse;
  shiftCode: string;
  workDate: string;
  status: string;
  sentAt: string;
  reason: string;
}

const EMPTY_FILTERS = {
  employee: "",
  shiftCode: "",
  workFrom: "",
  workTo: "",
  type: "",
  status: "",
  sentFrom: "",
  sentTo: "",
};
const PAGE_SIZE = 50;

interface Props {
  /** Kỳ đang chọn trên thời khóa biểu ("" = mọi kỳ) */
  periodId: string;
  /** Cửa hàng đang xem trên thời khóa biểu */
  storeId: string;
  onClose: () => void;
}

/**
 * Modal danh sách yêu cầu đăng ký ca và yêu cầu khẩn (thêm / hủy / đổi ca), lọc được theo từng cột,
 * duyệt theo dòng đã chọn hoặc duyệt hàng loạt theo loại yêu cầu.
 * Cửa hàng và kỳ lấy theo bộ lọc của thời khóa biểu, không chọn lại trong modal.
 */
export function RequestList({ periodId, storeId, onClose }: Props) {
  const {
    assignments,
    emergencyRequests,
    shiftDates,
    lookups,
    openShiftDetail,
    reload,
  } = useSchedule();
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [bulkType, setBulkType] = useState<RequestType>("REGISTER");
  const [approving, setApproving] = useState(false);
  const setFilter = (key: keyof typeof EMPTY_FILTERS, value: string) => {
    setFilters((current) => ({ ...current, [key]: value }));
    setPage(1);
  };

  const rows = useMemo<RequestRow[]>(() => {
    // Chỉ các ca thuộc kỳ + cửa hàng đang chọn
    const inScope = (item: ShiftByDateResponse) =>
      lookups.storeIdOf(item) === Number(storeId) &&
      (!periodId || lookups.periodIdOf(item) === Number(periodId));
    const shiftDateById = new Map(
      shiftDates.filter(inScope).map((item) => [shiftDateId(item), item]),
    );
    const assignmentById = new Map(
      assignments.map((item) => [assignmentId(item), item]),
    );
    const shiftOfAssignment = (id: unknown) => {
      const assignment = assignmentById.get(Number(id ?? 0));
      return assignment
        ? shiftDateById.get(relId(assignment, "shiftByDate"))
        : undefined;
    };
    const employeeOf = (id: number) => ({
      employeeId: id,
      employeeName: lookups.employeeName(id),
      employeeCode: text(lookups.maps.employee.get(id)?.employeeCode, ""),
    });
    const shiftInfo = (shift?: ShiftByDateResponse) => ({
      shift,
      shiftCode: text(shift ? lookups.templateOf(shift)?.shiftCode : "", ""),
      workDate: shift ? dayKey(shift.workDate) : "",
    });

    const registrations = assignments
      .map((assignment: ShiftAssignmentResponse): RequestRow | null => {
        const shift = shiftDateById.get(relId(assignment, "shiftByDate"));
        if (!shift) return null;
        return {
          key: `a-${assignmentId(assignment)}`,
          source: "assignment",
          id: assignmentId(assignment),
          type: "REGISTER",
          ...employeeOf(relId(assignment, "employee")),
          ...shiftInfo(shift),
          status: upper(assignment.status),
          sentAt: String(assignment.registeredAt ?? ""),
          reason: text(assignment.note, ""),
        };
      })
      .filter((row): row is RequestRow => row !== null);

    const emergencies = emergencyRequests.flatMap((request): RequestRow[] => {
      const record = request as Record<string, unknown>;
      const type = upper(request.requestType);
      // from_shift_assignment_id / to_assignment_id trỏ tới ca theo ngày (khóa ngoại shift_by_date)
      const targetShift = record.toAssignmentId
        ? shiftDateById.get(Number(record.toAssignmentId))
        : undefined;
      const shift =
        shiftOfAssignment(record.assignmentId ?? request.sourceAssignmentId) ??
        (record.fromShiftAssignmentId
          ? shiftDateById.get(Number(record.fromShiftAssignmentId))
          : undefined) ??
        (type === "ADD" ? targetShift : undefined);
      // Không xác định được ca (hoặc ca ngoài kỳ / cửa hàng đang chọn) thì bỏ qua
      if (!shift) return [];
      return [
        {
          key: `e-${Number(request.id ?? request.emergencyRequestId ?? 0)}`,
          source: "emergency",
          id: Number(request.id ?? request.emergencyRequestId ?? 0),
          type:
            type in REQUEST_TYPES && type !== "REGISTER"
              ? (type as RequestType)
              : "ADD",
          ...employeeOf(Number(request.employeeId ?? 0)),
          ...shiftInfo(shift),
          targetShift: type === "CHANGE" ? targetShift : undefined,
          status: upper(request.status),
          sentAt: String(record.requestedAt ?? request.createdAt ?? ""),
          reason: text(request.reason, ""),
        },
      ];
    });

    // Mới gửi trước
    return [...registrations, ...emergencies].sort((a, b) =>
      b.sentAt.localeCompare(a.sentAt),
    );
  }, [assignments, emergencyRequests, shiftDates, lookups, periodId, storeId]);

  const filtered = useMemo(() => {
    const q = filters.employee.trim().toLowerCase();
    return rows.filter((row) => {
      if (
        q &&
        !`${row.employeeName} ${row.employeeCode}`.toLowerCase().includes(q)
      )
        return false;
      if (filters.shiftCode && row.shiftCode !== filters.shiftCode)
        return false;
      if (
        filters.workFrom &&
        (!row.workDate || row.workDate < filters.workFrom)
      )
        return false;
      if (filters.workTo && (!row.workDate || row.workDate > filters.workTo))
        return false;
      if (filters.type && row.type !== filters.type) return false;
      if (filters.status && row.status !== filters.status) return false;
      const sent = dayKey(row.sentAt);
      if (filters.sentFrom && (!sent || sent < filters.sentFrom)) return false;
      if (filters.sentTo && (!sent || sent > filters.sentTo)) return false;
      return true;
    });
  }, [rows, filters]);

  const shiftCodeOptions = Array.from(
    new Set(rows.map((row) => row.shiftCode).filter(Boolean)),
  )
    .sort()
    .map((code) => ({ value: code, label: code }));
  const statusOptions = Array.from(
    new Set(rows.map((row) => row.status).filter(Boolean)),
  )
    .sort()
    .map((status) => ({ value: status, label: assignmentStyle(status).label }));
  const typeOptions = (Object.keys(REQUEST_TYPES) as RequestType[]).map(
    (type) => ({ value: type, label: REQUEST_TYPES[type].label }),
  );

  const visible = filtered.slice(0, page * PAGE_SIZE);

  // Chỉ yêu cầu đang chờ duyệt mới chọn / duyệt được
  const isPending = (row: RequestRow) => row.status === "PENDING";
  const pendingFiltered = filtered.filter(isPending);
  const selectedRows = pendingFiltered.filter((row) => selected.has(row.key));
  const allSelected =
    pendingFiltered.length > 0 &&
    selectedRows.length === pendingFiltered.length;
  const bulkRows = pendingFiltered.filter((row) => row.type === bulkType);
  const toggle = (key: string) =>
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  const toggleAll = () =>
    setSelected(
      allSelected ? new Set() : new Set(pendingFiltered.map((row) => row.key)),
    );

  const approve = async (targets: RequestRow[]) => {
    if (targets.length === 0) return;
    setApproving(true);
    try {
      const idsOf = (source: RequestRow["source"]) =>
        targets.filter((row) => row.source === source).map((row) => row.id);
      const assignmentIds = idsOf("assignment");
      const emergencyIds = idsOf("emergency");
      const [assignmentResult, emergencyResult] = await Promise.all([
        assignmentIds.length
          ? managerApi.approveShiftAssignments(assignmentIds)
          : null,
        emergencyIds.length
          ? managerApi.approveEmergencyRequests(emergencyIds)
          : null,
      ]);
      const approved =
        Number(assignmentResult?.data?.approved ?? 0) +
        Number(emergencyResult?.data?.approved ?? 0);
      notify.success(`Đã duyệt ${approved} yêu cầu`);
      setSelected(new Set());
      await reload();
    } catch (cause) {
      notify.error(
        cause instanceof Error ? cause.message : "Không thể duyệt yêu cầu",
      );
    } finally {
      setApproving(false);
    }
  };

  const approveByType = () => {
    const label = REQUEST_TYPES[bulkType].label.toLowerCase();
    if (
      window.confirm(
        `Duyệt tất cả ${bulkRows.length} yêu cầu "${label}" đang chờ duyệt trong danh sách?`,
      )
    )
      void approve(bulkRows);
  };
  const hasFilters = Object.values(filters).some(Boolean);
  const dateInput = (
    label: string,
    from: keyof typeof EMPTY_FILTERS,
    to: keyof typeof EMPTY_FILTERS,
  ) => (
    <div className="text-[11px] font-semibold text-slate-600">
      {label}
      <div className="flex items-center gap-1">
        <input
          type="date"
          value={filters[from]}
          onChange={(event) => setFilter(from, event.target.value)}
          className="field-input min-w-0 font-medium"
          aria-label={`${label} từ`}
        />
        <span className="text-slate-400">–</span>
        <input
          type="date"
          value={filters[to]}
          onChange={(event) => setFilter(to, event.target.value)}
          className="field-input min-w-0 font-medium"
          aria-label={`${label} đến`}
        />
      </div>
    </div>
  );

  return (
    <Modal
      open
      title="Danh sách yêu cầu đăng ký"
      onClose={onClose}
      size="max-w-6xl"
    >
      <div className="flex flex-col gap-4 border-b border-slate-100 pb-4">
        <div className="flex flex-wrap items-center gap-2 text-[11px]">
          <span className="rounded-full bg-brand-100 px-2.5 py-1 font-bold text-brand-800">
            {text(
              lookups.maps.store.get(Number(storeId))?.storeName,
              `Cửa hàng #${storeId}`,
            )}
          </span>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 font-bold text-slate-700">
            {periodId
              ? text(
                  lookups.maps.period.get(Number(periodId))?.periodName,
                  `Kỳ #${periodId}`,
                )
              : "Tất cả kỳ"}
          </span>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 font-bold text-slate-700">
            {filtered.length} yêu cầu
          </span>
          <span className="rounded-full bg-brand-50 px-2.5 py-1 font-bold text-brand-700">
            {filtered.filter((row) => row.status === "PENDING").length} chờ
            duyệt
          </span>
          <span className="text-slate-400">
            Bấm một dòng để mở chi tiết ca.
          </span>
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
          <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <label className="text-[11px] font-semibold text-slate-600">
              Nhân viên
              <input
                value={filters.employee}
                onChange={(event) => setFilter("employee", event.target.value)}
                placeholder="Tên hoặc mã nhân viên"
                className="field-input font-medium"
              />
            </label>
            <FilterSelect
              label="Mã ca"
              allLabel="Tất cả mã ca"
              className="min-w-0"
              value={filters.shiftCode}
              onChange={(value) => setFilter("shiftCode", value)}
              options={shiftCodeOptions}
            />
            {dateInput("Ngày làm", "workFrom", "workTo")}
            <FilterSelect
              label="Loại yêu cầu"
              allLabel="Tất cả loại"
              className="min-w-0"
              value={filters.type}
              onChange={(value) => setFilter("type", value)}
              options={typeOptions}
            />
            <FilterSelect
              label="Trạng thái"
              allLabel="Tất cả trạng thái"
              className="min-w-0"
              value={filters.status}
              onChange={(value) => setFilter("status", value)}
              options={statusOptions}
            />
            {dateInput("Ngày gửi yêu cầu", "sentFrom", "sentTo")}
          </div>
          <button
            type="button"
            onClick={() => {
              setFilters(EMPTY_FILTERS);
              setPage(1);
            }}
            disabled={!hasFilters}
            className="btn btn-secondary btn-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            Bỏ lọc
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-slate-50/60 p-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-slate-600">
            Đã chọn {selectedRows.length} yêu cầu
          </span>
          <button
            type="button"
            onClick={() => void approve(selectedRows)}
            disabled={approving || selectedRows.length === 0}
            className="btn btn-primary btn-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Check className="h-4 w-4" /> Duyệt
            {selectedRows.length ? ` (${selectedRows.length})` : ""}
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold text-slate-600">
            Duyệt hàng loạt
          </span>
          <select
            value={bulkType}
            onChange={(event) => setBulkType(event.target.value as RequestType)}
            className="field-input mt-0 w-auto py-1.5 text-xs font-medium"
            aria-label="Loại yêu cầu duyệt hàng loạt"
          >
            {typeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label} (
                {
                  pendingFiltered.filter((row) => row.type === option.value)
                    .length
                }
                )
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={approveByType}
            disabled={approving || bulkRows.length === 0}
            className="btn btn-secondary btn-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            <CheckCheck className="h-4 w-4" />{" "}
            {approving ? "Đang duyệt..." : `Duyệt tất cả (${bulkRows.length})`}
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full min-w-200 text-left text-xs">
          <thead className="bg-slate-50 text-[11px] font-bold text-slate-500">
            <tr>
              <th className="w-10 px-3 py-2">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  disabled={pendingFiltered.length === 0}
                  aria-label="Chọn tất cả yêu cầu chờ duyệt"
                  className="h-4 w-4 cursor-pointer accent-brand-500"
                />
              </th>
              <th className="px-3 py-2">Nhân viên</th>
              <th className="px-3 py-2">Mã ca</th>
              <th className="px-3 py-2">Thời gian ca</th>
              <th className="px-3 py-2">Loại yêu cầu</th>
              <th className="px-3 py-2">Trạng thái</th>
              <th className="px-3 py-2">Gửi lúc</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {visible.map((row) => {
              const type = REQUEST_TYPES[row.type];
              const status = assignmentStyle(row.status);
              // Drawer chi tiết ca nằm dưới modal nên đóng modal trước khi mở
              const open = row.shift
                ? () => {
                    onClose();
                    openShiftDetail(row.workDate, [
                      shiftDateId(row.shift as ShiftByDateResponse),
                    ]);
                  }
                : undefined;
              return (
                <tr
                  key={row.key}
                  onClick={open}
                  className={`${open ? "cursor-pointer hover:bg-brand-50/50" : ""} ${selected.has(row.key) && isPending(row) ? "bg-brand-50/60" : ""}`}
                  title={row.reason || undefined}
                >
                  <td
                    className="px-3 py-2"
                    onClick={(event) => event.stopPropagation()}
                  >
                    {isPending(row) && (
                      <input
                        type="checkbox"
                        checked={selected.has(row.key)}
                        onChange={() => toggle(row.key)}
                        aria-label={`Chọn yêu cầu của ${row.employeeName}`}
                        className="h-4 w-4 cursor-pointer accent-brand-500"
                      />
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <p className="font-bold text-slate-800">
                      {row.employeeName}
                    </p>
                    {row.employeeCode && (
                      <p className="text-[10px] text-slate-400">
                        {row.employeeCode}
                      </p>
                    )}
                  </td>
                  <td className="px-3 py-2 font-semibold text-slate-700">
                    {text(row.shiftCode)}
                    {row.shift && (
                      <p className="text-[10px] font-normal text-slate-400">
                        {text(row.shift.shiftName, "")}
                      </p>
                    )}
                  </td>
                  <td className="px-3 py-2 text-slate-600">
                    {row.shift ? (
                      <>
                        <p className="font-semibold">
                          {formatDate(row.shift.workDate)}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          {timeRange(row.shift.startTime, row.shift.endTime)}
                        </p>
                      </>
                    ) : (
                      "—"
                    )}
                    {row.targetShift && (
                      <p className="mt-0.5 text-[10px] font-semibold text-violet-700">
                        → {formatDate(row.targetShift.workDate)} ·{" "}
                        {timeRange(
                          row.targetShift.startTime,
                          row.targetShift.endTime,
                        )}
                      </p>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${type.badge}`}
                    >
                      {type.label}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${status.badge}`}
                    >
                      {status.label}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-slate-500">
                    {row.sentAt ? formatDateTime(row.sentAt) : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="py-8 text-center text-xs text-slate-400">
            {hasFilters
              ? "Không có yêu cầu nào khớp bộ lọc."
              : "Chưa có yêu cầu nào."}
          </p>
        )}
      </div>

      {filtered.length > visible.length && (
        <button
          type="button"
          onClick={() => setPage((current) => current + 1)}
          className="mt-3 w-full rounded-xl py-2 text-xs font-bold text-brand-700 hover:bg-brand-50"
        >
          Xem thêm ({filtered.length - visible.length} yêu cầu)
        </button>
      )}
    </Modal>
  );
}
