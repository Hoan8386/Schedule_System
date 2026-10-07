"use client";

import React, { useState } from "react";
import { History, Download, X, Check, MoreHorizontal } from "lucide-react";

const tabs = [
  { label: "Tất cả", count: 45, key: "all" },
  { label: "Đăng ký ca", count: 20, key: "dangky" },
  { label: "Đổi ca", count: 15, key: "doica" },
  { label: "Hủy ca", count: 10, key: "huyca" },
];

const requests = [
  {
    type: "ĐỔI CA", typeColor: "bg-blue-100 text-blue-700",
    name: "Lê Thị Mai", store: "Q1 - Lê Lợi",
    detail: { from: "Sáng 12/10", to: "Chiều 12/10" },
    reason: "Con ốm cần đi khám định kỳ buổi sáng",
    status: "CHỜ DUYỆT", statusColor: "bg-amber-100 text-amber-700",
    sentTime: "Gửi: 10:24 24/10",
    canAction: true,
    selected: true,
  },
  {
    type: "HỦY CA", typeColor: "bg-red-100 text-red-700", typeIcon: "🗑",
    name: "Trần Văn Nam", store: "Q3 - Tú Xương",
    detail: { label: "Hủy ca: Chiều 25/10 (13:00-22:00)" },
    reason: "Việc gia đình đột xuất ở quê",
    status: "CHỜ DUYỆT", statusColor: "bg-amber-100 text-amber-700",
    sentTime: "Gửi: 08:15 25/10",
    canAction: true,
    selected: true,
  },
  {
    type: "ĐĂNG KÝ CA", typeColor: "bg-green-100 text-green-700", typeIcon: "📋",
    name: "Phạm Thu Thảo", store: "Thủ Đức - Giga Mall",
    detail: { label: "Đăng ký thêm: Ca tối 28/10" },
    reason: "Tăng ca hỗ trợ chương trình khuyến mãi",
    status: "ĐÃ DUYỆT", statusColor: "bg-green-100 text-green-700",
    sentTime: "Bởi: Admin (12:00)",
    canAction: false,
    selected: true,
  },
  {
    type: "ĐỔI CA", typeColor: "bg-blue-100 text-blue-700",
    name: "Hoàng Anh Thư", store: "Q3 - Tú Xương",
    detail: { from: "Toàn ca 26/10", to: "Sáng 27/10" },
    reason: "Trùng lịch thi kết thúc học phần",
    status: "TỪ CHỐI", statusColor: "bg-red-100 text-red-700",
    sentTime: "Lý do: Không đủ nhân sự",
    canAction: false,
    selected: false,
  },
];

