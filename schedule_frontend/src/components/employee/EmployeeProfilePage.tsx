"use client";

import React from "react";
import {
  Pencil,
  CheckCircle2,
  Lock,
  Store,
  Phone,
  Mail,
  Calendar,
  CreditCard,
  Building,
  UserCheck,
} from "lucide-react";

export default function EmployeeProfilePage() {
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">
            Thông tin cá nhân
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Thông tin nhân viên, liên hệ và cửa hàng làm việc của bạn.
          </p>
        </div>
        <button
          onClick={() => alert("Chức năng cập nhật liên hệ đang mở cho nhân sự.")}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-xs"
        >
          <Pencil className="w-4 h-4 text-slate-500" />
          <span>Chỉnh sửa thông tin</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Avatar + Account) */}
        <div className="space-y-6">
          {/* Main User Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs text-center flex flex-col items-center">
            <div className="w-24 h-24 rounded-full bg-slate-100 border-4 border-white shadow-sm flex items-center justify-center text-2xl font-black text-slate-700">
              MA
            </div>

            <h3 className="text-lg font-black text-slate-800 mt-4">
              Nguyễn Minh Anh
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              NV024 · Nhân viên bán hàng
            </p>

            <span className="mt-3 px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
              Đang làm việc
            </span>

            <div className="w-full mt-6 pt-5 border-t border-slate-100 text-left space-y-3 text-xs">
              <div>
                <span className="text-slate-400 text-[11px]">Cửa hàng chính</span>
                <p className="font-bold text-slate-800 mt-0.5">
                  BLOAN Nguyễn Trãi
                </p>
              </div>
              <div>
                <span className="text-slate-400 text-[11px]">Ngày gia nhập</span>
                <p className="font-bold text-slate-800 mt-0.5">01/09/2025</p>
              </div>
            </div>
          </div>

          {/* Account card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3.5 text-xs">
            <h4 className="font-bold text-slate-800 text-sm">Tài khoản</h4>
            <div>
              <span className="text-slate-400 text-[11px]">Tên đăng nhập</span>
              <p className="font-bold text-slate-800 mt-0.5">minhanh.nv024</p>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-600 font-semibold text-xs">
              <CheckCircle2 className="w-4 h-4" />
              <span>Email đã xác thực</span>
            </div>
            <button
              onClick={() => alert("Vui lòng kiểm tra email để đặt lại mật khẩu.")}
              className="w-full mt-2 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 font-bold text-slate-700 flex items-center justify-center gap-2 transition-all shadow-xs"
            >
              <Lock className="w-4 h-4 text-slate-500" />
              <span>Đổi mật khẩu</span>
            </button>
          </div>
        </div>

        {/* Right Column (Info Details) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Thông tin nhân viên */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h4 className="font-bold text-slate-800 text-sm">
              Thông tin nhân viên
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-slate-400 text-[11px]">Họ và tên</span>
                <p className="font-bold text-slate-800 mt-0.5">Nguyễn Minh Anh</p>
              </div>
              <div>
                <span className="text-slate-400 text-[11px]">Ngày sinh</span>
                <p className="font-bold text-slate-800 mt-0.5">14/08/2002</p>
              </div>
              <div>
                <span className="text-slate-400 text-[11px]">Giới tính</span>
                <p className="font-bold text-slate-800 mt-0.5">Nữ</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
              <div>
                <span className="text-slate-400 text-[11px]">Email</span>
                <p className="font-bold text-slate-800 mt-0.5">
                  minhanh.nv024@bloan.vn
                </p>
              </div>
              <div>
                <span className="text-slate-400 text-[11px]">Số điện thoại</span>
                <p className="font-bold text-slate-800 mt-0.5">0903 246 810</p>
              </div>
            </div>

            <div className="text-xs pt-2">
              <span className="text-slate-400 text-[11px]">Địa chỉ liên hệ</span>
              <p className="font-bold text-slate-800 mt-0.5">
                Phường Bến Thành, TP. Hồ Chí Minh
              </p>
            </div>
          </div>

          {/* Thông tin công việc */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h4 className="font-bold text-slate-800 text-sm">
              Thông tin công việc
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-slate-400 text-[11px]">Vị trí</span>
                <p className="font-bold text-slate-800 mt-0.5">Nhân viên bán hàng</p>
              </div>
              <div>
                <span className="text-slate-400 text-[11px]">Hình thức làm việc</span>
                <p className="font-bold text-slate-800 mt-0.5">Bán thời gian</p>
              </div>
              <div>
                <span className="text-slate-400 text-[11px]">Đơn giá giờ làm</span>
                <p className="font-bold text-amber-600 mt-0.5">30.000 VND / giờ</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-2">
              <div>
                <span className="text-slate-400 text-[11px]">Quản lý trực tiếp</span>
                <p className="font-bold text-slate-800 mt-0.5">Trần Hoàng Nam</p>
              </div>
              <div>
                <span className="text-slate-400 text-[11px]">Tài khoản nhận tiền</span>
                <p className="font-bold text-slate-800 mt-0.5">
                  Vietcombank · •••• 4826
                </p>
              </div>
              <div>
                <span className="text-slate-400 text-[11px]">Tên chủ tài khoản</span>
                <p className="font-bold text-slate-800 mt-0.5">NGUYEN MINH ANH</p>
              </div>
            </div>
          </div>

          {/* Cửa hàng làm việc */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h4 className="font-bold text-slate-800 text-sm">
              Cửa hàng làm việc
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-1.5">
                <div className="flex items-center gap-2">
                  <Store className="w-4 h-4 text-slate-500" />
                  <span className="font-bold text-slate-800">BLOAN Nguyễn Trãi</span>
                </div>
                <p className="text-[10px] text-amber-700 font-bold">Cửa hàng chính</p>
                <p className="text-slate-500 text-[11px]">
                  112 Nguyễn Trãi, TP. Hồ Chí Minh
                </p>
                <p className="text-slate-400 text-[10px]">
                  Quản lý: Trần Hoàng Nam · 0901 234 567
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-1.5">
                <div className="flex items-center gap-2">
                  <Store className="w-4 h-4 text-slate-500" />
                  <span className="font-bold text-slate-800">BLOAN Cách Mạng Tháng 8</span>
                </div>
                <p className="text-[10px] text-slate-500 font-bold">Hỗ trợ liên cửa hàng</p>
                <p className="text-slate-500 text-[11px]">
                  245 Cách Mạng Tháng 8, TP. Hồ Chí Minh
                </p>
                <p className="text-slate-400 text-[10px]">
                  Quản lý: Lê Thu Hà · 0902 345 678
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Note bottom */}
      <p className="text-center text-xs text-slate-400">
        Cần thay đổi thông tin công việc hoặc tài khoản nhận tiền? Vui lòng liên hệ quản lý cửa hàng để được xác minh và cập nhật.
      </p>
    </div>
  );
}
