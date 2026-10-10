"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  ShieldCheck,
  UserCheck,
  UserX,
  KeyRound,
  Plus,
  Search,
  RotateCcw,
  Trash2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Edit,
  Lock,
  Unlock,
  X,
  Building2,
  Mail,
  Phone,
  Shield,
} from "lucide-react";
import { UserRoleCode } from "@/types/auth";
import {
  adminUserApi,
  adminBrandApi,
  UserResponse,
  RoleResponse,
  UserRoleResponse,
  StoreItemResponse,
} from "@/lib/adminApi";

export interface AccountItem {
  id: number;
  username: string;
  fullName: string;
  email: string;
  phone: string;
  roleId: number;
  roleCode: UserRoleCode;
  roleName: string;
  storeName: string;
  status: "ACTIVE" | "LOCKED";
  lastLogin: string;
}

export default function QuanLyTaiKhoanPage() {
  const [accounts, setAccounts] = useState<AccountItem[]>([]);
  const [roles, setRoles] = useState<RoleResponse[]>([]);
  const [userRoles, setUserRoles] = useState<UserRoleResponse[]>([]);
  const [stores, setStores] = useState<StoreItemResponse[]>([]);
  const [isLoadingApi, setIsLoadingApi] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Bộ lọc danh sách
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Modal tạo tài khoản
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newFullName, setNewFullName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newRoleId, setNewRoleId] = useState<number>(4);
  const [newStore, setNewStore] = useState("Toàn hệ thống BLOAN");

  // Modal chỉnh sửa & gán quyền
  const [editAccount, setEditAccount] = useState<AccountItem | null>(null);
  const [editFullName, setEditFullName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editRoleId, setEditRoleId] = useState<number>(4);
  const [editStore, setEditStore] = useState("");
  const [editStatus, setEditStatus] = useState<"ACTIVE" | "LOCKED">("ACTIVE");

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Tải dữ liệu thực tế từ backend
  const loadData = async () => {
    setIsLoadingApi(true);
    setApiError(null);
    try {
      const [resUsers, resRoles, resUserRoles, resStores] = await Promise.allSettled([
        adminUserApi.getUsers(),
        adminUserApi.getRoles(),
        adminUserApi.getUserRoles(),
        adminBrandApi.getStores(),
      ]);

      const rolesList: RoleResponse[] =
        resRoles.status === "fulfilled" && Array.isArray(resRoles.value.data)
          ? resRoles.value.data
          : [];
      setRoles(rolesList);

      const userRolesList: UserRoleResponse[] =
        resUserRoles.status === "fulfilled" && Array.isArray(resUserRoles.value.data)
          ? resUserRoles.value.data
          : [];
      setUserRoles(userRolesList);

      const storesList: StoreItemResponse[] =
        resStores.status === "fulfilled" && Array.isArray(resStores.value.data)
          ? resStores.value.data
          : [];
      setStores(storesList);

      if (resUsers.status === "fulfilled" && Array.isArray(resUsers.value.data)) {
        const mapped: AccountItem[] = resUsers.value.data.map((u: UserResponse) => {
          // Tìm vai trò hiện tại của user trong user_role
          const ur = userRolesList.find((item) => item.userId === u.id);
          const foundRole = ur
            ? rolesList.find((r) => r.roleId === ur.roleId)
            : rolesList.find((r) => r.roleCode === "EMPLOYEE") || rolesList[0];

          const roleCode = (foundRole?.roleCode as UserRoleCode) || "EMPLOYEE";
          const roleName = foundRole?.roleName || "Nhân viên";
          const roleId = foundRole?.roleId || 4;

          const username = u.username || `user_${u.id}`;

          return {
            id: u.id,
            username,
            fullName: username,
            email: u.email || "",
            phone: u.phone || "Chưa cập nhật",
            roleId,
            roleCode,
            roleName,
            storeName: roleCode === "ADMIN" ? "Toàn hệ thống BLOAN" : "BLOAN · Chi nhánh trung tâm",
            status: (u.status === "ACTIVE" ? "ACTIVE" : "LOCKED") as "ACTIVE" | "LOCKED",
            lastLogin: u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString("vi-VN") : "Chưa đăng nhập",
          };
        });

        setAccounts(mapped);
      } else {
        if (resUsers.status === "rejected") {
          throw resUsers.reason;
        }
        setAccounts([]);
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Không thể kết nối đến máy chủ backend.";
      setApiError(errMsg);
      setAccounts([]);
    } finally {
      setIsLoadingApi(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Xử lý tạo tài khoản mới
  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newEmail.trim()) {
      alert("Vui lòng điền đầy đủ Tên đăng nhập và Email!");
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Tạo user qua POST /api/v1/user
      const res = await adminUserApi.createUser({
        username: newUsername.trim(),
        email: newEmail.trim(),
        phone: newPhone.trim() || "Chưa cập nhật",
        status: "ACTIVE",
      });

      const newUserId = res?.data?.id;

      // 2. Gán quyền qua POST /api/v1/user_role
      if (newUserId && newRoleId) {
        try {
          await adminUserApi.assignRole({
            userId: newUserId,
            roleId: newRoleId,
          });
        } catch (roleErr) {
          console.warn("Gán vai trò khi tạo user thất bại:", roleErr);
        }
      }

      alert(`Đã khởi tạo tài khoản @${newUsername} thành công!`);
      setShowCreateModal(false);
      setNewUsername("");
      setNewFullName("");
      setNewEmail("");
      setNewPhone("");
      await loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Lỗi khi tạo tài khoản!";
      alert(`Tạo tài khoản thất bại: ${msg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mở modal Edit tài khoản & Gán quyền
  const handleOpenEdit = (acc: AccountItem) => {
    setEditAccount(acc);
    setEditFullName(acc.fullName);
    setEditEmail(acc.email);
    setEditPhone(acc.phone === "Chưa cập nhật" ? "" : acc.phone);
    setEditRoleId(acc.roleId);
    setEditStore(acc.storeName);
    setEditStatus(acc.status);
  };

  // Lưu chỉnh sửa thông tin & gán quyền
  const handleUpdateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editAccount) return;

    setIsSubmitting(true);
    try {
      // 1. Cập nhật thông tin User qua PUT /api/v1/user/{id}
      await adminUserApi.updateUser(editAccount.id, {
        email: editEmail.trim() || undefined,
        phone: editPhone.trim() || undefined,
        status: editStatus,
      });

      // 2. Nếu thay đổi Role: xóa role cũ và gán role mới
      if (editRoleId !== editAccount.roleId) {
        // Xóa gán role cũ nếu có
        try {
          await adminUserApi.removeRole({
            userId: editAccount.id,
            roleId: editAccount.roleId,
          });
        } catch (delErr) {
          console.warn("Xóa quyền cũ không thành công hoặc chưa từng có:", delErr);
        }

        // Gán quyền mới
        await adminUserApi.assignRole({
          userId: editAccount.id,
          roleId: editRoleId,
        });
      }

      alert(`Cập nhật thông tin và phân quyền cho @${editAccount.username} thành công!`);
      setEditAccount(null);
      await loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Lỗi khi cập nhật tài khoản!";
      alert(`Cập nhật thất bại: ${msg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Đổi nhanh trạng thái ACTIVE / LOCKED
  const handleToggleStatus = async (acc: AccountItem) => {
    const nextStatus = acc.status === "ACTIVE" ? "LOCKED" : "ACTIVE";
    try {
      await adminUserApi.updateUser(acc.id, { status: nextStatus });
      setAccounts((prev) =>
        prev.map((a) => (a.id === acc.id ? { ...a, status: nextStatus } : a))
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Lỗi kết nối API";
      alert(`Không thể thay đổi trạng thái tài khoản: ${msg}`);
    }
  };

  // Xóa tài khoản
  const handleDeleteAccount = async (id: number, username: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản @${username} khỏi hệ thống?`)) {
      return;
    }
    try {
      await adminUserApi.deleteUser(id);
      setAccounts((prev) => prev.filter((a) => a.id !== id));
      alert(`Đã xóa tài khoản @${username} thành công!`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Lỗi máy chủ khi xóa";
      alert(`Xóa tài khoản thất bại: ${msg}`);
    }
  };

  // Bộ lọc
  const filteredAccounts = accounts.filter((acc) => {
    const username = String(acc.username ?? "").toLowerCase();
    const fullName = String(acc.fullName ?? "").toLowerCase();
    const email = String(acc.email ?? "").toLowerCase();
    const phone = String(acc.phone ?? "").toLowerCase();
    const term = search.toLowerCase().trim();

    const matchSearch =
      !term ||
      username.includes(term) ||
      fullName.includes(term) ||
      email.includes(term) ||
      phone.includes(term);

    const matchRole = roleFilter === "ALL" || acc.roleCode === roleFilter;
    const matchStatus = statusFilter === "ALL" || acc.status === statusFilter;

    return matchSearch && matchRole && matchStatus;
  });

  const roleBadgeStyle = (code: UserRoleCode) => {
    switch (code) {
      case "ADMIN":
        return "bg-red-50 text-red-700 border-red-200";
      case "MANAGER":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "STORE_MANAGER":
        return "bg-amber-50 text-amber-800 border-amber-200";
      default:
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
      
            <span className="text-slate-500 text-xs font-semibold">Bảo mật & Người dùng</span>
          </div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight mt-1">
            Quản lý tài khoản & Phân quyền hệ thống
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Quản lý danh sách người dùng, cập nhật thông tin cá nhân và gán vai trò trực tiếp.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadData}
            disabled={isLoadingApi}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
            title="Đồng bộ lại từ Backend Spring Boot"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isLoadingApi ? "animate-spin text-amber-600" : "text-slate-500"}`}
            />
            <span>{isLoadingApi ? "Đang đồng bộ..." : "Tải lại dữ liệu"}</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-900 text-xs font-bold transition-all shadow-sm shadow-amber-200 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo tài khoản mới</span>
          </button>
        </div>
      </div>

      {/* Thông báo lỗi kết nối nếu có */}
      {apiError && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>Lỗi tải dữ liệu tài khoản từ backend: <strong>{apiError}</strong></span>
          </div>
          <button
            onClick={loadData}
            className="font-bold underline text-rose-800 hover:text-rose-900 cursor-pointer ml-4"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* 4 Thẻ Thống Kê (Dữ liệu thực tế từ backend) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Tổng tài khoản</span>
            <div className="text-2xl sm:text-3xl font-black text-slate-800 mt-1 tracking-tight">
              {accounts.length}
            </div>
            <p className="text-[11px] text-emerald-600 mt-1 font-semibold">
              {accounts.filter((a) => a.status === "ACTIVE").length} đang hoạt động
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
            <span className="text-xs font-semibold text-slate-500">Quản lý & Trưởng CH</span>
            <div className="text-2xl sm:text-3xl font-black text-slate-800 mt-1 tracking-tight">
              {accounts.filter((a) => a.roleCode === "STORE_MANAGER" || a.roleCode === "MANAGER").length}
            </div>
            <p className="text-[11px] text-slate-400 mt-1 font-medium">Vận hành và quản lý ca</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Tài khoản bị khóa</span>
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

      {/* DANH SÁCH TÀI KHOẢN VÀ THAO TÁC */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Bộ lọc & Tìm kiếm */}
        <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo username, họ tên, email, sđt..."
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
              {roles.map((r) => (
                <option key={r.roleId} value={r.roleCode}>
                  {r.roleCode} ({r.roleName})
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium text-slate-700 outline-hidden hover:border-slate-300"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="ACTIVE">Đang hoạt động</option>
              <option value="LOCKED">Bị tạm khóa</option>
            </select>

            <button
              onClick={() => {
                setSearch("");
                setRoleFilter("ALL");
                setStatusFilter("ALL");
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-bold cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Đặt lại</span>
            </button>
          </div>
        </div>

        {/* Bảng dữ liệu */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/60 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="px-5 py-3">Tài khoản & Người dùng</th>
                <th className="px-5 py-3">Vai trò hệ thống</th>
                <th className="px-5 py-3">Liên hệ</th>
                <th className="px-5 py-3">Đăng nhập gần nhất</th>
                <th className="px-5 py-3 text-center">Trạng thái</th>
                <th className="px-5 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredAccounts.map((acc) => {
                const badgeClass = roleBadgeStyle(acc.roleCode);

                return (
                  <tr key={acc.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-900 font-black text-xs flex items-center justify-center border border-amber-200 shrink-0">
                          {acc.username.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-sm">@{acc.username}</p>
                          <p className="text-[11px] text-slate-400 font-mono mt-0.5">ID: #{acc.id}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-black border ${badgeClass}`}
                      >
                        {acc.roleCode} · {acc.roleName}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      <p className="font-medium text-slate-800">{acc.email || "—"}</p>
                      <p className="text-[11px] text-slate-400 font-mono">{acc.phone}</p>
                    </td>

                    <td className="px-5 py-4 text-slate-500 font-medium">{acc.lastLogin}</td>

                    <td className="px-5 py-4 text-center">
                      <button
                        onClick={() => handleToggleStatus(acc)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black border transition-all cursor-pointer ${
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
                        {/* NÚT CHỈNH SỬA & GÁN QUYỀN HỆ THỐNG */}
                        <button
                          onClick={() => handleOpenEdit(acc)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-[11px] transition-colors cursor-pointer"
                          title="Cập nhật thông tin & Gán quyền hệ thống"
                        >
                          <Edit className="w-3.5 h-3.5 text-amber-700" />
                          <span>Sửa & Gán quyền</span>
                        </button>

                        <button
                          onClick={() => handleToggleStatus(acc)}
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
                          title={acc.status === "ACTIVE" ? "Khóa tài khoản" : "Mở khóa"}
                        >
                          {acc.status === "ACTIVE" ? (
                            <Lock className="w-3.5 h-3.5" />
                          ) : (
                            <Unlock className="w-3.5 h-3.5" />
                          )}
                        </button>

                        <button
                          onClick={() =>
                            alert(`Mật khẩu tạm thời cho @${acc.username} đã được cấp lại: Bloan@2026`)
                          }
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-amber-600 transition-colors cursor-pointer"
                          title="Cấp lại mật khẩu"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDeleteAccount(acc.id, acc.username)}
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-rose-50 text-slate-400 hover:text-rose-600 hover:border-rose-200 transition-colors cursor-pointer"
                          title="Xóa tài khoản khỏi hệ thống"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredAccounts.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto mb-2 text-slate-300 stroke-[1.5]" />
                    <p className="font-semibold text-sm text-slate-600">Không tìm thấy tài khoản nào</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {accounts.length === 0
                        ? "Hệ thống chưa có dữ liệu tài khoản từ backend hoặc chưa kết nối được."
                        : "Không có tài khoản nào phù hợp với bộ lọc tìm kiếm."}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ============================================================== */}
      {/* MODAL CẬP NHẬT THÔNG TIN & GÁN QUYỀN HỆ THỐNG (EDIT ACCOUNT)    */}
      {/* ============================================================== */}
      {editAccount && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header Modal */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center font-bold">
                  <Edit className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">
                    Cập nhật tài khoản & Gán quyền hệ thống
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Tài khoản: <strong className="text-slate-700 font-mono">@{editAccount.username}</strong> (ID: #{editAccount.id})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditAccount(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateAccount} className="p-6 space-y-4 text-xs">
              {/* Thông tin tài khoản */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Email liên hệ *
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    placeholder="email@bloan.vn"
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl outline-hidden focus:border-amber-400 font-medium text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Số điện thoại
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      placeholder="0901234567"
                      className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl outline-hidden focus:border-amber-400 font-medium text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Trạng thái tài khoản
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as "ACTIVE" | "LOCKED")}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-hidden focus:border-amber-400 font-medium text-slate-800 bg-white"
                  >
                    <option value="ACTIVE">HOẠT ĐỘNG (Bình thường)</option>
                    <option value="LOCKED">ĐÃ KHÓA (Tạm ngưng)</option>
                  </select>
                </div>
              </div>

              {/* PHÂN QUYỀN HỆ THỐNG / GÁN VAI TRÒ */}
              <div className="pt-2 border-t border-slate-100">
                <label className="font-bold text-slate-800 flex items-center gap-1.5 mb-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  <span>Gán vai trò / Phân quyền hệ thống (Role RBAC) *</span>
                </label>
                <select
                  value={editRoleId}
                  onChange={(e) => setEditRoleId(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-hidden focus:border-amber-400 font-bold text-slate-800 bg-white"
                >
                  {roles.map((r) => (
                    <option key={r.roleId} value={r.roleId}>
                      {r.roleCode} — {r.roleName}
                    </option>
                  ))}
                  {roles.length === 0 && (
                    <>
                      <option value={1}>ADMIN — Quản trị viên</option>
                      <option value={2}>MANAGER — Quản lý chuỗi</option>
                      <option value={3}>STORE_MANAGER — Trưởng cửa hàng</option>
                      <option value={4}>EMPLOYEE — Nhân viên</option>
                    </>
                  )}
                </select>

                {/* Mô tả vai trò */}
                <div className="mt-2 p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 text-[11px] text-amber-900 leading-relaxed">
                  {editRoleId === 1 && (
                    <p>
                      <strong>ADMIN:</strong> Toàn quyền quản trị hệ thống, quản lý tài khoản, phân quyền, cấu hình thông số và truy cập toàn bộ API.
                    </p>
                  )}
                  {editRoleId === 2 && (
                    <p>
                      <strong>MANAGER:</strong> Quản lý vận hành toàn chuỗi chi nhánh, xem danh sách nhân sự, chốt bảng lương và duyệt đề xuất ca làm.
                    </p>
                  )}
                  {editRoleId === 3 && (
                    <p>
                      <strong>STORE_MANAGER:</strong> Xếp ca làm việc, đối soát chấm công, duyệt đổi ca nhân viên và lập biên bản trong phạm vi chi nhánh phụ trách.
                    </p>
                  )}
                  {editRoleId >= 4 && (
                    <p>
                      <strong>EMPLOYEE:</strong> Nhân viên phục vụ/pha chế; chỉ xem lịch làm việc cá nhân, đăng ký ca mở, điểm danh FaceID và xem phiếu lương.
                    </p>
                  )}
                </div>
              </div>

              {/* Chi nhánh phụ trách */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Phạm vi cơ sở / Chi nhánh
                </label>
                <div className="relative">
                  <Building2 className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <select
                    value={editStore}
                    onChange={(e) => setEditStore(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl outline-hidden focus:border-amber-400 font-medium text-slate-800 bg-white"
                  >
                    <option value="Toàn hệ thống BLOAN">Toàn hệ thống BLOAN (Áp dụng cho Admin/Manager)</option>
                    {stores.map((s) => (
                      <option key={s.id || s.storeId} value={s.storeName}>
                        {s.storeName || s.storeCode}
                      </option>
                    ))}
                    {stores.length === 0 && (
                      <>
                        <option value="BLOAN · Chi nhánh trung tâm">BLOAN · Chi nhánh trung tâm</option>
                        <option value="BLOAN · Lê Lợi (Q1)">BLOAN · Lê Lợi (Q1)</option>
                        <option value="BLOAN · Tú Xương (Q3)">BLOAN · Tú Xương (Q3)</option>
                        <option value="BLOAN · Giga Mall (Thủ Đức)">BLOAN · Giga Mall (Thủ Đức)</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditAccount(null)}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL TẠO TÀI KHOẢN MỚI                                        */}
      {/* ============================================================== */}
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
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAccount} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Tên đăng nhập (Username) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="vd: nguyenvana hoặc store_manager_q1"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-hidden focus:border-amber-400 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Email liên hệ *
                  </label>
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
                  <label className="font-bold text-slate-700 block mb-1">
                    Vai trò hệ thống *
                  </label>
                  <select
                    value={newRoleId}
                    onChange={(e) => setNewRoleId(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-hidden focus:border-amber-400 font-medium bg-white"
                  >
                    {roles.map((r) => (
                      <option key={r.roleId} value={r.roleId}>
                        {r.roleCode} — {r.roleName}
                      </option>
                    ))}
                    {roles.length === 0 && (
                      <>
                        <option value={4}>EMPLOYEE (Nhân viên)</option>
                        <option value={3}>STORE_MANAGER (Trưởng CH)</option>
                        <option value={2}>MANAGER (Quản lý chuỗi)</option>
                        <option value={1}>ADMIN (Quản trị viên)</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Cơ sở / Chi nhánh</label>
                  <select
                    value={newStore}
                    onChange={(e) => setNewStore(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-hidden focus:border-amber-400 font-medium bg-white"
                  >
                    <option value="Toàn hệ thống BLOAN">Toàn hệ thống BLOAN</option>
                    {stores.map((s) => (
                      <option key={s.id || s.storeId} value={s.storeName}>
                        {s.storeName || s.storeCode}
                      </option>
                    ))}
                    {stores.length === 0 && (
                      <>
                        <option value="BLOAN · Chi nhánh trung tâm">BLOAN · Chi nhánh trung tâm</option>
                        <option value="BLOAN · Lê Lợi (Q1)">BLOAN · Lê Lợi (Q1)</option>
                        <option value="BLOAN · Tú Xương (Q3)">BLOAN · Tú Xương (Q3)</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-slate-700">
                <p className="font-bold text-amber-900">Mật khẩu khởi tạo mặc định:</p>
                <p className="font-mono text-xs text-amber-950 font-bold mt-0.5">Bloan@2026</p>
                <p className="text-[11px] text-amber-800 mt-1">
                  Nhân viên có thể đổi mật khẩu sau khi đăng nhập lần đầu vào hệ thống.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? "Đang tạo..." : "Tạo tài khoản"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
