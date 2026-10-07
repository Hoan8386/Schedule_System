"use client";

import React, { useState } from "react";
import { Plus, MapPin, Users, Grid, List, ChevronLeft, ChevronRight, Store, Calendar, Phone, MoreHorizontal } from "lucide-react";

const stores = [
  {
    name: "BLOAN · Nguyễn Trãi",
    code: "BLOAN-S01",
    address: "124 Nguyễn Trãi, Thanh Xuân, Hà Nội",
    phone: "024 3822 9901",
    manager: "Hoàng Nam",
    staffCount: "12 nhân sự",
    staffAvatars: 3,
    status: "HOẠT ĐỘNG",
    statusColor: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    imageBg: "from-amber-400/20 to-amber-500/30",
  },
  {
    name: "BLOAN · Lê Lợi",
    code: "BLOAN-S02",
    address: "45 Lê Lợi, Bến Nghé, Quận 1, TP. HCM",
    phone: "028 3910 8822",
    manager: "Lê Thị Mai",
    staffCount: "16 nhân sự",
    staffAvatars: 3,
    status: "HOẠT ĐỘNG",
    statusColor: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    imageBg: "from-orange-400/20 to-orange-500/30",
  },
  {
    name: "BLOAN · Tú Xương",
    code: "BLOAN-S03",
    address: "18 Tú Xương, Võ Thị Sáu, Quận 3, TP. HCM",
    phone: "028 3820 4455",
    manager: "Trần Văn Nam",
    staffCount: "10 nhân sự",
    staffAvatars: 2,
    status: "HOẠT ĐỘNG",
    statusColor: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    imageBg: "from-amber-400/20 to-amber-500/30",
  },
  {
    name: "BLOAN · Giga Mall",
    code: "BLOAN-S04",
    address: "Tầng 4 Giga Mall, 240 Phạm Văn Đồng, TP. Thủ Đức",
    phone: "028 3726 1199",
    manager: "Phạm Thu Thảo",
    staffCount: "14 nhân sự",
    staffAvatars: 3,
    status: "HOẠT ĐỘNG",
    statusColor: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    imageBg: "from-emerald-400/20 to-emerald-500/30",
  },
  {
    name: "BLOAN · Crescent Mall",
    code: "BLOAN-S05",
    address: "Tầng 3 Crescent Mall, 101 Tôn Dật Tiên, Tân Phú, Quận 7",
    phone: "028 5413 7788",
    manager: "Chưa bổ nhiệm",
    staffCount: "6 nhân sự",
    staffAvatars: 1,
    status: "SẮP MỞ",
    statusColor: "bg-blue-50 text-blue-700 border border-blue-200",
    imageBg: "from-blue-400/20 to-blue-500/30",
  },
  {
    name: "BLOAN · Phan Xích Long",
    code: "BLOAN-S06",
    address: "88 Phan Xích Long, Phường 2, Phú Nhuận, TP. HCM",
    phone: "028 3517 6622",
    manager: "Đỗ Minh Tuấn",
    staffCount: "8 nhân sự",
    staffAvatars: 2,
    status: "TẠM NGƯNG",
    statusColor: "bg-rose-50 text-rose-700 border border-rose-200",
    imageBg: "from-rose-400/20 to-rose-500/30",
  },
];

