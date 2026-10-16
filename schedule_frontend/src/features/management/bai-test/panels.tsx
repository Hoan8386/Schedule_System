import React, { useMemo, useState } from "react";
import { FileQuestion, Pencil, Plus, Search, Trash2 } from "lucide-react";
import type { TestOptionResponse, TestQuestionResponse, TestResponse } from "@/lib/api";
import { idOf, STATUS_LABEL, statusBadge, type StoreSummary } from "./model";

const sectionClass = "overflow-hidden rounded-2xl border border-slate-200/80 bg-surface shadow-xs";
const titleClass = "text-xs font-bold uppercase tracking-wider text-slate-800";

/** Tổng hợp bài test theo cửa hàng. */
export function StoreSummaryGrid({ summaries }: { summaries: StoreSummary[] }) {
  return (
    <section className={sectionClass}>
      <div className="border-b border-slate-100 p-4">
        <h2 className={titleClass}>Tổng hợp theo từng cửa hàng</h2>
        <p className="mt-1 text-[11px] text-slate-400">Theo dõi trạng thái giao bài và kết quả làm test tại từng chi nhánh.</p>
      </div>
      <div className="grid grid-cols-1 gap-3 p-4 md:grid-cols-2 xl:grid-cols-3">
        {summaries.length === 0 && <div className="col-span-full p-8 text-center text-xs text-slate-400">Chưa có dữ liệu tổng hợp theo cửa hàng.</div>}
        {summaries.map((summary) => (
          <div key={summary.storeId} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-black text-slate-800">{summary.storeName}</p>
                <p className="mt-1 text-[11px] text-slate-400">
                  {summary.employeeCount} nhân viên · {summary.testCount} bài test
                </p>
              </div>
              <span className="rounded-md bg-brand-50 px-2 py-1 text-[10px] font-bold text-brand-700">{summary.assignedCount} giao</span>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              {[
                ["Đã giao", summary.assignedCount, "text-slate-700"],
                ["Hoàn thành", summary.completedCount, "text-slate-700"],
                ["Đạt", summary.passedCount, "text-emerald-600"],
              ].map(([label, count, tone]) => (
                <div key={label} className="rounded-xl border border-slate-200 bg-white p-2">
                  <p className="text-[10px] text-slate-400">{label}</p>
                  <p className={`text-lg font-black ${tone}`}>{count}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
              <span>Điểm TB</span>
              <span className="font-bold text-slate-700">{summary.avgScore === null ? "—" : `${summary.avgScore.toFixed(1)} / 10`}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

interface TestListProps {
  tests: TestResponse[];
  loading: boolean;
  selectedTestId: number | null;
  onSelect: (id: number) => void;
  onEdit: (test: TestResponse) => void;
  onDelete: (test: TestResponse) => void;
}

/** Danh sách bài test có tìm kiếm và lọc trạng thái. */
export function TestListPanel({ tests, loading, selectedTestId, onSelect, onEdit, onDelete }: TestListProps) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return tests.filter(
      (item) =>
        (!keyword || item.testName.toLowerCase().includes(keyword) || item.testCode.toLowerCase().includes(keyword)) && (status === "ALL" || item.status === status)
    );
  }, [search, status, tests]);

  return (
    <section className={sectionClass}>
      <div className="flex flex-col justify-between gap-3 border-b border-slate-100 p-4 md:flex-row md:items-center">
        <h2 className={titleClass}>Danh sách bài test</h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm mã hoặc tên..."
              className="w-48 rounded-xl border border-slate-200 bg-slate-50 py-2 pl-8 pr-3 text-xs outline-none focus:border-brand-400"
            />
          </div>
          <select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none">
            <option value="ALL">Tất cả</option>
            <option value="ACTIVE">Đang mở</option>
            <option value="DRAFT">Bản nháp</option>
            <option value="CLOSED">Đã đóng</option>
          </select>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-50 text-[11px] font-semibold text-slate-400">
              <th className="px-4 py-3">Bài test</th>
              <th className="px-4 py-3">Thời lượng</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center text-slate-400">Chưa có bài test phù hợp.</td>
              </tr>
            )}
            {filtered.map((test) => {
              const testId = idOf(test);
              return (
                <tr key={testId} onClick={() => onSelect(testId)} className={`cursor-pointer transition-colors ${testId === selectedTestId ? "bg-brand-50/70" : "hover:bg-slate-50/70"}`}>
                  <td className="px-4 py-3.5">
                    <p className="font-bold text-slate-800">{test.testName}</p>
                    <p className="mt-0.5 text-[11px] text-slate-400">{test.testCode}</p>
                  </td>
                  <td className="px-4 py-3.5 text-slate-600">{test.durationMinutes ?? "—"} phút</td>
                  <td className="px-4 py-3.5">
                    <span className={`rounded-md px-2 py-1 text-[10px] font-bold ${statusBadge(test.status)}`}>{STATUS_LABEL[test.status] ?? test.status}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={(event) => { event.stopPropagation(); onEdit(test); }}
                        aria-label={`Sửa ${test.testName}`}
                        className="rounded-lg p-2 text-slate-400 hover:bg-brand-50 hover:text-brand-600"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={(event) => { event.stopPropagation(); onDelete(test); }}
                        aria-label={`Xóa ${test.testName}`}
                        className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

interface QuestionBankProps {
  test: TestResponse | undefined;
  questions: TestQuestionResponse[];
  optionsOf: (questionId: number) => TestOptionResponse[];
  onAdd: () => void;
  onEdit: (question: TestQuestionResponse) => void;
  onDelete: (question: TestQuestionResponse) => void;
}

/** Câu hỏi của bài test đang chọn. */
export function QuestionBankPanel({ test, questions, optionsOf, onAdd, onEdit, onDelete }: QuestionBankProps) {
  return (
    <section className={sectionClass}>
      <div className="flex items-center justify-between border-b border-slate-100 p-4">
        <div>
          <h2 className={titleClass}>Ngân hàng câu hỏi</h2>
          <p className="mt-1 text-[11px] text-slate-400">{test?.testName ?? "Chọn một bài test để xem chi tiết"}</p>
        </div>
        {test && (
          <button onClick={onAdd} className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3 py-2 text-[11px] font-bold text-white hover:bg-slate-700">
            <Plus className="h-3.5 w-3.5" /> Thêm câu
          </button>
        )}
      </div>
      {!test ? (
        <div className="p-10 text-center text-xs text-slate-400">
          <FileQuestion className="mx-auto mb-2 h-8 w-8 text-slate-300" />
          Chọn bài test bên trái.
        </div>
      ) : (
        <div className="max-h-[470px] space-y-2 overflow-y-auto p-3">
          {questions.length === 0 && <div className="p-8 text-center text-xs text-slate-400">Bài test chưa có câu hỏi.</div>}
          {questions.map((question, index) => (
            <div key={idOf(question)} className="rounded-xl border border-slate-100 p-3 transition-colors hover:border-brand-200">
              <div className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-[11px] font-black text-brand-700">{index + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-700">{question.questionText}</p>
                  <p className="mt-1 text-[10px] text-slate-400">
                    {question.questionType} · {question.score ?? 1} điểm · {optionsOf(idOf(question)).length} đáp án
                  </p>
                </div>
                <button onClick={() => onEdit(question)} aria-label="Sửa câu hỏi" className="p-1.5 text-slate-400 hover:text-brand-600">
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => onDelete(question)} aria-label="Xóa câu hỏi" className="p-1.5 text-slate-400 hover:text-red-600">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
