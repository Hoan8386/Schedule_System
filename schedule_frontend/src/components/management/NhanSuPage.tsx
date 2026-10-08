"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Edit, Plus, RefreshCw, Search, Trash2, Users, X } from "lucide-react";
import {
  EmployeeResponse,
  EmployeeRequest,
  EmployeeStoreResponse,
  StoreManagerResponse,
  StoreResponse,
  managerApi,
} from "@/lib/managerApi";

const value = (input: unknown, fallback = "Chưa cập nhật") =>
  input === null || input === undefined || String(input).trim() === ""
    ? fallback
    : String(input);

const date = (input: string | null | undefined) =>
  input ? new Date(input).toLocaleDateString("vi-VN") : "Chưa cập nhật";

const statusName = (status: string | null | undefined) =>
  ({ ACTIVE: "ĐANG LÀM VIỆC", INACTIVE: "TẠM NGƯNG", RESIGNED: "ĐÃ NGHỈ VIỆC" }[
    status?.toUpperCase() ?? ""
  ] ?? value(status, "CHƯA CẬP NHẬT"));

const emptyEmployeeForm: EmployeeRequest = {
  userId: 0,
  employeeCode: "",
  fullName: "",
  email: "",
  phone: "",
  address: "",
  hireDate: "",
  status: "ACTIVE",
  note: "",
};

