import React, { useState } from "react";
import { Search } from "lucide-react";
import { SHIFT_STATUS, type ShiftItem } from "./model";

const selectClass = "rounded-xl border border-slate-200 bg-white px-3 py-2 font-medium text-slate-700 outline-hidden hover:border-slate-300";

/** Bộ lọc + bảng ca đang mở đăng ký. */
export function ShiftRegisterTable({ shifts, onRegister }: { shifts: ShiftItem[]; onRegister: (id: string) => void }) {
  // Các bộ lọc hiện chỉ để hiển thị, chưa áp dụng lên danh sách
  const [search, setSearch] = useState("");
  const [store, setStore] = useState("all");
  const [shift, setShift] = useState("all");
  const [status, setStatus] = useState("all");

  return (
    <>
      <div className="flex flex-col justify-between gap-3 text-xs lg:flex-row lg:items-center">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm ngày hoặc cửa hàng"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3.5 text-slate-700 placeholder-slate-400 outline-hidden transition-all hover:border-slate-300 focus:border-brand-400"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <select value={store} onChange={(event) => setStore(event.target.value)} className={selectClass}>
            <option value="all">Tất cả cửa hàng</option>
            <option value="nt">Nguyễn Trãi</option>
            <option value="cmt8">Cách Mạng Tháng 8</option>
          </select>
          <select value={shift} onChange={(event) => setShift(event.target.value)} className={selectClass}>
            <option value="all">Tất cả ca</option>
            <option value="sang">Ca sáng (08:00 - 14:00)</option>
            <option value="toi">Ca tối (16:00 - 22:00)</option>
          </select>
          <select value={status} onChange={(event) => setStatus(event.target.value)} className={selectClass}>
            <option value="all">Tất cả tình trạng</option>
            <option value="available">Còn chỗ</option>
            <option value="registered">Đã đăng ký</option>
            <option value="full">Hết chỗ</option>
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-surface shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 p-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Ca đang mở đăng ký</h3>
          <span className="text-[11px] text-slate-400">Số lượng = Đã đăng ký / Sức chứa</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-semibold text-slate-400">
                <th className="px-4 py-3">Ngày làm</th>
                <th className="px-4 py-3">Ca & giờ</th>
                <th className="px-4 py-3">Cửa hàng</th>
                <th className="px-4 py-3 text-center">Số lượng</th>
                <th className="px-4 py-3">Tiền công / ca</th>
                <th className="px-4 py-3">Tình trạng</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {shifts.map((item) => {
                const meta = SHIFT_STATUS[item.status];
                return (
                  <tr key={item.id} className="transition-colors hover:bg-slate-50/70">
                    <td className="px-4 py-3 font-bold text-slate-800">{item.day}</td>
                    <td className="px-4 py-3">
                      <p className="font-bold text-slate-800">{item.shiftName}</p>
                      <p className="text-[11px] text-slate-400">{item.shiftHours}</p>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-600">{item.store}</td>
                    <td className="px-4 py-3 text-center font-bold text-slate-700">
                      {item.registeredCount} / {item.capacity}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-bold text-slate-800">{item.ratePerShift}</p>
                      <p className="text-[10px] text-slate-400">{item.hoursDetail}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${meta.badge}`}>{meta.label}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {item.status === "AVAILABLE" ? (
                        <button onClick={() => onRegister(item.id)} className="btn btn-primary btn-sm px-3.5 py-1.5">Đăng ký ca</button>
                      ) : (
                        <button disabled className={`cursor-not-allowed rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-semibold ${meta.button}`}>
                          {meta.label}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-slate-100 p-4 text-xs text-slate-500">
          <span>
            Hiển thị 1–{shifts.length} trong {shifts.length} ca
          </span>
          <div className="flex items-center gap-1.5">
            <button className="rounded-lg border border-slate-200 px-3 py-1.5 text-slate-400 disabled:opacity-50">Trước</button>
            <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 font-bold text-brand-contrast">1</button>
            <button className="rounded-lg border border-slate-200 px-3 py-1.5 text-slate-400 disabled:opacity-50">Sau</button>
          </div>
        </div>
      </div>
    </>
  );
}
