import React, { useState } from "react";
import { Search } from "lucide-react";
import { REQUEST_STATUS, TYPE_LABEL, type RequestItem, type RequestType } from "./model";

const selectClass = "rounded-xl border border-slate-200 bg-white px-3 py-2 font-medium outline-hidden";

interface Props {
  requests: RequestItem[];
  loading: boolean;
  onDecide: (request: RequestItem, status: "APPROVED" | "REJECTED") => void;
}

/** Yêu cầu ca của nhân viên theo loại (đăng ký / đổi / hủy), duyệt hoặc từ chối. */
export function RequestTable({ requests, loading, onDecide }: Props) {
  const [tab, setTab] = useState<RequestType>("REGISTER");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const pendingOf = (type: RequestType) => requests.filter((request) => request.type === type && request.status === "PENDING").length;
  const totalPending = (Object.keys(TYPE_LABEL) as RequestType[]).reduce((sum, type) => sum + pendingOf(type), 0);

  const filtered = requests.filter((request) => {
    if (request.type !== tab) return false;
    const q = search.toLowerCase();
    if (search && !request.staffName.toLowerCase().includes(q) && !request.id.toLowerCase().includes(q)) return false;
    return status === "all" || REQUEST_STATUS[request.status].filter === status;
  });

  const message = loading ? "Đang tải yêu cầu từ cửa hàng..." : filtered.length === 0 ? "Không có yêu cầu phù hợp." : null;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-surface shadow-xs">
      <div className="border-b border-slate-100 p-5">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-bold text-slate-800">Yêu cầu của nhân viên</h3>
          <span className="rounded-full border border-brand-200 bg-brand-50 px-2 py-0.5 text-[11px] font-bold text-brand-700">{totalPending} yêu cầu chờ duyệt</span>
        </div>
        <div className="mt-4 flex items-center gap-2">
          {(Object.keys(TYPE_LABEL) as RequestType[]).map((type) => (
            <button
              key={type}
              onClick={() => setTab(type)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${tab === type ? "bg-brand-500 text-brand-contrast shadow-xs" : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"}`}
            >
              {TYPE_LABEL[type]} ({pendingOf(type)})
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col justify-between gap-3 border-b border-slate-100 bg-slate-50/50 p-4 text-xs sm:flex-row sm:items-center">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm tên nhân viên hoặc mã yêu cầu"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 outline-hidden hover:border-slate-300"
          />
        </div>
        <div className="flex items-center gap-2.5">
          <select className={selectClass}>
            <option>12 – 18/10/2026</option>
            <option>05 – 11/10/2026</option>
          </select>
          <select value={status} onChange={(event) => setStatus(event.target.value)} className={selectClass}>
            <option value="all">Tất cả</option>
            <option value="pending">Chờ duyệt</option>
            <option value="approved">Đã duyệt</option>
            <option value="rejected">Từ chối</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50 text-[11px] font-semibold text-slate-400">
              <th className="px-4 py-3">Nhân viên</th>
              <th className="px-4 py-3">Ca & ngày</th>
              <th className="px-4 py-3">Lý do</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {message ? (
              <tr>
                <td colSpan={5} className="py-10 text-center text-slate-400">{message}</td>
              </tr>
            ) : (
              filtered.map((request) => {
                const badge = REQUEST_STATUS[request.status];
                return (
                  <tr key={request.id} className="transition-colors hover:bg-slate-50/70">
                    <td className="px-4 py-3.5">
                      <p className="font-bold text-slate-800">{request.staffName}</p>
                      <p className="text-[11px] text-slate-400">
                        {request.staffCode} · {request.id}
                      </p>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-bold text-slate-800">{request.shiftDetail}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-medium text-slate-700">{request.reason}</p>
                      <p className="mt-0.5 text-[10px] text-slate-400">{request.submitTime}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${badge.className}`}>{badge.label}</span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      {request.status === "PENDING" ? (
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => onDecide(request, "APPROVED")} className="btn btn-primary btn-sm px-3.5 py-1.5">Duyệt</button>
                          <button onClick={() => onDecide(request, "REJECTED")} className="rounded-xl border border-red-200 px-3 py-1.5 font-bold text-red-600 transition-all hover:bg-red-50">
                            Từ chối
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] font-medium text-slate-400">Đã hoàn tất</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 p-4 text-xs text-slate-500">
        <span>
          Hiển thị 1–{filtered.length} trong {filtered.length} yêu cầu
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
