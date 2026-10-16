import React, { useState } from "react";
import { ArrowRight, Check, Plus, ShieldAlert } from "lucide-react";
import { MANAGER_TODOS, RECENT_REQUESTS, RECENT_VIOLATIONS } from "./data";

const panel = "rounded-2xl border border-slate-200/80 bg-surface shadow-xs";

/** Danh sách việc cần làm của quản lý (đánh dấu cục bộ). */
export function ManagerTodos() {
  const [done, setDone] = useState<number[]>([3]);
  const toggle = (id: number) => setDone((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));

  return (
    <div className={`${panel} flex flex-col justify-between p-5`}>
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800">Nhiệm vụ quản lý</h3>
          <span className="text-[11px] font-bold text-brand-600">{MANAGER_TODOS.filter((todo) => !done.includes(todo.id)).length} việc cần làm</span>
        </div>
        <div className="space-y-2.5 text-xs">
          {MANAGER_TODOS.map((todo) => {
            const isDone = done.includes(todo.id);
            return (
              <div key={todo.id} onClick={() => toggle(todo.id)} className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-100 p-2.5 transition-colors hover:bg-slate-50/70">
                <div
                  className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-md border transition-all ${
                    isDone ? "border-brand-500 bg-brand-500 text-brand-contrast" : "border-slate-300"
                  }`}
                >
                  {isDone && <Check className="h-3 w-3 stroke-[3]" />}
                </div>
                <div className="flex-1">
                  <p className={`font-bold ${isDone ? "text-slate-400 line-through" : "text-slate-800"}`}>{todo.text}</p>
                  <p className="mt-0.5 text-[10px] text-slate-400">{todo.sub}</p>
                  <span className="mt-1 inline-block rounded-sm bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-600">{todo.deadline}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <button
        onClick={() => alert("Thêm nhiệm vụ mới")}
        className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-slate-200 py-2.5 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-50"
      >
        <Plus className="h-4 w-4" />
        <span>Thêm nhiệm vụ mới</span>
      </button>
    </div>
  );
}

export function RecentRequestsTable() {
  return (
    <div className={`${panel} overflow-hidden lg:col-span-2`}>
      <div className="flex items-center justify-between border-b border-slate-100 p-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Yêu cầu đổi / hủy ca mới nhất</h3>
        <button onClick={() => alert("Chuyển đến trang Xử lý yêu cầu")} className="flex items-center gap-1 text-xs font-bold text-brand-600 hover:underline">
          <span>Xem tất cả</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50 text-[11px] font-semibold text-slate-400">
              <th className="px-4 py-2.5">Nhân viên</th>
              <th className="px-4 py-2.5">Cửa hàng</th>
              <th className="px-4 py-2.5">Loại yêu cầu</th>
              <th className="px-4 py-2.5">Ngày gửi</th>
              <th className="px-4 py-2.5 text-right">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {RECENT_REQUESTS.map((request) => (
              <tr key={request.code} className="transition-colors hover:bg-slate-50/70">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-100 text-xs font-bold text-brand-800">{request.initials}</div>
                    <div>
                      <p className="font-bold text-slate-800">{request.name}</p>
                      <p className="text-[10px] text-slate-400">{request.code}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 font-medium text-slate-600">{request.store}</td>
                <td className="px-4 py-3 font-bold text-slate-800">{request.type}</td>
                <td className="px-4 py-3 text-slate-400">{request.date}</td>
                <td className="px-4 py-3 text-right">
                  <span
                    className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                      request.status === "Chờ duyệt" ? "border border-brand-200 bg-brand-50 text-brand-700" : "border border-emerald-200 bg-emerald-50 text-emerald-700"
                    }`}
                  >
                    {request.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function RecentViolations() {
  return (
    <div className={`${panel} p-5`}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-800">Vi phạm gần đây</h3>
        <span className="text-xs font-bold text-red-600">5 mới</span>
      </div>
      <div className="space-y-3.5 text-xs">
        {RECENT_VIOLATIONS.map((violation) => (
          <div key={violation.name} className="flex items-start gap-3 border-b border-slate-100 pb-3 last:border-0 last:pb-0">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <ShieldAlert className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <p className="font-bold text-slate-800">{violation.name}</p>
                <span className="text-[10px] text-slate-400">{violation.time}</span>
              </div>
              <p className="mt-0.5 text-[11px] leading-snug text-slate-500">{violation.desc}</p>
              <span className={`mt-1.5 inline-block rounded-md border px-2 py-0.5 text-[9px] font-bold ${violation.tagColor}`}>{violation.tag}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
