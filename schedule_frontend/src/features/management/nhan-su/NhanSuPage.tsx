"use client";

import React, { useState } from "react";
import { Plus, RefreshCw, Users } from "lucide-react";
import { Button, PageHeader } from "@/components/ui";
import { managerApi, type EmployeeResponse } from "@/lib/api";
import { isActive, value } from "./utils";
import { useEmployees } from "./useEmployees";
import { EmployeeFiltersBar } from "./components/EmployeeFiltersBar";
import { EmployeeTable } from "./components/EmployeeTable";
import { EmployeeFormModal } from "./form/EmployeeFormModal";
import { EmployeeProfileModal } from "./profile/EmployeeProfileModal";

/** Quản lý nhân sự: hồ sơ, phân bổ cửa hàng, tự cấp tài khoản qua email. */
export default function NhanSuPage() {
  const data = useEmployees();
  const { filtered, assignmentsByEmployee, storeMap, managerIds, loading, error, setError, reload } = data;
  const [successMsg, setSuccessMsg] = useState("");
  /** undefined = đóng, null = tạo mới */
  const [editing, setEditing] = useState<EmployeeResponse | null | undefined>(undefined);
  const [viewing, setViewing] = useState<EmployeeResponse | null>(null);

  const openForm = (employee: EmployeeResponse | null) => {
    setError("");
    setSuccessMsg("");
    setEditing(employee);
  };

  const remove = async (employee: EmployeeResponse) => {
    if (!window.confirm(`Xóa hồ sơ "${value(employee.fullName)}"?`)) return;
    setError("");
    setSuccessMsg("");
    try {
      await managerApi.deleteEmployee(employee.id);
      setSuccessMsg(`Đã xóa nhân viên "${value(employee.fullName)}" thành công.`);
      await reload();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể xóa nhân viên");
    }
  };

  const stats = [
    { label: "Tổng nhân sự", count: data.employees.length },
    { label: "Đang làm việc", count: data.employees.filter((employee) => isActive(employee.status)).length },
    { label: "Đang giữ vai trò quản lý", count: managerIds.size },
  ];

  return (
    <div className="page">
      <PageHeader
        title="Quản lý nhân sự"
        subtitle="Hồ sơ nhân viên, phân bổ cửa hàng và tự động cấp tài khoản đăng nhập qua Email."
        actions={
          <>
            <Button icon={Plus} onClick={() => openForm(null)}>Thêm nhân viên</Button>
            <Button variant="secondary" onClick={() => void reload()}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Làm mới
            </Button>
          </>
        }
      />

      {successMsg && <Dismissible tone="success" message={successMsg} onDismiss={() => setSuccessMsg("")} />}
      {error && editing === undefined && <Dismissible tone="danger" message={error} onDismiss={() => setError("")} />}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map(({ label, count }) => (
          <div key={label} className="card flex items-center justify-between p-5">
            <div>
              <span className="text-xs font-semibold text-slate-500">{label}</span>
              <div className="mt-1 text-3xl font-black text-slate-800">{count}</div>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Users className="h-5 w-5" />
            </div>
          </div>
        ))}
      </div>

      <div className="card overflow-hidden">
        <EmployeeFiltersBar filters={data.filters} onChange={data.setFilters} stores={data.stores} />
        {loading ? (
          <div className="p-10 text-center text-sm text-slate-500">Đang tải dữ liệu nhân sự...</div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500">Không có dữ liệu nhân sự từ API.</div>
        ) : (
          <EmployeeTable
            employees={filtered}
            assignmentsByEmployee={assignmentsByEmployee}
            storeMap={storeMap}
            managerIds={managerIds}
            onView={setViewing}
            onEdit={openForm}
            onDelete={(employee) => void remove(employee)}
          />
        )}
      </div>

      {editing !== undefined && (
        <EmployeeFormModal
          employee={editing}
          assignments={editing ? assignmentsByEmployee.get(editing.id) ?? [] : []}
          stores={data.stores}
          onClose={() => setEditing(undefined)}
          onSaved={(message) => {
            setEditing(undefined);
            setSuccessMsg(message);
            void reload();
          }}
        />
      )}

      {viewing && (
        <EmployeeProfileModal
          employee={viewing}
          isManager={managerIds.has(viewing.id)}
          assignments={assignmentsByEmployee.get(viewing.id) ?? []}
          storeMap={storeMap}
          onClose={() => setViewing(null)}
          onEdit={(employee) => {
            setViewing(null);
            openForm(employee);
          }}
        />
      )}
    </div>
  );
}

function Dismissible({ tone, message, onDismiss }: { tone: "success" | "danger"; message: string; onDismiss: () => void }) {
  return (
    <div className={`alert alert-${tone} justify-between font-medium`}>
      <span>{message}</span>
      <button type="button" onClick={onDismiss} className="font-bold opacity-70 hover:opacity-100" aria-label="Đóng">×</button>
    </div>
  );
}
