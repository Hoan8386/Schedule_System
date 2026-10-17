"use client";

import { notify } from "@/lib/toast";
import React, { useEffect, useState } from "react";
import { Copy, Info } from "lucide-react";
import { employeeApi } from "@/lib/api";
import { toShiftItem, type ShiftItem } from "./model";
import { ShiftRegisterTable } from "./ShiftRegisterTable";

/** Nhân viên đăng ký ca trong kỳ đang mở. */
export default function EmployeeRegisterShiftPage() {
  const [shifts, setShifts] = useState<ShiftItem[]>([]);
  const [employeeId, setEmployeeId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([employeeApi.getProfile(), employeeApi.getShiftsByDate({ status: "OPEN" }), employeeApi.getAssignments()])
      .then(([profile, available, assignments]) => {
        if (cancelled) return;
        const employee = profile.data?.[0];
        setEmployeeId(employee?.id ?? null);
        const registered = new Set((assignments.data ?? []).filter((item) => item.employeeId === employee?.id).map((item) => item.shiftByDateId));
        setShifts((available.data ?? []).map((item) => toShiftItem(item, registered)));
      })
      .catch((cause) => setError(cause instanceof Error ? cause.message : "Không thể tải danh sách ca"));
    return () => {
      cancelled = true;
    };
  }, []);

  const register = async (id: string) => {
    if (!employeeId) return setError("Không xác định được hồ sơ nhân viên hiện tại");
    try {
      await employeeApi.createAssignment({
        shiftByDate: { id: Number(id) },
        employee: { id: employeeId },
        status: "PENDING",
        registeredAt: new Date().toISOString(),
      });
      setShifts((prev) => prev.map((item) => (item.id === id ? { ...item, registeredCount: item.registeredCount + 1, status: "REGISTERED" } : item)));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể đăng ký ca");
    }
  };

  const registeredCount = shifts.filter((item) => item.status === "REGISTERED").length;

  return (
    <div className="page">
      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">{error}</div>}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-800">Đăng ký ca</h1>
          <p className="mt-1 text-xs text-slate-500">Chọn ca phù hợp cho tuần tới. Quản lý sẽ xác nhận lịch sau khi kỳ đăng ký kết thúc.</p>
        </div>
        <button onClick={() => notify.info("Đã tự động chọn các ca tương ứng theo kỳ trước!")} className="btn btn-secondary shadow-xs">
          <Copy className="h-4 w-4 text-slate-500" />
          <span>Thêm giống kỳ trước</span>
        </button>
      </div>

      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200/80 bg-surface p-5 shadow-xs md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-base font-extrabold text-slate-800">Tuần 12 – 18/10/2026</h2>
            <span className="rounded-full border border-brand-200 bg-brand-100 px-2 py-0.5 text-[10px] font-bold text-brand-800">Đang mở</span>
          </div>
          <p className="mt-1 text-xs text-slate-400">Đóng đăng ký: 18:00, Thứ Sáu 09/10/2026</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-extrabold text-slate-800">
            Bạn đã đăng ký {registeredCount} ca · {registeredCount * 6} giờ
          </p>
          <p className="mt-0.5 text-xs text-slate-400">Dự kiến {(registeredCount * 180000).toLocaleString("vi-VN")} VND · Chờ xác nhận lịch</p>
        </div>
      </div>

      <ShiftRegisterTable shifts={shifts} onRegister={(id) => void register(id)} />

      <div className="flex items-center gap-3 rounded-2xl border border-brand-200/80 bg-brand-50/60 p-4 text-xs text-brand-900">
        <Info className="h-4 w-4 shrink-0 text-brand-600" />
        <p>Không thể đăng ký khi ca hết chỗ hoặc trùng giờ với ca đã chọn. Bạn có thể chỉnh sửa đăng ký trước khi kỳ đóng.</p>
      </div>
    </div>
  );
}
