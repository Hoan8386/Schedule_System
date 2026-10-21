import React, { useMemo, useState } from "react";
import { Download, Search } from "lucide-react";
import { Button, EmptyState } from "@/components/ui";
import type { ShiftAssignmentResponse, ShiftByDateResponse } from "@/lib/api";
import { dayKey, formatDate, fromDayKey, hhmm, localKey, relId, text, upper } from "@/lib/format";
import { cn } from "@/lib/cn";
import { downloadXlsx, type XlsxCell } from "@/lib/xlsx";
import { assignmentStyle, isActiveAssignment, shiftDateStyle, STATUS_OPTIONS, WEEKDAY_LONG } from "../../constants";
import { useSchedule } from "../../ScheduleContext";
import { shiftDateId } from "../../useScheduleLookups";

interface Props {
  /** Ca đã lọc theo bộ lọc chung của TKB (cửa hàng, kỳ, nhóm ca, trạng thái ca) */
  shifts: ShiftByDateResponse[];
  /** Nhân viên đang chọn ở bộ lọc chung (chế độ danh sách: lọc theo nhân viên) */
  employeeId: string;
  storeName: string;
  onOpen: (day: Date, items: ShiftByDateResponse[]) => void;
}

interface Row {
  key: string;
  shift: ShiftByDateResponse;
  assignment?: ShiftAssignmentResponse;
  date: string;
}

/** Trạng thái phân ca: "NONE" = ca chưa có nhân viên */
const ASSIGNMENT_FILTERS = [
  { value: "", label: "Tất cả" },
  { value: "ACTIVE", label: "Còn hiệu lực (chờ duyệt + đã duyệt)" },
  ...STATUS_OPTIONS.assignment.map((status) => ({ value: status, label: assignmentStyle(status).label })),
  { value: "NONE", label: "Ca chưa có nhân viên" },
];

const monthRange = () => {
  const now = new Date();
  return {
    from: localKey(new Date(now.getFullYear(), now.getMonth(), 1)),
    to: localKey(new Date(now.getFullYear(), now.getMonth() + 1, 0)),
  };
};

const controlClass = "rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium outline-hidden";

/**
 * Chế độ danh sách của thời khóa biểu: mỗi dòng là một nhân viên trong một ca (ca chưa có ai là một dòng trống).
 * Lọc theo khoảng thời gian + các bộ lọc; "Tải Excel" xuất đúng các dòng đang lọc.
 */
