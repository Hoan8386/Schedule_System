"use client";

import React, { useState } from "react";
import {
  Monitor,
  Calendar,
  Users,
  Send,
  Upload,
  CheckCircle2,
  Clock,
} from "lucide-react";

export default function EmployeeFeedbackPage() {
  const [feedbackType, setFeedbackType] = useState<"system" | "shift" | "colleague">("shift");
  const [store, setStore] = useState("BLOAN Nguyễn Trãi");
  const [shift, setShift] = useState("04/10 · Ca sáng · 08:00 – 14:00");
  const [title, setTitle] = useState("Bổ sung găng tay cho ca sáng");
  const [content, setContent] = useState(
    "Trong ca sáng ngày 04/10, quầy chế biến gần hết găng tay dùng một lần. Mong cửa hàng bổ sung vật tư trước ca tiếp theo để đội ngũ thực hiện đúng quy trình vệ sinh."
  );
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSent(true);
    setTimeout(() => {
      alert("Cảm ơn bạn! Phản hồi đã được chuyển tới quản lý cửa hàng.");
      setIsSent(false);
    }, 800);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">
          Feedback
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Chia sẻ phản hồi về hệ thống, ca làm hoặc đồng nghiệp.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Left (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-800">Gửi phản hồi</h3>
            <span className="text-[11px] text-slate-400">* Thông tin bắt buộc</span>
          </div>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-xs">
            {/* Loại phản hồi */}
            <div className="space-y-2">
              <label className="font-bold text-slate-700">
                Loại phản hồi <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setFeedbackType("system")}
                  className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-bold transition-all ${
                    feedbackType === "system"
                      ? "border-amber-400 bg-amber-50/70 text-amber-900"
                      : "border-slate-200 hover:border-slate-300 text-slate-600"
                  }`}
                >
                  <Monitor className="w-4 h-4" />
                  <span>Hệ thống</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFeedbackType("shift")}
                  className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-bold transition-all ${
                    feedbackType === "shift"
                      ? "border-amber-400 bg-amber-50/70 text-amber-900"
                      : "border-slate-200 hover:border-slate-300 text-slate-600"
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  <span>Ca làm ✓</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFeedbackType("colleague")}
                  className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-bold transition-all ${
                    feedbackType === "colleague"
                      ? "border-amber-400 bg-amber-50/70 text-amber-900"
                      : "border-slate-200 hover:border-slate-300 text-slate-600"
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Nhân viên</span>
                </button>
              </div>
            </div>

            {/* Cửa hàng & Ca liên quan */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">
                  Cửa hàng liên quan <span className="text-red-500">*</span>
                </label>
                <select
                  value={store}
                  onChange={(e) => setStore(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-hidden hover:border-slate-300"
                >
                  <option>BLOAN Nguyễn Trãi</option>
                  <option>BLOAN Cách Mạng Tháng 8</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">
                  Ca làm liên quan <span className="text-red-500">*</span>
                </label>
                <select
                  value={shift}
                  onChange={(e) => setShift(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-hidden hover:border-slate-300"
                >
                  <option>04/10 · Ca sáng · 08:00 – 14:00</option>
                  <option>02/10 · Ca tối · 16:00 – 22:00</option>
                  <option>01/10 · Ca sáng · 08:00 – 14:00</option>
                </select>
              </div>
            </div>

            {/* Tiêu đề */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">
                Tiêu đề <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-hidden hover:border-slate-300 focus:border-amber-400"
              />
            </div>

            {/* Nội dung phản hồi */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">
                Nội dung phản hồi <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={4}
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-hidden hover:border-slate-300 focus:border-amber-400 resize-none leading-relaxed"
              />
              <p className="text-[11px] text-slate-400">
                Vui lòng mô tả rõ tình huống để quản lý hỗ trợ nhanh hơn.
              </p>
            </div>

            {/* Tệp đính kèm */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">
                Tệp đính kèm (không bắt buộc)
              </label>
              <div className="border border-dashed border-slate-200 rounded-xl p-4 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-2.5 text-slate-500 text-xs">
                  <Upload className="w-4 h-4 text-slate-400" />
                  <div>
                    <p className="font-semibold text-slate-700">
                      Ảnh hoặc tài liệu minh họa
                    </p>
                    <p className="text-[10px] text-slate-400">
                      JPG, PNG, PDF · Tối đa 10 MB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => alert("Chọn tệp từ thiết bị...")}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 font-bold text-slate-700"
                >
                  Chọn tệp
                </button>
              </div>
            </div>

            {/* Submit Bar */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Chỉ quản lý phụ trách được xem phản hồi.
              </span>
              <button
                type="submit"
                disabled={isSent}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold transition-all shadow-xs"
              >
                <Send className="w-4 h-4" />
                <span>{isSent ? "Đang gửi..." : "Gửi phản hồi"}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Info & Recent feedbacks */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4 text-xs">
            <h4 className="font-bold text-slate-800 text-sm">
              Chúng tôi luôn lắng nghe
            </h4>
            <p className="text-slate-500 leading-relaxed">
              Góp ý của bạn giúp công việc tại cửa hàng thuận lợi hơn mỗi ngày.
            </p>

            <div className="space-y-3 pt-2">
              <div>
                <p className="font-bold text-slate-800">Hệ thống</p>
                <p className="text-slate-400 text-[11px]">Báo lỗi, đề xuất tính năng.</p>
              </div>
              <div>
                <p className="font-bold text-slate-800">Ca làm</p>
                <p className="text-slate-400 text-[11px]">
                  Vật tư, lịch ca, môi trường làm việc.
                </p>
              </div>
              <div>
                <p className="font-bold text-slate-800">Nhân viên</p>
                <p className="text-slate-400 text-[11px]">
                  Góp ý phối hợp với đồng nghiệp.
                </p>
              </div>
            </div>
          </div>

          {/* Phản hồi gần đây */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3.5 text-xs">
            <h4 className="font-bold text-slate-800 text-sm">Phản hồi gần đây</h4>

            <div className="space-y-3">
              <div className="p-3 rounded-xl border border-slate-100 hover:bg-slate-50/70 transition-colors">
                <span className="text-[10px] text-slate-400">
                  PH-023 · Hệ thống · 02/10/2026
                </span>
                <p className="font-bold text-slate-800 mt-0.5">
                  Lịch ca hiển thị chậm trên điện thoại
                </p>
                <span className="inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                  Đang xử lý
                </span>
              </div>

              <div className="p-3 rounded-xl border border-slate-100 hover:bg-slate-50/70 transition-colors">
                <span className="text-[10px] text-slate-400">
                  PH-019 · Ca làm · 26/09/2026
                </span>
                <p className="font-bold text-slate-800 mt-0.5">
                  Bổ sung dụng cụ vệ sinh quầy
                </p>
                <span className="inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                  Đã phản hồi
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
