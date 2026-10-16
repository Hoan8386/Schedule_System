"use client";

import React, { useEffect, useState } from "react";
import { Info } from "lucide-react";
import { storeManagerApi } from "@/lib/api";
import { toRequest, typeToApi, type RequestItem } from "./model";
import { RequestTable } from "./RequestTable";

/** Lần xử lý gần đây (dữ liệu mẫu) */
const RECENT_DECISIONS = [
  { request: "DK-030 · 12/10", staff: "Nguyễn Minh Anh", result: "Đã duyệt", resultClass: "bg-slate-100 text-slate-600", note: "Ca sáng · Còn sức chứa", at: "04/10 · 17:30" },
  {
    request: "HC-017 · 09/10",
    staff: "Võ Thanh Thảo",
    result: "Đã từ chối",
    resultClass: "border border-red-200 bg-red-50 text-red-700",
    note: "Cần xác nhận lại phương án bàn giao",
    at: "04/10 · 16:10",
  },
];

const errorText = (cause: unknown) => (cause instanceof Error ? cause.message : String(cause));

/** Trưởng cửa hàng duyệt yêu cầu đăng ký / đổi / hủy ca của nhân viên. */
export default function StoreManagerShiftRequestsPage() {
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    storeManagerApi
      .getEmergencyRequests()
      .then(({ data }) => active && setRequests(data.map(toRequest)))
      .catch((cause) => {
        if (!active) return;
        setError(errorText(cause));
        setRequests([]);
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const decide = async (request: RequestItem, status: "APPROVED" | "REJECTED") => {
    try {
      await storeManagerApi.updateEmergencyRequest(Number(request.id), {
        emergencyRequestId: Number(request.id),
        requestType: typeToApi(request.type),
        reason: request.reason,
        status,
      });
      setRequests((prev) => prev.map((item) => (item.id === request.id ? { ...item, status } : item)));
    } catch (cause) {
      setError(errorText(cause));
    }
  };

  return (
    <div className="page">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-800">Xử lý yêu cầu ca</h1>
        <p className="mt-1 text-xs text-slate-500">Xem xét đăng ký, đổi và hủy ca của nhân viên tại cửa hàng.</p>
      </div>
      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">{error}</div>}

      <div className="flex items-center gap-3 rounded-2xl border border-brand-200/80 bg-brand-50/70 p-4 text-xs text-brand-900">
        <Info className="h-4 w-4 shrink-0 text-brand-600" />
        <p>Bạn chỉ duyệt yêu cầu của nhân viên thuộc BLOAN Nguyễn Trãi. Đăng ký ca của chính bạn nằm ở mục “Đăng ký ca của tôi”.</p>
      </div>

      <RequestTable requests={requests} loading={loading} onDecide={(request, status) => void decide(request, status)} />

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-surface shadow-xs">
        <div className="border-b border-slate-100 p-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Lần xử lý gần đây</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-[11px] font-semibold text-slate-400">
                <th className="px-4 py-2.5">Yêu cầu</th>
                <th className="px-4 py-2.5">Nhân viên</th>
                <th className="px-4 py-2.5">Kết quả</th>
                <th className="px-4 py-2.5">Ghi nhận</th>
                <th className="px-4 py-2.5 text-right">Người xử lý</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {RECENT_DECISIONS.map((row) => (
                <tr key={row.request}>
                  <td className="px-4 py-3 font-bold text-slate-800">{row.request}</td>
                  <td className="px-4 py-3">{row.staff}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${row.resultClass}`}>{row.result}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{row.note}</td>
                  <td className="px-4 py-3 text-right">
                    <p className="font-bold text-slate-800">Trần Thu Hà</p>
                    <p className="text-[10px] text-slate-400">{row.at}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