export function ListView({ shifts, employeeId, storeName, onOpen }: Props) {
  const { lookups } = useSchedule();
  const [range, setRange] = useState(monthRange);
  const [assignmentStatus, setAssignmentStatus] = useState("ACTIVE");
  const [search, setSearch] = useState("");

  const rows = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    const result: Row[] = [];
    shifts.forEach((shift) => {
      const date = dayKey(shift.workDate);
      if (!date || (range.from && date < range.from) || (range.to && date > range.to)) return;
      const all = lookups.allAssignmentsOf(shift);
      const entries: (ShiftAssignmentResponse | undefined)[] = all.length ? all : [undefined];
      entries.forEach((assignment) => {
        const status = assignment ? upper(assignment.status) : "NONE";
        if (assignmentStatus === "ACTIVE" && (!assignment || !isActiveAssignment(assignment))) return;
        if (assignmentStatus === "NONE" && lookups.activeAssignmentsOf(shift).length > 0) return;
        if (assignmentStatus && assignmentStatus !== "ACTIVE" && assignmentStatus !== "NONE" && status !== assignmentStatus) return;
        if (employeeId && (!assignment || relId(assignment, "employee") !== Number(employeeId))) return;
        if (keyword) {
          const employee = assignment ? lookups.maps.employee.get(relId(assignment, "employee")) : undefined;
          const haystack = [shift.shiftName, employee?.fullName, employee?.employeeCode, lookups.groupNameOf(lookups.groupIdOf(shift)), shift.managerNote, assignment?.note]
            .map((value) => String(value ?? "").toLowerCase())
            .join(" ");
          if (!haystack.includes(keyword)) return;
        }
        result.push({ key: `${shiftDateId(shift)}-${assignment ? Number(assignment.id ?? assignment.shiftAssignmentId ?? 0) : "none"}`, shift, assignment, date });
      });
    });
    return result.sort(
      (a, b) =>
        a.date.localeCompare(b.date) ||
        hhmm(a.shift.startTime).localeCompare(hhmm(b.shift.startTime)) ||
        String(a.shift.shiftName ?? "").localeCompare(String(b.shift.shiftName ?? ""))
    );
  }, [shifts, range, assignmentStatus, employeeId, search, lookups]);

  const describe = (row: Row) => {
    const employeeId = row.assignment ? relId(row.assignment, "employee") : 0;
    const employee = employeeId ? lookups.maps.employee.get(employeeId) : undefined;
    const day = fromDayKey(row.date);
    const cap = lookups.capacityOf(row.shift);
    const count = lookups.activeAssignmentsOf(row.shift).length;
    const period = lookups.maps.period.get(lookups.periodIdOf(row.shift));
    return {
      day,
      weekday: WEEKDAY_LONG[day.getDay()],
      employeeCode: text(employee?.employeeCode, ""),
      employeeName: employeeId ? lookups.employeeName(employeeId) : "",
      group: lookups.groupNameOf(lookups.groupIdOf(row.shift)),
      period: text(period?.periodName, ""),
      count,
      cap,
      assignmentLabel: row.assignment ? assignmentStyle(row.assignment.status).label : "Chưa có nhân viên",
      shiftLabel: shiftDateStyle(row.shift.status).label,
      payRate: row.shift.payRate != null ? Number(row.shift.payRate) : null,
    };
  };

  const exportExcel = () => {
    const header = [
      "Ngày", "Thứ", "Ca", "Bắt đầu", "Kết thúc", "Nhóm ca", "Cửa hàng", "Kỳ",
      "Mã NV", "Nhân viên", "Trạng thái phân ca", "Trạng thái ca", "Số NV / tối đa", "Đơn giá", "Ghi chú",
    ];
    const data: XlsxCell[][] = rows.map((row) => {
      const info = describe(row);
      return [
        formatDate(row.date), info.weekday, text(row.shift.shiftName, ""), hhmm(row.shift.startTime), hhmm(row.shift.endTime),
        info.group, storeName, info.period, info.employeeCode, info.employeeName, info.assignmentLabel, info.shiftLabel,
        `${info.count}${info.cap > 0 ? `/${info.cap}` : ""}`, info.payRate, text(row.assignment?.note ?? row.shift.managerNote, ""),
      ];
    });
    const slug = storeName.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/gi, "d").replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "");
    downloadXlsx(`danh-sach-ca_${slug || "cua-hang"}_${range.from || "dau"}_${range.to || "cuoi"}`, "Danh sách ca", header, data);
  };

  return (
    <div className="mt-4 space-y-3">
      <div className="flex flex-wrap items-end gap-2 text-xs">
        <label className="flex flex-col gap-1 text-[10px] font-semibold text-slate-500">
          Từ ngày
          <input type="date" value={range.from} max={range.to || undefined} onChange={(event) => setRange((current) => ({ ...current, from: event.target.value }))} className={controlClass} />
        </label>
        <label className="flex flex-col gap-1 text-[10px] font-semibold text-slate-500">
          Đến ngày
          <input type="date" value={range.to} min={range.from || undefined} onChange={(event) => setRange((current) => ({ ...current, to: event.target.value }))} className={controlClass} />
        </label>
        <label className="flex flex-col gap-1 text-[10px] font-semibold text-slate-500">
          Trạng thái phân ca
          <select value={assignmentStatus} onChange={(event) => setAssignmentStatus(event.target.value)} className={controlClass}>
            {ASSIGNMENT_FILTERS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-1 flex-col gap-1 text-[10px] font-semibold text-slate-500">
          Tìm kiếm
          <span className="relative">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Ca, nhân viên, mã NV, nhóm ca, ghi chú..." className={cn(controlClass, "w-full min-w-48 pl-8")} />
          </span>
        </label>
        <span className="pb-1.5 text-[11px] font-semibold text-slate-500">{rows.length} dòng</span>
        <Button icon={Download} onClick={exportExcel} disabled={rows.length === 0} title="Xuất đúng các dòng đang lọc ra file Excel">
          Tải Excel
        </Button>
      </div>

      <div className="max-h-[70vh] overflow-auto rounded-xl border border-slate-200">
        <table className="w-full text-left text-xs">
          <thead className="sticky top-0 bg-slate-50">
            <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-500">
              <th className="px-3 py-2.5">Ngày</th>
              <th className="px-3 py-2.5">Ca</th>
              <th className="px-3 py-2.5">Nhóm ca</th>
              <th className="px-3 py-2.5">Nhân viên</th>
              <th className="px-3 py-2.5">Phân ca</th>
              <th className="px-3 py-2.5">Trạng thái ca</th>
              <th className="px-3 py-2.5 text-right">NV / tối đa</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {rows.map((row) => {
              const info = describe(row);
              const shiftStyle = shiftDateStyle(row.shift.status);
              return (
                <tr key={row.key} onClick={() => onOpen(info.day, [row.shift])} className="cursor-pointer hover:bg-slate-50" title="Bấm để xem chi tiết ca">
                  <td className="whitespace-nowrap px-3 py-2">
                    <p className="font-semibold text-slate-800">{formatDate(row.date)}</p>
                    <p className="text-[10px] text-slate-400">{info.weekday}</p>
                  </td>
                  <td className="whitespace-nowrap px-3 py-2">
                    <p className="font-semibold text-slate-800">{text(row.shift.shiftName, `Ca #${shiftDateId(row.shift)}`)}</p>
                    <p className="text-[10px] text-slate-500">
                      {hhmm(row.shift.startTime)}–{hhmm(row.shift.endTime)}
                    </p>
                  </td>
                  <td className="px-3 py-2">
                    <span className={cn("rounded border px-1.5 py-0.5 text-[10px] font-semibold", lookups.colorOf(row.shift))}>{info.group || "—"}</span>
                  </td>
                  <td className="px-3 py-2">
                    {row.assignment ? (
                      <>
                        <p className="font-semibold text-slate-800">{info.employeeName}</p>
                        <p className="text-[10px] text-slate-400">{info.employeeCode}</p>
                      </>
                    ) : (
                      <span className="text-[11px] italic text-rose-500">Chưa có nhân viên</span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    {row.assignment && (
                      <span className={cn("rounded-md px-2 py-0.5 text-[10px] font-bold", assignmentStyle(row.assignment.status).badge)}>{info.assignmentLabel}</span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <span className={cn("rounded-md px-2 py-0.5 text-[10px] font-bold", shiftStyle.badge)}>{shiftStyle.label}</span>
                  </td>
                  <td className="px-3 py-2 text-right font-semibold">
                    {info.count}
                    {info.cap > 0 ? `/${info.cap}` : ""}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {rows.length === 0 && <EmptyState className="m-4">Không có ca nào trong khoảng thời gian / bộ lọc đã chọn.</EmptyState>}
      </div>
    </div>
  );
}
