"use client";

import { notify } from "@/lib/toast";
import React, { useState } from "react";
import { Activity, Code, ExternalLink, Info, Layers, ShieldCheck } from "lucide-react";
import { API_BASE_URL } from "@/lib/api";
import { useApiCatalog } from "./useApiCatalog";
import { EndpointsTab } from "./EndpointsTab";
import { RolePermissionsTab } from "./RolePermissionsTab";

export type { ApiEndpointItem } from "./apiCatalog";

type Tab = "endpoints" | "roles_permissions";

/** Danh mục API (permission) và phân quyền API theo vai trò. */
export default function QuanLyApiPage() {
  const catalog = useApiCatalog();
  const { endpoints, roles, loading, error } = catalog;
  const [activeTab, setActiveTab] = useState<Tab>("endpoints");
  const modules = Array.from(new Set(endpoints.map((endpoint) => endpoint.module)));

  const stats = [
    { label: "Tổng Endpoints API", value: endpoints.length, icon: Code, tone: "bg-blue-100 text-blue-800 border-blue-200" },
    { label: "Vai trò phân quyền (RBAC)", value: `${roles.length} Roles`, icon: ShieldCheck, tone: "bg-brand-100 text-brand-800 border-brand-200" },
    { label: "Phân hệ chức năng", value: `${modules.length} Modules`, icon: Layers, tone: "bg-purple-100 text-purple-800 border-purple-200" },
    { label: "Tình trạng Backend", value: loading ? "..." : error ? "OFFLINE" : "ONLINE", icon: Activity, tone: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  ];

  const tabs: { key: Tab; label: string; icon: typeof Code }[] = [
    { key: "endpoints", label: `Danh mục toàn bộ API (${endpoints.length})`, icon: Code },
    { key: "roles_permissions", label: `Role & API thuộc Role (${roles.length} Vai trò)`, icon: ShieldCheck },
  ];

  return (
    <div className="page">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-lg border border-brand-300 bg-brand-100 px-2.5 py-0.5 text-xs font-black uppercase tracking-wider text-brand-800">ADMIN CENTER</span>
            <span className="text-xs text-slate-400">/</span>
            <span className="text-xs font-bold text-slate-700">Tích hợp & Lập trình</span>
          </div>
          <div className="mt-1 flex items-center gap-2.5">
            <h1 className="text-2xl font-black tracking-tight text-slate-900">Quản lý API & Phân quyền Endpoints</h1>
            <div className="group relative">
              <button
                type="button"
                className="flex h-6 w-6 cursor-help items-center justify-center rounded-full border border-slate-300 bg-slate-200 font-bold text-slate-700 shadow-2xs transition-all hover:bg-brand-100 hover:text-brand-800"
                title="Thông tin API & Phân quyền"
              >
                <Info className="h-3.5 w-3.5 stroke-[2.5]" />
              </button>
              <div className="pointer-events-none absolute left-0 top-8 z-40 hidden w-80 max-w-[calc(100vw-2rem)] rounded-xl border border-slate-700 bg-slate-900 p-3.5 text-white shadow-2xl group-hover:block">
                <p className="text-xs font-medium leading-relaxed text-slate-200">Danh mục quyền API và phân quyền theo từng vai trò được đọc trực tiếp từ backend.</p>
              </div>
            </div>
          </div>
        </div>

        {error && <div className="rounded-xl border border-rose-300 bg-rose-50 px-4 py-3 text-xs font-bold text-rose-800">Không thể tải dữ liệu quản lý API: {error}</div>}
        {loading && (
          <div className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-xs font-bold text-slate-700">Đang tải quyền API, vai trò và liên kết phân quyền từ backend...</div>
        )}
        <button onClick={() => notify.info(`Mở Swagger UI Backend: ${API_BASE_URL}/swagger-ui.html`)} className="btn btn-secondary">
          <ExternalLink className="h-4 w-4 text-slate-700" />
          <span>Tài liệu Swagger UI</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, tone }) => (
          <div key={label} className="flex items-center justify-between rounded-2xl border border-slate-300 bg-surface p-5 shadow-xs">
            <div>
              <span className="text-xs font-bold text-slate-700">{label}</span>
              <div className="mt-1 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">{value}</div>
            </div>
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${tone}`}>
              <Icon className="h-5 w-5 stroke-[2.2]" />
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200/80 pb-3">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`inline-flex cursor-pointer items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition-all ${
              activeTab === key ? "bg-brand-500 text-brand-contrast shadow-xs" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {activeTab === "endpoints" ? (
        <EndpointsTab endpoints={endpoints} modules={modules} />
      ) : (
        <RolePermissionsTab
          roles={roles}
          endpoints={endpoints}
          selectedRole={catalog.selectedRole}
          onSelectRole={catalog.setSelectedRole}
          canAssign={Boolean(catalog.selectedRoleRecord)}
          availablePermissions={catalog.availablePermissions}
          onAssign={catalog.assignPermissions}
        />
      )}
    </div>
  );
}
