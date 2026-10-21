"use client";

import React, { useState } from "react";
import { Building2, Edit, Mail, Phone, ShieldCheck, X } from "lucide-react";
import { adminUserApi, type RoleResponse, type StoreItemResponse } from "@/lib/api";
import { ALL_SCOPE, FALLBACK_ROLES, FALLBACK_STORES, PHONE_NOT_SET, ROLE_DESCRIPTION, roleLabel, type AccountItem } from "./roles";

interface Props {
  account: AccountItem;
  roles: RoleResponse[];
  stores: StoreItemResponse[];
  onClose: () => void;
  onSaved: () => void;
}

const field = "w-full rounded-xl border border-slate-200 bg-white py-2 font-medium text-slate-800 outline-hidden focus:border-brand-400";

/** Cập nhật thông tin liên hệ, trạng thái và vai trò của tài khoản. */
export function EditAccountModal({ account, roles, stores, onClose, onSaved }: Props) {
  const [email, setEmail] = useState(account.email);
  const [phone, setPhone] = useState(account.phone === PHONE_NOT_SET ? "" : account.phone);
  const [roleId, setRoleId] = useState(account.roleId);
  const [store, setStore] = useState(account.storeName);
  const [status, setStatus] = useState(account.status);
  const [submitting, setSubmitting] = useState(false);

  // Admin: không chỉnh quyền, không khóa, luôn hoạt động
  const isAdmin = account.roleCode === "ADMIN";
  const roleOptions = roles.length ? roles : FALLBACK_ROLES;
  const description = ROLE_DESCRIPTION[Math.min(roleId, 4)];

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await adminUserApi.updateUser(account.id, {
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        status: isAdmin ? "ACTIVE" : status,
      });
      if (!isAdmin && roleId !== account.roleId) {
        // Đổi vai trò nguyên tử ở backend; thất bại (vd. quản lý hoạt động cuối cùng) thì giữ nguyên vai trò cũ
        await adminUserApi.changeRole({ userId: account.id, roleId });
      }
      onSaved();
    } catch {
      // Lỗi đã được hiện bằng toast từ HTTP client
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-surface shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500/10 font-bold text-brand-700">
              <Edit className="h-4 w-4 text-brand-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Cập nhật tài khoản & Phân quyền</h3>
              <p className="text-[11px] text-slate-400">
                Tài khoản: <strong className="font-mono text-slate-700">@{account.username}</strong> (ID: #{account.id})
              </p>
            </div>
          </div>
          <button onClick={onClose} className="cursor-pointer rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-200" aria-label="Đóng">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4 p-6 text-xs">
          <div>
            <label className="mb-1 block font-bold text-slate-700">Email liên hệ *</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="email@bloan.vn" className={`${field} pl-9 pr-3`} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block font-bold text-slate-700">Số điện thoại</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input type="text" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="0901234567" className={`${field} pl-9 pr-3`} />
              </div>
            </div>
            <div>
              <label className="mb-1 block font-bold text-slate-700">Trạng thái tài khoản</label>
              <select
                value={isAdmin ? "ACTIVE" : status}
                disabled={isAdmin}
                title={isAdmin ? "Tài khoản admin luôn hoạt động" : undefined}
                onChange={(event) => setStatus(event.target.value as AccountItem["status"])}
                className={`${field} px-3 disabled:bg-slate-100`}
              >
                <option value="ACTIVE">Hoạt động (Bình thường)</option>
                <option value="LOCKED">Đã khóa (Tạm ngưng)</option>
              </select>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-2">
            <label className="mb-1.5 flex items-center gap-1.5 font-bold text-slate-800">
              <ShieldCheck className="h-4 w-4 text-brand-600" />
              <span>Vai trò tài khoản *</span>
            </label>
            <select
              value={roleId}
              disabled={isAdmin}
              onChange={(event) => setRoleId(Number(event.target.value))}
              className={`${field} px-3 font-bold disabled:bg-slate-100`}
            >
              {roleOptions.map((role) => (
                <option key={role.roleId} value={role.roleId}>{roleLabel(role.roleCode)}</option>
              ))}
            </select>
            {isAdmin && <p className="mt-1 text-[11px] font-semibold text-rose-600">Tài khoản admin: không chỉnh được quyền, không khóa, luôn hoạt động.</p>}
            {description && (
              <div className="mt-2 rounded-xl border border-brand-200/80 bg-brand-50/70 p-3 text-[11px] leading-relaxed text-brand-900">
                <p>
                  <strong>{description[0]}:</strong> {description[1]}
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="mb-1 block font-bold text-slate-700">Phạm vi cơ sở / Chi nhánh</label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <select value={store} onChange={(event) => setStore(event.target.value)} className={`${field} pl-9 pr-3`}>
                <option value={ALL_SCOPE}>{ALL_SCOPE} (Áp dụng cho Admin/Manager)</option>
                {stores.length
                  ? stores.map((item) => (
                      <option key={item.id || item.storeId} value={item.storeName}>{item.storeName || item.storeCode}</option>
                    ))
                  : FALLBACK_STORES.map((name) => <option key={name} value={name}>{name}</option>)}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
            <button type="button" onClick={onClose} disabled={submitting} className="btn btn-secondary btn-sm">
              Hủy
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary btn-sm px-5">
              {submitting ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
