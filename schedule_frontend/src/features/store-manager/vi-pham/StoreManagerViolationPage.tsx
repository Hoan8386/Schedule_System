"use client";

import React, { useEffect, useState } from "react";
import { CheckSquare, ClipboardList, FileText, Info, Search } from "lucide-react";
import { storeManagerApi } from "@/lib/api";
import { toViolation, type ViolationItem } from "./model";
import { ViolationTable } from "./ViolationTable";
import { RecordViolationModal, type ViolationReport } from "./RecordViolationModal";

interface Props {
  /** "lapbienban" mở sẵn form lập biên bản */
  initialTab?: string;
}

const STATS = [
  { label: "Chờ xác minh", value: "2 sự việc", hint: "Cần trao đổi với nhân viên", icon: Search, tone: "bg-brand-50 text-brand-600" },
  { label: "Đang xử lý", value: "1 sự việc", hint: "Đã ghi nhận phản hồi", icon: ClipboardList, tone: "bg-blue-50 text-blue-600" },
  { label: "Đã hoàn tất", value: "2 sự việc", hint: "Đã lưu hướng xử lý", icon: CheckSquare, tone: "bg-emerald-50 text-emerald-600" },
];

const errorText = (cause: unknown) => (cause instanceof Error ? cause.message : String(cause));

/** Ghi nhận, xác minh và theo dõi vi phạm của nhân viên trong cửa hàng. */
export default function StoreManagerViolationPage({ initialTab }: Props) {
  const [violations, setViolations] = useState<ViolationItem[]>([]);
  const [modalOpen, setModalOpen] = useState(initialTab === "lapbienban");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    storeManagerApi
      .getViolations()
      .then(({ data }) => active && setViolations(data.map((item) => toViolation(item))))
      .catch((cause) => {
        if (!active) return;
        setError(errorText(cause));
        setViolations([]);
      });
    return () => {
      active = false;
    };
  }, []);

  const createReport = async (report: ViolationReport) => {
    try {
      const { data } = await storeManagerApi.createViolation({
        employeeCode: report.staffCode,
        description: report.description.trim() || "Ghi nhận sự việc mới",
        category: report.category,
        status: "PROCESSING",
      });
      const created = toViolation(data, {
        staffName: report.staffName,
        staffCode: report.staffCode,
        title: report.description,
        shiftDetail: "Ca hiện tại",
        category: report.category,
        time: new Date().toISOString(),
        status: "PROCESSING",
      });
      setViolations((prev) => [created, ...prev]);
      setModalOpen(false);
    } catch (cause) {
      setError(errorText(cause));
    }
  };

  return (
    <div className="page">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-800">Xử lý vi phạm</h1>
          <p className="mt-1 text-xs text-slate-500">Ghi nhận, xác minh và theo dõi sự việc của nhân viên tại BLOAN Nguyễn Trãi.</p>
        </div>
        {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">{error}</div>}
        <button onClick={() => setModalOpen(true)} className="btn btn-primary px-5 shadow-sm shadow-brand-200">
          <FileText className="h-4 w-4" />
          <span>Lập biên bản</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {STATS.map(({ label, value, hint, icon: Icon, tone }) => (
          <div key={label} className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-surface p-5 shadow-xs">
            <div>
              <span className="text-xs font-semibold text-slate-500">{label}</span>
              <div className="mt-1 text-3xl font-black text-slate-800">{value}</div>
              <p className="mt-1 text-[11px] text-slate-400">{hint}</p>
            </div>
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${tone}`}>
              <Icon className="h-5 w-5" />
            </div>
          </div>
        ))}
      </div>

      <ViolationTable violations={violations} />

      <div className="flex items-center gap-3 rounded-2xl border border-brand-200/80 bg-brand-50/70 p-4 text-xs text-brand-900">
        <Info className="h-4 w-4 shrink-0 text-brand-600" />
        <p>
          Sự việc cần được xác minh và ghi nhận phản hồi trước khi kết luận. Hướng xử lý không tự động tạo khoản phạt hoặc khấu trừ tiền công.
        </p>
      </div>

      {modalOpen && <RecordViolationModal onClose={() => setModalOpen(false)} onSubmit={(report) => void createReport(report)} />}
    </div>
  );
}
