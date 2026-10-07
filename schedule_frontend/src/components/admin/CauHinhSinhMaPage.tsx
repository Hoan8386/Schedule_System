"use client";

import React, { useState } from "react";
import {
  Hash,
  Sparkles,
  Save,
  RotateCcw,
  Check,
  HelpCircle,
  Play,
  FileDigit,
  Settings2,
  Layers,
} from "lucide-react";

interface CodeRule {
  id: string;
  title: string;
  desc: string;
  prefix: string;
  includeYear: boolean;
  includeMonth: boolean;
  paddingDigits: number;
  separator: string;
  resetCycle: "NEVER" | "YEARLY" | "MONTHLY";
  currentCounter: number;
}

export default function CauHinhSinhMaPage() {
  const [rules, setRules] = useState<CodeRule[]>([
    {
      id: "employee",
      title: "Mã Nhân viên (Employee Code)",
      desc: "Định danh hồ sơ nhân sự, mã thẻ chấm công và tài khoản đăng nhập",
      prefix: "NV",
      includeYear: true,
      includeMonth: false,
      paddingDigits: 3,
      separator: "-",
      resetCycle: "YEARLY",
      currentCounter: 148,
    },
    {
      id: "store",
      title: "Mã Cửa hàng / Chi nhánh (Store Code)",
      desc: "Mã điểm bán kinh doanh trên hệ thống toàn quốc",
      prefix: "BLOAN-S",
      includeYear: false,
      includeMonth: false,
      paddingDigits: 2,
      separator: "",
      resetCycle: "NEVER",
      currentCounter: 24,
    },
    {
      id: "shift",
      title: "Mã Ca làm việc (Shift Code)",
      desc: "Định danh ca theo buổi và khung giờ làm việc",
      prefix: "CA",
      includeYear: false,
      includeMonth: false,
      paddingDigits: 2,
      separator: "-",
      resetCycle: "NEVER",
      currentCounter: 12,
    },
    {
      id: "violation",
      title: "Mã Biên bản Vi phạm (Violation Ticket)",
      desc: "Định danh biên bản xử lý kỷ luật và khấu trừ lương",
      prefix: "BBVP",
      includeYear: true,
      includeMonth: false,
      paddingDigits: 4,
      separator: "-",
      resetCycle: "YEARLY",
      currentCounter: 42,
    },
    {
      id: "bonus",
      title: "Mã Phiếu thưởng KPI (Bonus Voucher)",
      desc: "Mã đề xuất khen thưởng và chi trả hoa hồng",
      prefix: "PT",
      includeYear: true,
      includeMonth: true,
      paddingDigits: 3,
      separator: "-",
      resetCycle: "MONTHLY",
      currentCounter: 18,
    },
  ]);

  const currentYear = 2026;
  const currentMonth = "10";

  const generatePreview = (rule: CodeRule, offset = 1) => {
    const parts = [rule.prefix];
    if (rule.includeYear && rule.includeMonth) {
      parts.push(`${currentYear}${currentMonth}`);
    } else if (rule.includeYear) {
      parts.push(`${currentYear}`);
    } else if (rule.includeMonth) {
      parts.push(`${currentMonth}`);
    }
    const num = String(rule.currentCounter + offset).padStart(rule.paddingDigits, "0");
    parts.push(num);
    return parts.join(rule.separator);
  };

  const updateRule = (id: string, updates: Partial<CodeRule>) => {
    setRules(rules.map((r) => (r.id === id ? { ...r, ...updates } : r)));
  };

  const handleSave = () => {
    alert("Đã lưu quy tắc cấu hình sinh mã tự động toàn hệ thống!");
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
            <span className="text-slate-500 text-xs font-semibold">Quy tắc sinh mã</span>
          </div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight mt-1">
            Cấu hình quy tắc sinh mã tự động (Auto-Code Generator)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Tùy biến tiền tố, định dạng ngày tháng và số lượng chữ số tự tăng cho các thực thể dữ liệu trong chuỗi Ăn Vặt BLOAN.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => alert("Đã đặt lại quy tắc về chuẩn mặc định")}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-xs"
          >
            <RotateCcw className="w-4 h-4 text-slate-500" />
            <span>Mặc định</span>
          </button>
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-900 text-xs font-bold transition-all shadow-sm shadow-amber-200"
          >
            <Save className="w-4 h-4" />
            <span>Lưu quy tắc sinh mã</span>
          </button>
        </div>
      </div>

      {/* Overview Card */}
      <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl p-5 text-slate-900 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-950" />
            <h3 className="font-black text-base tracking-tight">Quy chuẩn sinh mã duy nhất (Unique Identity)</h3>
          </div>
          <p className="text-xs font-medium text-amber-950/80 max-w-2xl">
            Mỗi đối tượng khi được thêm mới sẽ được cấp phát mã tự động theo mẫu đã định nghĩa. Hệ thống đảm bảo không trùng lặp ngay cả khi có hàng nghìn giao dịch đồng thời.
          </p>
        </div>
        <div className="bg-white/90 backdrop-blur-xs px-4 py-2.5 rounded-xl shadow-xs border border-white/60 shrink-0 text-center">
          <p className="text-[10px] font-bold text-slate-500 uppercase">Năm chu kỳ hiện tại</p>
          <p className="text-xl font-black text-slate-900">2026 · Quý 4</p>
        </div>
      </div>

      {/* Rules List */}
      <div className="space-y-4">
        {rules.map((rule) => {
          const previewNext1 = generatePreview(rule, 1);
          const previewNext2 = generatePreview(rule, 2);

          return (
            <div
              key={rule.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 hover:border-amber-300 transition-all"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold shrink-0 mt-0.5">
                    <FileDigit className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">{rule.title}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{rule.desc}</p>
                  </div>
                </div>

                {/* Live Preview Pill */}
                <div className="flex items-center gap-3 bg-slate-50 border border-slate-200/80 px-4 py-2 rounded-xl">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Mẫu mã tiếp theo:
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="font-mono text-sm font-black text-amber-800 bg-amber-100/70 border border-amber-300/60 px-2 py-0.5 rounded-md">
                        {previewNext1}
                      </span>
                      <span className="text-slate-400 text-xs">→</span>
                      <span className="font-mono text-xs font-bold text-slate-600">
                        {previewNext2}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Configuration Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 pt-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tiền tố (Prefix):</label>
                  <input
                    type="text"
                    value={rule.prefix}
                    onChange={(e) => updateRule(rule.id, { prefix: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono font-bold text-slate-800 outline-hidden focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Dấu phân cách:</label>
                  <select
                    value={rule.separator}
                    onChange={(e) => updateRule(rule.id, { separator: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium text-slate-800 outline-hidden focus:border-amber-400 bg-white"
                  >
                    <option value="-">Gạch ngang (-)</option>
                    <option value="_">Gạch dưới (_)</option>
                    <option value="/">Gạch chéo (/)</option>
                    <option value="">Không phân cách</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Số chữ số đệm (0...):</label>
                  <select
                    value={rule.paddingDigits}
                    onChange={(e) => updateRule(rule.id, { paddingDigits: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium text-slate-800 outline-hidden focus:border-amber-400 bg-white"
                  >
                    <option value={2}>2 chữ số (01, 02...)</option>
                    <option value={3}>3 chữ số (001, 002...)</option>
                    <option value={4}>4 chữ số (0001, 0002...)</option>
                    <option value={5}>5 chữ số (00001...)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Chèn Năm / Tháng:</label>
                  <div className="flex items-center gap-3 pt-1.5">
                    <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700">
                      <input
                        type="checkbox"
                        checked={rule.includeYear}
                        onChange={(e) => updateRule(rule.id, { includeYear: e.target.checked })}
                        className="rounded accent-amber-500"
                      />
                      <span>Năm (YYYY)</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700">
                      <input
                        type="checkbox"
                        checked={rule.includeMonth}
                        onChange={(e) => updateRule(rule.id, { includeMonth: e.target.checked })}
                        className="rounded accent-amber-500"
                      />
                      <span>Tháng (MM)</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Chu kỳ làm mới (Reset):</label>
                  <select
                    value={rule.resetCycle}
                    onChange={(e) => updateRule(rule.id, { resetCycle: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium text-slate-800 outline-hidden focus:border-amber-400 bg-white"
                  >
                    <option value="NEVER">Không bao giờ (Tăng liên tục)</option>
                    <option value="YEARLY">Hàng năm (Về 001 đầu năm)</option>
                    <option value="MONTHLY">Hàng tháng (Về 001 đầu tháng)</option>
                  </select>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
