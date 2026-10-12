"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Edit,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Users,
  X,
  Sparkles,
  Upload,
  User as UserIcon,
  Eye,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building2,
  ShieldCheck,
  Clock,
  Briefcase,
  Copy,
  Check,
  CreditCard,
  Maximize2,
  ExternalLink,
  Camera,
  Image as ImageIcon,
} from "lucide-react";
import {
  EmployeeResponse,
  EmployeeRequest,
  EmployeeStoreResponse,
  StoreManagerResponse,
  StoreResponse,
  managerApi,
  API_BASE_URL,
} from "@/lib/managerApi";

function DefaultAvatarIllustration({
  className = "w-full h-full",
  gender,
}: {
  className?: string;
  gender?: string | null;
}) {
  const isFemale = gender?.toUpperCase() === "FEMALE";
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fed7aa" />
          <stop offset="100%" stopColor="#fb923c" />
        </linearGradient>
        <linearGradient id="shirtGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#c2410c" />
        </linearGradient>
      </defs>
      {/* Background circle */}
      <circle cx="50" cy="50" r="50" fill="url(#bgGrad)" />

      {/* Torso / Shoulders */}
      <path
        d="M18 96C18 78 32 68 50 68C68 68 82 78 82 96"
        fill="url(#shirtGrad)"
      />
      {/* Neck */}
      <path
        d="M42 56H58V69C58 73.4 54.4 77 50 77C45.6 77 42 73.4 42 69V56Z"
        fill="#fed7aa"
      />
      {/* Collar accent */}
      <path
        d="M40 68L50 79L60 68"
        stroke="#ffedd5"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Head / Face */}
      <circle cx="50" cy="42" r="19" fill="#fde68a" />

      {/* Hair */}
      {isFemale ? (
        <path
          d="M31 43C29 30 38 21 50 21C62 21 71 30 69 43C69 49 67 55 65 58C63 53 61 38 50 38C39 38 37 53 35 58C33 55 31 49 31 43Z"
          fill="#451a03"
        />
      ) : (
        <path
          d="M31 41C31 29 40 22 50 22C60 22 69 29 69 41C69 42 65 37 60 36C54 35 51 37 50 37C49 37 46 35 40 36C35 37 31 42 31 41Z"
          fill="#374151"
        />
      )}

      {/* Eyes */}
      <circle cx="44" cy="44" r="2.2" fill="#1f2937" />
      <circle cx="56" cy="44" r="2.2" fill="#1f2937" />

      {/* Cheeks */}
      <circle cx="41" cy="48" r="2" fill="#fca5a5" opacity="0.6" />
      <circle cx="59" cy="48" r="2" fill="#fca5a5" opacity="0.6" />

      {/* Smile */}
      <path
        d="M46 50C48 52.5 52 52.5 54 50"
        stroke="#1f2937"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

const resolveImageUrl = (imgOrId?: string | number | null) => {
  if (!imgOrId) return null;
  const str = String(imgOrId).trim();
  if (!str) return null;
  if (str.startsWith("http://") || str.startsWith("https://") || str.startsWith("data:")) {
    return str;
  }
  if (/^\d+$/.test(str)) {
    return managerApi.getAttachmentFileUrl(str);
  }
  if (str.startsWith("/")) {
    return `${API_BASE_URL}${str}`;
  }
  return managerApi.getAttachmentFileUrl(str);
};

const value = (input: unknown, fallback = "Chưa cập nhật") =>
  input === null || input === undefined || String(input).trim() === ""
    ? fallback
    : String(input);

const date = (input: string | null | undefined) =>
  input ? new Date(input).toLocaleDateString("vi-VN") : "Chưa cập nhật";

const dateTime = (input: string | null | undefined) =>
  input ? new Date(input).toLocaleString("vi-VN") : "Chưa cập nhật";

const genderName = (gender: string | null | undefined) =>
  ({ MALE: "Nam", FEMALE: "Nữ", OTHER: "Khác" }[gender?.toUpperCase() ?? ""] ??
  value(gender, "Chưa cập nhật"));

const statusName = (status: string | null | undefined) =>
  ({ ACTIVE: "ĐANG LÀM VIỆC", INACTIVE: "TẠM NGƯNG", RESIGNED: "ĐÃ NGHỈ VIỆC" }[
    status?.toUpperCase() ?? ""
  ] ?? value(status, "CHƯA CẬP NHẬT"));

