"use client";

import React, { useState } from "react";
import { Check, Info, RotateCcw } from "lucide-react";
import { DEFAULT_BRAND, type BrandSettings } from "./brandConfig";
import { BrandSettingsForm } from "./BrandSettingsForm";
import { BrandPreview } from "./BrandPreview";

/** Cấu hình logo, màu sắc và thông tin doanh nghiệp của chuỗi, kèm xem trước. */
export default function ThongTinThuongHieuPage() {
  const [brand, setBrand] = useState<BrandSettings>(DEFAULT_BRAND);
  const update = (patch: Partial<BrandSettings>) => setBrand((prev) => ({ ...prev, ...patch }));

  return (
    <div className="page">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-lg border border-brand-300 bg-brand-100 px-2.5 py-0.5 text-xs font-black uppercase tracking-wider text-brand-800">ADMIN CENTER</span>
            <span className="text-xs text-slate-400">/</span>
            <span className="text-xs font-bold text-slate-700">Tùy biến nhận diện</span>
          </div>
          <div className="mt-1 flex items-center gap-2.5">
            <h1 className="text-2xl font-black tracking-tight text-slate-900">Quản lý chuỗi cửa hàng</h1>
            <div className="group relative">
              <button
                type="button"
                className="flex h-6 w-6 cursor-help items-center justify-center rounded-full border border-slate-300 bg-slate-200 font-bold text-slate-700 shadow-2xs transition-all hover:bg-brand-100 hover:text-brand-800"
                title="Thông tin cấu hình thương hiệu"
              >
                <Info className="h-3.5 w-3.5 stroke-[2.5]" />
              </button>
              <div className="pointer-events-none absolute left-0 top-8 z-40 hidden w-80 rounded-xl border border-slate-700 bg-slate-900 p-3.5 text-white shadow-2xl group-hover:block">
                <p className="text-xs font-medium leading-relaxed text-slate-200">
                  Cấu hình Logo, màu sắc chủ đạo, thông điệp thương hiệu và thông tin pháp lý của toàn hệ thống Ăn Vặt BLOAN.
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <button onClick={() => setBrand(DEFAULT_BRAND)} className="btn btn-secondary">
            <RotateCcw className="h-4 w-4 text-slate-700" />
            <span>Khôi phục mặc định</span>
          </button>
          <button onClick={() => alert("Đã lưu cấu hình thương hiệu & giao diện chuỗi thành công!")} className="btn btn-primary px-5 shadow-sm shadow-brand-200">
            <Check className="h-4 w-4 stroke-[3]" />
            <span>Lưu cài đặt thương hiệu</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <BrandSettingsForm brand={brand} onChange={update} />
        <BrandPreview brand={brand} />
      </div>
    </div>
  );
}
