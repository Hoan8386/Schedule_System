"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Search, Users } from "lucide-react";
import { Alert, Badge, Button, EmptyState, Modal, Spinner } from "@/components/ui";
import { managerApi } from "@/lib/api";
import { cn } from "@/lib/cn";
import { useSchedule } from "../ScheduleContext";

interface GroupMembersModalProps {
  groupId: number;
  groupName: string;
  storeId: number;
  storeName?: string | null;
  /** Nhân viên đang trong nhóm */
  memberIds: number[];
  onClose: () => void;
  /** Gọi sau khi lưu thành công (để tải lại danh sách nhóm ca) */
  onSaved: () => void;
}

interface StaffRow {
  employeeId: number;
  fullName: string;
  employeeCode: string | null;
  phone: string | null;
}

/** Chọn nhân viên vào nhóm ca: chỉ liệt kê nhân viên đang làm việc tại cửa hàng của nhóm. */
export function GroupMembersModal({ groupId, groupName, storeId, storeName, memberIds, onClose, onSaved }: GroupMembersModalProps) {
  const { employees } = useSchedule();
  const [storeEmployeeIds, setStoreEmployeeIds] = useState<number[] | null>(null);
  const [loadError, setLoadError] = useState("");
  const [selected, setSelected] = useState<Set<number>>(() => new Set(memberIds));
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);

  // Nhân viên đang làm việc tại cửa hàng của nhóm ca
  useEffect(() => {
    let active = true;
    managerApi
      .getEmployeeStores({ storeId, status: "ACTIVE" })
      .then((response) => active && setStoreEmployeeIds([...new Set(response.data.map((item) => item.employeeId))]))
      .catch((cause: unknown) => active && setLoadError(cause instanceof Error ? cause.message : "Không thể tải nhân viên cửa hàng"));
    return () => {
      active = false;
    };
  }, [storeId]);

  // Thành viên hiện tại lên đầu, sau đó theo tên
  const staff = useMemo<StaffRow[]>(() => {
    const byId = new Map(employees.map((employee) => [Number(employee.id), employee]));
    const members = new Set(memberIds);
    return (storeEmployeeIds ?? [])
      .map((id) => {
        const employee = byId.get(id);
        return {
          employeeId: id,
          fullName: employee?.fullName ?? `NV #${id}`,
          employeeCode: employee?.employeeCode ?? null,
          phone: employee?.phone ?? null,
        };
      })
      .sort((a, b) => Number(members.has(b.employeeId)) - Number(members.has(a.employeeId)) || a.fullName.localeCompare(b.fullName, "vi"));
  }, [employees, storeEmployeeIds, memberIds]);

  const keyword = search.trim().toLowerCase();
  const visible = staff.filter(
    (item) => !keyword || `${item.fullName} ${item.employeeCode ?? ""} ${item.phone ?? ""}`.toLowerCase().includes(keyword)
  );

  const initial = new Set(memberIds);
  const added = [...selected].filter((id) => !initial.has(id)).length;
  const removed = [...initial].filter((id) => !selected.has(id)).length;
  const allVisibleSelected = visible.length > 0 && visible.every((item) => selected.has(item.employeeId));

  const toggle = (id: number) =>
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleVisible = () =>
    setSelected((current) => {
      const next = new Set(current);
      visible.forEach((item) => (allVisibleSelected ? next.delete(item.employeeId) : next.add(item.employeeId)));
      return next;
    });

  const save = async () => {
    setSaving(true);
    try {
      // Chỉ gửi nhân viên còn làm tại cửa hàng (bỏ người đã chuyển cửa hàng khỏi nhóm)
      const storeIds = new Set(storeEmployeeIds ?? []);
      await managerApi.saveShiftGroupEmployees(groupId, [...selected].filter((id) => storeIds.has(id)));
      onSaved();
      onClose();
    } catch {
      // Lỗi đã được hiện bằng toast từ HTTP client
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open
      size="max-w-2xl"
      onClose={saving ? () => undefined : onClose}
      title={
        <span className="flex items-center gap-2">
          <Users className="h-5 w-5 text-brand-600" />
          Nhân viên nhóm ca · {groupName}
        </span>
      }
      footer={
        <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-xs text-slate-500">
            Đã chọn <strong className="text-slate-800">{selected.size}</strong> nhân viên
            {(added > 0 || removed > 0) && (
              <>
                {" "}· <span className="text-emerald-600">+{added}</span> / <span className="text-rose-600">-{removed}</span>
              </>
            )}
          </span>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={onClose} disabled={saving}>
              Hủy
            </Button>
            <Button onClick={() => void save()} disabled={!storeEmployeeIds || saving || (added === 0 && removed === 0)}>
              {saving ? "Đang lưu..." : "Lưu danh sách"}
            </Button>
          </div>
        </div>
      }
    >
      {loadError && <Alert>{loadError}</Alert>}
      {!storeEmployeeIds && !loadError && <Spinner label="Đang tải nhân viên cửa hàng..." className="py-10" />}

      {storeEmployeeIds && (
        <div className="space-y-3">
          <p className="text-xs text-slate-500">
            Nhân viên đang làm việc tại <strong className="text-slate-700">{storeName ?? "cửa hàng của nhóm ca"}</strong>.
          </p>

          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Tìm tên, mã hoặc số điện thoại"
                aria-label="Tìm nhân viên"
                className="field-input pl-8"
              />
            </div>
            <Button variant="secondary" size="sm" onClick={toggleVisible} disabled={visible.length === 0}>
              {allVisibleSelected ? "Bỏ chọn tất cả" : "Chọn tất cả"}
            </Button>
          </div>

          {staff.length === 0 ? (
            <EmptyState>Cửa hàng chưa có nhân viên nào đang làm việc</EmptyState>
          ) : (
            <div className="max-h-[50vh] divide-y divide-slate-100 overflow-y-auto rounded-xl border border-slate-200">
              {visible.length === 0 && <p className="p-6 text-center text-xs text-slate-400">Không có nhân viên phù hợp</p>}
              {visible.map((item) => {
                const checked = selected.has(item.employeeId);
                const isMember = initial.has(item.employeeId);
                return (
                  <label
                    key={item.employeeId}
                    className={cn("flex cursor-pointer items-center gap-3 px-4 py-3 text-xs hover:bg-slate-50", checked && "bg-brand-50/50")}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggle(item.employeeId)}
                      className="h-4 w-4 rounded border-slate-300 accent-brand-500"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-slate-800">{item.fullName}</p>
                      <p className="text-[11px] text-slate-400">
                        {item.employeeCode ?? `#${item.employeeId}`}
                        {item.phone ? ` · ${item.phone}` : ""}
                      </p>
                    </div>
                    {isMember && !checked && <Badge tone="danger">Sẽ gỡ</Badge>}
                    {isMember && checked && <Badge tone="success">Trong nhóm</Badge>}
                    {!isMember && checked && <Badge tone="info">Sẽ thêm</Badge>}
                  </label>
                );
              })}
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
