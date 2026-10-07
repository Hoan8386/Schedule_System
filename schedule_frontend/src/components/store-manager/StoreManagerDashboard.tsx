"use client";

import React, { useState } from "react";
import {
  Users,
  Calendar,
  Clock,
  Wallet,
  Inbox,
  ArrowRight,
  CheckSquare,
  AlertCircle,
  Check,
} from "lucide-react";

interface StoreManagerDashboardProps {
  onGoToRequests: () => void;
  onGoToMyShift: () => void;
}

export default function StoreManagerDashboard({
  onGoToRequests,
  onGoToMyShift,
}: StoreManagerDashboardProps) {
  const [todos, setTodos] = useState([
    {
      id: 1,
      text: "Duyệt yêu cầu ca tuần tới",
      assignee: "Thu Hà",
      due: "05/10, 12:00",
      completed: false,
    },
    {
      id: 2,
      text: "Trao đổi sự việc VP-012",
      assignee: "Thu Hà",
      due: "05/10, 15:00",
      completed: false,
    },
    {
      id: 3,
      text: "Kiểm tra dụng cụ ca tối",
      assignee: "Quốc Bảo",
      due: "05/10, 16:00",
      completed: false,
    },
  ]);

  const toggleTodo = (id: number) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">
            Chào buổi sáng, Thu Hà
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Thứ Hai, 05/10/2026 · Công việc và vận hành tại BLOAN Nguyễn Trãi.
          </p>
        </div>
        <button
          onClick={onGoToRequests}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-900 text-xs font-bold transition-all shadow-sm shadow-amber-200"
        >
          <Inbox className="w-4 h-4" />
          <span>Xử lý yêu cầu ca</span>
        </button>
      </div>

      {/* Scope line */}
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span className="font-semibold text-slate-600">
          Tháng 10/2026 · Lũy kế 01/10 – 05/10
        </span>
        <span className="px-2 py-0.5 rounded-md bg-slate-100 font-semibold text-slate-600">
          Phạm vi: 1 cửa hàng
        </span>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold text-slate-500">
              Nhân viên tại cửa hàng
            </span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-800 tracking-tight">
              6 nhân viên
            </div>
            <div className="text-[11px] text-slate-400 mt-1 font-medium">
              Không gồm Trưởng cửa hàng
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold text-slate-500">
              Ca đã hoàn thành
            </span>
            <Calendar className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-800 tracking-tight">
              24 ca
            </div>
            <div className="text-[11px] text-slate-400 mt-1 font-medium">
              6 nhân viên · 4 ca / người
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold text-slate-500">
              Tổng giờ nhân viên
            </span>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-800 tracking-tight">
              144 giờ
            </div>
            <div className="text-[11px] text-slate-400 mt-1 font-medium">
              Mỗi ca 6 giờ
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold text-slate-500">
              Tiền công nhân viên
            </span>
            <Wallet className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-800 tracking-tight">
              4.320.000 VND
            </div>
            <div className="text-[11px] text-slate-400 mt-1 font-medium">
              30.000 VND / giờ · Chưa đối soát
            </div>
          </div>
        </div>
      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hàng đợi yêu cầu */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-800">
                Hàng đợi yêu cầu
              </h3>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-bold border border-amber-200">
                6 chờ duyệt
              </span>
            </div>

            {/* 3 mini stat blocks */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <span className="text-[11px] text-slate-400 font-medium">
                  Đăng ký ca
                </span>
                <p className="text-xl font-black text-slate-800 mt-1">3</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <span className="text-[11px] text-slate-400 font-medium">
                  Đổi ca
                </span>
                <p className="text-xl font-black text-slate-800 mt-1">2</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <span className="text-[11px] text-slate-400 font-medium">
                  Hủy ca
                </span>
                <p className="text-xl font-black text-slate-800 mt-1">1</p>
              </div>
            </div>

            {/* Quick table */}
            <div className="border border-slate-100 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-[11px] font-semibold text-slate-400 border-b border-slate-100">
                    <th className="py-2.5 px-3">Nhân viên</th>
                    <th className="py-2.5 px-3">Yêu cầu</th>
                    <th className="py-2.5 px-3 text-right">Xử lý</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  <tr>
                    <td className="py-3 px-3">
                      <p className="font-bold text-slate-800">Nguyễn Minh Anh</p>
                      <p className="text-[10px] text-slate-400">NV024 · DC-024</p>
                    </td>
                    <td className="py-3 px-3">
                      <p className="font-bold text-slate-800">Đổi ca · 08/10 → 09/10</p>
                      <p className="text-[10px] text-slate-400">Ca tối → Ca sáng</p>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={onGoToRequests}
                        className="px-3 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold"
                      >
                        Xem
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3">
                      <p className="font-bold text-slate-800">Lê Quốc Bảo</p>
                      <p className="text-[10px] text-slate-400">NV025 · DK-031</p>
                    </td>
                    <td className="py-3 px-3">
                      <p className="font-bold text-slate-800">Đăng ký · 15/10</p>
                      <p className="text-[10px] text-slate-400">Ca tối · 16:00 – 22:00</p>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={onGoToRequests}
                        className="px-3 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold"
                      >
                        Xem
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3">
                      <p className="font-bold text-slate-800">Phạm Ngọc Linh</p>
                      <p className="text-[10px] text-slate-400">NV026 · HC-018</p>
                    </td>
                    <td className="py-3 px-3">
                      <p className="font-bold text-slate-800">Hủy ca · 11/10</p>
                      <p className="text-[10px] text-slate-400">Ca tối · Lịch cá nhân</p>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={onGoToRequests}
                        className="px-3 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold"
                      >
                        Xem
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-400 text-[11px]">
              Ưu tiên yêu cầu gần ngày làm
            </span>
            <button
              onClick={onGoToRequests}
              className="inline-flex items-center gap-1 font-bold text-amber-600 hover:underline"
            >
              <span>Xem toàn bộ 6 yêu cầu</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Column: Ca của bạn & Việc cần làm */}
        <div className="space-y-6">
          {/* Ca của bạn hôm nay */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-800">
                Ca của bạn hôm nay
              </h3>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
                Đã xác nhận
              </span>
            </div>

            <div className="flex items-start gap-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="w-14 h-16 bg-white rounded-xl border border-slate-200 flex flex-col items-center justify-center shrink-0">
                <span className="text-[9px] font-bold text-slate-500 uppercase">
                  Thứ Hai
                </span>
                <span className="text-xl font-black text-slate-800">05</span>
                <span className="text-[9px] text-slate-400">Tháng 10</span>
              </div>
              <div className="space-y-1">
                <div className="text-base font-bold text-slate-800">
                  Ca tối · 16:00 – 22:00
                </div>
                <div className="text-xs text-slate-600">
                  BLOAN Nguyễn Trãi · Điều phối ca
                </div>
                <div className="text-xs font-semibold text-amber-700">
                  6 giờ · 240.000 VND
                </div>
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-400">
                Trần Thu Hà · CH001 · Chỉ lịch của chính bạn
              </span>
              <button
                onClick={onGoToMyShift}
                className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 font-bold text-slate-700"
              >
                Đăng ký ca tuần tới
              </button>
            </div>
          </div>

          {/* Việc cần làm hôm nay */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-800">
                Việc cần làm hôm nay
              </h3>
              <span className="text-[11px] text-slate-500 font-bold">
                {todos.filter((t) => !t.completed).length} công việc
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              {todos.map((item) => (
                <div
                  key={item.id}
                  onClick={() => toggleTodo(item.id)}
                  className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-100 hover:bg-slate-50/70 cursor-pointer transition-colors"
                >
                  <div
                    className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                      item.completed
                        ? "bg-amber-500 border-amber-500 text-slate-900"
                        : "border-slate-300"
                    }`}
                  >
                    {item.completed && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <div className="flex-1">
                    <p
                      className={`font-bold ${
                        item.completed
                          ? "line-through text-slate-400"
                          : "text-slate-800"
                      }`}
                    >
                      {item.text}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {item.assignee} · Hạn {item.due}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Info notice bar */}
      <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-center gap-3 text-xs text-amber-900">
        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
        <p>
          Kỳ đăng ký 12 – 18/10 đang mở đến 18:00 ngày 09/10. Bài test của bạn: An toàn thực phẩm tại cửa hàng, hạn 07/10.
        </p>
      </div>
    </div>
  );
}
