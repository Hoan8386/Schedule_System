"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  MessageSquare,
  Download,
  Settings,
  Plus,
  MoreVertical,
  Search,
  CheckCircle2,
  Clock,
  ShieldAlert,
} from "lucide-react";

const statCards = [
  {
    label: "Vi phạm tháng này",
    value: "42 ca",
    sub: "+12% so với tháng trước",
    subColor: "text-rose-500",
    icon: AlertTriangle,
    iconColor: "text-rose-600",
    iconBg: "bg-rose-50",
  },
  {
    label: "Lỗi phổ biến nhất",
    value: "Đi muộn > 15p",
    sub: "18 trường hợp ghi nhận",
    subColor: "text-slate-500",
    icon: Clock,
    iconColor: "text-amber-600",
    iconBg: "bg-amber-50",
  },
  {
    label: "Tổng tiền phạt khấu trừ",
    value: "8.450.000 đ",
    sub: "Đã thu hồi 85% vào quỹ",
    subColor: "text-emerald-600",
    icon: ShieldAlert,
    iconColor: "text-blue-600",
    iconBg: "bg-blue-50",
  },
  {
    label: "Khiếu nại đang chờ xử lý",
    value: "05 vụ",
    sub: "Cần phản hồi trong 24h",
    subColor: "text-amber-600",
    icon: MessageSquare,
    iconColor: "text-purple-600",
    iconBg: "bg-purple-50",
  },
];

const violations = [
  {
    name: "Nguyễn Thùy Dương",
    id: "#NV1002",
    store: "BLOAN · Lê Lợi (Q1)",
    type: "ĐI MUỘN",
    typeColor: "text-amber-700 bg-amber-50 border border-amber-200",
    time: "08:16 AM",
    date: "15/10/2026",
    action: "Trừ lương",
    penalty: "-50.000 đ",
    status: "ĐÃ XÁC NHẬN",
    statusColor: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    action2: "Chi tiết",
  },
  {
    name: "Lê Quốc Khánh",
    id: "#NV1005",
    store: "BLOAN · Crescent Mall (Q7)",
    type: "NGHỈ KHÔNG PHÉP",
    typeColor: "text-rose-700 bg-rose-50 border border-rose-200",
    time: "Ca Sáng",
    date: "14/10/2026",
    action: "Cảnh cáo & Trừ lương",
    penalty: "-200.000 đ",
    status: "ĐANG KHIẾU NẠI",
    statusColor: "bg-amber-50 text-amber-700 border border-amber-200",
    action2: "Phản hồi",
  },
  {
    name: "Phạm Hoàng Nam",
    id: "#NV1090",
    store: "Kho Tổng BLOAN",
    type: "SAI QUY TRÌNH",
    typeColor: "text-blue-700 bg-blue-50 border border-blue-200",
    time: "03:30 PM",
    date: "13/10/2026",
    action: "Nhắc nhở trực tiếp",
    penalty: "0 đ",
    status: "HOÀN TẤT",
    statusColor: "bg-slate-100 text-slate-600 border border-slate-200",
    action2: "Xem",
  },
  {
    name: "Hoàng Minh Anh",
    id: "#NV1009",
    store: "BLOAN · CMT8 (Tân Bình)",
    type: "ĐI MUỘN",
    typeColor: "text-amber-700 bg-amber-50 border border-amber-200",
    time: "08:05 AM",
    date: "13/10/2026",
    action: "Trừ lương",
    penalty: "-20.000 đ",
    status: "ĐÃ XÁC NHẬN",
    statusColor: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    action2: "Chi tiết",
  },
  {
    name: "Đỗ Văn Hùng",
    id: "#NV1022",
    store: "BLOAN · Tú Xương (Q3)",
    type: "KHÁC",
    typeColor: "text-slate-700 bg-slate-50 border border-slate-200",
    time: "10:45 AM",
    date: "12/10/2026",
    action: "Phê bình nội bộ",
    penalty: "0 đ",
    status: "HOÀN TẤT",
    statusColor: "bg-slate-100 text-slate-600 border border-slate-200",
    action2: "Xem",
  },
];

const rules = [
  {
    title: "Đi muộn > 15 phút",
    desc: "Phạt 50.000đ/lần. Quá 3 lần/tháng trừ thêm 100.000đ và hạ 1 bậc thưởng.",
    color: "border-l-amber-500",
  },
  {
    title: "Nghỉ không phép (Bỏ ca)",
    desc: "Phạt 200.000đ/ngày & hủy toàn bộ tiền thưởng chuyên cần trong tháng.",
    color: "border-l-rose-500",
  },
  {
    title: "Sai quy trình phục vụ / An toàn thực phẩm",
    desc: "Nhắc nhở lần 1. Lần 2 phạt 100.000đ và học lại quy trình vệ sinh.",
    color: "border-l-orange-400",
  },
  {
    title: "Trang phục / Tạp dề không đúng quy chuẩn",
    desc: "Phạt 20.000đ/lần vi phạm tại khu vực quầy thu ngân & chế biến.",
    color: "border-l-slate-400",
  },
  {
    title: "Sử dụng điện thoại trong giờ làm",
    desc: "Phạt 50.000đ/lần trong giờ phục vụ cao điểm không có sự cho phép.",
    color: "border-l-slate-400",
  },
];

