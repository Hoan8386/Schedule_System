import React from "react";
import Image from "next/image";
import { Building, Image as ImageIcon, Palette, Upload } from "lucide-react";
import { COLOR_PRESETS, LOGO_OPTIONS, type BrandSettings } from "./brandConfig";

interface Props {
  brand: BrandSettings;
  onChange: (patch: Partial<BrandSettings>) => void;
}

const inputClass = "w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-800 outline-hidden focus:border-brand-400";

function Section({ icon: Icon, tone, title, children }: { icon: typeof Palette; tone: string; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-300 bg-surface p-5 shadow-xs">
      <div className="mb-4 flex items-center gap-2.5">
        <div className={`flex h-8 w-8 items-center justify-center rounded-xl border font-bold ${tone}`}>
          <Icon className="h-4 w-4" />
        </div>
        <h3 className="text-sm font-bold text-slate-900">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <div>
      <label className="mb-1 block font-bold text-slate-800">{label}</label>
      <div className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white p-1.5">
        <input type="color" value={value} onChange={(event) => onChange(event.target.value)} className="h-8 w-8 cursor-pointer rounded-lg border-0 p-0" />
        <input type="text" value={value} onChange={(event) => onChange(event.target.value)} className="w-full font-mono text-xs font-bold uppercase text-slate-900 outline-hidden" />
      </div>
    </div>
  );
}

/** Cột cấu hình: logo, bảng màu, thông tin doanh nghiệp. */
export function BrandSettingsForm({ brand, onChange }: Props) {
  const text = (key: keyof BrandSettings, label: string, className = "font-medium", type = "text") => (
    <div>
      <label className="mb-1 block font-bold text-slate-700">{label}</label>
      <input type={type} value={brand[key]} onChange={(event) => onChange({ [key]: event.target.value })} className={`${inputClass} ${className}`} />
    </div>
  );

  return (
    <div className="space-y-6 lg:col-span-7">
      <Section icon={ImageIcon} tone="border-brand-200 bg-brand-100 text-brand-800" title="Logo & Hình ảnh thương hiệu">
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-xs font-bold text-slate-700">Chọn Logo chính thức (Thư viện logo BLOAN):</label>
            <div className="grid grid-cols-3 gap-3">
              {LOGO_OPTIONS.map((item) => {
                const active = brand.logoPath === item.path;
                return (
                  <div
                    key={item.path}
                    onClick={() => onChange({ logoPath: item.path })}
                    className={`flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 p-3 text-center transition-all ${
                      active ? "border-brand-500 bg-brand-50/30 shadow-xs" : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-slate-100 bg-white p-1 shadow-2xs">
                      <Image src={item.path} alt={item.label} width={56} height={56} className="rounded-lg object-contain" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-700">{item.label}</span>
                    {active && <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-black text-brand-700">Đang dùng</span>}
                  </div>
                );
              })}
            </div>
          </div>
          <button
            onClick={() => alert("Mở cửa sổ tải ảnh logo tùy chỉnh từ máy tính...")}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 py-3 text-xs font-bold text-slate-600 transition-all hover:border-brand-400 hover:bg-brand-50/20"
          >
            <Upload className="h-4 w-4 text-slate-500" />
            <span>Tải lên logo tùy biến khác (PNG, JPG, SVG tối đa 2MB)</span>
          </button>
        </div>
      </Section>

      <Section icon={Palette} tone="border-blue-200 bg-blue-100 text-blue-800" title="Hệ màu sắc nhận diện (Design Tokens)">
        <div className="space-y-4 text-xs">
          <div>
            <label className="mb-2 block font-bold text-slate-800">Bảng màu gợi ý theo nhận diện:</label>
            <div className="flex flex-wrap gap-2">
              {COLOR_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => onChange({ primaryColor: preset.primary, accentColor: preset.accent })}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-800 shadow-2xs transition-all hover:bg-slate-50"
                >
                  {/* Màu do người dùng chọn nên phải dùng style động */}
                  <span className="h-3.5 w-3.5 rounded-full" style={{ backgroundColor: preset.primary }} />
                  <span>{preset.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-2">
            <ColorField label="Màu chủ đạo (Primary):" value={brand.primaryColor} onChange={(primaryColor) => onChange({ primaryColor })} />
            <ColorField label="Màu thương hiệu phụ (Accent):" value={brand.accentColor} onChange={(accentColor) => onChange({ accentColor })} />
          </div>
        </div>
      </Section>

      <Section icon={Building} tone="border-emerald-200 bg-emerald-100 text-emerald-800" title="Thông tin chuỗi & Doanh nghiệp">
        <div className="space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-3">
            {text("storeName", "Tên chuỗi cửa hàng *", "font-bold")}
            {text("taxCode", "Mã số thuế / Giấy phép", "font-mono")}
          </div>
          {text("slogan", "Slogan thương hiệu")}
          <div className="grid grid-cols-2 gap-3">
            {text("hotline", "Hotline toàn chuỗi", "font-mono")}
            {text("email", "Email CSKH / Vận hành", "font-medium", "email")}
          </div>
          {text("address", "Địa chỉ trụ sở chính")}
        </div>
      </Section>
    </div>
  );
}
