"use client";

import React, { useState } from "react";
import { Plus, RefreshCw, Users } from "lucide-react";
import { Button, PageHeader, Pagination } from "@/components/ui";
import { managerApi, type EmployeeListItem } from "@/lib/api";
import { value } from "./utils";
import { useEmployees } from "./useEmployees";
import { EmployeeFiltersBar } from "./components/EmployeeFiltersBar";
import { EmployeeTable } from "./components/EmployeeTable";
import { EmployeeFormModal } from "./form/EmployeeFormModal";
import { EmployeeProfileModal } from "./profile/EmployeeProfileModal";

/**
 * Quản lý nhân sự: hồ sơ, phân bổ cửa hàng, tự cấp tài khoản qua email.
 * readOnly (trưởng cửa hàng): cùng danh sách nhưng chỉ xem thông tin + lọc / tìm kiếm (backend giới hạn theo cửa hàng).
 */
export default function NhanSuPage({ readOnly = false }: { readOnly?: boolean }) {
  const data = useEmployees();
  const { employees, storeMap, loading, error, setError, reload } = data;
  const [successMsg, setSuccessMsg] = useState("");
  /** undefined = đóng, null = tạo mới */
  const [editing, setEditing] = useState<EmployeeListItem | null | undefined>(undefined);
  const [viewing, setViewing] = useState<EmployeeListItem | null>(null);

  const openForm = (employee: EmployeeListItem | null) => {
    setError("");
    setSuccessMsg("");
    setEditing(employee);
  };

  const remove = async (employee: EmployeeListItem) => {
    if (!window.confirm(`Xóa hồ sơ "${value(employee.fullName)}"?`)) return;
    setError("");
    setSuccessMsg("");
    try {
      await managerApi.deleteEmployee(employee.id);
      setSuccessMsg(`Đã xóa nhân viên "${value(employee.fullName)}" thành công.`);
      reload();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể xóa nhân viên");
    }
  };

  // Số liệu tổng do backend đếm trong phạm vi được xem (không phụ thuộc trang hiện tại)
  const stats = [
    { label: "Tổng nhân sự", count: data.summary?.total ?? 0 },
    { label: "Đang làm việc", count: data.summary?.active ?? 0 },
    { label: "Đang giữ vai trò quản lý", count: data.summary?.managers ?? 0 },
  ];

  return (
    <div className="page">
      <PageHeader
        title="Quản lý nhân sự"
        subtitle={
          readOnly
            ? "Nhân viên tại cửa hàng của bạn – chỉ xem thông tin, lọc và tìm kiếm."
            : "Hồ sơ nhân viên, phân bổ cửa hàng và tự động cấp tài khoản đăng nhập qua Email."
        }
        actions={
          <>
            {!readOnly && <Button icon={Plus} onClick={() => openForm(null)}>Thêm nhân viên</Button>}
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
        {loading && employees.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500">Đang tải dữ liệu nhân sự...</div>
        ) : employees.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500">
            {data.summary?.total ? "Không có nhân viên phù hợp bộ lọc." : "Chưa có dữ liệu nhân sự."}
          </div>
        ) : (
          <div className={loading ? "opacity-60 transition-opacity" : undefined}>
            <EmployeeTable
              employees={employees}
              storeMap={storeMap}
              onView={setViewing}
              onEdit={readOnly ? undefined : openForm}
              onDelete={readOnly ? undefined : (employee) => void remove(employee)}
            />
          </div>
        )}
        <Pagination meta={data.meta} onPageChange={data.setPage} disabled={loading} />
      </div>

      {editing !== undefined && (
        <EmployeeFormModal
          employee={editing}
          assignments={editing?.assignments ?? []}
          stores={data.stores}
          onClose={() => setEditing(undefined)}
          onSaved={(message) => {
            setEditing(undefined);
            setSuccessMsg(message);
            reload();
          }}
        />
      )}

      {viewing && (
        <EmployeeProfileModal
          employee={viewing}
          isManager={viewing.manager}
          assignments={viewing.assignments}
          storeMap={storeMap}
          onClose={() => setViewing(null)}
          onEdit={
            readOnly
              ? undefined
              : () => {
                  setViewing(null);
                  openForm(viewing);
                }
          }
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