export default function YeuCauPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [selectedItems, setSelectedItems] = useState<number[]>([0, 1, 2]);

  const toggleSelect = (idx: number) => {
    setSelectedItems((prev) => prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <nav className="text-xs text-slate-400 mb-1">Hệ thống <span className="mx-1">›</span> <span className="text-slate-600">Xử lý yêu cầu</span></nav>
          <h1 className="text-2xl font-extrabold text-slate-900">Xử lý yêu cầu hệ thống</h1>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
            <History size={15} /> Lịch sử duyệt
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-white text-sm font-semibold transition-colors shadow-sm">
            <Download size={15} /> Xuất báo cáo
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-100">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab.key
                ? "border-amber-400 text-amber-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${activeTab === tab.key ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-500"}`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Filter row */}
      <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-xs flex flex-wrap items-end gap-3">
        <div>
          <label className="text-xs text-slate-500 font-medium mb-1 block">CỬA HÀNG</label>
          <select className="text-sm px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-300 min-w-[160px]">
            <option>Tất cả cửa hàng</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-slate-500 font-medium mb-1 block">KHOẢNG NGÀY</label>
          <div className="text-sm px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 min-w-[180px] flex items-center gap-2">
            <span className="text-slate-400">📅</span>
            <span>20/10/2023 - 26/10/2023</span>
          </div>
        </div>
        <div>
          <label className="text-xs text-slate-500 font-medium mb-1 block">TRẠNG THÁI</label>
          <select className="text-sm px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-300 min-w-[160px]">
            <option>Tất cả trạng thái</option>
            <option>Chờ duyệt</option>
            <option>Đã duyệt</option>
            <option>Từ chối</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-slate-500 font-medium mb-1 block">TÌM KIẾM</label>
          <input placeholder="Tên nhân viên..." className="text-sm px-3 py-2 rounded-lg border border-slate-200 bg-white w-44 focus:outline-none focus:ring-2 focus:ring-amber-300 placeholder:text-slate-400" />
        </div>
        <button className="px-4 py-2 rounded-lg bg-slate-800 text-white text-sm font-semibold hover:bg-slate-700 transition-colors">
          Lọc dữ liệu
        </button>
      </div>

      {/* Bulk action bar */}
      {selectedItems.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-4">
          <div className="w-4 h-4 rounded bg-blue-500 flex items-center justify-center">
            <Check size={10} className="text-white" />
          </div>
          <span className="text-sm font-semibold text-slate-700">Đã chọn {selectedItems.length} yêu cầu</span>
          <button className="text-amber-600 text-sm font-medium hover:text-amber-700">Hủy chọn</button>
          <div className="ml-auto flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors">
              <X size={14} /> Từ chối hàng loạt
            </button>
            <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white text-sm font-semibold transition-colors">
              <Check size={14} /> Duyệt hàng loạt
            </button>
          </div>
        </div>
      )}

      {/* Requests table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <th className="px-5 py-3 text-left w-8"><input type="checkbox" className="rounded" /></th>
              <th className="px-5 py-3 text-left">Loại yêu cầu</th>
              <th className="px-5 py-3 text-left">Nhân viên</th>
              <th className="px-5 py-3 text-left">Nội dung chi tiết</th>
              <th className="px-5 py-3 text-left">Lý do</th>
              <th className="px-5 py-3 text-left">Trạng thái</th>
              <th className="px-5 py-3 text-left">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {requests.map((req, i) => (
              <tr key={i} className={`hover:bg-slate-50/50 transition-colors ${selectedItems.includes(i) ? "bg-blue-50/30" : ""}`}>
                <td className="px-5 py-4">
                  <input type="checkbox" checked={selectedItems.includes(i)} onChange={() => toggleSelect(i)} className="rounded accent-blue-500" />
                </td>
                <td className="px-5 py-4">
                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${req.typeColor}`}>
                    {req.typeIcon && `${req.typeIcon} `}{req.type}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 font-bold text-xs flex items-center justify-center shrink-0">
                      {req.name.split(" ").slice(-1)[0].slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">{req.name}</p>
                      <p className="text-[11px] text-slate-400">{req.store}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  {req.detail.from ? (
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded font-medium">{req.detail.from}</span>
                      <span className="text-slate-400">→</span>
                      <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-medium">{req.detail.to}</span>
                    </div>
                  ) : (
                    <span className="text-slate-700 text-xs">{req.detail.label}</span>
                  )}
                </td>
                <td className="px-5 py-4 text-slate-600 text-xs max-w-[160px]">{req.reason}</td>
                <td className="px-5 py-4">
                  <div>
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${req.statusColor}`}>{req.status}</span>
                    <p className="text-[10px] text-slate-400 mt-0.5">{req.sentTime}</p>
                  </div>
                </td>
                <td className="px-5 py-4">
                  {req.canAction ? (
                    <div className="flex items-center gap-1.5">
                      <button className="px-3 py-1.5 rounded-lg border border-red-300 text-red-600 text-xs font-semibold hover:bg-red-50 transition-colors">Từ chối</button>
                      <button className="px-3 py-1.5 rounded-lg bg-amber-400 text-white text-xs font-semibold hover:bg-amber-500 transition-colors">Duyệt</button>
                    </div>
                  ) : (
                    <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
                      <MoreHorizontal size={16} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between">
          <p className="text-sm text-slate-500">Hiển thị <strong>1 - 4</strong> của <strong>45</strong> yêu cầu</p>
          <div className="flex items-center gap-1">
            {["‹", "1", "2", "3", "›"].map((p, i) => (
              <button key={i} className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${p === "1" ? "bg-amber-400 text-white" : "text-slate-600 hover:bg-slate-100"}`}>{p}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
