import React from "react";
import Image from "next/image";
import { Eye } from "lucide-react";
import type { BrandSettings } from "./brandConfig";

function PreviewBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">{title}</p>
      {children}
    </div>
  );
}

/**
 * Xem trước nhận diện theo cấu hình đang chỉnh.
 * Màu lấy trực tiếp từ giá trị người dùng chọn nên dùng inline style.
 */
export function BrandPreview({ brand }: { brand: BrandSettings }) {
  return (
    <div className="space-y-6 lg:col-span-5">
      <div className="sticky top-6 rounded-2xl border border-slate-200/80 bg-surface p-5 shadow-xs">
        <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-brand-600" />
            <h3 className="text-sm font-bold text-slate-800">Xem trước giao diện thực tế</h3>
          </div>
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-700">Live Preview</span>
        </div>

        <div className="space-y-4">
          <PreviewBlock title="1. Thanh điều hướng ứng dụng (Navbar / Sidebar)">
            <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-inner">
              <div className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-white p-3 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl p-1.5 shadow-2xs" style={{ backgroundColor: brand.primaryColor }}>
                    <Image src={brand.logoPath} alt="Logo Preview" width={32} height={32} className="rounded-md object-contain" />
                  </div>
                  <div>
                    <div className="text-sm font-extrabold leading-tight tracking-tight" style={{ color: brand.accentColor }}>
                      {brand.storeName}
                    </div>
                    <div className="text-[10px] font-medium text-slate-400">Workforce Management</div>
                  </div>
                </div>
                <button className="rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900 shadow-2xs" style={{ backgroundColor: brand.primaryColor }}>
                  Bảng tin
                </button>
              </div>
            </div>
          </PreviewBlock>

          <PreviewBlock title="2. Thẻ nhân viên / Mobile App Card">
            <div
              className="relative overflow-hidden rounded-2xl p-5 text-white shadow-md"
              style={{ background: `linear-gradient(135deg, ${brand.primaryColor} 0%, var(--neutral-800) 100%)` }}
            >
              <div className="relative z-10 flex items-start justify-between">
                <div>
                  <span className="rounded-md bg-white/20 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider backdrop-blur-xs">{brand.storeName}</span>
                  <h4 className="mt-2 text-lg font-black tracking-tight">Nguyễn Thùy Dương</h4>
                  <p className="text-xs font-medium text-white/80">Mã NV: NV-2026-088 · Ca Sáng</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/90 p-1 shadow-xs">
                  <Image src={brand.logoPath} alt="Logo" width={30} height={30} className="rounded object-contain" />
                </div>
              </div>
              <div className="mt-6 flex items-center justify-between border-t border-white/20 pt-3 text-xs">
                <span className="text-white/80">Hotline: {brand.hotline}</span>
                <span className="font-bold text-brand-200">Đã Check-in 07:55</span>
              </div>
            </div>
          </PreviewBlock>

          <PreviewBlock title="3. Thông tin chân trang hệ thống">
            <div className="space-y-1.5 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 text-xs font-medium text-slate-600">
              <p className="font-bold text-slate-800">
                {brand.storeName} – {brand.slogan}
              </p>
              <p className="text-slate-500">📍 {brand.address}</p>
              <p className="text-slate-500">
                📞 Hotline: {brand.hotline} | ✉ {brand.email}
              </p>
              <p className="pt-1 font-mono text-[11px] text-slate-400">MST: {brand.taxCode} · Bản quyền thuộc BLOAN 2026</p>
            </div>
          </PreviewBlock>
        </div>
      </div>
    </div>
  );
}
