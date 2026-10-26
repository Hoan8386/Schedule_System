"use client";

import React, { useState } from "react";
import { ArrowRightLeft, Crown, Trash2, UserPlus, Users } from "lucide-react";
import { SearchSelect, useConfirm } from "@/components/ui";
import type { EmployeeResponse, EmployeeStoreResponse, StoreResponse, StoreStaffRequest } from "@/lib/api";
import { POSITION_OPTIONS, positionName } from "@/features/management/nhan-su/utils";

const isActive = (status: unknown) => !status || String(status).toUpperCase() === "ACTIVE";
const text = (value: unknown, fallback = "Chưa cập nhật") =>
  value === null || value === undefined || String(value).trim() === "" ? fallback : String(value);

interface StaffRow {
  employeeId: number;
  position: string;
  /** Vị trí trước khi sửa (rỗng nếu mới thêm) */
  originalPosition: string;
  isNew: boolean;
}

interface Removal {
  employeeId: number;
  transferToStoreId: number | null;
}

/** Nháp nhân sự của cửa hàng – áp dụng khi lưu cửa hàng. */
export interface StaffDraft {
  managerId: number | null;
  initialManagerId: number | null;
  rows: StaffRow[];
  removals: Removal[];
}

export function initialStaffDraft(storeId: number | null, assignments: EmployeeStoreResponse[], employees: EmployeeResponse[], managerId: number | null): StaffDraft {
  const ids = storeId
    ? [...new Set(assignments.filter((item) => item.storeId === storeId && isActive(item.status)).map((item) => item.employeeId))]
    : [];
  const positionOf = (id: number) => employees.find((employee) => employee.id === id)?.position ?? "EMPLOYEE";
  return {
    managerId,
    initialManagerId: managerId,
    rows: ids.map((employeeId) => ({ employeeId, position: positionOf(employeeId), originalPosition: positionOf(employeeId), isNew: false })),
    removals: [],
  };
}

/** Thay đổi cần gửi lên backend (null nếu không có gì thay đổi). */
export function staffRequestOf(draft: StaffDraft): StoreStaffRequest | null {
  const members = draft.rows
    .filter((row) => row.isNew || row.position !== row.originalPosition)
    .map((row) => ({ employeeId: row.employeeId, position: row.position }));
  const managerChanged = draft.managerId !== draft.initialManagerId;
  if (members.length === 0 && draft.removals.length === 0 && !managerChanged) return null;
  return {
    managerEmployeeId: managerChanged ? draft.managerId ?? 0 : null,
    members,
    removals: draft.removals,
  };
}

interface Props {
  storeId: number | null;
  storeName: string;
  draft: StaffDraft;
  onChange: (draft: StaffDraft) => void;
  employees: EmployeeResponse[];
  assignments: EmployeeStoreResponse[];
  stores: StoreResponse[];
}

