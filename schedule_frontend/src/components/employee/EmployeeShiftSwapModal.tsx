"use client";

import React, { useState } from "react";
import { X, Store, Info, Check } from "lucide-react";

interface EmployeeShiftSwapModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EmployeeShiftSwapModal({
  isOpen,
  onClose,
}: EmployeeShiftSwapModalProps) {
  const [currentShift, setCurrentShift] = useState("06/10/2026 · Ca sáng · 08:00 – 14:00");
  const [targetShift, setTargetShift] = useState("07/10/2026 · Ca tối · 16:00 – 22:00");
  const [reason, setReason] = useState(
    "Em có lịch học bổ sung vào sáng 06/10. Em xin chuyển sang ca tối 07/10 để đảm bảo đủ giờ làm trong tuần."
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1200);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-800">
              Yêu cầu đổi ca
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Chọn ca hiện tại và ca muốn đổi. Yêu cầu sẽ được gửi đến quản lý cửa hàng.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-6 h-6 stroke-[3]" />
            </div>
            <h4 className="text-base font-bold text-slate-800">
              Đã gửi yêu cầu đổi ca thành công!
            </h4>
            <p className="text-xs text-slate-500">
              Mã yêu cầu DC-025 đã được chuyển tới trưởng cửa hàng để phê duyệt.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
            {/* Ca hiện tại */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">
                Ca hiện tại <span className="text-red-500">*</span>
              </label>
              <select
                value={currentShift}
                onChange={(e) => setCurrentShift(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 outline-hidden hover:border-slate-300 focus:border-amber-400"
              >
                <option value="06/10/2026 · Ca sáng · 08:00 – 14:00">
                  06/10/2026 · Ca sáng · 08:00 – 14:00
                </option>
                <option value="08/10/2026 · Ca tối · 16:00 – 22:00">
                  08/10/2026 · Ca tối · 16:00 – 22:00
                </option>
                <option value="10/10/2026 · Ca sáng · 08:00 – 14:00">
                  10/10/2026 · Ca sáng · 08:00 – 14:00
                </option>
              </select>
              <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl flex items-center gap-2 text-slate-500">
                <Store className="w-3.5 h-3.5 text-slate-400" />
                <span>BLOAN Nguyễn Trãi · 6 giờ · 180.000 VND</span>
              </div>
            </div>

            {/* Ca muốn đổi sang */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">
                Ca muốn đổi sang <span className="text-red-500">*</span>
              </label>
              <select
                value={targetShift}
                onChange={(e) => setTargetShift(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 outline-hidden hover:border-slate-300 focus:border-amber-400"
              >
                <option value="07/10/2026 · Ca tối · 16:00 – 22:00">
                  07/10/2026 · Ca tối · 16:00 – 22:00
                </option>
                <option value="09/10/2026 · Ca sáng · 08:00 – 14:00">
                  09/10/2026 · Ca sáng · 08:00 – 14:00
                </option>
                <option value="11/10/2026 · Ca tối · 16:00 – 22:00">
                  11/10/2026 · Ca tối · 16:00 – 22:00
                </option>
              </select>
              <p className="text-[11px] text-slate-400">
                BLOAN Nguyễn Trãi · 6 giờ · 180.000 VND · Còn 2 chỗ
              </p>
            </div>

            {/* Lý do đổi ca */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">
                Lý do đổi ca <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Nhập chi tiết lý do muốn đổi ca..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 outline-hidden hover:border-slate-300 focus:border-amber-400 resize-none font-medium"
              />
            </div>

            {/* Warning banner */}
            <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl flex items-start gap-2.5 text-amber-900">
              <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed">
                Tiếp tục làm ca hiện tại nếu yêu cầu chưa được duyệt. Ca mới chỉ được xác nhận sau khi quản lý đồng ý.
              </p>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold transition-all"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold transition-all shadow-xs disabled:opacity-50"
              >
                {isSubmitting ? "Đang gửi..." : "Gửi yêu cầu đổi ca"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