const emptyEmployeeForm: EmployeeRequest = {
  userId: undefined,
  employeeCode: "",
  fullName: "",
  avatar: "",
  idCardFrontId: null,
  idCardBackId: null,
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
  const [successMsg, setSuccessMsg] = useState("");
  const [editingEmployee, setEditingEmployee] = useState<EmployeeResponse | null>(null);
  const [employeeForm, setEmployeeForm] = useState<EmployeeRequest>(emptyEmployeeForm);
  const [employeeFormOpen, setEmployeeFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingFront, setUploadingFront] = useState(false);
  const [uploadingBack, setUploadingBack] = useState(false);
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);
  const [avatarImgError, setAvatarImgError] = useState(false);
  const [assignmentStoreId, setAssignmentStoreId] = useState("ALL");
  const [assignmentRole, setAssignmentRole] = useState<"ALL" | "MANAGER" | "EMPLOYEE">("ALL");
  const [assignmentStatus, setAssignmentStatus] = useState("ALL");
  const [assignmentPrimary, setAssignmentPrimary] = useState("ALL");
  const [viewingProfile, setViewingProfile] = useState<EmployeeResponse | null>(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [loadingProfileDetail, setLoadingProfileDetail] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
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

  const openEmployeeProfile = async (employee: EmployeeResponse) => {
    setViewingProfile(employee);
    setProfileModalOpen(true);
    setCopiedCode(false);
    setAvatarImgError(false);
    setLoadingProfileDetail(true);
    try {
      const res = await managerApi.getEmployee(employee.id);
      if (res.data) {
        setViewingProfile(res.data);
      }
    } catch {
      // Keep existing employee state if detail request fails
    } finally {
      setLoadingProfileDetail(false);
    }
  };

  const copyEmployeeCode = (code: string) => {
    if (!code) return;
    void navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const openEmployeeForm = (employee?: EmployeeResponse) => {
    setEditingEmployee(employee ?? null);
    setEmployeeFormOpen(true);
    setError("");
    setSuccessMsg("");
    setEmployeeForm({
      userId: employee?.userId ?? undefined,
      employeeCode: employee?.employeeCode ?? "",
      fullName: employee?.fullName ?? "",
      avatar: (employee?.avatar as string) ?? "",
      idCardFrontId: employee?.idCardFrontId ?? null,
      idCardBackId: employee?.idCardBackId ?? null,
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

  const handleAvatarFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    setError("");
    try {
      const res = await managerApi.uploadAttachment(file);
      const url =
        res.data.url ||
        (res.data.attachmentId ? managerApi.getAttachmentFileUrl(res.data.attachmentId) : "") ||
        res.data.filePath ||
        "";
      if (url) {
        setEmployeeForm((prev) => ({ ...prev, avatar: url }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Tải ảnh đại diện thất bại");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleIdCardFrontFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadingFront(true);
    setError("");
    try {
      const res = await managerApi.uploadAttachment(file);
      if (res.data?.attachmentId) {
        setEmployeeForm((prev) => ({ ...prev, idCardFrontId: res.data.attachmentId }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Tải ảnh CCCD mặt trước thất bại");
    } finally {
      setUploadingFront(false);
    }
  };

  const handleIdCardBackFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadingBack(true);
    setError("");
    try {
      const res = await managerApi.uploadAttachment(file);
      if (res.data?.attachmentId) {
        setEmployeeForm((prev) => ({ ...prev, idCardBackId: res.data.attachmentId }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Tải ảnh CCCD mặt sau thất bại");
    } finally {
      setUploadingBack(false);
    }
  };

  const handleDirectAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !viewingProfile) return;
    setUploadingAvatar(true);
    setError("");
    try {
      const res = await managerApi.uploadAttachment(file);
      const newAvatar =
        res.data.url ||
        (res.data.attachmentId ? managerApi.getAttachmentFileUrl(res.data.attachmentId) : "") ||
        res.data.filePath ||
        "";
      if (newAvatar) {
        await managerApi.updateEmployee(viewingProfile.id, {
          employeeCode: viewingProfile.employeeCode ?? "",
          fullName: viewingProfile.fullName ?? "",
          status: viewingProfile.status ?? "ACTIVE",
          userId: viewingProfile.userId ?? undefined,
          dateOfBirth: viewingProfile.dateOfBirth ?? undefined,
          gender: viewingProfile.gender ?? undefined,
          email: viewingProfile.email ?? undefined,
          phone: viewingProfile.phone ?? undefined,
          address: viewingProfile.address ?? undefined,
          hireDate: viewingProfile.hireDate ?? undefined,
          note: viewingProfile.note ?? undefined,
          idCardFrontId: viewingProfile.idCardFrontId,
          idCardBackId: viewingProfile.idCardBackId,
          avatar: newAvatar,
        });
        setViewingProfile((prev) => (prev ? { ...prev, avatar: newAvatar } : null));
        setEmployees((prev) =>
          prev.map((emp) => (emp.id === viewingProfile.id ? { ...emp, avatar: newAvatar } : emp))
        );
        setAvatarImgError(false);
        setSuccessMsg("Cập nhật ảnh đại diện thành công!");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Cập nhật ảnh đại diện thất bại");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleDirectIdCardUpload = async (
    type: "front" | "back",
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !viewingProfile) return;
    if (type === "front") setUploadingFront(true);
    else setUploadingBack(true);
    setError("");
    try {
      const res = await managerApi.uploadAttachment(file);
      const attachmentId = res.data?.attachmentId;
      if (attachmentId) {
        const updatePayload: EmployeeRequest = {
          employeeCode: viewingProfile.employeeCode ?? "",
          fullName: viewingProfile.fullName ?? "",
          status: viewingProfile.status ?? "ACTIVE",
          userId: viewingProfile.userId ?? undefined,
          avatar: (viewingProfile.avatar as string) ?? undefined,
          dateOfBirth: viewingProfile.dateOfBirth ?? undefined,
          gender: viewingProfile.gender ?? undefined,
          email: viewingProfile.email ?? undefined,
          phone: viewingProfile.phone ?? undefined,
          address: viewingProfile.address ?? undefined,
          hireDate: viewingProfile.hireDate ?? undefined,
          note: viewingProfile.note ?? undefined,
          idCardFrontId: type === "front" ? attachmentId : viewingProfile.idCardFrontId,
          idCardBackId: type === "back" ? attachmentId : viewingProfile.idCardBackId,
        };
        await managerApi.updateEmployee(viewingProfile.id, updatePayload);
        setViewingProfile((prev) =>
          prev
            ? {
                ...prev,
                ...(type === "front" ? { idCardFrontId: attachmentId } : { idCardBackId: attachmentId }),
              }
            : null
        );
        setEmployees((prev) =>
          prev.map((emp) =>
            emp.id === viewingProfile.id
              ? {
                  ...emp,
                  ...(type === "front" ? { idCardFrontId: attachmentId } : { idCardBackId: attachmentId }),
                }
              : emp
          )
        );
        setSuccessMsg(`Cập nhật ảnh CCCD mặt ${type === "front" ? "trước" : "sau"} thành công!`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Cập nhật ảnh CCCD thất bại");
    } finally {
      if (type === "front") setUploadingFront(false);
      else setUploadingBack(false);
    }
  };

  const saveEmployee = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!employeeForm.fullName?.trim() || !employeeForm.employeeCode?.trim()) {
      setError("Vui lòng nhập đầy đủ Mã nhân viên và Họ tên.");
      return;
    }

    if (!editingEmployee && !employeeForm.email?.trim()) {
      setError("Vui lòng nhập Email để hệ thống tạo tài khoản User và gửi thông tin đăng nhập cho nhân viên.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccessMsg("");
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
      setSuccessMsg(
        editingEmployee
          ? "Cập nhật hồ sơ nhân viên thành công!"
          : "Tạo nhân viên thành công! Hệ thống đã tạo tài khoản và gửi email thông tin đăng nhập."
      );
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
    setSuccessMsg("");
    try {
      await managerApi.deleteEmployee(employee.id);
      setSuccessMsg(`Đã xóa nhân viên "${value(employee.fullName)}" thành công.`);
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
            Hồ sơ nhân viên, phân bổ cửa hàng và tự động cấp tài khoản đăng nhập qua Email.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => openEmployeeForm()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-900 text-xs font-bold transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> Thêm nhân viên
          </button>
          <button
            onClick={() => void loadData()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Làm mới
          </button>
        </div>

        {employeeFormOpen ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-xs">
            <form
              onSubmit={saveEmployee}
              className="w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-lg font-black text-slate-800">
                    {editingEmployee ? "Sửa hồ sơ nhân viên" : "Thêm mới nhân viên"}
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    {editingEmployee
                      ? `Cập nhật thông tin nhân viên ${editingEmployee.fullName}`
                      : "Điền thông tin nhân viên để tạo hồ sơ và tự động kích hoạt tài khoản"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setEmployeeFormOpen(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100 text-slate-400 hover:text-slate-700 text-xl font-bold transition-colors"
                >
                  ×
                </button>
              </div>

              {!editingEmployee ? (
                <div className="p-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 rounded-xl text-xs text-amber-900 flex items-start gap-2.5 shadow-xs">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-amber-950">Tự động khởi tạo tài khoản & gửi Email:</strong>
                    <p className="text-amber-800 text-[11px] mt-0.5">
                      Hệ thống sẽ tự động tạo tài khoản User (quyền Nhân viên) và gửi Email chứa tên đăng nhập & mật khẩu khởi tạo trực tiếp đến Email dưới đây.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-center justify-between">
                  <span>User ID liên kết: <strong className="font-mono text-slate-800">#{employeeForm.userId ?? "Chưa có"}</strong></span>
                  <span className="text-[11px] text-slate-400 font-medium">Hồ sơ: {editingEmployee.employeeCode}</span>
                </div>
              )}

              {/* Avatar upload / input */}
              <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="w-14 h-14 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                  {employeeForm.avatar ? (
                    <img
                      src={employeeForm.avatar}
                      alt="Avatar Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <DefaultAvatarIllustration
                      gender={employeeForm.gender}
                      className="w-full h-full"
                    />
                  )}
                </div>
                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700">Ảnh đại diện (Avatar)</label>
                    {employeeForm.avatar && (
                      <button
                        type="button"
                        onClick={() => setEmployeeForm({ ...employeeForm, avatar: "" })}
                        className="text-[11px] text-rose-600 hover:underline"
                      >
                        Xóa ảnh
                      </button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Dán URL ảnh hoặc nhấn Tải ảnh..."
                      value={employeeForm.avatar ?? ""}
                      onChange={(e) => setEmployeeForm({ ...employeeForm, avatar: e.target.value })}
                      className="flex-1 text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-amber-400"
                    />
                    <label className="px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 cursor-pointer flex items-center gap-1.5 shrink-0 transition-colors shadow-xs">
                      <Upload className="w-3.5 h-3.5 text-slate-500" />
                      <span>{uploadingAvatar ? "Đang tải..." : "Tải ảnh"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={uploadingAvatar}
                        onChange={handleAvatarFileChange}
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="text-xs font-bold text-slate-700">
                  Mã nhân viên <span className="text-rose-500">*</span>
                  <input
                    required
                    type="text"
                    placeholder="VD: NV001"
                    value={employeeForm.employeeCode ?? ""}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, employeeCode: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 font-normal text-xs"
                  />
                </label>

                <label className="text-xs font-bold text-slate-700">
                  Họ và tên <span className="text-rose-500">*</span>
                  <input
                    required
                    type="text"
                    placeholder="VD: Nguyễn Văn A"
                    value={employeeForm.fullName ?? ""}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, fullName: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 font-normal text-xs"
                  />
                </label>

                <label className="text-xs font-bold text-slate-700">
                  Email {!editingEmployee && <span className="text-rose-500">* (để nhận mật khẩu)</span>}
                  <input
                    required={!editingEmployee}
                    type="email"
                    placeholder="nhanvien@gmail.com"
                    value={employeeForm.email ?? ""}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, email: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 font-normal text-xs"
                  />
                </label>

                <label className="text-xs font-bold text-slate-700">
                  Số điện thoại
                  <input
                    type="text"
                    placeholder="VD: 0987654321"
                    value={employeeForm.phone ?? ""}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, phone: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 font-normal text-xs"
                  />
                </label>

                <label className="text-xs font-bold text-slate-700">
                  Ngày sinh
                  <input
                    type="date"
                    value={employeeForm.dateOfBirth ?? ""}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, dateOfBirth: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 font-normal text-xs"
                  />
                </label>

                <label className="text-xs font-bold text-slate-700">
                  Giới tính
                  <select
                    value={employeeForm.gender ?? ""}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, gender: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 font-normal text-xs"
                  >
                    <option value="">Chọn giới tính</option>
                    <option value="MALE">Nam</option>
                    <option value="FEMALE">Nữ</option>
                    <option value="OTHER">Khác</option>
                  </select>
                </label>

                <label className="text-xs font-bold text-slate-700">
                  Ngày bắt đầu làm việc
                  <input
                    type="date"
                    value={employeeForm.hireDate ?? ""}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, hireDate: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 font-normal text-xs"
                  />
                </label>

                <label className="text-xs font-bold text-slate-700">
                  Trạng thái làm việc
                  <select
                    value={employeeForm.status}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, status: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 font-normal text-xs"
                  >
                    <option value="ACTIVE">ACTIVE (Đang làm việc)</option>
                    <option value="INACTIVE">INACTIVE (Tạm ngưng)</option>
                    <option value="RESIGNED">RESIGNED (Đã nghỉ việc)</option>
                  </select>
                </label>

                <label className="text-xs font-bold text-slate-700 sm:col-span-2">
                  Địa chỉ
                  <input
                    type="text"
                    placeholder="VD: 123 Nguyễn Văn Cừ, Quận 5, TP.HCM"
                    value={employeeForm.address ?? ""}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, address: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 font-normal text-xs"
                  />
                </label>

                {/* Ảnh Căn cước công dân (CCCD / CMND) */}
                <div className="sm:col-span-2 p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-amber-500" />
                      Ảnh Căn cước công dân (CCCD / CMND)
                    </label>
                    <span className="text-[11px] text-slate-400">Tùy chọn tải lên định danh nhân sự</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Mặt trước */}
                    <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-amber-500"></span> Mặt trước
                        </span>
                        {employeeForm.idCardFrontId ? (
                          <button
                            type="button"
                            onClick={() => setEmployeeForm((prev) => ({ ...prev, idCardFrontId: null }))}
                            className="text-[11px] text-rose-600 hover:underline"
                          >
                            Xóa ảnh
                          </button>
                        ) : null}
                      </div>
                      {employeeForm.idCardFrontId ? (
                        <div className="relative aspect-[16/10] rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
                          <img
                            src={managerApi.getAttachmentFileUrl(employeeForm.idCardFrontId)}
                            alt="CCCD Mặt trước"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="aspect-[16/10] rounded-lg border border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center text-slate-400 text-[11px]">
                          <CreditCard className="w-5 h-5 mb-1 text-slate-300" />
                          <span>Chưa có ảnh mặt trước</span>
                        </div>
                      )}
                      <label className="w-full py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 cursor-pointer flex items-center justify-center gap-1.5 transition-colors">
                        <Upload className="w-3.5 h-3.5 text-slate-500" />
                        <span>
                          {uploadingFront
                            ? "Đang tải..."
                            : employeeForm.idCardFrontId
                            ? "Đổi ảnh mặt trước"
                            : "Tải ảnh mặt trước"}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={uploadingFront}
                          onChange={handleIdCardFrontFileChange}
                        />
                      </label>
                    </div>

                    {/* Mặt sau */}
                    <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-orange-500"></span> Mặt sau
                        </span>
                        {employeeForm.idCardBackId ? (
                          <button
                            type="button"
                            onClick={() => setEmployeeForm((prev) => ({ ...prev, idCardBackId: null }))}
                            className="text-[11px] text-rose-600 hover:underline"
                          >
                            Xóa ảnh
                          </button>
                        ) : null}
                      </div>
                      {employeeForm.idCardBackId ? (
                        <div className="relative aspect-[16/10] rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
                          <img
                            src={managerApi.getAttachmentFileUrl(employeeForm.idCardBackId)}
                            alt="CCCD Mặt sau"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="aspect-[16/10] rounded-lg border border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center text-slate-400 text-[11px]">
                          <CreditCard className="w-5 h-5 mb-1 text-slate-300" />
                          <span>Chưa có ảnh mặt sau</span>
                        </div>
                      )}
                      <label className="w-full py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 cursor-pointer flex items-center justify-center gap-1.5 transition-colors">
                        <Upload className="w-3.5 h-3.5 text-slate-500" />
                        <span>
                          {uploadingBack
                            ? "Đang tải..."
                            : employeeForm.idCardBackId
                            ? "Đổi ảnh mặt sau"
                            : "Tải ảnh mặt sau"}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={uploadingBack}
                          onChange={handleIdCardBackFileChange}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <label className="text-xs font-bold text-slate-700">
                  Cửa hàng phân bổ
                  <select
                    value={employeeStoreForm.storeId}
                    onChange={(e) => setEmployeeStoreForm({ ...employeeStoreForm, storeId: Number(e.target.value) })}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 font-normal text-xs"
                  >
                    <option value={0}>Chưa phân bổ</option>
                    {stores.map((store) => (
                      <option key={store.id} value={store.id}>
                        {value(store.storeName)} ({value(store.storeCode)})
                      </option>
                    ))}
                  </select>
                </label>

                <label className="text-xs font-bold text-slate-700">
                  Ngày bắt đầu tại cửa hàng
                  <input
                    type="date"
                    value={employeeStoreForm.startDate}
                    onChange={(e) => setEmployeeStoreForm({ ...employeeStoreForm, startDate: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 font-normal text-xs"
                  />
                </label>

                <label className="text-xs font-bold text-slate-700 sm:col-span-2">
                  Ghi chú
                  <textarea
                    rows={2}
                    placeholder="Ghi chú thêm về nhân viên..."
                    value={employeeForm.note ?? ""}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, note: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 font-normal text-xs"
                  />
                </label>
              </div>

              {error && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs text-rose-700">
                  {error}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEmployeeFormOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  disabled={saving || uploadingAvatar}
                  className="rounded-xl bg-amber-500 hover:bg-amber-600 px-5 py-2 text-xs font-bold text-slate-900 disabled:opacity-50 transition-colors shadow-xs"
                >
                  {saving ? "Đang lưu..." : editingEmployee ? "Cập nhật" : "Tạo nhân viên"}
                </button>
              </div>
            </form>
          </div>
        ) : null}
      </div>

      {successMsg && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-800 font-medium flex items-center justify-between">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg("")} className="text-emerald-600 hover:text-emerald-900 font-bold">×</button>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError("")} className="text-rose-500 hover:text-rose-800 font-bold">×</button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Tổng nhân sự", count: employees.length },
          { label: "Đang làm việc", count: employees.filter((employee) => employee.status?.toUpperCase() === "ACTIVE").length },
          { label: "Đang giữ vai trò quản lý", count: managerIds.size },
        ].map(({ label, count }) => (
          <div key={label} className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500">{label}</span>
              <div className="text-3xl font-black text-slate-800 mt-1">{count}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50/50 border-b border-slate-100 overflow-x-auto">
          <div className="flex min-w-max flex-nowrap items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Tìm tên, mã, email, số điện thoại..."
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
            >
              <option value="ALL">Trạng thái: Tất cả</option>
              <option value="ACTIVE">Đang làm việc</option>
              <option value="INACTIVE">Tạm ngưng</option>
              <option value="RESIGNED">Đã nghỉ việc</option>
            </select>

            <select
              value={assignmentStoreId}
              onChange={(event) => setAssignmentStoreId(event.target.value)}
              className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
            >
              <option value="ALL">Cửa hàng: Tất cả</option>
              {stores.map((store) => (
                <option key={store.id} value={store.id}>
                  {value(store.storeName)}
                </option>
              ))}
            </select>

            <select
              value={assignmentRole}
              onChange={(event) => setAssignmentRole(event.target.value as "ALL" | "MANAGER" | "EMPLOYEE")}
              className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
            >
              <option value="ALL">Vai trò: Tất cả</option>
              <option value="MANAGER">Quản lý</option>
              <option value="EMPLOYEE">Nhân viên</option>
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
              className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
              Đặt lại
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-10 text-center text-sm text-slate-500">Đang tải dữ liệu nhân sự...</div>
        ) : filteredEmployees.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500">Không có dữ liệu nhân sự từ API.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/60 text-[11px] font-bold text-slate-400 uppercase">
                <tr>
                  <th className="px-5 py-3">Nhân viên</th>
                  <th className="px-5 py-3">Email / điện thoại</th>
                  <th className="px-5 py-3">Cửa hàng phụ trách</th>
                  <th className="px-5 py-3">Ngày bắt đầu</th>
                  <th className="px-5 py-3">Trạng thái</th>
                  <th className="px-5 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredEmployees.map((employee) => {
                  const employeeAssignments = assignmentsByEmployee.get(employee.id) ?? [];
                  const resolvedAvatar = resolveImageUrl(employee.avatar);
                  return (
                    <tr key={employee.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-4">
                        <div
                          onClick={() => void openEmployeeProfile(employee)}
                          className="flex items-center gap-3 cursor-pointer group"
                          title="Nhấp để xem hồ sơ chi tiết"
                        >
                          <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-200 shrink-0 shadow-xs group-hover:ring-2 group-hover:ring-amber-400 transition-all flex items-center justify-center bg-amber-50">
                            {resolvedAvatar ? (
                              <img
                                src={resolvedAvatar}
                                alt={employee.fullName || "Avatar"}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <DefaultAvatarIllustration
                                gender={employee.gender}
                                className="w-full h-full"
                              />
                            )}
                          </div>
                          <div>
                            <b className="text-sm text-slate-800 group-hover:text-amber-600 transition-colors">
                              {value(employee.fullName)}
                            </b>
                            <span className="block text-[11px] text-slate-400 font-mono">
                              Mã: {value(employee.employeeCode)}
                              {managerIds.has(employee.id) ? " · QUẢN LÝ" : ""}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {value(employee.email)}
                        <span className="block text-slate-400">{value(employee.phone)}</span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-1.5">
                          {employeeAssignments.length ? (
                            employeeAssignments.map((assignment) => (
                              <span
                                key={assignment.employeeStoreId}
                                className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200/60"
                              >
                                {value(storeMap.get(assignment.storeId)?.storeName, `Store #${assignment.storeId}`)}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-400">Chưa phân bổ</span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-500">{date(employee.hireDate)}</td>
                      <td className="px-5 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            employee.status?.toUpperCase() === "ACTIVE"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-slate-100 text-slate-600 border border-slate-200"
                          }`}
                        >
                          {statusName(employee.status)}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => void openEmployeeProfile(employee)}
                            className="p-2 rounded-lg border border-slate-200 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-700 text-slate-600 transition-colors"
                            title="Xem hồ sơ nhân viên"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => openEmployeeForm(employee)}
                            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
                            title="Sửa"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => void deleteEmployee(employee)}
                            className="p-2 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-700 transition-colors"
                            title="Xóa"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {/* Profile Modal */}
      {profileModalOpen && viewingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl max-h-[92vh] flex flex-col rounded-3xl bg-white shadow-2xl overflow-hidden border border-slate-200/80">
            {/* Modal Header with rich gradient banner */}
            <div className="relative bg-gradient-to-r from-amber-500 via-amber-600 to-orange-500 p-6 text-white shrink-0">
              <button
                type="button"
                onClick={() => setProfileModalOpen(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-black/15 hover:bg-black/30 flex items-center justify-center text-white transition-colors"
                title="Đóng"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                {/* Large Avatar */}
                <div className="w-20 h-20 rounded-2xl ring-4 ring-white/30 bg-white/20 shadow-lg flex items-center justify-center overflow-hidden shrink-0">
                  {viewingProfile.avatar ? (
                    <img
                      src={viewingProfile.avatar}
                      alt={viewingProfile.fullName || "Avatar"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-black text-white">
                      {value(viewingProfile.fullName, "?").slice(0, 1).toUpperCase()}
                    </span>
                  )}
                </div>

                {/* Name & Quick Badges */}
                <div className="flex-1 space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-black text-white tracking-tight truncate">
                      {value(viewingProfile.fullName)}
                    </h2>
                    {loadingProfileDetail && (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-white/70" />
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Employee Code with Copy Button */}
                    <button
                      type="button"
                      onClick={() => copyEmployeeCode(viewingProfile.employeeCode ?? "")}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/20 hover:bg-black/30 text-white font-mono text-xs font-semibold backdrop-blur-xs transition-colors"
                      title="Nhấn để sao chép mã NV"
                    >
                      <span>Mã: {value(viewingProfile.employeeCode)}</span>
                      {copiedCode ? (
                        <Check className="w-3 h-3 text-emerald-300" />
                      ) : (
                        <Copy className="w-3 h-3 text-white/70" />
                      )}
                    </button>

                    {/* Role Badge */}
                    {managerIds.has(viewingProfile.id) ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-900/40 border border-indigo-300/30 text-indigo-100 text-xs font-bold">
                        <ShieldCheck className="w-3.5 h-3.5" /> Quản lý cửa hàng
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/20 border border-white/20 text-white text-xs font-bold">
                        <Briefcase className="w-3.5 h-3.5" /> Nhân viên
                      </span>
                    )}

                    {/* Status Badge */}
                    <span
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                        viewingProfile.status?.toUpperCase() === "ACTIVE"
                          ? "bg-emerald-500 text-white"
                          : viewingProfile.status?.toUpperCase() === "INACTIVE"
                          ? "bg-amber-400 text-slate-950"
                          : "bg-rose-500 text-white"
                      }`}
                    >
                      {statusName(viewingProfile.status)}
                    </span>
                  </div>

                  {/* Fast Contact Links */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-amber-100/90 pt-1">
                    {viewingProfile.email && (
                      <a
                        href={`mailto:${viewingProfile.email}`}
                        className="inline-flex items-center gap-1 hover:text-white hover:underline transition-colors"
                      >
                        <Mail className="w-3.5 h-3.5" /> {viewingProfile.email}
                      </a>
                    )}
                    {viewingProfile.phone && (
                      <a
                        href={`tel:${viewingProfile.phone}`}
                        className="inline-flex items-center gap-1 hover:text-white hover:underline transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5" /> {viewingProfile.phone}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Body: Scrollable sections */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
              {/* Section 1: Thông tin cá nhân */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2 text-slate-800 font-bold text-xs">
                  <UserIcon className="w-4 h-4 text-amber-500" />
                  <span>Thông tin cá nhân</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Họ và tên</span>
                    <span className="font-semibold text-slate-700">{value(viewingProfile.fullName)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Mã nhân sự</span>
                    <span className="font-mono font-semibold text-slate-700">{value(viewingProfile.employeeCode)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Giới tính</span>
                    <span className="font-medium text-slate-700">{genderName(viewingProfile.gender)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Ngày sinh</span>
                    <span className="font-medium text-slate-700">{date(viewingProfile.dateOfBirth)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Ngày bắt đầu làm việc</span>
                    <span className="font-medium text-slate-700">{date(viewingProfile.hireDate)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">CCCD / CMND</span>
                    <span className="font-medium text-slate-700">
                      {viewingProfile.idCardFrontId || viewingProfile.idCardBackId
                        ? "Đã lưu trữ hồ sơ định danh"
                        : "Chưa cập nhật"}
                    </span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-slate-400 block text-[11px]">Địa chỉ liên hệ</span>
                    <div className="flex items-start gap-1.5 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span className="text-slate-700">{value(viewingProfile.address)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Tài khoản hệ thống & Đăng nhập */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2 text-slate-800 font-bold text-xs">
                  <ShieldCheck className="w-4 h-4 text-indigo-500" />
                  <span>Tài khoản hệ thống & Đăng nhập</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">User ID liên kết</span>
                    {viewingProfile.userId ? (
                      <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">
                        #{viewingProfile.userId}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">Chưa liên kết User ID</span>
                    )}
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Email đăng nhập</span>
                    <span className="font-medium text-slate-700">{value(viewingProfile.email)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Số điện thoại liên hệ</span>
                    <span className="font-medium text-slate-700">{value(viewingProfile.phone)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Vai trò tài khoản</span>
                    <span className="font-medium text-slate-700">
                      {managerIds.has(viewingProfile.id) ? "Quản lý (Store Manager)" : "Nhân viên (Staff)"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Section 3: Phân bổ cửa hàng công tác */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2 text-slate-800 font-bold text-xs">
                    <Building2 className="w-4 h-4 text-emerald-500" />
                    <span>Cửa hàng phân bổ công tác</span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {(assignmentsByEmployee.get(viewingProfile.id) ?? []).length} chi nhánh
                  </span>
                </div>

                {(() => {
                  const empAssignments = assignmentsByEmployee.get(viewingProfile.id) ?? [];
                  if (empAssignments.length === 0) {
                    return (
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-400">
                        Nhân viên hiện chưa được phân bổ vào cửa hàng nào.
                      </div>
                    );
                  }
                  return (
                    <div className="space-y-2">
                      {empAssignments.map((assignment) => {
                        const store = storeMap.get(assignment.storeId);
                        return (
                          <div
                            key={assignment.employeeStoreId}
                            className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-xs text-slate-800">
                                  {store?.storeName ?? `Cửa hàng #${assignment.storeId}`}
                                </span>
                                {store?.storeCode && (
                                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200 text-slate-600">
                                    {store.storeCode}
                                  </span>
                                )}
                                {assignment.isPrimary && (
                                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                                    Chi nhánh chính
                                  </span>
                                )}
                              </div>
                              {store?.address && (
                                <p className="text-[11px] text-slate-500 flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                  <span>{store.address}</span>
                                </p>
                              )}
                              <p className="text-[11px] text-slate-400">
                                Bắt đầu: {date(assignment.startDate)}
                                {assignment.endDate ? ` · Kết thúc: ${date(assignment.endDate)}` : " · Đang công tác"}
                              </p>
                            </div>
                            <div className="shrink-0 flex items-center gap-2">
                              <span
                                className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                  assignment.status?.toUpperCase() === "ACTIVE"
                                    ? "bg-emerald-100 text-emerald-800"
                                    : "bg-slate-200 text-slate-600"
                                }`}
                              >
                                {assignment.status ?? "ACTIVE"}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>

              {/* Section 4: Ghi chú & Dấu thời gian */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2 text-slate-800 font-bold text-xs">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>Ghi chú & Dấu thời gian</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Ghi chú hồ sơ</span>
                    <p className="mt-0.5 text-slate-700 bg-slate-50 rounded-xl p-2.5 border border-slate-200/60 text-xs whitespace-pre-wrap">
                      {viewingProfile.note ? viewingProfile.note : "Không có ghi chú thêm."}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px] text-slate-400">
                    <div>
                      Ngày tạo: <span className="text-slate-600 font-medium">{dateTime(viewingProfile.createdAt)}</span>
                    </div>
                    <div>
                      Cập nhật gần nhất:{" "}
                      <span className="text-slate-600 font-medium">{dateTime(viewingProfile.updatedAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between gap-3 p-4 bg-white border-t border-slate-100 shrink-0">
              <button
                type="button"
                onClick={() => setProfileModalOpen(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={() => {
                  setProfileModalOpen(false);
                  openEmployeeForm(viewingProfile);
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 px-4 py-2 text-xs font-bold text-slate-900 transition-colors shadow-xs"
              >
                <Edit className="w-3.5 h-3.5" /> Chỉnh sửa hồ sơ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
