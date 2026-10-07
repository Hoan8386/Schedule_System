"use client";

import React from "react";
import { AlertTriangle, MessageSquare, Download, Settings, Plus, MoreVertical } from "lucide-react";

const statCards = [
  { label: "Vi phạm tháng này", value: "42", sub: "+12% so với tháng trước", subColor: "text-red-500", icon: <AlertTriangle size={18} className="text-orange-500" />, iconBg: "bg-orange-100" },
  { label: "Vi phạm phổ biến nhất", value: "Đi muộn > 15p", sub: "18 trường hợp ghi nhận", subColor: "text-slate-500", icon: <span className="text-yellow-500 text-base">⚡</span>, iconBg: "bg-yellow-100", small: true },
  { label: "Tổng tiền phạt", value: "8.450.000", sub: "Đã thu hồi 85%", subColor: "text-emerald-600", icon: <span className="text-blue-500 text-base">💰</span>, iconBg: "bg-blue-100", unit: "VND" },
  { label: "Khiếu nại đang chờ", value: "05", sub: "Cần phản hồi trong 24h", subColor: "text-amber-600", icon: <MessageSquare size={18} className="text-purple-500" />, iconBg: "bg-purple-100" },
];

const violations = [
  { name: "Nguyễn Thùy Dương", id: "#NV1002", store: "Chi nhánh Q1", type: "ĐI MUỘN", typeColor: "text-amber-600 bg-amber-50", time: "08:16 AM", date: "15/11/2023", action: "Trừ lương", penalty: "-50.000", status: "ĐÃ XÁC NHẬN", statusColor: "bg-green-100 text-green-700", action2: "Chi tiết" },
  { name: "Lê Quốc Khánh", id: "#NV1005", store: "Chi nhánh Q7", type: "NGHỈ KHÔNG PHÉP", typeColor: "text-red-600 bg-red-50", time: "Ca Sáng", date: "14/11/2023", action: "Cảnh cáo & Trừ lương", penalty: "-200.000", status: "ĐANG KHIẾU NẠI", statusColor: "bg-orange-100 text-orange-700", action2: "Phản hồi" },
  { name: "Phạm Hoàng Nam", id: "#NV1090", store: "Kho Trung Tâm", type: "SAI QUY TRÌNH", typeColor: "text-blue-600 bg-blue-50", time: "03:30 PM", date: "13/11/2023", action: "Nhắc nhở trực tiếp", penalty: "0", status: "HOÀN TẤT", statusColor: "bg-slate-100 text-slate-600", action2: "Xem" },
  { name: "Hoàng Minh Anh", id: "#NV1009", store: "Chi nhánh BT", type: "ĐI MUỘN", typeColor: "text-amber-600 bg-amber-50", time: "08:05 AM", date: "13/11/2023", action: "Trừ lương", penalty: "-20.000", status: "ĐÃ XÁC NHẬN", statusColor: "bg-green-100 text-green-700", action2: "Chi tiết" },
  { name: "Đỗ Văn Hùng", id: "#NV1022", store: "Chi nhánh Q3", type: "KHÁC", typeColor: "text-slate-600 bg-slate-50", time: "10:45 AM", date: "12/11/2023", action: "Phê bình", penalty: "0", status: "HOÀN TẤT", statusColor: "bg-slate-100 text-slate-600", action2: "Xem" },
];

const rules = [
  { title: "Đi muộn > 15 phút", desc: "Phạt 50.000đ/lần. Quá 3 lần/tháng trừ thêm 100.000đ.", color: "border-l-amber-400" },
  { title: "Nghỉ không phép", desc: "Phạt 200.000đ/ngày & hủy thưởng chuyên cần tháng.", color: "border-l-red-500" },
  { title: "Sai quy trình phục vụ", desc: "Nhắc nhở lần 1. Lần 2 phạt 100.000đ.", color: "border-l-orange-400" },
  { title: "Trang phục không đúng", desc: "Phạt 20.000đ/lần vi phạm.", color: "border-l-slate-400" },
  { title: "Sử dụng điện thoại", desc: "Phạt 50.000đ trong giờ phục vụ khách.", color: "border-l-slate-400" },
];

