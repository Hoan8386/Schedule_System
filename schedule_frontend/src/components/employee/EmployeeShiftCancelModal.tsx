"use client";

import React, { useState } from "react";
import { X, AlertTriangle, Check, Store } from "lucide-react";

interface EmployeeShiftCancelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EmployeeShiftCancelModal({
  isOpen,
  onClose,
}: EmployeeShiftCancelModalProps) {
  const [selectedShift, setSelectedShift] = useState("10/10/2026 · Ca sáng · 08:00 – 14:00");
  const [reason, setReason] = useState(
    "Em có lịch khám bệnh vào sáng 10/10 và không thể có mặt tại cửa hàng. Em xin phép hủy ca này."
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
              Yêu cầu hủy ca
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Kiểm tra ca làm và nhập lý do trước khi gửi yêu cầu hủy đến quản lý.
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
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-6 h-6 stroke-[3]" />
            </div>
            <h4 className="text-base font-bold text-slate-800">
              Đã gửi yêu cầu hủy ca!
            </h4>
            <p className="text-xs text-slate-500">
              Mã yêu cầu HC-019 đã được ghi nhận và gửi đến trưởng cửa hàng xử lý.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
            {/* Ca muốn hủy */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">
                Ca muốn hủy <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedShift}
                onChange={(e) => setSelectedShift(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 outline-hidden hover:border-slate-300 focus:border-red-400"
              >
                <option value="10/10/2026 · Ca sáng · 08:00 – 14:00">
                  10/10/2026 · Ca sáng · 08:00 – 14:00
                </option>
                <option value="08/10/2026 · Ca tối · 16:00 – 22:00">
                  08/10/2026 · Ca tối · 16:00 – 22:00
                </option>
                <option value="06/10/2026 · Ca sáng · 08:00 – 14:00">
                  06/10/2026 · Ca sáng · 08:00 – 14:00
                </option>
              </select>

              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                <div className="flex items-center gap-2 text-slate-700 font-bold">
                  <Store className="w-3.5 h-3.5 text-slate-400" />
                  <span>BLOAN Cách Mạng Tháng 8</span>
                </div>
                <div className="text-[11px] text-slate-500">
                  Quầy bán hàng · 6 giờ · 180.000 VND
                </div>
                <span className="inline-block text-[9px] font-bold px-1.5 py-0.5 rounded-sm bg-slate-200/70 text-slate-700 mt-1">
                  Đã xác nhận
                </span>
              </div>
            </div>

            {/* Lý do hủy ca */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">
                Lý do hủy ca <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Nhập chi tiết lý do muốn hủy ca..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 outline-hidden hover:border-slate-300 focus:border-red-400 resize-none font-medium"
              />
            </div>

            {/* Warning banner */}
            <div className="p-3 bg-red-50/70 border border-red-200/80 rounded-xl flex items-start gap-2.5 text-red-900">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed">
                Nếu được duyệt, ca này sẽ bị xóa khỏi lịch và 180.000 VND sẽ không được tính vào tiền công dự kiến. Bạn vẫn phải làm ca nếu yêu cầu chưa được duyệt.
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
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition-all shadow-xs disabled:opacity-50"
              >
                {isSubmitting ? "Đang xử lý..." : "Xác nhận yêu cầu hủy"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