/** Chọn trưởng cửa hàng và phân bổ nhân viên (thêm, xóa, chuyển cửa hàng, đổi vị trí) – mỗi thao tác đều có popup xác nhận. */
export function StoreStaffEditor({ storeId, storeName, draft, onChange, employees, assignments, stores }: Props) {
  const { confirm, dialog } = useConfirm();
  const [addId, setAddId] = useState("");
  const [addPosition, setAddPosition] = useState("EMPLOYEE");

  const employeeOf = (id: number) => employees.find((employee) => employee.id === id);
  const nameOf = (id: number | null) => (id ? text(employeeOf(id)?.fullName, `Nhân viên #${id}`) : "");
  const storeNameOf = (id: number) => text(stores.find((store) => store.id === id)?.storeName, `Cửa hàng #${id}`);
  /** Cửa hàng khác mà nhân viên đang làm (không tính cửa hàng này) */
  const otherStores = (employeeId: number) => [
    ...new Set(assignments.filter((item) => item.employeeId === employeeId && item.storeId !== storeId && isActive(item.status)).map((item) => item.storeId)),
  ];
  const storeLabel = storeName.trim() || "cửa hàng này";

  const withRow = (current: StaffDraft, employeeId: number, position: string): StaffDraft => {
    const existing = current.rows.find((row) => row.employeeId === employeeId);
    const removals = current.removals.filter((removal) => removal.employeeId !== employeeId);
    if (existing) {
      return { ...current, removals, rows: current.rows.map((row) => (row.employeeId === employeeId ? { ...row, position } : row)) };
    }
    const original = employeeOf(employeeId)?.position ?? "";
    // Nhân viên vừa bị bỏ rồi thêm lại: không còn là "mới"
    const wasMember = assignments.some((item) => item.employeeId === employeeId && item.storeId === storeId && isActive(item.status));
    return { ...current, removals, rows: [...current.rows, { employeeId, position, originalPosition: original, isNew: !wasMember }] };
  };

  // ---------------------------------------------------------------- Trưởng cửa hàng

  const changeManager = async (value: string) => {
    const nextId = value ? Number(value) : null;
    if (nextId === draft.managerId) return;
    const current = nameOf(draft.managerId);
    if (nextId === null) {
      const ok = await confirm({
        tone: "danger",
        title: "Bỏ trống trưởng cửa hàng",
        message: <>Bỏ <b>{current}</b> khỏi vị trí phụ trách {storeLabel}? Nhân viên vẫn làm tại cửa hàng với vị trí hiện tại.</>,
        confirmLabel: "Bỏ trống",
      });
      if (ok) onChange({ ...draft, managerId: null });
      return;
    }
    const next = employeeOf(nextId);
    const ok = await confirm({
      title: current ? "Xác nhận đổi trưởng cửa hàng" : "Xác nhận thêm trưởng cửa hàng",
      message: (
        <>
          {current ? (
            <>Đổi trưởng cửa hàng của {storeLabel} từ <b>{current}</b> sang <b>{nameOf(nextId)}</b>?</>
          ) : (
            <>Giao <b>{nameOf(nextId)}</b> làm trưởng cửa hàng của {storeLabel}?</>
          )}
          {next?.position !== "STORE_MANAGER" && <> Vị trí của {nameOf(nextId)} sẽ chuyển sang <b>Trưởng cửa hàng</b> (quyền tài khoản đổi theo).</>}
          {!draft.rows.some((row) => row.employeeId === nextId) && <> Nhân viên sẽ được thêm vào cửa hàng.</>}
        </>
      ),
    });
    if (!ok) return;
    onChange({ ...withRow(draft, nextId, "STORE_MANAGER"), managerId: nextId });
  };

  // ---------------------------------------------------------------- Thêm / đổi vị trí / chuyển / xóa

  const addEmployee = async () => {
    const employeeId = Number(addId);
    if (!employeeId) return;
    const employee = employeeOf(employeeId);
    const ok = await confirm({
      title: "Xác nhận thêm nhân viên",
      message: (
        <>
          Thêm <b>{nameOf(employeeId)}</b> vào {storeLabel} với vị trí <b>{positionName(addPosition)}</b>?
          {employee?.position && employee.position !== addPosition && <> Vị trí hiện tại ({positionName(employee.position)}) sẽ đổi theo.</>}
          {String(employee?.status ?? "").toUpperCase() === "INACTIVE" && <> Nhân viên đang <b>tạm nghỉ</b> sẽ chuyển sang <b>đang làm việc</b>.</>}
        </>
      ),
    });
    if (!ok) return;
    onChange(withRow(draft, employeeId, addPosition));
    setAddId("");
    setAddPosition("EMPLOYEE");
  };

  const changePosition = async (row: StaffRow, position: string) => {
    if (position === row.position) return;
    const isManager = draft.managerId === row.employeeId;
    const ok = await confirm({
      title: "Xác nhận đổi vị trí",
      message: (
        <>
          Đổi vị trí của <b>{nameOf(row.employeeId)}</b> từ <b>{positionName(row.position)}</b> sang <b>{positionName(position)}</b>?
          Quyền tài khoản sẽ thay đổi theo vị trí mới.
          {isManager && position !== "STORE_MANAGER" && <> Nhân viên sẽ <b>thôi làm trưởng cửa hàng</b> của {storeLabel}.</>}
        </>
      ),
    });
    if (!ok) return;
    const next = withRow(draft, row.employeeId, position);
    onChange(isManager && position !== "STORE_MANAGER" ? { ...next, managerId: null } : next);
  };

  const transfer = async (row: StaffRow, targetId: number) => {
    const ok = await confirm({
      title: "Xác nhận chuyển cửa hàng",
      message: (
        <>
          Chuyển <b>{nameOf(row.employeeId)}</b> từ {storeLabel} sang <b>{storeNameOf(targetId)}</b>?
          {draft.managerId === row.employeeId && <> Nhân viên sẽ thôi phụ trách {storeLabel}.</>}
        </>
      ),
      confirmLabel: "Chuyển cửa hàng",
    });
    if (!ok) return;
    onChange(remove(row, targetId));
  };

  const removeRow = async (row: StaffRow) => {
    const employee = employeeOf(row.employeeId);
    const lastStore = String(employee?.status ?? "ACTIVE").toUpperCase() === "ACTIVE" && otherStores(row.employeeId).length === 0;
    const ok = await confirm({
      tone: "danger",
      title: "Xác nhận xóa nhân viên khỏi cửa hàng",
      message: lastStore ? (
        <>
          <b>{nameOf(row.employeeId)}</b> đang làm việc và chỉ thuộc {storeLabel}. Nhân viên đang làm việc phải thuộc ít nhất <b>1 cửa hàng</b>.
          Nếu xóa mà không chuyển sang cửa hàng khác, nhân viên sẽ được chuyển sang trạng thái <b>Tạm nghỉ</b>.
          <span className="mt-1 block text-slate-500">Muốn giữ nhân viên làm việc, hãy dùng “Chuyển cửa hàng”.</span>
        </>
      ) : (
        <>Xóa <b>{nameOf(row.employeeId)}</b> khỏi {storeLabel}? Nhân viên vẫn làm tại {otherStores(row.employeeId).map(storeNameOf).join(", ") || "cửa hàng khác"}.</>
      ),
      confirmLabel: lastStore ? "Xóa và chuyển tạm nghỉ" : "Xóa khỏi cửa hàng",
    });
    if (!ok) return;
    onChange(remove(row, null));
  };

  const remove = (row: StaffRow, transferToStoreId: number | null): StaffDraft => ({
    ...draft,
    managerId: draft.managerId === row.employeeId ? null : draft.managerId,
    rows: draft.rows.filter((item) => item.employeeId !== row.employeeId),
    // Nhân viên mới thêm trong lần sửa này thì chỉ cần bỏ khỏi nháp
    removals: row.isNew ? draft.removals : [...draft.removals, { employeeId: row.employeeId, transferToStoreId }],
  });

  // ---------------------------------------------------------------- Giao diện

  const hintOf = (employee: EmployeeResponse) =>
    [text(employee.employeeCode, ""), positionName(employee.position), String(employee.status ?? "").toUpperCase() === "INACTIVE" ? "Tạm nghỉ" : ""]
      .filter(Boolean)
      .join(" · ");
  const workable = employees.filter((employee) => String(employee.status ?? "ACTIVE").toUpperCase() !== "RESIGNED");
  const managerOptions = workable
    .filter((employee) => String(employee.status ?? "ACTIVE").toUpperCase() === "ACTIVE")
    .map((employee) => ({ value: String(employee.id), label: text(employee.fullName, `#${employee.id}`), hint: hintOf(employee) }));
  const addOptions = workable
    .filter((employee) => !draft.rows.some((row) => row.employeeId === employee.id))
    .map((employee) => ({ value: String(employee.id), label: text(employee.fullName, `#${employee.id}`), hint: hintOf(employee) }));
  const otherStoreOptions = stores.filter((store) => store.id !== storeId);

  return (
    <div className="space-y-3 sm:col-span-2">
      <div className="space-y-1.5 rounded-2xl border border-brand-200/80 bg-brand-50/50 p-3">
        <span className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
          <Crown className="h-4 w-4 text-brand-600" /> Trưởng cửa hàng
        </span>
        <SearchSelect
          aria-label="Chọn trưởng cửa hàng"
          value={draft.managerId ? String(draft.managerId) : ""}
          onChange={(value) => void changeManager(value)}
          options={managerOptions}
          allLabel="Chưa có trưởng cửa hàng"
          placeholder="Gõ tên hoặc mã nhân viên..."
        />
      </div>

      <div className="space-y-2 rounded-2xl border border-slate-200 p-3">
        <span className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
          <Users className="h-4 w-4 text-emerald-600" /> Nhân viên thuộc cửa hàng ({draft.rows.length})
        </span>

        <div className="flex flex-col gap-2 sm:flex-row">
          <SearchSelect
            aria-label="Chọn nhân viên để thêm"
            className="flex-1"
            value={addId}
            onChange={setAddId}
            options={addOptions}
            placeholder="Gõ tên hoặc mã nhân viên để thêm..."
          />
          <select value={addPosition} onChange={(event) => setAddPosition(event.target.value)} className="rounded-xl border border-slate-200 px-3 py-2 text-xs" aria-label="Vị trí">
            {POSITION_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <button type="button" disabled={!addId} onClick={() => void addEmployee()} className="btn btn-secondary btn-sm">
            <UserPlus className="h-3.5 w-3.5" /> Thêm
          </button>
        </div>

        <div className="max-h-72 space-y-2 overflow-y-auto">
          {draft.rows.length === 0 && <p className="py-4 text-center text-xs text-slate-400">Chưa có nhân viên tại cửa hàng.</p>}
          {draft.rows.map((row) => {
            const employee = employeeOf(row.employeeId);
            const isManager = draft.managerId === row.employeeId;
            return (
              <div key={row.employeeId} className="flex flex-col gap-2 rounded-xl border border-slate-100 bg-slate-50/60 p-2.5 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-slate-800">
                    {nameOf(row.employeeId)}
                    {isManager && <span className="ml-1.5 rounded-full bg-brand-100 px-1.5 py-0.5 text-[9px] font-black text-brand-800">TRƯỞNG CỬA HÀNG</span>}
                    {row.isNew && <span className="ml-1.5 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[9px] font-black text-emerald-700">MỚI</span>}
                  </p>
                  <p className="text-[10px] text-slate-400">{text(employee?.employeeCode, "")}</p>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <select
                    aria-label="Đổi vị trí"
                    value={row.position}
                    onChange={(event) => void changePosition(row, event.target.value)}
                    className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px]"
                  >
                    {POSITION_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                  {otherStoreOptions.length > 0 && (
                    <label className="relative inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] text-slate-600" title="Chuyển cửa hàng">
                      <ArrowRightLeft className="h-3 w-3" />
                      <select
                        aria-label="Chuyển sang cửa hàng"
                        value=""
                        onChange={(event) => event.target.value && void transfer(row, Number(event.target.value))}
                        className="bg-transparent text-[11px] outline-hidden"
                      >
                        <option value="">Chuyển cửa hàng</option>
                        {otherStoreOptions.map((store) => (
                          <option key={store.id} value={store.id}>{text(store.storeName)}</option>
                        ))}
                      </select>
                    </label>
                  )}
                  <button
                    type="button"
                    onClick={() => void removeRow(row)}
                    className="rounded-lg border border-rose-200 p-1.5 text-rose-600 hover:bg-rose-50"
                    title="Xóa khỏi cửa hàng"
                    aria-label="Xóa khỏi cửa hàng"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {draft.removals.length > 0 && (
          <div className="rounded-xl border border-dashed border-slate-200 p-2 text-[11px] text-slate-500">
            <b>Sẽ rời cửa hàng khi lưu:</b>{" "}
            {draft.removals
              .map((removal) => `${nameOf(removal.employeeId)}${removal.transferToStoreId ? ` → ${storeNameOf(removal.transferToStoreId)}` : ""}`)
              .join(", ")}
          </div>
        )}
      </div>
      {dialog}
    </div>
  );
}
