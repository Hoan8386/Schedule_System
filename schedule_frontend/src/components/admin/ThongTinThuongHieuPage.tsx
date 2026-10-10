"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Palette,
  Image as ImageIcon,
  Building,
  Upload,
  Check,
  RotateCcw,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  FileText,
  Eye,
  Sliders,
} from "lucide-react";

export default function ThongTinThuongHieuPage() {
  // Brand form state
  const [storeName, setStoreName] = useState("Ăn Vặt BLOAN");
  const [slogan, setSlogan] = useState("Đậm Vị Truyền Thống – Trọn Vị Yêu Thương");
  const [hotline, setHotline] = useState("1900 8386");
  const [email, setEmail] = useState("cskh@anvatbloan.vn");
  const [address, setAddress] = useState("124 Nguyễn Trãi, Thanh Xuân, Hà Nội");
  const [taxCode, setTaxCode] = useState("0109888999");
  const [logoPath, setLogoPath] = useState("/logo/logo1.jpg");

  // Colors
  const [primaryColor, setPrimaryColor] = useState("#F59E0B"); // Amber 500
  const [accentColor, setAccentColor] = useState("#ED1C24"); // Brand Red
  const [themeMode, setThemeMode] = useState<"light" | "warm" | "dark">("light");

  const colorPresets = [
    { label: "Vàng Cam BLOAN", primary: "#F59E0B", accent: "#ED1C24" },
    { label: "Đỏ Rực Rỡ", primary: "#ED1C24", accent: "#F59E0B" },
    { label: "Trà Sữa Matcha", primary: "#10B981", accent: "#F59E0B" },
    { label: "Xanh Sapphire", primary: "#2563EB", accent: "#F59E0B" },
    { label: "Tím Khoai Môn", primary: "#8B5CF6", accent: "#EC4899" },
  ];

  const handleSave = () => {
    alert("Đã lưu cấu hình thương hiệu & giao diện chuỗi thành công!");
  };

  const handleReset = () => {
    setStoreName("Ăn Vặt BLOAN");
    setSlogan("Đậm Vị Truyền Thống – Trọn Vị Yêu Thương");
    setHotline("1900 8386");
    setEmail("cskh@anvatbloan.vn");
    setAddress("124 Nguyễn Trãi, Thanh Xuân, Hà Nội");
    setTaxCode("0109888999");
    setLogoPath("/logo/logo1.jpg");
    setPrimaryColor("#F59E0B");
    setAccentColor("#ED1C24");
    setThemeMode("light");
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-lg">
              ADMIN CENTER
            </span>
            <span className="text-slate-400 text-xs">/</span>
            <span className="text-slate-500 text-xs font-semibold">Tùy biến nhận diện</span>
          </div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight mt-1">
            Quản lý chuỗi cửa hàng
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Cấu hình Logo, màu sắc chủ đạo, thông điệp thương hiệu và thông tin pháp lý của toàn hệ thống Ăn Vặt BLOAN.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-xs"
          >
            <RotateCcw className="w-4 h-4 text-slate-500" />
            <span>Khôi phục mặc định</span>
          </button>
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-900 text-xs font-bold transition-all shadow-sm shadow-amber-200"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Lưu cài đặt thương hiệu</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column: Form configuration (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card 1: Logo & Media */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <ImageIcon className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Logo & Hình ảnh thương hiệu</h3>
                <p className="text-[11px] text-slate-400">Hình ảnh hiển thị trên thanh menu, trang đăng nhập và hóa đơn</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2">
                  Chọn Logo chính thức (Thư viện logo BLOAN):
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { path: "/logo/logo1.jpg", label: "Logo 1 (Chính thức)" },
                    { path: "/logo/logo2.jpg", label: "Logo 2 (Họa tiết vàng)" },
                    { path: "/logo/logo3.jpg", label: "Logo 3 (Vuông nét)" },
                  ].map((item) => (
                    <div
                      key={item.path}
                      onClick={() => setLogoPath(item.path)}
                      className={`p-3 rounded-2xl border-2 cursor-pointer transition-all flex flex-col items-center gap-2 text-center ${
                        logoPath === item.path
                          ? "border-amber-500 bg-amber-50/30 shadow-xs"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="w-16 h-16 rounded-xl bg-white p-1 border border-slate-100 flex items-center justify-center shadow-2xs">
                        <Image
                          src={item.path}
                          alt={item.label}
                          width={56}
                          height={56}
                          className="object-contain rounded-lg"
                        />
                      </div>
                      <span className="text-[11px] font-bold text-slate-700">{item.label}</span>
                      {logoPath === item.path && (
                        <span className="text-[10px] font-black text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                          Đang dùng
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => alert("Mở cửa sổ tải ảnh logo tùy chỉnh từ máy tính...")}
                  className="w-full py-3 rounded-xl border border-dashed border-slate-300 hover:border-amber-400 hover:bg-amber-50/20 text-xs font-bold text-slate-600 transition-all flex items-center justify-center gap-2"
                >
                  <Upload className="w-4 h-4 text-slate-500" />
                  <span>Tải lên logo tùy biến khác (PNG, JPG, SVG tối đa 2MB)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Card 2: Color Palette */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Palette className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Hệ màu sắc nhận diện (Design Tokens)</h3>
                <p className="text-[11px] text-slate-400">Tùy biến màu nhấn chính và màu phụ trên toàn giao diện</p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-2">Bảng màu gợi ý theo nhận diện:</label>
                <div className="flex flex-wrap gap-2">
                  {colorPresets.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        setPrimaryColor(preset.primary);
                        setAccentColor(preset.accent);
                      }}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white text-slate-700 font-semibold text-xs transition-all shadow-2xs"
                    >
                      <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: preset.primary }} />
                      <span>{preset.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Màu chủ đạo (Primary):</label>
                  <div className="flex items-center gap-2 p-1.5 border border-slate-200 rounded-xl bg-white">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-8 h-8 rounded-lg border-0 cursor-pointer p-0"
                    />
                    <input
                      type="text"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-full text-xs font-mono font-bold uppercase text-slate-800 outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Màu thương hiệu phụ (Accent):</label>
                  <div className="flex items-center gap-2 p-1.5 border border-slate-200 rounded-xl bg-white">
                    <input
                      type="color"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="w-8 h-8 rounded-lg border-0 cursor-pointer p-0"
                    />
                    <input
                      type="text"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="w-full text-xs font-mono font-bold uppercase text-slate-800 outline-hidden"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Business Information */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <Building className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Thông tin chuỗi & Doanh nghiệp</h3>
                <p className="text-[11px] text-slate-400">Hiển thị trong email thông báo, chân trang và phiếu lương</p>
              </div>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tên chuỗi cửa hàng *</label>
                  <input
                    type="text"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-hidden focus:border-amber-400 font-bold text-slate-800"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Mã số thuế / Giấy phép</label>
                  <input
                    type="text"
                    value={taxCode}
                    onChange={(e) => setTaxCode(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-hidden focus:border-amber-400 font-mono text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Slogan thương hiệu</label>
                <input
                  type="text"
                  value={slogan}
                  onChange={(e) => setSlogan(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-hidden focus:border-amber-400 font-medium text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Hotline toàn chuỗi</label>
                  <input
                    type="text"
                    value={hotline}
                    onChange={(e) => setHotline(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-hidden focus:border-amber-400 font-mono text-slate-800"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Email CSKH / Vận hành</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-hidden focus:border-amber-400 font-medium text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Địa chỉ trụ sở chính</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-hidden focus:border-amber-400 font-medium text-slate-800"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Live Realtime Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sticky top-6">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-amber-600" />
                <h3 className="font-bold text-slate-800 text-sm">Xem trước giao diện thực tế</h3>
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                Live Preview
              </span>
            </div>

            {/* Mockup 1: Top Header Mockup */}
            <div className="space-y-4">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  1. Thanh điều hướng ứng dụng (Navbar / Sidebar)
                </p>
                <div className="rounded-2xl border border-slate-200 p-4 bg-slate-50 shadow-inner space-y-3">
                  <div className="bg-white rounded-xl p-3 border border-slate-200/80 shadow-xs flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center p-1.5 shadow-2xs"
                        style={{ backgroundColor: primaryColor }}
                      >
                        <Image
                          src={logoPath}
                          alt="Logo Preview"
                          width={32}
                          height={32}
                          className="object-contain rounded-md"
                        />
                      </div>
                      <div>
                        <div
                          className="font-extrabold text-sm leading-tight tracking-tight"
                          style={{ color: accentColor }}
                        >
                          {storeName}
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium">Workforce Management</div>
                      </div>
                    </div>

                    <button
                      className="px-3 py-1.5 rounded-xl text-xs font-bold shadow-2xs text-slate-900"
                      style={{ backgroundColor: primaryColor }}
                    >
                      Bảng tin
                    </button>
                  </div>
                </div>
              </div>

              {/* Mockup 2: Employee Portal Card */}
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  2. Thẻ nhân viên / Mobile App Card
                </p>
                <div
                  className="rounded-2xl p-5 text-white shadow-md relative overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${primaryColor} 0%, #1e293b 100%)`,
                  }}
                >
                  <div className="relative z-10 flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/20 backdrop-blur-xs">
                        {storeName}
                      </span>
                      <h4 className="text-lg font-black mt-2 tracking-tight">Nguyễn Thùy Dương</h4>
                      <p className="text-xs text-white/80 font-medium">Mã NV: NV-2026-088 · Ca Sáng</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-white/90 p-1 flex items-center justify-center shadow-xs">
                      <Image
                        src={logoPath}
                        alt="Logo"
                        width={30}
                        height={30}
                        className="object-contain rounded"
                      />
                    </div>
                  </div>

                  <div className="mt-6 pt-3 border-t border-white/20 flex items-center justify-between text-xs">
                    <span className="text-white/80">Hotline: {hotline}</span>
                    <span className="font-bold text-amber-200">Đã Check-in 07:55</span>
                  </div>
                </div>
              </div>

              {/* Mockup 3: Footer Brand Signature */}
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  3. Thông tin chân trang hệ thống
                </p>
                <div className="rounded-2xl border border-slate-100 p-4 bg-slate-50/70 text-xs text-slate-600 space-y-1.5 font-medium">
                  <p className="font-bold text-slate-800">{storeName} – {slogan}</p>
                  <p className="text-slate-500">📍 {address}</p>
                  <p className="text-slate-500">📞 Hotline: {hotline} | ✉ {email}</p>
                  <p className="text-[11px] text-slate-400 pt-1 font-mono">MST: {taxCode} · Bản quyền thuộc BLOAN 2026</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
