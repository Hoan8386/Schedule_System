"use client";

import React, { useState } from "react";
import { BellRing, Clock, FileText, Info, Mail, Server } from "lucide-react";
import { EMAIL_TEMPLATES, MOCK_LOGS, NOTIFICATION_TEMPLATES } from "./mockData";
import { EmailTemplateTab, NotificationTemplateTab } from "./TemplateEditors";
import { SmtpTab } from "./SmtpTab";

export type { EmailTemplate, NotificationTemplate } from "./mockData";

type Tab = "email_templates" | "notif_templates" | "smtp" | "logs";

const TABS: { key: Tab; label: string; icon: typeof Mail }[] = [
  { key: "email_templates", label: `Mẫu Email tự động (${EMAIL_TEMPLATES.length})`, icon: Mail },
  { key: "notif_templates", label: `Mẫu Thông báo riêng (In-App) (${NOTIFICATION_TEMPLATES.length})`, icon: BellRing },
  { key: "smtp", label: "Cấu hình SMTP Server", icon: Server },
  { key: "logs", label: "Lịch sử gửi thư & thông báo", icon: Clock },
];

const STATS = [
  { label: "Email đã gửi tháng này", value: "4,280", icon: Mail, tone: "bg-brand-100 text-brand-800 border-brand-200" },
  { label: "Mẫu Email hệ thống", value: `${EMAIL_TEMPLATES.length} Mẫu`, icon: FileText, tone: "bg-blue-100 text-blue-800 border-blue-200" },
  { label: "Mẫu Thông báo riêng", value: `${NOTIFICATION_TEMPLATES.length} Mẫu`, icon: BellRing, tone: "bg-purple-100 text-purple-800 border-purple-200" },
  { label: "Máy chủ SMTP", value: "ĐÃ KẾT NỐI", icon: Server, tone: "bg-emerald-100 text-emerald-800 border-emerald-200", valueClass: "text-xl text-emerald-700 sm:text-2xl" },
];

/** Mẫu email / thông báo in-app, cấu hình SMTP và nhật ký gửi. */
export default function QuanLyEmailThongBaoPage() {
  const [activeTab, setActiveTab] = useState<Tab>("email_templates");

  return (
    <div className="page">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-lg border border-brand-300 bg-brand-100 px-2.5 py-0.5 text-xs font-black uppercase tracking-wider text-brand-800">ADMIN CENTER</span>
            <span className="text-xs text-slate-400">/</span>
            <span className="text-xs font-bold text-slate-700">Kênh liên lạc & Thông báo</span>
          </div>
          <div className="mt-1 flex items-center gap-2.5">
            <h1 className="text-2xl font-black tracking-tight text-slate-900">Quản lý thông báo & Email hệ thống</h1>
            <div className="group relative">
              <button
                type="button"
                className="flex h-6 w-6 cursor-help items-center justify-center rounded-full border border-slate-300 bg-slate-200 font-bold text-slate-700 shadow-2xs transition-all hover:bg-brand-100 hover:text-brand-800"
                title="Thông tin hệ thống Email & Thông báo"
              >
                <Info className="h-3.5 w-3.5 stroke-[2.5]" />
              </button>
              <div className="pointer-events-none absolute left-0 top-8 z-40 hidden w-80 max-w-[calc(100vw-2rem)] rounded-xl border border-slate-700 bg-slate-900 p-3.5 text-white shadow-2xl group-hover:block">
                <p className="text-xs font-medium leading-relaxed text-slate-200">
                  Cấu hình mẫu thư điện tử tự động, mẫu thông báo ứng dụng và thiết lập máy chủ kết nối SMTP an toàn.
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-brand-300 bg-brand-50 px-3.5 py-2 text-xs font-bold text-brand-900">
          <Info className="h-4 w-4 shrink-0 text-brand-700" />
          <span>Chức năng phát thông báo tới nhân sự đã được chuyển giao cho Cấp Quản Lý vận hành.</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map(({ label, value, icon: Icon, tone, valueClass }) => (
          <div key={label} className="flex items-center justify-between rounded-2xl border border-slate-300 bg-surface p-5 shadow-xs">
            <div>
              <span className="text-xs font-bold text-slate-700">{label}</span>
              <div className={`mt-1 font-black tracking-tight ${valueClass ?? "text-2xl text-slate-900 sm:text-3xl"}`}>{value}</div>
            </div>
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${tone}`}>
              <Icon className="h-5 w-5 stroke-[2.2]" />
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`inline-flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === key ? "bg-brand-500 text-brand-contrast shadow-xs" : "text-slate-700 hover:bg-slate-100"
            }`}
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {activeTab === "email_templates" && <EmailTemplateTab />}
      {activeTab === "notif_templates" && <NotificationTemplateTab />}
      {activeTab === "smtp" && <SmtpTab />}
      {activeTab === "logs" && <LogsTable />}
    </div>
  );
}

function LogsTable() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-300 bg-surface shadow-xs">
      <div className="border-b border-slate-200 bg-slate-50 p-4">
        <h3 className="text-sm font-bold text-slate-900">Nhật ký phát thư & thông báo (Notification Logs)</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="whitespace-nowrap border-b border-slate-200 bg-slate-100 text-xs font-black uppercase tracking-wider text-slate-700">
              {["Người nhận", "Kênh gửi", "Mẫu thư / Thông báo", "Tiêu đề", "Thời gian"].map((header) => (
                <th key={header} className="px-5 py-3.5">{header}</th>
              ))}
              <th className="px-5 py-3.5 text-right">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-xs">
            {MOCK_LOGS.map((log, index) => (
              <tr key={index} className="whitespace-nowrap transition-colors hover:bg-slate-50">
                <td className="px-5 py-3.5 font-bold text-slate-900">{log.recipient}</td>
                <td className="px-5 py-3.5">
                  <span
                    className={`rounded border px-2 py-0.5 text-[10px] font-black ${
                      log.type === "EMAIL" ? "border-blue-200 bg-blue-100 text-blue-800" : "border-purple-200 bg-purple-100 text-purple-800"
                    }`}
                  >
                    {log.type === "EMAIL" ? "Email SMTP" : "App Notif"}
                  </span>
                </td>
                <td className="px-5 py-3.5 font-bold text-slate-800">{log.template}</td>
                <td className="px-5 py-3.5 font-semibold text-slate-700">{log.subject}</td>
                <td className="px-5 py-3.5 font-mono text-slate-600">{log.time}</td>
                <td className="px-5 py-3.5 text-right">
                  <span className="rounded-full border border-emerald-300 bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-800">{log.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
