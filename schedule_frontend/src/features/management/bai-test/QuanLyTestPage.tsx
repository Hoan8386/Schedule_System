"use client";

import React, { useState } from "react";
import { AlertCircle, BookOpenCheck, CheckCircle2, ClipboardList, Plus, RefreshCw, X } from "lucide-react";
import type { TestResponse } from "@/lib/api";
import { EMPTY_TEST_FORM, idOf, toQuestionDraft, type QuestionDraft, type TestForm } from "./model";
import { useTestManagement } from "./useTestManagement";
import { QuestionBankPanel, StoreSummaryGrid, TestListPanel } from "./panels";
import { QuestionFormModal, TestFormModal } from "./modals";

const toTestForm = (test: TestResponse): TestForm => ({
  testCode: test.testCode,
  testName: test.testName,
  description: test.description ?? "",
  durationMinutes: String(test.durationMinutes ?? 15),
  passingScore: String(test.passingScore ?? 70),
  status: test.status,
});

/** Quản lý bài test: đề, ngân hàng câu hỏi và tổng hợp kết quả theo cửa hàng. */
export default function QuanLyTestPage() {
  const state = useTestManagement();
  const { tests, questions, selectedTestId, loading, saving, error, notice } = state;
  const [testModal, setTestModal] = useState<{ id?: number; form: TestForm } | null>(null);
  const [questionDraft, setQuestionDraft] = useState<QuestionDraft | null>(null);

  const selectedTest = tests.find((item) => idOf(item) === selectedTestId);
  const stats = [
    { label: "Tổng bài test", value: tests.length, icon: ClipboardList, tone: "text-slate-600 bg-slate-100" },
    { label: "Đang mở", value: tests.filter((item) => item.status === "ACTIVE").length, icon: CheckCircle2, tone: "text-emerald-600 bg-emerald-50" },
    { label: "Bản nháp", value: tests.filter((item) => item.status === "DRAFT").length, icon: BookOpenCheck, tone: "text-brand-600 bg-brand-50" },
  ];

  return (
    <div className="page">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-600">Đào tạo & đánh giá</p>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-800">Quản lý bài test</h1>
          <p className="mt-1 text-xs text-slate-500">Tạo nội dung, quản lý câu hỏi và chuẩn bị bài kiểm tra cho toàn chuỗi.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => void state.reload()} aria-label="Tải lại dữ liệu" className="btn-icon border border-slate-200 bg-white p-2.5 text-slate-500 hover:bg-slate-50">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button onClick={() => setTestModal({ form: EMPTY_TEST_FORM })} className="btn btn-primary shadow-sm shadow-brand-200">
            <Plus className="h-4 w-4 stroke-[3]" /> Tạo bài test
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" /> <span>{error}</span>
          <button onClick={() => state.setError("")} className="ml-auto" aria-label="Đóng thông báo lỗi">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      {notice && <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-700">{notice}</div>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map(({ label, value, icon: Icon, tone }) => (
          <div key={label} className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-surface p-5 shadow-xs">
            <div>
              <p className="text-xs font-semibold text-slate-500">{label}</p>
              <p className="mt-1 text-3xl font-black text-slate-800">{value}</p>
            </div>
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${tone}`}>
              <Icon className="h-5 w-5" />
            </div>
          </div>
        ))}
      </div>

      <StoreSummaryGrid summaries={state.storeSummaries} />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <TestListPanel
          tests={tests}
          loading={loading}
          selectedTestId={selectedTestId}
          onSelect={state.setSelectedTestId}
          onEdit={(test) => setTestModal({ id: idOf(test), form: toTestForm(test) })}
          onDelete={state.removeTest}
        />
        <QuestionBankPanel
          test={selectedTest}
          questions={questions.filter((item) => item.testId === selectedTestId)}
          optionsOf={state.optionsOf}
          onAdd={() => setQuestionDraft(toQuestionDraft(undefined, state.options))}
          onEdit={(question) => setQuestionDraft(toQuestionDraft(question, state.options))}
          onDelete={state.removeQuestion}
        />
      </div>

      {testModal && (
        <TestFormModal
          id={testModal.id}
          initial={testModal.form}
          saving={saving}
          onClose={() => setTestModal(null)}
          onSave={async (id, form) => {
            if (await state.saveTest(id, form)) setTestModal(null);
          }}
        />
      )}

      {questionDraft && (
        <QuestionFormModal
          initial={questionDraft}
          saving={saving}
          onClose={() => setQuestionDraft(null)}
          onSave={async (draft) => {
            if (await state.saveQuestion(draft)) setQuestionDraft(null);
          }}
        />
      )}
    </div>
  );
}
