"use client";

import React, { useState } from "react";
import { Plus, MapPin, Users, Grid, List, ChevronLeft, ChevronRight } from "lucide-react";

const stores = [
  {
    name: "CH Nguyễn Trãi", code: "#S01", address: "124 Nguyễn Trãi, Thanh Xuân, Hà Nội",
    manager: "Hoàng Nam", staffCount: "12 TV", staffAvatars: 3,
    status: "HOẠT ĐỘNG", statusColor: "bg-green-500 text-white",
    imageBg: "from-amber-200 to-amber-300",
  },
  {
    name: "CH Lê Lợi", code: "#S02", address: "45 Lê Lợi, Quận 1, TP. Hồ Chí Minh",
    manager: "Lan Anh", staffCount: "8 TV", staffAvatars: 3,
    status: "HOẠT ĐỘNG", statusColor: "bg-green-500 text-white",
    imageBg: "from-orange-200 to-orange-300",
  },
  {
    name: "CH Bà Triệu", code: "#S03", address: "210 Bà Triệu, Hai Bà Trưng, Hà Nội",
    manager: "Chưa cập nhật", staffCount: "0 TV", staffAvatars: 0,
    status: "SẮP MỞ", statusColor: "bg-amber-400 text-white",
    imageBg: "from-slate-200 to-slate-300",
  },
  {
    name: "CH Phan Xích Long", code: "#S04", address: "88 Phan Xích Long, Phú Nhuận, HCM",
    manager: "Minh Tuấn", staffCount: "5 TV", staffAvatars: 2,
    status: "TẠM NGƯNG", statusColor: "bg-red-500 text-white",
    imageBg: "from-rose-200 to-rose-300",
  },
];

export default function CuaHangPage() {
  const [view, setView] = useState<"grid" | "table">("grid");

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-slate-900">Quản lý cửa hàng</h1>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-white text-sm font-semibold transition-colors shadow-sm">
          <Plus size={15} /> Thêm cửa hàng mới
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 gap-1">
          <button onClick={() => setView("grid")} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${view === "grid" ? "bg-amber-50 text-amber-700" : "text-slate-500 hover:text-slate-700"}`}>
            <Grid size={14} /> Grid view
          </button>
          <button onClick={() => setView("table")} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${view === "table" ? "bg-amber-50 text-amber-700" : "text-slate-500 hover:text-slate-700"}`}>
            <List size={14} /> Table view
          </button>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <select className="text-sm px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-700">
            <option>Khu vực: Tất cả</option>
            <option>Hà Nội</option>
            <option>TP. HCM</option>
          </select>
          <select className="text-sm px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-700">
            <option>Trạng thái: Hoạt động</option>
            <option>Tất cả</option>
            <option>Tạm ngưng</option>
          </select>
          <button className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 4h10M5 8h6M7 12h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
          </button>
        </div>
      </div>

      {/* Grid view */}
      {view === "grid" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {stores.map((store, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden hover:shadow-md hover:border-amber-200 transition-all group">
              {/* Image area */}
              <div className={`relative h-44 bg-gradient-to-br ${store.imageBg} flex items-center justify-center`}>
                <span className="text-6xl opacity-30">🏪</span>
                <span className={`absolute top-3 right-3 text-xs font-bold px-3 py-1 rounded-full ${store.statusColor}`}>
                  {store.status}
                </span>
              </div>

              {/* Card content */}
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <h3 className="font-bold text-slate-900">{store.name}</h3>
                  <span className="text-xs text-slate-400 font-mono">{store.code}</span>
                </div>
                <div className="flex items-center gap-1 mt-1 text-xs text-slate-500">
                  <MapPin size={11} />
                  <span>{store.address}</span>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Trưởng cửa hàng</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 font-bold text-[10px] flex items-center justify-center">
                        {store.manager !== "Chưa cập nhật" ? store.manager.split(" ").slice(-1)[0].slice(0, 2).toUpperCase() : "?"}
                      </div>
                      <span className="text-xs font-medium text-slate-700">{store.manager}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Nhân sự</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      {store.staffAvatars > 0 && (
                        <div className="flex -space-x-1.5">
                          {Array.from({ length: Math.min(store.staffAvatars, 3) }).map((_, j) => (
                            <div key={j} className="w-5 h-5 rounded-full bg-slate-300 border border-white" />
                          ))}
                        </div>
                      )}
                      <span className="text-xs font-medium text-slate-700">{store.staffCount}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2">
                  <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-amber-600 hover:bg-amber-50 text-xs font-semibold transition-colors border border-amber-200">
                    <Users size={12} /> Nhân viên
                  </button>
                  <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-amber-600 hover:bg-amber-50 text-xs font-semibold transition-colors border border-amber-200">
                    📅 Lịch làm
                  </button>
                  <button className="ml-auto p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
                    <span className="text-base">···</span>
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Add new card */}
          <button className="bg-white rounded-2xl border-2 border-dashed border-slate-200 h-[360px] flex flex-col items-center justify-center gap-3 hover:border-amber-300 hover:bg-amber-50/40 transition-colors group">
            <div className="w-12 h-12 rounded-full bg-slate-100 group-hover:bg-amber-100 flex items-center justify-center transition-colors">
              <Plus size={22} className="text-slate-400 group-hover:text-amber-600" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-slate-600 group-hover:text-amber-700">Thêm cửa hàng</p>
              <p className="text-xs text-slate-400 mt-0.5">Mở rộng mạng lưới kinh doanh</p>
            </div>
          </button>
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-slate-500">
        <span>Đang hiển thị <strong>4</strong> trên tổng số <strong>4</strong> cửa hàng</span>
        <div className="flex items-center gap-1">
          <button className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-slate-400"><ChevronLeft size={14} /></button>
          <button className="w-8 h-8 rounded-lg bg-amber-400 text-white font-semibold text-sm">1</button>
          <button className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-slate-400"><ChevronRight size={14} /></button>
        </div>
      </div>
    </div>
  );
}
