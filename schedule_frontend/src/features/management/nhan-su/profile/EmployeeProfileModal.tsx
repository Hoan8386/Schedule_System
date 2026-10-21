"use client";

import React, { useEffect, useState } from "react";
import { Briefcase, Check, Copy, Edit, Mail, Phone, RefreshCw, ShieldCheck, X } from "lucide-react";
import { managerApi, type EmployeeResponse, type EmployeeStoreResponse, type StoreResponse } from "@/lib/api";
import { resolveImageUrl, statusName, value } from "../utils";
import { AccountSection, NoteSection, PersonalSection, StoreSection } from "./ProfileSections";

interface Props {
  employee: EmployeeResponse;
  isManager: boolean;
  assignments: EmployeeStoreResponse[];
  storeMap: Map<number, StoreResponse>;
  onClose: () => void;
  /** Bỏ trống = chỉ xem */
  onEdit?: (employee: EmployeeResponse) => void;
}

const STATUS_BADGE: Record<string, string> = {
  ACTIVE: "bg-emerald-500 text-white",
  INACTIVE: "bg-brand-400 text-slate-950",
};

/** Hồ sơ chi tiết nhân viên (tự tải bản đầy đủ từ API). */
export function EmployeeProfileModal({ employee, isManager, assignments, storeMap, onClose, onEdit }: Props) {
  const [profile, setProfile] = useState(employee);
  const [loadingDetail, setLoadingDetail] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    managerApi
      .getEmployee(employee.id)
      .then((res) => !cancelled && res.data && setProfile(res.data))
      .catch(() => undefined) // giữ dữ liệu đang có nếu tải chi tiết lỗi
      .finally(() => !cancelled && setLoadingDetail(false));
    return () => {
      cancelled = true;
    };
  }, [employee.id]);

  const copyCode = (code: string) => {
    if (!code) return;
    void navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const avatar = resolveImageUrl(profile.avatar as string | null | undefined);

  return (
    <div className="modal-backdrop bg-slate-950/50 backdrop-blur-xs">
      <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-surface shadow-2xl">
        <div className="relative shrink-0 bg-gradient-to-r from-brand-500 via-brand-600 to-orange-500 p-6 text-white">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-xl bg-black/15 text-white transition-colors hover:bg-black/30"
            title="Đóng"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white/20 shadow-lg ring-4 ring-white/30">
              {avatar ? (
                // eslint-disable-next-line @next/next/no-img-element -- ảnh từ backend
                <img src={avatar} alt={profile.fullName || "Avatar"} className="h-full w-full object-cover" />
              ) : (
                <span className="text-2xl font-black text-white">{value(profile.fullName, "?").slice(0, 1).toUpperCase()}</span>
              )}
            </div>

            <div className="min-w-0 flex-1 space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="truncate text-xl font-black tracking-tight text-white">{value(profile.fullName)}</h2>
                {loadingDetail && <RefreshCw className="h-3.5 w-3.5 animate-spin text-white/70" />}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => copyCode(profile.employeeCode ?? "")}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-black/20 px-2.5 py-1 font-mono text-xs font-semibold text-white backdrop-blur-xs transition-colors hover:bg-black/30"
                  title="Nhấn để sao chép mã NV"
                >
                  <span>Mã: {value(profile.employeeCode)}</span>
                  {copied ? <Check className="h-3 w-3 text-emerald-300" /> : <Copy className="h-3 w-3 text-white/70" />}
                </button>
                {isManager ? (
                  <span className="inline-flex items-center gap-1 rounded-lg border border-indigo-300/30 bg-indigo-900/40 px-2.5 py-1 text-xs font-bold text-indigo-100">
                    <ShieldCheck className="h-3.5 w-3.5" /> Quản lý cửa hàng
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-lg border border-white/20 bg-white/20 px-2.5 py-1 text-xs font-bold text-white">
                    <Briefcase className="h-3.5 w-3.5" /> Nhân viên
                  </span>
                )}
                <span className={`rounded-lg px-2.5 py-1 text-xs font-bold ${STATUS_BADGE[profile.status?.toUpperCase() ?? ""] ?? "bg-rose-500 text-white"}`}>
                  {statusName(profile.status)}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-brand-100/90">
                {profile.email && (
                  <a href={`mailto:${profile.email}`} className="inline-flex items-center gap-1 transition-colors hover:text-white hover:underline">
                    <Mail className="h-3.5 w-3.5" /> {profile.email}
                  </a>
                )}
                {profile.phone && (
                  <a href={`tel:${profile.phone}`} className="inline-flex items-center gap-1 transition-colors hover:text-white hover:underline">
                    <Phone className="h-3.5 w-3.5" /> {profile.phone}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50/50 p-6">
          <PersonalSection profile={profile} />
          <AccountSection profile={profile} isManager={isManager} />
          <StoreSection assignments={assignments} storeMap={storeMap} />
          <NoteSection profile={profile} />
        </div>

        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-slate-100 bg-surface p-4">
          <button type="button" onClick={onClose} className="btn btn-secondary btn-sm">
            Đóng
          </button>
          {onEdit && (
            <button type="button" onClick={() => onEdit(profile)} className="btn btn-primary btn-sm">
              <Edit className="h-3.5 w-3.5" /> Chỉnh sửa hồ sơ
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