export default function NoiQuyPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Nội quy & Vi phạm</h1>
          <p className="text-sm text-slate-500 mt-1">Giám sát và xử lý các trường hợp vi phạm quy định làm việc</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
            <Settings size={15} /> Cấu hình Nội quy
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors shadow-sm">
            <Plus size={15} /> Lập biên bản mới
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <div key={i} className="bg-white rounded-xl p-4 border border-slate-100 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-slate-500">{card.label}</p>
              <div className={`w-8 h-8 rounded-lg ${card.iconBg} flex items-center justify-center`}>{card.icon}</div>
            </div>
            <p className={`font-extrabold text-slate-900 ${card.small ? "text-base" : "text-2xl"}`}>
              {card.value} {card.unit && <span className="text-sm text-slate-500">{card.unit}</span>}
            </p>
            <p className={`text-xs mt-0.5 ${card.subColor}`}>{card.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Violations table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-slate-500">☰</span>
              <h3 className="font-bold text-slate-800">Danh sách biên bản vi phạm</h3>
            </div>
            <div className="flex items-center gap-2">
              <select className="text-xs px-2 py-1 rounded border border-slate-200 bg-white text-slate-600">
                <option>Tất cả trạng thái</option>
              </select>
              <button className="p-1.5 rounded hover:bg-slate-100 text-slate-400"><Download size={14} /></button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="px-4 py-3 text-left">Nhân viên</th>
                  <th className="px-4 py-3 text-left">Cửa hàng</th>
                  <th className="px-4 py-3 text-left">Loại vi phạm</th>
                  <th className="px-4 py-3 text-left">Thời gian</th>
                  <th className="px-4 py-3 text-left">Xử lý</th>
                  <th className="px-4 py-3 text-left">Mức phạt</th>
                  <th className="px-4 py-3 text-left">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {violations.map((v, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 font-bold text-xs flex items-center justify-center shrink-0">
                          {v.name.split(" ").slice(-1)[0].slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 text-xs">{v.name}</p>
                          <p className="text-[10px] text-slate-400">{v.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-500">{v.store}</td>
                    <td className="px-4 py-3.5">
                      <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${v.typeColor}`}>{v.type}</span>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-600">{v.time}<br /><span className="text-slate-400">{v.date}</span></td>
                    <td className="px-4 py-3.5 text-xs text-slate-600">{v.action}</td>
                    <td className={`px-4 py-3.5 text-xs font-bold ${v.penalty.startsWith("-") ? "text-red-600" : "text-slate-600"}`}>{v.penalty}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${v.statusColor}`}>{v.status}</span>
                        <button className="text-amber-600 text-xs font-semibold hover:text-amber-700">{v.action2}</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between">
            <p className="text-xs text-slate-500">Hiển thị 1-10 trên 42 trường hợp</p>
            <div className="flex items-center gap-1">
              {["‹", "1", "2", "›"].map((p, i) => (
                <button key={i} className={`w-7 h-7 rounded text-sm font-medium ${p === "1" ? "bg-amber-400 text-white" : "text-slate-500 hover:bg-slate-100"}`}>{p}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Rules panel */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800">Nội quy hiện hành</h3>
              <button className="p-1.5 rounded hover:bg-slate-100 text-slate-400"><Settings size={14} /></button>
            </div>
            <div className="space-y-3">
              {rules.map((rule, i) => (
                <div key={i} className={`rounded-lg border-l-4 ${rule.color} bg-slate-50 p-3`}>
                  <p className="text-sm font-semibold text-slate-800">{rule.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{rule.desc}</p>
                </div>
              ))}
            </div>
            <button className="mt-3 w-full py-2 rounded-xl border border-dashed border-slate-200 text-xs text-slate-400 hover:bg-slate-50 transition-colors">
              + Thêm quy định mới
            </button>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-red-500">⚠</span>
              <p className="text-sm font-bold text-red-700">LƯU Ý QUAN TRỌNG</p>
            </div>
            <p className="text-xs text-red-600">Mọi biên bản xử lý trừ lương cần có hình ảnh/bằng chứng đính kèm để tránh các khiếu nại không đáng có từ nhân sự.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
