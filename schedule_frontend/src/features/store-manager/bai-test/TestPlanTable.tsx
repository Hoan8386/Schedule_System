import { notify } from "@/lib/toast";
import React, { useState } from "react";
import { Search } from "lucide-react";
import { PLAN_STATUS, type TestPlan } from "./model";

const selectClass = "rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 font-medium outline-hidden";

/** Danh sách bài test đã soạn / đã giao. */
export function TestPlanTable({ tests }: { tests: TestPlan[] }) {
  const [search, setSearch] = useState("");

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-surface shadow-xs">
      <div className="flex flex-col justify-between gap-3 border-b border-slate-100 p-4 md:flex-row md:items-center">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Danh sách bài test</h3>
        <div className="flex items-center gap-2.5 text-xs">
          <div className="relative min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm tên hoặc mã bài test"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 outline-hidden"
            />
          </div>
          <select className={selectClass}>
            <option>Tất cả trạng thái</option>
            <option>Đã giao</option>
            <option>Đóng</option>
            <option>Nháp</option>
          </select>
          <select className={selectClass}>
            <option>Tháng 10/2026</option>
            <option>Tháng 09/2026</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50 text-[11px] font-semibold text-slate-400">
              <th className="px-4 py-3">Bài test</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3">Hạn nộp</th>
              <th className="px-4 py-3 text-center">Số câu</th>
              <th className="px-4 py-3 text-center">Đã giao / Nộp</th>
              <th className="px-4 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {tests.map((test) => {
              const status = PLAN_STATUS[test.status];
              return (
                <tr key={test.id} className="transition-colors hover:bg-slate-50/70">
                  <td className="px-4 py-3.5">
                    <p className="font-bold text-slate-800">{test.title}</p>
                    <p className="text-[11px] text-slate-400">
                      {test.code} · {test.duration}
                    </p>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${status.className}`}>{status.label}</span>
                  </td>
                  <td className="px-4 py-3.5 font-medium text-slate-600">{test.dueDate}</td>
                  <td className="px-4 py-3.5 text-center font-bold text-slate-700">{test.questionCount}</td>
                  <td className="px-4 py-3.5 text-center font-bold text-slate-700">
                    {test.totalAssigned > 0 ? `${test.totalAssigned} / ${test.submittedCount}` : "0 / 0"}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => notify.info(`Xem chi tiết bài test: ${test.title}`)} className="rounded-xl border border-slate-200 px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-50">
                        {test.status === "CLOSED" ? "Xem kết quả" : "Xem"}
                      </button>
                      {test.status !== "CLOSED" && (
                        <button onClick={() => notify.success(`Đã phân phối bài test: ${test.title}`)} className="rounded-xl border border-slate-200 px-3 py-1.5 font-bold text-slate-700 hover:bg-slate-50">
                          Giao bài
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