export default function NoiQuyPage() {
  const [search, setSearch] = useState("");

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">
            Nội quy & Xử lý vi phạm
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Giám sát kỷ luật làm việc, xử lý biên bản vi phạm và giải quyết khiếu nại nhân sự.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => alert("Mở cấu hình mức phạt nội quy chuỗi...")}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-xs"
          >
            <Settings className="w-4 h-4 text-slate-500" />
            <span>Cấu hình nội quy</span>
          </button>
          <button
            onClick={() => alert("Mở form lập biên bản vi phạm mới...")}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-900 text-xs font-bold transition-all shadow-sm shadow-amber-200"
          >
            <Plus className="w-4 h-4" />
            <span>Lập biên bản mới</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between"
            >
              <div>
                <span className="text-xs font-semibold text-slate-500">
                  {card.label}
                </span>
                <div className="text-xl sm:text-2xl font-black text-slate-800 mt-1 tracking-tight">
                  {card.value}
                </div>
                <p className={`text-[11px] mt-1 font-semibold ${card.subColor}`}>
                  {card.sub}
                </p>
              </div>
              <div
                className={`w-10 h-10 rounded-xl ${card.iconBg} ${card.iconColor} flex items-center justify-center shrink-0`}
              >
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Violations table (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="relative flex-1 max-w-xs">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm nhân viên, Mã NV..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl outline-hidden hover:border-slate-300 focus:border-amber-400 transition-all font-medium text-slate-800"
                />
              </div>
              <div className="flex items-center gap-2">
                <select className="px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium text-slate-700 outline-hidden hover:border-slate-300">
                  <option>Tất cả trạng thái</option>
                  <option>Đã xác nhận</option>
                  <option>Đang khiếu nại</option>
                  <option>Hoàn tất</option>
                </select>
                <button
                  onClick={() => alert("Đang xuất danh sách biên bản vi phạm...")}
                  className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors shadow-2xs"
                  title="Xuất dữ liệu"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/60 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="px-4 py-3">Nhân viên</th>
                    <th className="px-4 py-3">Cửa hàng</th>
                    <th className="px-4 py-3">Loại vi phạm</th>
                    <th className="px-4 py-3">Thời gian</th>
                    <th className="px-4 py-3">Xử lý</th>
                    <th className="px-4 py-3">Mức phạt</th>
                    <th className="px-4 py-3 text-right">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {violations.map((v, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-center border border-amber-200 shrink-0">
                            {v.name.split(" ").slice(-1)[0].slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 text-xs">{v.name}</p>
                            <p className="text-[10px] text-slate-400 font-medium">{v.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-slate-600 font-medium">{v.store}</td>
                      <td className="px-4 py-3.5">
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${v.typeColor}`}>
                          {v.type}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-slate-600">
                        <span className="font-semibold text-slate-700">{v.time}</span>
                        <br />
                        <span className="text-[10px] text-slate-400">{v.date}</span>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-slate-600 font-medium">{v.action}</td>
                      <td
                        className={`px-4 py-3.5 text-xs font-black ${
                          v.penalty.startsWith("-") ? "text-rose-600" : "text-slate-600"
                        }`}
                      >
                        {v.penalty}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${v.statusColor}`}>
                            {v.status}
                          </span>
                          <button
                            onClick={() => alert(`Xem chi tiết biên bản của ${v.name}`)}
                            className="text-amber-700 font-bold text-xs hover:underline"
                          >
                            {v.action2}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="px-5 py-3.5 bg-slate-50/30 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <p>
              Hiển thị <span className="font-bold text-slate-700">1 – 5</span> trên{" "}
              <span className="font-bold text-slate-700">42</span> trường hợp vi phạm
            </p>
            <div className="flex items-center gap-1.5">
              {["‹", "1", "2", "›"].map((p, i) => (
                <button
                  key={i}
                  className={`w-7 h-7 rounded-lg font-bold transition-colors ${
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

        {/* Rules panel (1 col) */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-800 text-sm">Nội quy hiện hành</h3>
              </div>
              <button
                onClick={() => alert("Mở trình cài đặt khung chế tài...")}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2.5">
              {rules.map((rule, i) => (
                <div
                  key={i}
                  className={`rounded-xl border border-slate-100 border-l-4 ${rule.color} bg-slate-50/60 p-3 hover:bg-slate-50 transition-colors`}
                >
                  <p className="text-xs font-bold text-slate-800">{rule.title}</p>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{rule.desc}</p>
                </div>
              ))}
            </div>
            <button
              onClick={() => alert("Mở form thêm quy định nội quy mới...")}
              className="mt-3 w-full py-2.5 rounded-xl border border-dashed border-slate-200 text-xs font-bold text-slate-500 hover:bg-slate-50 hover:border-slate-300 transition-colors text-center"
            >
              + Thêm quy định nội quy mới
            </button>
          </div>

          <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 shadow-2xs">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-amber-600 text-base">⚠️</span>
              <p className="text-xs font-black text-amber-900 uppercase tracking-wider">
                LƯU Ý QUAN TRỌNG TỪ BAN ĐIỀU HÀNH
              </p>
            </div>
            <p className="text-xs text-amber-900/90 leading-relaxed font-medium">
              Mọi biên bản xử lý khấu trừ lương cần có xác nhận bằng chứng ảnh chụp hoặc dữ liệu máy chấm công để đảm bảo tính minh bạch và tránh khiếu nại.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
