import { notify } from "@/lib/toast";
import React, { useState } from "react";
import { Search } from "lucide-react";
import { VIOLATION_STATUS, type ViolationItem } from "./model";

const selectClass = "rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 font-medium outline-hidden";

/** Danh sách sự việc vi phạm có tìm kiếm và lọc trạng thái. */
export function ViolationTable({ violations }: { violations: ViolationItem[] }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const filtered = violations.filter((item) => {
    const q = search.toLowerCase();
    if (search && !item.staffName.toLowerCase().includes(q) && !item.id.toLowerCase().includes(q)) return false;
    return status === "all" || VIOLATION_STATUS[item.status].filter === status;
  });

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-surface shadow-xs">
      <div className="flex flex-col justify-between gap-3 border-b border-slate-100 p-4 md:flex-row md:items-center">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Danh sách sự việc · Tháng 10/2026</h3>
        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          <div className="relative min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm nhân viên hoặc mã sự việc"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 outline-hidden hover:border-slate-300"
            />
          </div>
          <select className={selectClass}>
            <option>01/10 – 05/10/2026</option>
            <option>Tháng 09/2026</option>
          </select>
          <select value={status} onChange={(event) => setStatus(event.target.value)} className={selectClass}>
            <option value="all">Tất cả trạng thái</option>
            <option value="pending">Chờ xác minh</option>
            <option value="processing">Đang xử lý</option>
            <option value="completed">Hoàn tất</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50 text-[11px] font-semibold text-slate-400">
              <th className="px-4 py-3">Nhân viên</th>
              <th className="px-4 py-3">Sự việc</th>
              <th className="px-4 py-3">Phân loại</th>
              <th className="px-4 py-3">Thời điểm</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {filtered.map((item) => {
              const badge = VIOLATION_STATUS[item.status];
              const pending = item.status === "PENDING_VERIFY";
              return (
                <tr key={item.id} className="transition-colors hover:bg-slate-50/70">
                  <td className="px-4 py-3.5">
                    <p className="font-bold text-slate-800">{item.staffName}</p>
                    <p className="text-[10px] text-slate-400">{item.staffCode}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="font-bold text-slate-800">
                      {item.id} · {item.title}
                    </p>
                    <p className="text-[11px] text-slate-400">{item.shiftDetail}</p>
                  </td>
                  <td className="px-4 py-3.5 font-medium text-slate-600">{item.category}</td>
                  <td className="px-4 py-3.5 text-slate-500">{item.time}</td>
                  <td className="px-4 py-3.5">
                    <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${badge.className}`}>{badge.label}</span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <button
                      onClick={() => notify.info(pending ? `Đang mở biên bản xác minh ${item.id}` : `Xem chi tiết hồ sơ ${item.id}`)}
                      className={`rounded-xl border border-slate-200 py-1.5 hover:bg-slate-50 ${pending ? "px-3.5 font-bold text-slate-700" : "px-3 font-medium text-slate-600"}`}
                    >
                      {pending ? "Xử lý" : "Xem"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 p-4 text-xs text-slate-500">
        <span>
          Hiển thị 1–{filtered.length} trong {filtered.length} sự việc
        </span>
        <div className="flex items-center gap-1.5">
          <button className="rounded-lg border border-slate-200 px-3 py-1.5 text-slate-400">Trước</button>
          <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 font-bold text-brand-contrast">1</button>
          <button className="rounded-lg border border-slate-200 px-3 py-1.5 text-slate-400">Sau</button>
        </div>
      </div>
    </div>
  );
}