export default function CuaHangPage() {
  const [view, setView] = useState<"grid" | "table">("grid");

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">
            Quản lý chi nhánh cửa hàng
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Tổng hợp mạng lưới 24 cửa hàng thuộc hệ thống Ăn Vặt BLOAN trên toàn quốc.
          </p>
        </div>
        <button
          onClick={() => alert("Mở form thêm địa điểm cửa hàng mới...")}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-900 text-xs font-bold transition-all shadow-sm shadow-amber-200"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm cửa hàng mới</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center bg-slate-100 p-1 rounded-xl gap-1">
          <button
            onClick={() => setView("grid")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              view === "grid" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Dạng lưới</span>
          </button>
          <button
            onClick={() => setView("table")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              view === "table" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>Dạng bảng</span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <select className="px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium text-slate-700 outline-hidden hover:border-slate-300">
            <option>Khu vực: Toàn quốc</option>
            <option>TP. Hồ Chí Minh (18)</option>
            <option>Hà Nội (6)</option>
          </select>
          <select className="px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium text-slate-700 outline-hidden hover:border-slate-300">
            <option>Trạng thái: Tất cả</option>
            <option>Đang hoạt động</option>
            <option>Sắp khai trương</option>
            <option>Tạm ngưng</option>
          </select>
        </div>
      </div>

      {/* Grid view */}
      {view === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {stores.map((store, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden hover:shadow-md hover:border-amber-300 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Visual Area */}
                <div className={`relative h-36 bg-gradient-to-br ${store.imageBg} flex items-center justify-center border-b border-slate-100`}>
                  <div className="w-14 h-14 rounded-2xl bg-white/80 backdrop-blur-xs flex items-center justify-center shadow-xs">
                    <Store className="w-7 h-7 text-amber-600" />
                  </div>
                  <span className={`absolute top-3 right-3 text-[11px] font-black px-2.5 py-1 rounded-full ${store.statusColor}`}>
                    {store.status}
                  </span>
                  <span className="absolute bottom-2 left-3 text-[10px] font-mono font-bold bg-white/70 backdrop-blur-xs px-2 py-0.5 rounded-md text-slate-700">
                    {store.code}
                  </span>
                </div>

                {/* Card Content */}
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-black text-slate-800 text-base">{store.name}</h3>
                    <p className="flex items-start gap-1.5 text-xs text-slate-500 mt-1 font-medium leading-relaxed">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span>{store.address}</span>
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Trưởng cửa hàng</p>
                      <p className="font-bold text-slate-800 mt-0.5">{store.manager}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Đội ngũ</p>
                      <p className="font-bold text-slate-800 mt-0.5">{store.staffCount}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-4 pt-0 flex items-center gap-2">
                <button
                  onClick={() => alert(`Xem danh sách nhân viên: ${store.name}`)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold transition-colors"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Nhân sự</span>
                </button>
                <button
                  onClick={() => alert(`Xem lịch làm việc: ${store.name}`)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors"
                >
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Lịch ca</span>
                </button>
                <button
                  onClick={() => alert(`Tùy chọn cửa hàng: ${store.name}`)}
                  className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-400 hover:text-slate-700"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {/* Add New Store Tile */}
          <button
            onClick={() => alert("Mở form thêm địa điểm cửa hàng mới...")}
            className="bg-white rounded-2xl border-2 border-dashed border-slate-200 min-h-[300px] flex flex-col items-center justify-center gap-3 hover:border-amber-400 hover:bg-amber-50/20 transition-all group p-6"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-50 group-hover:bg-amber-100 flex items-center justify-center transition-colors">
              <Plus className="w-6 h-6 text-amber-600" />
            </div>
            <div className="text-center">
              <p className="font-bold text-slate-800 text-sm group-hover:text-amber-800">Thêm điểm bán mới</p>
              <p className="text-xs text-slate-400 mt-1">Mở rộng mạng lưới chi nhánh Ăn Vặt BLOAN</p>
            </div>
          </button>
        </div>
      ) : (
        /* Table view */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/60 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="px-5 py-3">Mã & Cửa hàng</th>
                <th className="px-5 py-3">Địa chỉ chi nhánh</th>
                <th className="px-5 py-3">Hotline</th>
                <th className="px-5 py-3">Trưởng cửa hàng</th>
                <th className="px-5 py-3">Quy mô</th>
                <th className="px-5 py-3">Trạng thái</th>
                <th className="px-5 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {stores.map((s, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-bold text-slate-800 text-sm">{s.name}</p>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">{s.code}</p>
                  </td>
                  <td className="px-5 py-4 font-medium text-slate-600 max-w-xs">{s.address}</td>
                  <td className="px-5 py-4 font-mono text-slate-600">{s.phone}</td>
                  <td className="px-5 py-4 font-bold text-slate-800">{s.manager}</td>
                  <td className="px-5 py-4 font-semibold text-slate-700">{s.staffCount}</td>
                  <td className="px-5 py-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${s.statusColor}`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => alert(`Quản lý cửa hàng ${s.name}`)}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs"
                    >
                      Chi tiết
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
        <span>
          Đang hiển thị <strong className="text-slate-800">6</strong> trên tổng số{" "}
          <strong className="text-slate-800">24</strong> cửa hàng chuỗi
        </span>
        <div className="flex items-center gap-1.5">
          <button className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 disabled:opacity-40">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button className="w-8 h-8 rounded-lg bg-amber-500 text-slate-900 font-bold shadow-2xs">
            1
          </button>
          <button className="w-8 h-8 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold">
            2
          </button>
          <button className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
