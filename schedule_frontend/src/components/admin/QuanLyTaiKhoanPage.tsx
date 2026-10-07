"use client";

import React, { useState } from "react";
import {
  Users,
  ShieldCheck,
  UserCheck,
  UserX,
  KeyRound,
  Plus,
  Search,
  Filter,
  Check,
  X,
  Edit,
  Lock,
  Unlock,
  RotateCcw,
  Trash2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { UserRoleCode } from "@/types/auth";

interface AccountItem {
  id: number;
  username: string;
  fullName: string;
  email: string;
  phone: string;
  roleCode: UserRoleCode;
  roleName: string;
  storeName: string;
  status: "ACTIVE" | "LOCKED";
  lastLogin: string;
}

const mockAccounts: AccountItem[] = [
  {
    id: 1,
    username: "admin_hoan",
    fullName: "Nguyễn Hoàn (Admin)",
    email: "hoan33356@gmail.com",
    phone: "0900000099",
    roleCode: "ADMIN",
    roleName: "Quản trị viên",
    storeName: "Toàn hệ thống BLOAN",
    status: "ACTIVE",
    lastLogin: "Vừa xong",
  },
  {
    id: 2,
    username: "manager_hai",
    fullName: "Trần Hải Long",
    email: "long.th@bloan.vn",
    phone: "0912345678",
    roleCode: "MANAGER",
    roleName: "Quản lý chuỗi",
    storeName: "Cụm miền Nam (18 CH)",
    status: "ACTIVE",
    lastLogin: "10 phút trước",
  },
  {
    id: 3,
    username: "store_mai",
    fullName: "Lê Thị Mai",
    email: "mai.lt@bloan.vn",
    phone: "0987654321",
    roleCode: "STORE_MANAGER",
    roleName: "Trưởng cửa hàng",
    storeName: "BLOAN · Lê Lợi (Q1)",
    status: "ACTIVE",
    lastLogin: "1 giờ trước",
  },
  {
    id: 4,
    username: "store_nam",
    fullName: "Trần Văn Nam",
    email: "nam.tv@bloan.vn",
    phone: "0977889900",
    roleCode: "STORE_MANAGER",
    roleName: "Trưởng cửa hàng",
    storeName: "BLOAN · Tú Xương (Q3)",
    status: "ACTIVE",
    lastLogin: "3 giờ trước",
  },
  {
    id: 5,
    username: "nv_duong",
    fullName: "Nguyễn Thùy Dương",
    email: "duong.nt@bloan.vn",
    phone: "0944112233",
    roleCode: "EMPLOYEE",
    roleName: "Nhân viên",
    storeName: "BLOAN · Lê Lợi (Q1)",
    status: "ACTIVE",
    lastLogin: "Hôm qua",
  },
  {
    id: 6,
    username: "nv_khanh",
    fullName: "Lý Quốc Khánh",
    email: "khanh.lq@bloan.vn",
    phone: "0933221100",
    roleCode: "EMPLOYEE",
    roleName: "Nhân viên",
    storeName: "BLOAN · Crescent Mall (Q7)",
    status: "LOCKED",
    lastLogin: "3 ngày trước",
  },
];

interface PermissionRow {
  group: string;
  permCode: string;
  name: string;
  desc: string;
  admin: boolean;
  manager: boolean;
  storeManager: boolean;
  employee: boolean;
}

const initialPermissions: PermissionRow[] = [
  // Quản lý người dùng
  {
    group: "Quản lý tài khoản & Nhân sự",
    permCode: "ROLE_USER_VIEW",
    name: "Xem danh sách tài khoản",
    desc: "Xem thông tin người dùng trong phạm vi quản lý",
    admin: true,
    manager: true,
    storeManager: true,
    employee: false,
  },
  {
    group: "Quản lý tài khoản & Nhân sự",
    permCode: "ROLE_USER_CREATE",
    name: "Tạo tài khoản & Nhân viên mới",
    desc: "Đăng ký tài khoản nhân sự mới vào hệ thống",
    admin: true,
    manager: true,
    storeManager: false,
    employee: false,
  },
  {
    group: "Quản lý tài khoản & Nhân sự",
    permCode: "ROLE_USER_UPDATE",
    name: "Cập nhật & Phân quyền tài khoản",
    desc: "Thay đổi chức vụ, mật khẩu hoặc khóa tài khoản",
    admin: true,
    manager: true,
    storeManager: false,
    employee: false,
  },
  {
    group: "Quản lý tài khoản & Nhân sự",
    permCode: "ROLE_USER_DELETE",
    name: "Xóa tài khoản khỏi hệ thống",
    desc: "Quyền xóa vĩnh viễn hồ sơ và dữ liệu tài khoản",
    admin: true,
    manager: false,
    storeManager: false,
    employee: false,
  },
  // Lịch & Ca làm việc
  {
    group: "Lịch & Ca làm việc",
    permCode: "ROLE_SHIFT_SCHEDULE_MANAGE",
    name: "Thiết lập kỳ đăng ký ca",
    desc: "Mở hoặc đóng kỳ đăng ký lịch làm toàn chuỗi",
    admin: true,
    manager: true,
    storeManager: false,
    employee: false,
  },
  {
    group: "Lịch & Ca làm việc",
    permCode: "ROLE_SHIFT_ASSIGN",
    name: "Xếp ca & Phân bổ nhân sự",
    desc: "Xếp ca trực tiếp cho nhân viên cửa hàng phụ trách",
    admin: true,
    manager: true,
    storeManager: true,
    employee: false,
  },
  {
    group: "Lịch & Ca làm việc",
    permCode: "ROLE_SHIFT_APPROVE",
    name: "Duyệt yêu cầu đổi ca / Hủy ca",
    desc: "Phê duyệt các nguyện vọng đổi ca của nhân sự",
    admin: true,
    manager: true,
    storeManager: true,
    employee: false,
  },
  {
    group: "Lịch & Ca làm việc",
    permCode: "ROLE_SHIFT_REGISTER",
    name: "Đăng ký ca làm cá nhân",
    desc: "Nhân viên tự đăng ký ca và xin đổi ca làm",
    admin: true,
    manager: true,
    storeManager: true,
    employee: true,
  },
  // Chấm công & Kỷ luật
  {
    group: "Chấm công & Kỷ luật",
    permCode: "ROLE_ATTENDANCE_OVERRIDE",
    name: "Điều chỉnh dữ liệu chấm công",
    desc: "Sửa giờ check-in/out khi có sai lệch máy quét",
    admin: true,
    manager: true,
    storeManager: true,
    employee: false,
  },
  {
    group: "Chấm công & Kỷ luật",
    permCode: "ROLE_VIOLATION_PENALTY",
    name: "Lập biên bản vi phạm & phạt",
    desc: "Ghi nhận vi phạm nội quy và áp mức phạt",
    admin: true,
    manager: true,
    storeManager: true,
    employee: false,
  },
  // Lương & Tài chính
  {
    group: "Lương & Tài chính",
    permCode: "ROLE_PAYROLL_CONFIG",
    name: "Quản lý quỹ lương & bảng lương",
    desc: "Duyệt chi trả lương và điều chỉnh đơn giá theo giờ",
    admin: true,
    manager: true,
    storeManager: false,
    employee: false,
  },
  {
    group: "Lương & Tài chính",
    permCode: "ROLE_BONUS_APPROVE",
    name: "Phê duyệt phiếu thưởng KPI",
    desc: "Duyệt phiếu thưởng nóng và thưởng chuyên cần",
    admin: true,
    manager: true,
    storeManager: false,
    employee: false,
  },
  // Quản trị hệ thống & Cấu hình
  {
    group: "Cấu hình hệ thống (Admin Only)",
    permCode: "ROLE_SYSTEM_CONFIG",
    name: "Cấu hình thương hiệu, Logo & Sinh mã",
    desc: "Tùy biến nhận diện chuỗi, quy tắc mã tự động",
    admin: true,
    manager: false,
    storeManager: false,
    employee: false,
  },
  {
    group: "Cấu hình hệ thống (Admin Only)",
    permCode: "ROLE_API_MANAGE",
    name: "Quản trị API Keys & Kết nối máy quét",
    desc: "Quản lý secret keys, webhooks và thiết bị ngoại vi",
    admin: true,
    manager: false,
    storeManager: false,
    employee: false,
  },
];

export default function QuanLyTaiKhoanPage() {
  const [activeSubTab, setActiveSubTab] = useState<"accounts" | "matrix">("accounts");
  const [accounts, setAccounts] = useState<AccountItem[]>(mockAccounts);
  const [permissions, setPermissions] = useState<PermissionRow[]>(initialPermissions);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form state
  const [newUsername, setNewUsername] = useState("");
  const [newFullName, setNewFullName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newRole, setNewRole] = useState<UserRoleCode>("EMPLOYEE");
  const [newStore, setNewStore] = useState("BLOAN · Lê Lợi (Q1)");

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername || !newEmail) {
      alert("Vui lòng nhập đầy đủ Tên đăng nhập và Email!");
      return;
    }

    const roleNames: Record<UserRoleCode, string> = {
      ADMIN: "Quản trị viên",
      MANAGER: "Quản lý chuỗi",
      STORE_MANAGER: "Trưởng cửa hàng",
      EMPLOYEE: "Nhân viên",
    };

    const newAcc: AccountItem = {
      id: Date.now(),
      username: newUsername,
      fullName: newFullName || newUsername,
      email: newEmail,
      phone: newPhone || "0900000000",
      roleCode: newRole,
      roleName: roleNames[newRole],
      storeName: newRole === "ADMIN" ? "Toàn hệ thống BLOAN" : newStore,
      status: "ACTIVE",
      lastLogin: "Chưa đăng nhập",
    };

    setAccounts([newAcc, ...accounts]);
    setShowCreateModal(false);
    setNewUsername("");
    setNewFullName("");
    setNewEmail("");
    setNewPhone("");
    alert(`Đã tạo tài khoản thành công cho: ${newUsername}`);
  };

  const toggleStatus = (id: number) => {
    setAccounts(
      accounts.map((acc) =>
        acc.id === id
          ? { ...acc, status: acc.status === "ACTIVE" ? "LOCKED" : "ACTIVE" }
          : acc
      )
    );
  };

  const togglePerm = (permCode: string, role: "admin" | "manager" | "storeManager" | "employee") => {
    setPermissions(
      permissions.map((p) =>
        p.permCode === permCode ? { ...p, [role]: !p[role] } : p
      )
    );
  };

  const filteredAccounts = accounts.filter((acc) => {
    const matchSearch =
      acc.username.toLowerCase().includes(search.toLowerCase()) ||
      acc.fullName.toLowerCase().includes(search.toLowerCase()) ||
      acc.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "ALL" || acc.roleCode === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-lg">
              ADMIN CENTER
            </span>
            <span className="text-slate-400 text-xs">/</span>
            <span className="text-slate-500 text-xs font-semibold">Bảo mật & Người dùng</span>
          </div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight mt-1">
            Quản lý tài khoản & Phân quyền hệ thống
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Thiết lập danh sách tài khoản người dùng, phân cấp quyền hạn theo 4 nhóm vai trò (RBAC) toàn chuỗi Ăn Vặt BLOAN.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setActiveSubTab(activeSubTab === "accounts" ? "matrix" : "accounts")}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-xs"
          >
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            <span>{activeSubTab === "accounts" ? "Ma trận phân quyền" : "Danh sách tài khoản"}</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-900 text-xs font-bold transition-all shadow-sm shadow-amber-200"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo tài khoản mới</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Tổng tài khoản</span>
            <div className="text-2xl sm:text-3xl font-black text-slate-800 mt-1 tracking-tight">
              {accounts.length}
            </div>
            <p className="text-[11px] text-emerald-600 mt-1 font-semibold">
              {accounts.filter((a) => a.status === "ACTIVE").length} Đang hoạt động
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Quản trị viên (ADMIN)</span>
            <div className="text-2xl sm:text-3xl font-black text-slate-800 mt-1 tracking-tight">
              {accounts.filter((a) => a.roleCode === "ADMIN").length}
            </div>
            <p className="text-[11px] text-slate-400 mt-1 font-medium">Toàn quyền hệ thống</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Trưởng cửa hàng & Quản lý</span>
            <div className="text-2xl sm:text-3xl font-black text-slate-800 mt-1 tracking-tight">
              {accounts.filter((a) => a.roleCode === "STORE_MANAGER" || a.roleCode === "MANAGER").length}
            </div>
            <p className="text-[11px] text-slate-400 mt-1 font-medium">Phụ trách 24 chi nhánh</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Tài khoản bị tạm khóa</span>
            <div className="text-2xl sm:text-3xl font-black text-slate-800 mt-1 tracking-tight">
              {accounts.filter((a) => a.status === "LOCKED").length}
            </div>
            <p className="text-[11px] text-rose-500 mt-1 font-semibold">Tạm ngưng quyền truy cập</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <UserX className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 pb-3">
        <button
          onClick={() => setActiveSubTab("accounts")}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === "accounts"
              ? "bg-amber-500 text-slate-900 shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Danh sách tài khoản ({accounts.length})</span>
        </button>
        <button
          onClick={() => setActiveSubTab("matrix")}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === "matrix"
              ? "bg-amber-500 text-slate-900 shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Ma trận phân quyền (RBAC)</span>
        </button>
      </div>

      {activeSubTab === "accounts" ? (
        /* TAB 1: ACCOUNTS LIST */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          {/* Filters */}
          <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm username, họ tên, email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl outline-hidden hover:border-slate-300 focus:border-amber-400 transition-all font-medium text-slate-800"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium text-slate-700 outline-hidden hover:border-slate-300"
              >
                <option value="ALL">Tất cả vai trò</option>
                <option value="ADMIN">ADMIN (Quản trị viên)</option>
                <option value="MANAGER">MANAGER (Quản lý chuỗi)</option>
                <option value="STORE_MANAGER">STORE_MANAGER (Trưởng CH)</option>
                <option value="EMPLOYEE">EMPLOYEE (Nhân viên)</option>
              </select>

              <button
                onClick={() => {
                  setSearch("");
                  setRoleFilter("ALL");
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-bold"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Đặt lại</span>
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/60 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="px-5 py-3">Tài khoản & Người dùng</th>
                  <th className="px-5 py-3">Vai trò hệ thống</th>
                  <th className="px-5 py-3">Phạm vi gán</th>
                  <th className="px-5 py-3">Liên hệ</th>
                  <th className="px-5 py-3">Đăng nhập gần nhất</th>
                  <th className="px-5 py-3 text-center">Trạng thái</th>
                  <th className="px-5 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredAccounts.map((acc) => {
                  const roleBadges: Record<UserRoleCode, { bg: string; text: string; border: string }> = {
                    ADMIN: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
                    MANAGER: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
                    STORE_MANAGER: { bg: "bg-amber-50", text: "text-amber-800", border: "border-amber-200" },
                    EMPLOYEE: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
                  };
                  const badge = roleBadges[acc.roleCode] || roleBadges.EMPLOYEE;

                  return (
                    <tr key={acc.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-900 font-black text-xs flex items-center justify-center border border-amber-200 shrink-0">
                            {acc.username.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 text-sm">{acc.fullName}</p>
                            <p className="text-[11px] text-slate-400 font-mono mt-0.5">@{acc.username}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-black border ${badge.bg} ${badge.text} ${badge.border}`}
                        >
                          {acc.roleCode} · {acc.roleName}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-semibold text-slate-700">{acc.storeName}</td>
                      <td className="px-5 py-4 text-slate-600">
                        <p className="font-medium">{acc.email}</p>
                        <p className="text-[11px] text-slate-400 font-mono">{acc.phone}</p>
                      </td>
                      <td className="px-5 py-4 text-slate-500 font-medium">{acc.lastLogin}</td>
                      <td className="px-5 py-4 text-center">
                        <button
                          onClick={() => toggleStatus(acc.id)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black border transition-all ${
                            acc.status === "ACTIVE"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                              : "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                          }`}
                          title="Nhấn để đổi trạng thái"
                        >
                          {acc.status === "ACTIVE" ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" />
                              <span>HOẠT ĐỘNG</span>
                            </>
                          ) : (
                            <>
                              <Lock className="w-3 h-3" />
                              <span>ĐÃ KHÓA</span>
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => alert(`Đặt lại mật khẩu tạm thời cho @${acc.username}: Bloan@2026`)}
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-amber-600"
                            title="Reset mật khẩu"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => toggleStatus(acc.id)}
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-rose-600"
                            title={acc.status === "ACTIVE" ? "Khóa tài khoản" : "Mở khóa"}
                          >
                            {acc.status === "ACTIVE" ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* TAB 2: PERMISSION MATRIX */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Bảng phân quyền chi tiết (RBAC)</h3>
              <p className="text-[11px] text-slate-400">
                Tích chọn để cấp hoặc thu hồi quyền truy cập đối với từng vai trò người dùng trong hệ thống Ăn Vặt BLOAN.
              </p>
            </div>
            <button
              onClick={() => alert("Đã lưu cấu hình ma trận phân quyền RBAC thành công!")}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold transition-all shadow-xs"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Lưu ma trận quyền</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-5 py-3 w-1/3">Tính năng / Quyền hạn</th>
                  <th className="px-5 py-3 text-center">
                    <span className="text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-md">
                      ADMIN
                    </span>
                  </th>
                  <th className="px-5 py-3 text-center">
                    <span className="text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
                      MANAGER
                    </span>
                  </th>
                  <th className="px-5 py-3 text-center">
                    <span className="text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                      STORE_MANAGER
                    </span>
                  </th>
                  <th className="px-5 py-3 text-center">
                    <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                      EMPLOYEE
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {permissions.map((p, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-slate-800">{p.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">{p.permCode}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{p.desc}</div>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <input
                        type="checkbox"
                        checked={p.admin}
                        onChange={() => togglePerm(p.permCode, "admin")}
                        className="w-4 h-4 rounded accent-red-600 cursor-pointer"
                      />
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <input
                        type="checkbox"
                        checked={p.manager}
                        onChange={() => togglePerm(p.permCode, "manager")}
                        className="w-4 h-4 rounded accent-blue-600 cursor-pointer"
                      />
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <input
                        type="checkbox"
                        checked={p.storeManager}
                        onChange={() => togglePerm(p.permCode, "storeManager")}
                        className="w-4 h-4 rounded accent-amber-500 cursor-pointer"
                      />
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <input
                        type="checkbox"
                        checked={p.employee}
                        onChange={() => togglePerm(p.permCode, "employee")}
                        className="w-4 h-4 rounded accent-emerald-500 cursor-pointer"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <Plus className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-800 text-sm">Tạo tài khoản người dùng mới</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAccount} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tên đăng nhập (Username) *</label>
                  <input
                    type="text"
                    required
                    placeholder="vd: store_quangtrung"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-hidden focus:border-amber-400 font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Họ và tên *</label>
                  <input
                    type="text"
                    required
                    placeholder="vd: Nguyễn Văn A"
                    value={newFullName}
                    onChange={(e) => setNewFullName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-hidden focus:border-amber-400 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Email liên hệ *</label>
                  <input
                    type="email"
                    required
                    placeholder="vd: anva@bloan.vn"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-hidden focus:border-amber-400 font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Số điện thoại</label>
                  <input
                    type="text"
                    placeholder="vd: 0901234567"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-hidden focus:border-amber-400 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Vai trò hệ thống *</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as UserRoleCode)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-hidden focus:border-amber-400 font-medium bg-white"
                  >
                    <option value="EMPLOYEE">EMPLOYEE (Nhân viên)</option>
                    <option value="STORE_MANAGER">STORE_MANAGER (Trưởng CH)</option>
                    <option value="MANAGER">MANAGER (Quản lý chuỗi)</option>
                    <option value="ADMIN">ADMIN (Quản trị viên)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Cơ sở / Chi nhánh</label>
                  <select
                    value={newStore}
                    onChange={(e) => setNewStore(e.target.value)}
                    disabled={newRole === "ADMIN"}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-hidden focus:border-amber-400 font-medium bg-white disabled:bg-slate-100"
                  >
                    <option value="BLOAN · Lê Lợi (Q1)">BLOAN · Lê Lợi (Q1)</option>
                    <option value="BLOAN · Tú Xương (Q3)">BLOAN · Tú Xương (Q3)</option>
                    <option value="BLOAN · Giga Mall (Thủ Đức)">BLOAN · Giga Mall</option>
                    <option value="BLOAN · Crescent Mall (Q7)">BLOAN · Crescent Mall</option>
                    <option value="BLOAN · Nguyễn Trãi (Hà Nội)">BLOAN · Nguyễn Trãi</option>
                  </select>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-slate-700">
                <p className="font-bold text-amber-900">Mật khẩu khởi tạo mặc định:</p>
                <p className="font-mono text-xs text-amber-950 font-bold mt-0.5">Bloan@2026</p>
                <p className="text-[11px] text-amber-800 mt-1">
                  Nhân viên sẽ được yêu cầu đổi mật khẩu trong lần đăng nhập đầu tiên.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold transition-all shadow-xs"
                >
                  Tạo tài khoản
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
