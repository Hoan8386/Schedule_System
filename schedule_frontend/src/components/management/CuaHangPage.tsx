"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Edit,
  Grid,
  List,
  MapPin,
  Phone,
  Plus,
  Store,
  Trash2,
  RefreshCw,
  Users,
  X,
} from "lucide-react";
import {
  EmployeeResponse,
  EmployeeStoreResponse,
  StoreManagerResponse,
  StoreResponse,
  StoreRequest,
  managerApi,
} from "@/lib/managerApi";

const text = (value: unknown, fallback = "Chưa cập nhật") =>
  value === null || value === undefined || String(value).trim() === ""
    ? fallback
    : String(value);

const statusLabel = (status: string | null | undefined) =>
  ({ ACTIVE: "HOẠT ĐỘNG", INACTIVE: "TẠM NGƯNG", OPENING: "SẮP MỞ" }[
    status?.toUpperCase() ?? ""
  ] ?? text(status, "CHƯA CẬP NHẬT"));

const statusClass = (status: string | null | undefined) => {
  switch (status?.toUpperCase()) {
    case "ACTIVE":
      return "bg-emerald-50 text-emerald-700 border border-emerald-200";
    case "INACTIVE":
      return "bg-rose-50 text-rose-700 border border-rose-200";
    default:
      return "bg-blue-50 text-blue-700 border border-blue-200";
  }
};

const emptyStoreForm: StoreRequest = {
  storeCode: "",
  storeName: "",
  address: "",
  phone: "",
  status: "ACTIVE",
  note: "",
};

