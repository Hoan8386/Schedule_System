"use client";

import React, { useState } from "react";
import {
  History,
  Download,
  X,
  Check,
  MoreHorizontal,
  Search,
  Filter,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
} from "lucide-react";

const tabs = [
  { label: "Tất cả yêu cầu", count: 45, key: "all" },
  { label: "Đăng ký ca", count: 20, key: "dangky" },
  { label: "Đổi ca", count: 15, key: "doica" },
  { label: "Hủy ca", count: 10, key: "huyca" },
];

const requests = [
  {
    id: 1,
    type: "ĐỔI CA",
    typeColor: "bg-blue-50 text-blue-700 border border-blue-200",
    name: "Lê Thị Mai",
    avatar: "LM",
    store: "BLOAN · Lê Lợi (Q1)",
    detail: { from: "Sáng 12/10 (08:00 - 14:00)", to: "Chiều 12/10 (14:00 - 20:00)" },
    reason: "Con ốm cần đi khám định kỳ buổi sáng",
    status: "CHỜ DUYỆT",
    statusColor: "bg-amber-50 text-amber-700 border border-amber-200",
    sentTime: "10:24 · 24/10",
    canAction: true,
  },
  {
    id: 2,
    type: "HỦY CA",
    typeColor: "bg-rose-50 text-rose-700 border border-rose-200",
    name: "Trần Văn Nam",
    avatar: "VN",
    store: "BLOAN · Tú Xương (Q3)",
    detail: { label: "Hủy ca: Chiều 25/10 (13:00 - 22:00)" },
    reason: "Việc gia đình đột xuất ở quê cần về gấp",
    status: "CHỜ DUYỆT",
    statusColor: "bg-amber-50 text-amber-700 border border-amber-200",
    sentTime: "08:15 · 25/10",
    canAction: true,
  },
  {
    id: 3,
    type: "ĐĂNG KÝ CA",
    typeColor: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    name: "Phạm Thu Thảo",
    avatar: "TT",
    store: "BLOAN · Giga Mall (Thủ Đức)",
    detail: { label: "Đăng ký thêm: Ca tối 28/10 (18:00 - 23:00)" },
    reason: "Tăng ca hỗ trợ chương trình khuyến mãi cuối tuần",
    status: "ĐÃ DUYỆT",
    statusColor: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    sentTime: "Duyệt bởi Admin (12:00)",
    canAction: false,
  },
  {
    id: 4,
    type: "ĐỔI CA",
    typeColor: "bg-blue-50 text-blue-700 border border-blue-200",
    name: "Hoàng Anh Thư",
    avatar: "AT",
    store: "BLOAN · Quang Trung (Gò Vấp)",
    detail: { from: "Toàn ca 26/10", to: "Sáng 27/10" },
    reason: "Trùng lịch thi kết thúc học phần đại học",
    status: "TỪ CHỐI",
    statusColor: "bg-rose-50 text-rose-700 border border-rose-200",
    sentTime: "Lý do: Đã đủ người ca sáng 27/10",
    canAction: false,
  },
];

