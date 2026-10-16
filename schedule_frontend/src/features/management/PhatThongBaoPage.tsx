"use client";

import React, { useState } from "react";
import {
  BellRing,
  Send,
  Users,
  Store,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Radio,
  FileText,
  Info,
  Calendar,
} from "lucide-react";

export default function PhatThongBaoPage() {
  const [targetScope, setTargetScope] = useState("STORE_CURRENT");
  const [selectedChannel, setSelectedChannel] = useState({
    app: true,
    email: false,
    zalo: false,
  });
  const [priority, setPriority] = useState<"NORMAL" | "HIGH" | "URGENT">("HIGH");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);

  // Mẫu thông báo gợi ý nhanh cho quản lý
  const quickTemplates = [
    {
      title: "[ĐỔI LỊCH CA] Thay đổi lịch phân ca tuần tới",
      message: "Quản lý đã cập nhật lại bảng phân ca tuần mới. Các bạn nhân viên vui lòng vào app kiểm tra ca làm và xác nhận trước 20:00 tối nay.",
      priority: "HIGH" as const,
    },
    {
      title: "[HỌP GIAO BAN] Họp đột xuất đầu ca làm",
      message: "Toàn bộ nhân sự ca chiều tập trung tại quầy pha chế trước giờ làm 15 phút để họp giao ban và phổ biến quy trình mới.",
      priority: "URGENT" as const,
    },
    {
      title: "[VỆ SINH CỬA HÀNG] Tổng vệ sinh định kỳ cuối tuần",
      message: "Nhắc nhở các bạn nhân viên hoàn tất bảng kiểm checklist vệ sinh máy móc và bàn ghế trước khi bàn giao ca tối.",
      priority: "NORMAL" as const,
    },
    {
      title: "[KHẨN CẤP] Điều chỉnh giờ đóng/mở cửa",
      message: "Cửa hàng sẽ mở cửa trễ hơn 30 phút vào sáng mai để bảo trì hệ thống điện. Các bạn nhân viên ca sáng lưu ý nắm thông tin.",
      priority: "URGENT" as const,
    },
  ];

  const handleApplyTemplate = (tpl: typeof quickTemplates[0]) => {
    setTitle(tpl.title);
    setMessage(tpl.message);
    setPriority(tpl.priority);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      alert("Vui lòng điền đầy đủ Tiêu đề và Nội dung thông báo!");
      return;
    }

    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setSendSuccess(true);
      setTimeout(() => {
        setSendSuccess(false);
        setTitle("");
        setMessage("");
      }, 3000);
    }, 800);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-amber-800 bg-amber-100 border border-amber-300 px-2.5 py-0.5 rounded-lg">
              QUẢN LÝ VẬN HÀNH
            </span>
            <span className="text-slate-400 text-xs">/</span>
            <span className="text-slate-700 text-xs font-bold">Kênh giao tiếp nhân sự</span>
          </div>
          <div className="flex items-center gap-2.5 mt-1">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Phát thông báo tới nhân sự
            </h1>
            <div className="relative group">
              <button
                type="button"
                className="w-6 h-6 rounded-full bg-slate-200 hover:bg-amber-100 text-slate-700 hover:text-amber-800 flex items-center justify-center font-bold transition-all cursor-help border border-slate-300 shadow-2xs"
                title="Thông tin chức năng"
              >
                <Info className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
              <div className="absolute left-0 top-8 z-40 hidden group-hover:block w-80 p-3.5 bg-slate-900 text-white rounded-xl shadow-2xl transition-all pointer-events-none border border-slate-700">
                <p className="text-slate-200 text-xs leading-relaxed font-medium">
                  Chức năng dành cho Quản lý chi nhánh & Trưởng chuỗi phát thông tin tức thời, điều chỉnh ca làm và gửi thông báo khẩn tới nhân viên.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {sendSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 flex items-center gap-3 text-emerald-900 text-xs font-bold animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Thông báo đã được phát thành công tới các nhân viên theo phạm vi đã chọn!</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form soạn thông báo (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-300 shadow-xs p-6 space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold border border-amber-200">
              <BellRing className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Soạn nội dung thông báo</h3>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Phạm vi gửi */}
            <div>
              <label className="font-bold text-slate-800 block mb-1">
                Phạm vi đối tượng nhận thông báo *
              </label>
              <select
                value={targetScope}
                onChange={(e) => setTargetScope(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-hidden focus:border-amber-500 font-bold text-slate-800 bg-white"
              >
                <option value="STORE_CURRENT">Chi nhánh hiện tại phụ trách (28 nhân sự)</option>
                <option value="SHIFT_TODAY">Nhân viên đang trong ca làm việc hôm nay (12 người)</option>
                <option value="STORE_MANAGERS">Tất cả Trưởng ca & Quản lý cơ sở</option>
                <option value="ALL_STORES">Toàn bộ nhân sự toàn chuỗi BLOAN (1,248 nhân sự)</option>
              </select>
            </div>

            {/* Mức độ ưu tiên */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-800 block mb-1">Mức độ ưu tiên *</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-hidden focus:border-amber-500 font-bold text-slate-800 bg-white"
                >
                  <option value="NORMAL">Bình thường (Thông báo chung)</option>
                  <option value="HIGH">Quan trọng (Cần xác nhận)</option>
                  <option value="URGENT">Khẩn cấp (Rung chuông & Popup)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">Kênh phát tin</label>
                <div className="flex items-center gap-3 pt-2">
                  <label className="flex items-center gap-1.5 cursor-pointer font-bold text-slate-800">
                    <input
                      type="checkbox"
                      checked={selectedChannel.app}
                      onChange={(e) => setSelectedChannel({ ...selectedChannel, app: e.target.checked })}
                      className="rounded accent-amber-500"
                    />
                    <span>App</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer font-bold text-slate-800">
                    <input
                      type="checkbox"
                      checked={selectedChannel.email}
                      onChange={(e) => setSelectedChannel({ ...selectedChannel, email: e.target.checked })}
                      className="rounded accent-amber-500"
                    />
                    <span>Email</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer font-bold text-slate-800">
                    <input
                      type="checkbox"
                      checked={selectedChannel.zalo}
                      onChange={(e) => setSelectedChannel({ ...selectedChannel, zalo: e.target.checked })}
                      className="rounded accent-amber-500"
                    />
                    <span>Zalo</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Tiêu đề */}
            <div>
              <label className="font-bold text-slate-800 block mb-1">Tiêu đề thông báo *</label>
              <input
                type="text"
                required
                placeholder="vd: [LƯU Ý] Điều chỉnh lịch ca làm chiều nay..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-xl outline-hidden focus:border-amber-500 font-bold text-slate-900"
              />
            </div>

            {/* Nội dung */}
            <div>
              <label className="font-bold text-slate-800 block mb-1">Nội dung chi tiết *</label>
              <textarea
                rows={5}
                required
                placeholder="Nhập nội dung thông báo gửi đến các bạn nhân viên..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full p-3 border border-slate-300 rounded-xl outline-hidden focus:border-amber-500 font-medium text-slate-800 leading-relaxed"
              />
            </div>

            <div className="pt-2 flex items-center justify-end">
              <button
                type="submit"
                disabled={isSending}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-900 font-black text-xs transition-all shadow-sm shadow-amber-200 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{isSending ? "Đang phát thông báo..." : "Phát thông báo ngay"}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Cột phải: Mẫu gợi ý nhanh & Lịch sử gần đây (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Mẫu soạn nhanh */}
          <div className="bg-white rounded-2xl border border-slate-300 shadow-xs p-5 space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
              <FileText className="w-4 h-4 text-amber-800 stroke-[2.2]" />
              <h3 className="font-bold text-slate-900 text-sm">Mẫu thông báo thông dụng</h3>
            </div>
            <p className="text-[11px] font-medium text-slate-700">
              Bấm vào mẫu để tự động điền tiêu đề và nội dung:
            </p>
            <div className="space-y-2">
              {quickTemplates.map((tpl, i) => (
                <div
                  key={i}
                  onClick={() => handleApplyTemplate(tpl)}
                  className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-amber-50 hover:border-amber-300 transition-all cursor-pointer"
                >
                  <p className="font-bold text-slate-900 text-xs truncate">{tpl.title}</p>
                  <p className="text-[11px] text-slate-600 line-clamp-2 mt-0.5">{tpl.message}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Lịch sử phát gần nhất */}
          <div className="bg-white rounded-2xl border border-slate-300 shadow-xs p-5 space-y-3 text-xs">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
              <Clock className="w-4 h-4 text-blue-700 stroke-[2.2]" />
              <h3 className="font-bold text-slate-900 text-sm">Thông báo đã gửi gần đây</h3>
            </div>
            <div className="space-y-2.5">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between font-bold text-slate-800">
                  <span>Họp đầu ca chiều</span>
                  <span className="text-[10px] text-slate-500 font-mono">14:10 · Hôm nay</span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1">Đã nhận: 12/12 nhân viên tại cửa hàng</p>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between font-bold text-slate-800">
                  <span>Cập nhật bảng phân ca T10</span>
                  <span className="text-[10px] text-slate-500 font-mono">09:30 · Hôm qua</span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1">Đã nhận: 28/28 nhân sự</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
