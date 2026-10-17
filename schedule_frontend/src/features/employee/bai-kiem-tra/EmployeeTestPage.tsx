"use client";

import { notify } from "@/lib/toast";
import React, { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Clock, FileText, Search } from "lucide-react";
import { employeeApi } from "@/lib/api";
import { buildTestItems, TEST_STATUS, type TestItem } from "./model";
import { QuizModal } from "./QuizModal";

const STATS = [
  { label: "Bài được giao", value: "4 bài", valueClass: "text-slate-800", icon: FileText, tone: "bg-slate-100 text-slate-500" },
  { label: "Cần hoàn thành", value: "2 bài", valueClass: "text-brand-600", icon: Clock, tone: "bg-brand-50 text-brand-600" },
  { label: "Đã hoàn thành", value: "2 bài", valueClass: "text-emerald-600", icon: CheckCircle2, tone: "bg-emerald-50 text-emerald-600" },
];

/** Danh sách bài kiểm tra được giao cho nhân viên và khung làm bài. */
export default function EmployeeTestPage() {
  const [tests, setTests] = useState<TestItem[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeTest, setActiveTest] = useState<TestItem | null>(null);

  useEffect(() => {
    Promise.all([employeeApi.getTestAssignments(), employeeApi.getTests(), employeeApi.getTestResults()])
      .then(([assignments, testList, results]) => setTests(buildTestItems(assignments.data ?? [], testList.data ?? [], results.data ?? [])))
      .catch((cause) => setLoadError(cause instanceof Error ? cause.message : "Không thể tải bài kiểm tra"));
  }, []);

  const markCompleted = (test: TestItem) => setTests((prev) => prev.map((item) => (item.id === test.id ? { ...item, status: "COMPLETED", score: 95 } : item)));

  return (
    <div className="page">
      {loadError && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">{loadError}</div>}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-800">Bài kiểm tra</h1>
        <p className="mt-1 text-xs text-slate-500">Hoàn thành đào tạo để tự tin làm việc và phục vụ khách hàng tốt hơn.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {STATS.map(({ label, value, valueClass, icon: Icon, tone }) => (
          <div key={label} className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-surface p-5 shadow-xs">
            <div>
              <span className="text-xs font-semibold text-slate-500">{label}</span>
              <div className={`mt-1 text-3xl font-black ${valueClass}`}>{value}</div>
            </div>
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${tone}`}>
              <Icon className="h-5 w-5" />
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 rounded-2xl border border-brand-200/80 bg-brand-50/70 p-4 text-xs text-brand-900">
        <AlertCircle className="h-4 w-4 shrink-0 text-brand-600" />
        <p>An toàn thực phẩm tại cửa hàng hết hạn vào 23:59 ngày 07/10/2026. Hãy dành 20 phút để hoàn thành bài kiểm tra.</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-surface shadow-xs">
        <div className="flex flex-col justify-between gap-3 border-b border-slate-100 p-4 md:flex-row md:items-center">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Danh sách bài kiểm tra</h3>
          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            <div className="relative min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm tên bài kiểm tra"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-xs outline-hidden hover:border-slate-300"
              />
            </div>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 font-medium outline-hidden">
              <option value="all">Tất cả trạng thái</option>
              <option value="not_started">Chưa làm</option>
              <option value="in_progress">Đang làm</option>
              <option value="completed">Hoàn thành</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-semibold text-slate-400">
                <th className="px-4 py-3">Bài kiểm tra</th>
                <th className="px-4 py-3">Thời lượng</th>
                <th className="px-4 py-3">Hạn hoàn thành</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3 text-center">Điểm</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {tests.map((test) => {
                const badge = TEST_STATUS[test.status];
                return (
                  <tr key={test.id} className="transition-colors hover:bg-slate-50/70">
                    <td className="px-4 py-3.5">
                      <p className="font-bold text-slate-800">{test.title}</p>
                      <p className="text-[11px] text-slate-400">
                        {test.code} · {test.type}
                      </p>
                    </td>
                    <td className="px-4 py-3.5">
                      {test.questions} câu · {test.duration} phút
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`font-semibold ${test.isUrgent ? "text-red-600" : "text-slate-600"}`}>{test.dueDate}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${badge.className}`}>{badge.label}</span>
                    </td>
                    <td className="px-4 py-3.5 text-center font-bold text-slate-800">{test.score ? `${test.score}/100` : "—"}</td>
                    <td className="px-4 py-3.5 text-right">
                      {test.status === "NOT_STARTED" && (
                        <button onClick={() => setActiveTest(test)} className="btn btn-primary btn-sm py-1.5">Bắt đầu</button>
                      )}
                      {test.status === "IN_PROGRESS" && (
                        <button onClick={() => setActiveTest(test)} className="rounded-xl border border-slate-200 px-3.5 py-1.5 font-bold text-slate-700 transition-all hover:bg-slate-50">
                          Tiếp tục
                        </button>
                      )}
                      {test.status === "COMPLETED" && (
                        <button
                          onClick={() => notify.info(`Kết quả kiểm tra: ${test.score}/100 điểm. Đạt tiêu chuẩn phục vụ.`)}
                          className="rounded-xl border border-slate-200 px-3 py-1.5 font-semibold text-slate-600 transition-all hover:bg-slate-50"
                        >
                          Xem kết quả
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 p-4 text-xs text-slate-500">
          <span>Hiển thị 1–4 trong 4 bài kiểm tra</span>
          <div className="flex items-center gap-1.5">
            <button className="rounded-lg border border-slate-200 px-3 py-1.5 text-slate-400">Trước</button>
            <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 font-bold text-brand-contrast">1</button>
            <button className="rounded-lg border border-slate-200 px-3 py-1.5 text-slate-400">Sau</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 text-xs md:grid-cols-2">
        <div className="space-y-1.5 rounded-2xl border border-slate-200/80 bg-surface p-5 shadow-xs">
          <h4 className="font-bold text-slate-800">Trước khi bắt đầu</h4>
          <p className="text-[11px] leading-relaxed text-slate-500">Kiểm tra kết nối và dành đủ thời gian. Thời gian làm bài bắt đầu khi bạn chọn “Bắt đầu”.</p>
        </div>
        <div className="space-y-1.5 rounded-2xl border border-slate-200/80 bg-surface p-5 shadow-xs">
          <h4 className="font-bold text-slate-800">Kết quả và tiêu chuẩn</h4>
          <p className="text-[11px] leading-relaxed text-slate-500">
            Điểm đạt từ 80/100. Bạn có thể xem lại kết quả sau khi nộp bài; liên hệ quản lý nếu cần được giao lại bài.
          </p>
        </div>
      </div>

      {activeTest && <QuizModal key={activeTest.id} test={activeTest} onClose={() => setActiveTest(null)} onSubmitted={markCompleted} />}
    </div>
  );
}