export default function YeuCauPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [selectedItems, setSelectedItems] = useState<number[]>([1, 2]);
  const [search, setSearch] = useState("");

  const toggleSelect = (id: number) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedItems(requests.map((r) => r.id));
    } else {
      setSelectedItems([]);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">
            Xử lý yêu cầu ca làm
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Phê duyệt đăng ký, đổi ca và hủy ca của nhân sự trên toàn hệ thống Ăn Vặt BLOAN.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => alert("Mở lịch sử phê duyệt...")}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-xs"
          >
            <History className="w-4 h-4 text-slate-500" />
            <span>Lịch sử duyệt</span>
          </button>
          <button
            onClick={() => alert("Đang xuất báo cáo danh sách yêu cầu...")}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-900 text-xs font-bold transition-all shadow-sm shadow-amber-200"
          >
            <Download className="w-4 h-4" />
            <span>Xuất báo cáo</span>
          </button>
        </div>
      </div>

      {/* Tabs Filter */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 pb-3">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab.key
                ? "bg-amber-500 text-slate-900 shadow-xs"
                : "text-slate-600 hover:bg-slate-100/80"
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                activeTab === tab.key
                  ? "bg-slate-900 text-white"
                  : "bg-slate-200 text-slate-700"
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Filter row */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo tên nhân viên..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl outline-hidden hover:border-slate-300 focus:border-amber-400 transition-all font-medium text-slate-800"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select className="px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium text-slate-700 outline-hidden hover:border-slate-300">
            <option>Tất cả cửa hàng (24)</option>
            <option>BLOAN · Lê Lợi (Q1)</option>
            <option>BLOAN · Tú Xương (Q3)</option>
            <option>BLOAN · Giga Mall</option>
          </select>

          <div className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium text-slate-700">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>20/10/2026 – 26/10/2026</span>
          </div>

          <select className="px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium text-slate-700 outline-hidden hover:border-slate-300">
            <option>Tất cả trạng thái</option>
            <option>Chờ duyệt</option>
            <option>Đã duyệt</option>
            <option>Từ chối</option>
          </select>
        </div>
      </div>

      {/* Bulk action bar */}
      {selectedItems.length > 0 && (
        <div className="bg-amber-50 border border-amber-200/80 rounded-2xl px-5 py-3 flex items-center justify-between gap-4 shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-lg bg-amber-500 text-slate-900 flex items-center justify-center font-bold text-xs shadow-2xs">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
            <span className="text-xs font-bold text-slate-800">
              Đã chọn <span className="text-amber-800 font-black">{selectedItems.length}</span> yêu cầu
            </span>
            <button
              onClick={() => setSelectedItems([])}
              className="text-xs font-semibold text-amber-700 hover:underline ml-2"
            >
              Bỏ chọn tất cả
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => alert(`Đã từ chối ${selectedItems.length} yêu cầu được chọn`)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-rose-200 bg-white hover:bg-rose-50 text-rose-700 text-xs font-bold transition-all shadow-2xs"
            >
              <X className="w-3.5 h-3.5" />
              <span>Từ chối hàng loạt</span>
            </button>
            <button
              onClick={() => alert(`Đã phê duyệt ${selectedItems.length} yêu cầu thành công!`)}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-900 text-xs font-bold transition-all shadow-2xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Duyệt hàng loạt</span>
            </button>
          </div>
        </div>
      )}

      {/* Requests table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/60 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="px-5 py-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={selectedItems.length === requests.length}
                    onChange={handleSelectAll}
                    className="rounded accent-amber-500"
                  />
                </th>
                <th className="px-5 py-3">Loại yêu cầu</th>
                <th className="px-5 py-3">Nhân viên</th>
                <th className="px-5 py-3">Nội dung chi tiết</th>
                <th className="px-5 py-3">Lý do</th>
                <th className="px-5 py-3">Trạng thái</th>
                <th className="px-5 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {requests.map((req) => (
                <tr
                  key={req.id}
                  className={`hover:bg-slate-50/50 transition-colors ${
                    selectedItems.includes(req.id) ? "bg-amber-50/20" : ""
                  }`}
                >
                  <td className="px-5 py-4 text-center">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(req.id)}
                      onChange={() => toggleSelect(req.id)}
                      className="rounded accent-amber-500"
                    />
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${req.typeColor}`}>
                      {req.type}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-center border border-amber-200/80 shrink-0 shadow-2xs">
                        {req.avatar}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{req.name}</p>
                        <p className="text-[11px] text-slate-400 font-medium">{req.store}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    {req.detail.from ? (
                      <div className="flex items-center gap-1.5 text-xs font-semibold">
                        <span className="bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-lg">
                          {req.detail.from}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded-lg">
                          {req.detail.to}
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-800 font-semibold">{req.detail.label}</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-slate-600 max-w-[220px] leading-relaxed">
                    {req.reason}
                  </td>
                  <td className="px-5 py-4">
                    <div>
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${req.statusColor}`}>
                        {req.status}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-1 font-medium">{req.sentTime}</p>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-right">
                    {req.canAction ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => alert(`Từ chối yêu cầu của ${req.name}`)}
                          className="px-3 py-1.5 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-700 text-xs font-bold transition-colors"
                        >
                          Từ chối
                        </button>
                        <button
                          onClick={() => alert(`Duyệt yêu cầu của ${req.name}`)}
                          className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-900 text-xs font-bold transition-colors shadow-2xs"
                        >
                          Duyệt
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => alert(`Xem chi tiết yêu cầu của ${req.name}`)}
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-400 hover:text-slate-700 transition-colors"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-5 py-3.5 bg-slate-50/30 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>
            Hiển thị <span className="font-bold text-slate-700">1 – 4</span> của{" "}
            <span className="font-bold text-slate-700">45</span> yêu cầu
          </p>
          <div className="flex items-center gap-1.5">
            {["‹", "1", "2", "3", "›"].map((p, i) => (
              <button
                key={i}
                className={`w-8 h-8 rounded-lg font-bold transition-colors ${
                  p === "1"
                    ? "bg-amber-500 text-slate-900 shadow-2xs"
                    : "border border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
