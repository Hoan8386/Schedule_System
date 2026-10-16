"use client";

import React from "react";
import Image from "next/image";
import { Calendar, Users, ShieldCheck, Lock } from "lucide-react";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen w-full bg-[#FFFFFF] flex flex-col justify-between selection:bg-amber-100 selection:text-amber-900">
      {/* Main Container */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-6 sm:px-12 lg:px-20 py-8 lg:py-12 flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16">
        
        {/* Left Column: Brand & Hero Value Proposition */}
        <section className="w-full lg:w-1/2 flex flex-col justify-between h-full pt-4 lg:pt-8 max-w-xl">
          <div>
            {/* Logo Section */}
            <header className="flex flex-col items-start">
              <div className="relative h-16 w-48 sm:h-20 sm:w-56 mb-1">
                <Image
                  src="/logo/logo1.jpg"
                  alt="Ăn Vặt BLOAN Logo"
                  fill
                  priority
                  sizes="(max-width: 640px) 192px, 224px"
                  className="object-contain object-left"
                />
              </div>
              <p className="text-[13px] font-bold text-slate-800 tracking-tight mt-1">
                Workforce Management
              </p>
            </header>

            {/* Accent Gold/Amber Bar */}
            <div className="w-12 h-1.5 bg-[#F59E0B] rounded-full mt-12 sm:mt-16 mb-8" />

            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-extrabold text-slate-900 tracking-tight leading-[1.2] whitespace-pre-line">
              {"Cùng một đội ngũ.\nVận hành nhịp\nnhàng."}
            </h1>

            {/* Subhead Description */}
            <p className="text-slate-500 text-sm sm:text-base leading-relaxed mt-4 max-w-lg">
              Quản lý ca làm, chấm công và nhân sự trên một nền tảng
              dành riêng cho chuỗi cửa hàng.
            </p>

            {/* Feature Value Props */}
            <div className="mt-10 sm:mt-12 space-y-5">
              {/* Feature 1 */}
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#FFFBEB] border border-[#FEF3C7] flex items-center justify-center shrink-0 text-[#F59E0B]">
                  <Calendar className="w-5 h-5 stroke-[1.8]" />
                </div>
                <span className="text-slate-700 font-medium text-sm sm:text-[15px]">
                  Sắp xếp ca làm linh hoạt
                </span>
              </div>

              {/* Feature 2 */}
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#FFFBEB] border border-[#FEF3C7] flex items-center justify-center shrink-0 text-[#F59E0B]">
                  <Users className="w-5 h-5 stroke-[1.8]" />
                </div>
                <span className="text-slate-700 font-medium text-sm sm:text-[15px]">
                  Kết nối đội ngũ tại mọi cửa hàng
                </span>
              </div>

              {/* Feature 3 */}
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#FFFBEB] border border-[#FEF3C7] flex items-center justify-center shrink-0 text-[#F59E0B]">
                  <ShieldCheck className="w-5 h-5 stroke-[1.8]" />
                </div>
                <span className="text-slate-700 font-medium text-sm sm:text-[15px]">
                  Bảo vệ dữ liệu nhân sự
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Left Badge */}
          <div className="mt-12 lg:mt-24 pt-4">
            <span className="text-slate-400 text-xs font-normal">
              Dành cho đội ngũ Ăn Vặt BLOAN
            </span>
          </div>
        </section>

        {/* Right Column: Card Container */}
        <section className="w-full lg:w-1/2 flex flex-col items-center justify-center">
          <div className="w-full max-w-[460px]">
            {/* The white form card */}
            <div className="bg-white rounded-3xl p-7 sm:p-9 border border-slate-100 shadow-[0_10px_35px_-10px_rgba(0,0,0,0.06),0_2px_12px_-2px_rgba(0,0,0,0.03)] transition-all">
              {children}
            </div>

            {/* Outer Footer below card */}
            <footer className="mt-6 text-center space-y-2">
              <p className="text-xs text-slate-500">
                Cần hỗ trợ?{" "}
                <button
                  type="button"
                  onClick={() => alert("Vui lòng liên hệ bộ phận IT / Nhân sự: admin@bloan.vn hoặc hotline 1900-BLOAN")}
                  className="text-[#DC2626] font-semibold hover:underline cursor-pointer"
                >
                  Liên hệ quản trị viên
                </button>
              </p>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                <Lock className="w-3.5 h-3.5" />
                <span>Kết nối an toàn · Dữ liệu được bảo vệ</span>
              </div>

              <p className="text-[11px] text-slate-400">
                © 2026 Ăn Vặt BLOAN
              </p>
            </footer>
          </div>
        </section>
      </main>
    </div>
  );
}