export default function NhanSuPage() {
  const [employees, setEmployees] = useState<EmployeeResponse[]>([]);
  const [stores, setStores] = useState<StoreResponse[]>([]);
  const [assignments, setAssignments] = useState<EmployeeStoreResponse[]>([]);
  const [managers, setManagers] = useState<StoreManagerResponse[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingEmployee, setEditingEmployee] = useState<EmployeeResponse | null>(null);
  const [employeeForm, setEmployeeForm] = useState<EmployeeRequest>(emptyEmployeeForm);
  const [employeeFormOpen, setEmployeeFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [assignmentStoreId, setAssignmentStoreId] = useState("ALL");
  const [assignmentRole, setAssignmentRole] = useState<"ALL" | "MANAGER" | "EMPLOYEE">("ALL");
  const [assignmentStatus, setAssignmentStatus] = useState("ALL");
  const [assignmentPrimary, setAssignmentPrimary] = useState("ALL");
  const [employeeStoreForm, setEmployeeStoreForm] = useState({
    storeId: 0,
    startDate: "",
    isPrimary: true,
    status: "ACTIVE",
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [employeeResponse, storeResponse, assignmentResponse, managerResponse] =
        await Promise.all([
          managerApi.getEmployees(status === "ALL" ? undefined : status),
          managerApi.getStores(),
          managerApi.getEmployeeStores({
            storeId: assignmentStoreId === "ALL" ? undefined : Number(assignmentStoreId),
            role: assignmentRole === "ALL" ? undefined : assignmentRole,
            status: assignmentStatus === "ALL" ? undefined : assignmentStatus,
            primary: assignmentPrimary === "ALL" ? undefined : assignmentPrimary === "true",
          }),
          managerApi.getStoreManagers(),
        ]);
      setEmployees(Array.isArray(employeeResponse.data) ? employeeResponse.data : []);
      setStores(Array.isArray(storeResponse.data) ? storeResponse.data : []);
      setAssignments(Array.isArray(assignmentResponse.data) ? assignmentResponse.data : []);
      setManagers(Array.isArray(managerResponse.data) ? managerResponse.data : []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Không thể tải dữ liệu nhân sự");
      setEmployees([]);
      setStores([]);
      setAssignments([]);
      setManagers([]);
    } finally {
      setLoading(false);
    }
  }, [status, assignmentStoreId, assignmentRole, assignmentStatus, assignmentPrimary]);

  const openEmployeeForm = (employee?: EmployeeResponse) => {
    setEditingEmployee(employee ?? null);
    setEmployeeFormOpen(true);
    setEmployeeForm({
      userId: employee?.userId ?? 0,
      employeeCode: employee?.employeeCode ?? "",
      fullName: employee?.fullName ?? "",
      dateOfBirth: employee?.dateOfBirth ?? "",
      gender: employee?.gender ?? "",
      email: employee?.email ?? "",
      phone: employee?.phone ?? "",
      address: employee?.address ?? "",
      hireDate: employee?.hireDate ?? "",
      status: employee?.status ?? "ACTIVE",
      note: employee?.note ?? "",
    });
    const currentAssignment = employee
      ? (assignmentsByEmployee.get(employee.id) ?? []).find(
          (assignment) => assignment.status?.toUpperCase() === "ACTIVE"
        ) ?? assignmentsByEmployee.get(employee.id)?.[0]
      : undefined;
    setEmployeeStoreForm({
      storeId: currentAssignment?.storeId ?? stores[0]?.id ?? 0,
      startDate: currentAssignment?.startDate ?? employee?.hireDate ?? "",
      isPrimary: currentAssignment?.isPrimary ?? true,
      status: currentAssignment?.status ?? "ACTIVE",
    });
  };

  const saveEmployee = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!employeeForm.userId) {
      setError("Vui lòng nhập userId đã tồn tại để liên kết hồ sơ nhân viên.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const employeeResponse = editingEmployee
        ? await managerApi.updateEmployee(editingEmployee.id, employeeForm)
        : await managerApi.createEmployee(employeeForm);
      if (employeeStoreForm.storeId) {
        const currentAssignment = editingEmployee
          ? (assignmentsByEmployee.get(editingEmployee.id) ?? []).find(
              (assignment) => assignment.status?.toUpperCase() === "ACTIVE"
            ) ?? assignmentsByEmployee.get(editingEmployee.id)?.[0]
          : undefined;
        const assignmentPayload = {
          employeeId: editingEmployee?.id ?? employeeResponse.data.id,
          storeId: employeeStoreForm.storeId,
          startDate: employeeStoreForm.startDate || null,
          endDate: null,
          isPrimary: employeeStoreForm.isPrimary,
          status: employeeStoreForm.status,
          assignedBy: null,
        };
        if (currentAssignment) {
          await managerApi.updateEmployeeStore(
            currentAssignment.employeeStoreId,
            assignmentPayload
          );
        } else {
          await managerApi.createEmployeeStore(assignmentPayload);
        }
      }
      setEmployeeFormOpen(false);
      setEditingEmployee(null);
      await loadData();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Không thể lưu nhân viên");
    } finally {
      setSaving(false);
    }
  };

  const deleteEmployee = async (employee: EmployeeResponse) => {
    if (!window.confirm(`Xóa hồ sơ "${value(employee.fullName)}"?`)) return;
    setError("");
    try {
      await managerApi.deleteEmployee(employee.id);
      await loadData();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Không thể xóa nhân viên");
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => void loadData(), 0);
    return () => window.clearTimeout(timer);
  }, [loadData]);

  const storeMap = useMemo(() => new Map(stores.map((store) => [store.id, store])), [stores]);
  const filteredEmployees = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return employees.filter((employee) => {
      const matchesSearch =
        !keyword ||
        [employee.employeeCode, employee.fullName, employee.phone, employee.email]
          .map((field) => value(field, "").toLowerCase())
          .some((field) => field.includes(keyword));
      const hasAssignmentFilter =
        assignmentStoreId !== "ALL" ||
        assignmentRole !== "ALL" ||
        assignmentStatus !== "ALL" ||
        assignmentPrimary !== "ALL";
      const matchesAssignment =
        !hasAssignmentFilter ||
        assignments.some((assignment) => assignment.employeeId === employee.id);
      return matchesSearch && matchesAssignment;
    });
  }, [
    employees,
    search,
    assignments,
    assignmentStoreId,
    assignmentRole,
    assignmentStatus,
    assignmentPrimary,
  ]);

  const assignmentsByEmployee = useMemo(() => {
    const map = new Map<number, EmployeeStoreResponse[]>();
    assignments.forEach((assignment) => {
      const current = map.get(assignment.employeeId) ?? [];
      current.push(assignment);
      map.set(assignment.employeeId, current);
    });
    return map;
  }, [assignments]);

  const managerIds = useMemo(
    () => new Set(managers.map((manager) => manager.employeeId)),
    [managers]
  );

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Quản lý nhân sự</h1>
          <p className="text-xs text-slate-500 mt-1">
            Dữ liệu được lấy trực tiếp từ API EMPLOYEE, EMPLOYEE_STORE và STORE_MANAGER.
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => openEmployeeForm()} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 text-slate-900 text-xs font-bold"><Plus className="w-4 h-4" /> Thêm nhân viên</button>
          <button onClick={() => void loadData()} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold"><RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Làm mới</button>
        </div>
        {employeeFormOpen ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
            <form onSubmit={saveEmployee} className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between"><h2 className="text-lg font-black text-slate-800">{editingEmployee ? "Sửa nhân viên" : "Thêm nhân viên"}</h2><button type="button" onClick={() => setEmployeeFormOpen(false)} className="text-slate-400 text-xl">×</button></div>
              <p className="text-xs text-slate-500">`userId` phải là tài khoản đã tồn tại trong hệ thống.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {([["userId", "User ID"], ["employeeCode", "Mã nhân viên"], ["fullName", "Họ và tên"], ["email", "Email"], ["phone", "Số điện thoại"], ["address", "Địa chỉ"], ["hireDate", "Ngày bắt đầu"], ["dateOfBirth", "Ngày sinh"], ["gender", "Giới tính"], ["note", "Ghi chú"]] as const).map(([field, label]) => <label key={field} className="text-xs font-bold text-slate-600">{label}<input required={field === "userId" || field === "employeeCode" || field === "fullName"} type={field === "userId" ? "number" : field.toLowerCase().includes("date") ? "date" : "text"} value={employeeForm[field] ?? ""} onChange={(event) => setEmployeeForm({ ...employeeForm, [field]: field === "userId" ? Number(event.target.value) : event.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 font-normal" /></label>)}
                <label className="text-xs font-bold text-slate-600">Trạng thái<select value={employeeForm.status} onChange={(event) => setEmployeeForm({ ...employeeForm, status: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 font-normal"><option value="ACTIVE">ACTIVE</option><option value="INACTIVE">INACTIVE</option><option value="RESIGNED">RESIGNED</option></select></label>
                <label className="text-xs font-bold text-slate-600">Cửa hàng đang làm
                  <select value={employeeStoreForm.storeId} onChange={(event) => setEmployeeStoreForm({ ...employeeStoreForm, storeId: Number(event.target.value) })} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 font-normal">
                    <option value={0}>Chưa phân công</option>
                    {stores.map((store) => <option key={store.id} value={store.id}>{value(store.storeName)} - {value(store.storeCode)}</option>)}
                  </select>
                </label>
                <label className="text-xs font-bold text-slate-600">Ngày bắt đầu phân công<input type="date" value={employeeStoreForm.startDate} onChange={(event) => setEmployeeStoreForm({ ...employeeStoreForm, startDate: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 font-normal" /></label>
                <label className="text-xs font-bold text-slate-600">Trạng thái phân công<select value={employeeStoreForm.status} onChange={(event) => setEmployeeStoreForm({ ...employeeStoreForm, status: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 font-normal"><option value="ACTIVE">ACTIVE</option><option value="INACTIVE">INACTIVE</option></select></label>
              </div>
              <div className="flex justify-end gap-2"><button type="button" onClick={() => setEmployeeFormOpen(false)} className="rounded-xl border px-4 py-2 text-sm">Hủy</button><button disabled={saving} className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-bold disabled:opacity-50">{saving ? "Đang lưu..." : "Lưu"}</button></div>
            </form>
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Tổng nhân sự", count: employees.length },
          { label: "Đang làm việc", count: employees.filter((employee) => employee.status?.toUpperCase() === "ACTIVE").length },
          { label: "Đang giữ vai trò quản lý", count: managerIds.size },
        ].map(({ label, count }) => {
          return <div key={label} className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between"><div><span className="text-xs font-semibold text-slate-500">{label}</span><div className="text-3xl font-black text-slate-800 mt-1">{count}</div></div><div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center"><Users className="w-5 h-5" /></div></div>;
        })}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50/50 border-b border-slate-100 overflow-x-auto">
          <div className="flex min-w-max flex-nowrap items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm tên, mã, email, số điện thoại..." className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs" />
          </div>

          <select value={status} onChange={(event) => setStatus(event.target.value)} className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs">
            <option value="ALL">Trạng thái: Tất cả</option><option value="ACTIVE">Đang làm việc</option><option value="INACTIVE">Tạm ngưng</option><option value="RESIGNED">Đã nghỉ việc</option>
          </select>
          <select value={assignmentStoreId} onChange={(event) => setAssignmentStoreId(event.target.value)} className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs">
            <option value="ALL">Cửa hàng: Tất cả</option>
            {stores.map((store) => <option key={store.id} value={store.id}>{value(store.storeName)}</option>)}
          </select>
          <select value={assignmentRole} onChange={(event) => setAssignmentRole(event.target.value as "ALL" | "MANAGER" | "EMPLOYEE")} className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs">
            <option value="ALL">Vai trò: Tất cả</option><option value="MANAGER">Quản lý</option><option value="EMPLOYEE">Nhân viên</option>
          </select>
          <select value={assignmentStatus} onChange={(event) => setAssignmentStatus(event.target.value)} className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs">
            <option value="ALL">Phân công: Tất cả</option><option value="ACTIVE">Đang phân công</option><option value="INACTIVE">Ngừng phân công</option>
          </select>
          <select value={assignmentPrimary} onChange={(event) => setAssignmentPrimary(event.target.value)} className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs">
            <option value="ALL">Chính/phụ: Tất cả</option><option value="true">Cửa hàng chính</option><option value="false">Cửa hàng phụ</option>
          </select>
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setStatus("ALL");
              setAssignmentStoreId("ALL");
              setAssignmentRole("ALL");
              setAssignmentStatus("ALL");
              setAssignmentPrimary("ALL");
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100"
          >
            <X className="h-3.5 w-3.5" />
            Xóa bộ lọc
          </button>
        </div>
        </div>
        {error && <div className="m-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
        {loading ? <div className="p-10 text-center text-sm text-slate-500">Đang tải dữ liệu nhân sự...</div> : filteredEmployees.length === 0 ? <div className="p-10 text-center text-sm text-slate-500">Không có dữ liệu nhân sự từ API.</div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/60 text-[11px] font-bold text-slate-400 uppercase"><tr><th className="px-5 py-3">Nhân viên</th><th className="px-5 py-3">Email / điện thoại</th><th className="px-5 py-3">Cửa hàng phụ trách</th><th className="px-5 py-3">Ngày bắt đầu</th><th className="px-5 py-3">Trạng thái</th><th className="px-5 py-3">Thao tác</th></tr></thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredEmployees.map((employee) => {
                  const employeeAssignments = assignmentsByEmployee.get(employee.id) ?? [];
                  return <tr key={employee.id} className="hover:bg-slate-50/50">
                    <td className="px-5 py-4"><div className="flex items-center gap-3"><div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 font-bold flex items-center justify-center">{value(employee.fullName, "?").slice(0, 1).toUpperCase()}</div><div><b className="text-sm text-slate-800">{value(employee.fullName)}</b><span className="block text-[11px] text-slate-400 font-mono">Mã: {value(employee.employeeCode)} {managerIds.has(employee.id) ? " · QUẢN LÝ" : ""}</span></div></div></td>
                    <td className="px-5 py-4 text-slate-600">{value(employee.email)}<span className="block text-slate-400">{value(employee.phone)}</span></td>
                    <td className="px-5 py-4"><div className="flex flex-wrap gap-1.5">{employeeAssignments.length ? employeeAssignments.map((assignment) => <span key={assignment.employeeStoreId} className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200/60">{value(storeMap.get(assignment.storeId)?.storeName, `Store #${assignment.storeId}`)}</span>) : <span className="text-slate-400">Chưa phân bổ</span>}</div></td>
                    <td className="px-5 py-4 text-slate-500">{date(employee.hireDate)}</td>
                    <td className="px-5 py-4"><span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${employee.status?.toUpperCase() === "ACTIVE" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-600 border border-slate-200"}`}>{statusName(employee.status)}</span></td>
                    <td className="px-5 py-4"><div className="flex gap-1"><button onClick={() => openEmployeeForm(employee)} className="p-2 rounded-lg border border-slate-200 text-slate-600" title="Sửa"><Edit className="w-3.5 h-3.5" /></button><button onClick={() => void deleteEmployee(employee)} className="p-2 rounded-lg border border-rose-200 text-rose-700" title="Xóa"><Trash2 className="w-3.5 h-3.5" /></button></div></td>
                  </tr>;
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