export default function CuaHangPage() {
  const [view, setView] = useState<"grid" | "table">("grid");
  const [stores, setStores] = useState<StoreResponse[]>([]);
  const [assignments, setAssignments] = useState<EmployeeStoreResponse[]>([]);
  const [employees, setEmployees] = useState<EmployeeResponse[]>([]);
  const [managers, setManagers] = useState<StoreManagerResponse[]>([]);
  const [status, setStatus] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingStore, setEditingStore] = useState<StoreResponse | null>(null);
  const [storeForm, setStoreForm] = useState<StoreRequest>(emptyStoreForm);
  const [storeFormOpen, setStoreFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [staffStore, setStaffStore] = useState<StoreResponse | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [storeResponse, assignmentResponse, managerResponse, employeeResponse] =
        await Promise.all([
          managerApi.getStores(status === "ALL" ? undefined : status),
          managerApi.getEmployeeStores(),
          managerApi.getStoreManagers(),
          managerApi.getEmployees(),
        ]);
      setStores(Array.isArray(storeResponse.data) ? storeResponse.data : []);
      setAssignments(
        Array.isArray(assignmentResponse.data) ? assignmentResponse.data : []
      );
      setManagers(
        Array.isArray(managerResponse.data) ? managerResponse.data : []
      );
      setEmployees(
        Array.isArray(employeeResponse.data) ? employeeResponse.data : []
      );
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : "Không thể tải dữ liệu cửa hàng"
      );
      setStores([]);
      setAssignments([]);
      setManagers([]);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  }, [status]);

  const openStoreForm = (store?: StoreResponse) => {
    setEditingStore(store ?? null);
    setStoreFormOpen(true);
    setStoreForm({
      storeCode: store?.storeCode ?? "",
      storeName: store?.storeName ?? "",
      address: store?.address ?? "",
      phone: store?.phone ?? "",
      status: store?.status ?? "ACTIVE",
      note: store?.note ?? "",
    });
    setLogoFile(null);
    setLogoPreview(store?.logoImage ?? null);
  };

  const selectLogo = (file: File | null) => {
    setLogoFile(file);
    if (!file) {
      setLogoPreview(editingStore?.logoImage ?? null);
      return;
    }
    setLogoPreview(URL.createObjectURL(file));
  };

  const closeStoreForm = () => {
    if (logoPreview?.startsWith("blob:")) URL.revokeObjectURL(logoPreview);
    setEditingStore(null);
    setStoreFormOpen(false);
    setStoreForm(emptyStoreForm);
    setLogoFile(null);
    setLogoPreview(null);
  };

  const saveStore = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      let logoId = storeForm.logoId;
      if (logoFile) {
        const uploadResponse = await managerApi.uploadAttachment(logoFile);
        logoId = uploadResponse.data.attachmentId;
      }
      const payload = { ...storeForm, logoId };
      if (editingStore) {
        await managerApi.updateStore(editingStore.id, payload);
      } else {
        await managerApi.createStore(payload);
      }
      closeStoreForm();
      await loadData();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Không thể lưu cửa hàng");
    } finally {
      setSaving(false);
    }
  };

  const deleteStore = async (store: StoreResponse) => {
    if (!window.confirm(`Xóa cửa hàng "${text(store.storeName)}"?`)) return;
    setError("");
    try {
      await managerApi.deleteStore(store.id);
      await loadData();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Không thể xóa cửa hàng");
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => void loadData(), 0);
    return () => window.clearTimeout(timer);
  }, [loadData]);

  const storeRows = useMemo(
    () =>
      stores.map((store) => ({
        store,
        staffCount: assignments.filter(
          (assignment) =>
            assignment.storeId === store.id &&
            (!assignment.status || assignment.status.toUpperCase() === "ACTIVE")
        ).length,
        managerCount: managers.filter((manager) => manager.storeId === store.id)
          .length,
      })),
    [assignments, managers, stores]
  );

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">
            Quản lý cửa hàng
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Dữ liệu được lấy trực tiếp từ API STORE, EMPLOYEE_STORE và STORE_MANAGER.
          </p>
        </div>
        <div className="flex items-center gap-2">
        <button
          onClick={() => openStoreForm()}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-900 text-xs font-bold"
        >
          <Plus className="w-4 h-4" /> Thêm cửa hàng
        </button>
        <button
          onClick={() => void loadData()}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Làm mới
        </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center bg-slate-100 p-1 rounded-xl gap-1">
          {(["grid", "table"] as const).map((option) => (
            <button
              key={option}
              onClick={() => setView(option)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold ${
                view === option ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500"
              }`}
            >
              {option === "grid" ? <Grid className="w-3.5 h-3.5" /> : <List className="w-3.5 h-3.5" />}
              {option === "grid" ? "Dạng lưới" : "Dạng bảng"}
            </button>
          ))}
        </div>
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium text-slate-700 text-xs"
        >
          <option value="ALL">Trạng thái: Tất cả</option>
          <option value="ACTIVE">Đang hoạt động</option>
          <option value="INACTIVE">Tạm ngưng</option>
          <option value="OPENING">Sắp mở</option>
        </select>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}
      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
          Đang tải dữ liệu cửa hàng...
        </div>
      ) : storeRows.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
          Không có dữ liệu cửa hàng từ API.
        </div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {storeRows.map(({ store, staffCount, managerCount }) => (
            <div key={store.id} className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="relative h-32 bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center border-b border-slate-100">
                {store.logoImage ? (
                  <img src={store.logoImage} alt={`Logo ${text(store.storeName)}`} className="h-full w-full object-cover" />
                ) : (
                  <Store className="w-12 h-12 text-amber-600" />
                )}
                <span className={`absolute top-3 right-3 text-[11px] font-black px-2.5 py-1 rounded-full ${statusClass(store.status)}`}>
                  {statusLabel(store.status)}
                </span>
                <span className="absolute bottom-2 left-3 text-[10px] font-mono font-bold bg-white/80 px-2 py-0.5 rounded-md text-slate-700">
                  {text(store.storeCode)}
                </span>
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="font-black text-slate-800 text-base">{text(store.storeName)}</h3>
                  <p className="flex items-start gap-1.5 text-xs text-slate-500 mt-1">
                    <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    {text(store.address)}
                  </p>
                  <p className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                    <Phone className="w-3.5 h-3.5 shrink-0" />
                    {text(store.phone)}
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                  <p><span className="block text-[10px] text-slate-400 font-bold">NHÂN SỰ</span><b>{staffCount}</b></p>
                  <p><span className="block text-[10px] text-slate-400 font-bold">QUẢN LÝ</span><b>{managerCount}</b></p>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => setStaffStore(store)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                  >
                    <Users className="w-3.5 h-3.5" /> Nhân viên tại cửa hàng
                  </button>
                  <button
                    onClick={() => openStoreForm(store)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-3 py-2 text-xs font-bold text-slate-900 hover:bg-amber-600"
                  >
                    <Edit className="w-3.5 h-3.5" /> Sửa
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/60 text-[11px] font-bold text-slate-400 uppercase">
              <tr><th className="px-5 py-3">Mã & cửa hàng</th><th className="px-5 py-3">Địa chỉ</th><th className="px-5 py-3">Hotline</th><th className="px-5 py-3">Nhân sự</th><th className="px-5 py-3">Quản lý</th><th className="px-5 py-3">Trạng thái</th><th className="px-5 py-3">Thao tác</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {storeRows.map(({ store, staffCount, managerCount }) => (
                <tr key={store.id} className="hover:bg-slate-50/50">
                  <td className="px-5 py-4"><b>{text(store.storeName)}</b><span className="block text-[11px] text-slate-400 font-mono">{text(store.storeCode)}</span></td>
                  <td className="px-5 py-4 text-slate-600">{text(store.address)}</td>
                  <td className="px-5 py-4 text-slate-600">{text(store.phone)}</td>
                  <td className="px-5 py-4">{staffCount}</td><td className="px-5 py-4">{managerCount}</td>
                  <td className="px-5 py-4"><span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusClass(store.status)}`}>{statusLabel(store.status)}</span></td>
                  <td className="px-5 py-4"><div className="flex gap-1"><button onClick={() => openStoreForm(store)} className="p-2 rounded-lg border border-slate-200 text-slate-600"><Edit className="w-3.5 h-3.5" /></button><button onClick={() => void deleteStore(store)} className="p-2 rounded-lg border border-rose-200 text-rose-700"><Trash2 className="w-3.5 h-3.5" /></button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {storeFormOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <form onSubmit={saveStore} className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between"><h2 className="text-lg font-black text-slate-800">{editingStore ? "Sửa cửa hàng" : "Thêm cửa hàng"}</h2><button type="button" onClick={closeStoreForm} className="text-slate-400 text-xl">×</button></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {([["storeCode", "Mã cửa hàng"], ["storeName", "Tên cửa hàng"], ["address", "Địa chỉ"], ["phone", "Số điện thoại"], ["note", "Ghi chú"]] as const).map(([field, label]) => <label key={field} className="text-xs font-bold text-slate-600">{label}<input required={field === "storeCode" || field === "storeName"} value={storeForm[field] ?? ""} onChange={(event) => setStoreForm({ ...storeForm, [field]: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 font-normal" /></label>)}
              <label className="text-xs font-bold text-slate-600 sm:col-span-2">Ảnh cửa hàng<input type="file" accept="image/*" onChange={(event) => selectLogo(event.target.files?.[0] ?? null)} className="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2 font-normal text-xs" />{logoFile && <span className="mt-1 block text-[11px] font-normal text-slate-500">{logoFile.name}</span>}{logoPreview && <img src={logoPreview} alt="Xem trước logo cửa hàng" className="mt-3 h-32 w-full rounded-xl border border-slate-200 object-cover" />}</label>
              <label className="text-xs font-bold text-slate-600">Trạng thái<select value={storeForm.status} onChange={(event) => setStoreForm({ ...storeForm, status: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 font-normal"><option value="ACTIVE">ACTIVE</option><option value="INACTIVE">INACTIVE</option><option value="OPENING">OPENING</option></select></label>
            </div>
            <div className="flex justify-end gap-2"><button type="button" onClick={closeStoreForm} className="rounded-xl border px-4 py-2 text-sm">Hủy</button><button disabled={saving} className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-bold disabled:opacity-50">{saving ? "Đang lưu..." : "Lưu"}</button></div>
          </form>
        </div>
      ) : null}
      {staffStore ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-black text-slate-800">Nhân viên tại {text(staffStore.storeName)}</h2>
                <p className="text-xs text-slate-500 mt-1">Danh sách nhân viên đang được phân bổ tại cửa hàng này.</p>
              </div>
              <button type="button" onClick={() => setStaffStore(null)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100" aria-label="Đóng"><X className="w-5 h-5" /></button>
            </div>
            <div className="mt-4 max-h-80 space-y-2 overflow-y-auto">
              {assignments.filter((assignment) => assignment.storeId === staffStore.id && (!assignment.status || assignment.status.toUpperCase() === "ACTIVE")).map((assignment) => {
                const employee = employees.find((item) => item.id === assignment.employeeId);
                const isManager = managers.some((manager) => manager.storeId === staffStore.id && manager.employeeId === assignment.employeeId);
                return <div key={assignment.employeeStoreId} className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3"><div><p className="text-sm font-bold text-slate-800">{text(employee?.fullName, `Nhân viên #${assignment.employeeId}`)}</p><p className="text-xs text-slate-500">{text(employee?.employeeCode)} · {text(employee?.phone)}</p></div><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${isManager ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-600"}`}>{isManager ? "QUẢN LÝ" : "NHÂN VIÊN"}</span></div>;
              })}
              {assignments.filter((assignment) => assignment.storeId === staffStore.id && (!assignment.status || assignment.status.toUpperCase() === "ACTIVE")).length === 0 && <p className="py-8 text-center text-sm text-slate-500">Chưa có nhân viên đang làm tại cửa hàng này.</p>}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
