"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  BookOpenCheck,
  CheckCircle2,
  ClipboardList,
  FileQuestion,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import {
  managerApi,
  TestOptionResponse,
  TestQuestionResponse,
  TestResponse,
} from "@/lib/managerApi";

const idOf = (item: { id?: number; testId?: number; questionId?: number }) =>
  Number(item.id ?? item.testId ?? item.questionId ?? 0);

const listData = <T,>(value: unknown): T[] =>
  Array.isArray(value) ? (value as T[]) : [];

const statusLabel: Record<string, string> = {
  ACTIVE: "Đang mở",
  DRAFT: "Bản nháp",
  INACTIVE: "Đã đóng",
  CLOSED: "Đã đóng",
};

type TestForm = {
  testCode: string;
  testName: string;
  description: string;
  durationMinutes: string;
  passingScore: string;
  status: string;
};

const emptyForm: TestForm = {
  testCode: "",
  testName: "",
  description: "",
  durationMinutes: "15",
  passingScore: "70",
  status: "DRAFT",
};

export default function QuanLyTestPage() {
  const [tests, setTests] = useState<TestResponse[]>([]);
  const [questions, setQuestions] = useState<TestQuestionResponse[]>([]);
  const [options, setOptions] = useState<TestOptionResponse[]>([]);
  const [selectedTestId, setSelectedTestId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [testModal, setTestModal] = useState<{ id?: number; form: TestForm } | null>(null);
  const [questionModal, setQuestionModal] = useState<{ id?: number; text: string; score: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [testResponse, questionResponse, optionResponse] = await Promise.all([
        managerApi.getTests(),
        managerApi.getTestQuestions(),
        managerApi.getTestOptions(),
      ]);
      const nextTests = listData<TestResponse>(testResponse.data);
      setTests(nextTests);
      setQuestions(listData<TestQuestionResponse>(questionResponse.data));
      setOptions(listData<TestOptionResponse>(optionResponse.data));
      setSelectedTestId((current) =>
        current && nextTests.some((item) => idOf(item) === current)
          ? current
          : nextTests.length
          ? idOf(nextTests[0])
          : null
      );
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể tải dữ liệu bài test");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredTests = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return tests.filter((item) => {
      const matchesText =
        !keyword ||
        item.testName.toLowerCase().includes(keyword) ||
        item.testCode.toLowerCase().includes(keyword);
      const matchesStatus = status === "ALL" || item.status === status;
      return matchesText && matchesStatus;
    });
  }, [search, status, tests]);

  const selectedTest = tests.find((item) => idOf(item) === selectedTestId);
  const selectedQuestions = questions.filter((item) => item.testId === selectedTestId);
  const activeCount = tests.filter((item) => item.status === "ACTIVE").length;
  const draftCount = tests.filter((item) => item.status === "DRAFT").length;

  const showNotice = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3000);
  };

  const saveTest = async () => {
    if (!testModal) return;
    if (!testModal.form.testCode.trim() || !testModal.form.testName.trim()) {
      setError("Vui lòng nhập mã và tên bài test.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const body = {
        ...testModal.form,
        durationMinutes: Number(testModal.form.durationMinutes),
        passingScore: Number(testModal.form.passingScore),
      };
      if (testModal.id) {
        await managerApi.updateTest(testModal.id, body);
        showNotice("Đã cập nhật bài test.");
      } else {
        await managerApi.createTest(body);
        showNotice("Đã tạo bài test mới.");
      }
      setTestModal(null);
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể lưu bài test");
    } finally {
      setSaving(false);
    }
  };

  const removeTest = async (test: TestResponse) => {
    const testId = idOf(test);
    if (!testId || !window.confirm(`Xóa bài test "${test.testName}"?`)) return;
    try {
      await managerApi.deleteTest(testId);
      showNotice("Đã xóa bài test.");
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể xóa bài test");
    }
  };

  const saveQuestion = async () => {
    if (!questionModal || !selectedTestId || !questionModal.text.trim()) return;
    setSaving(true);
    setError("");
    try {
      const body = {
        testId: selectedTestId,
        questionText: questionModal.text.trim(),
        questionType: "SINGLE_CHOICE",
        score: Number(questionModal.score) || 1,
      };
      if (questionModal.id) await managerApi.updateTestQuestion(questionModal.id, body);
      else await managerApi.createTestQuestion(body);
      setQuestionModal(null);
      showNotice("Đã lưu câu hỏi.");
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể lưu câu hỏi");
    } finally {
      setSaving(false);
    }
  };

  const removeQuestion = async (question: TestQuestionResponse) => {
    const questionId = idOf(question);
    if (!questionId || !window.confirm("Xóa câu hỏi này?")) return;
    try {
      await managerApi.deleteTestQuestion(questionId);
      showNotice("Đã xóa câu hỏi.");
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể xóa câu hỏi");
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-amber-600">Đào tạo & đánh giá</p>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight mt-1">Quản lý bài test</h1>
          <p className="text-xs text-slate-500 mt-1">Tạo nội dung, quản lý câu hỏi và chuẩn bị bài kiểm tra cho toàn chuỗi.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => void load()} aria-label="Tải lại dữ liệu" className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => setTestModal({ form: emptyForm })}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold shadow-sm shadow-amber-200"
          >
            <Plus className="w-4 h-4 stroke-[3]" /> Tạo bài test
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl border border-red-200 bg-red-50 text-xs text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0" /> <span>{error}</span>
          <button onClick={() => setError("")} className="ml-auto" aria-label="Đóng thông báo lỗi"><X className="w-4 h-4" /></button>
        </div>
      )}
      {notice && <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50 text-xs font-semibold text-emerald-700">{notice}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Tổng bài test", value: tests.length, icon: ClipboardList, tone: "text-slate-600 bg-slate-100" },
          { label: "Đang mở", value: activeCount, icon: CheckCircle2, tone: "text-emerald-600 bg-emerald-50" },
          { label: "Bản nháp", value: draftCount, icon: BookOpenCheck, tone: "text-amber-600 bg-amber-50" },
        ].map((item) => (
          <div key={item.label} className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div><p className="text-xs font-semibold text-slate-500">{item.label}</p><p className="text-3xl font-black text-slate-800 mt-1">{item.value}</p></div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.tone}`}><item.icon className="w-5 h-5" /></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.15fr_0.85fr] gap-5">
        <section className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">Danh sách bài test</h2>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm mã hoặc tên..." className="w-48 pl-8 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs outline-none focus:border-amber-400" />
              </div>
              <select value={status} onChange={(event) => setStatus(event.target.value)} className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs outline-none">
                <option value="ALL">Tất cả</option><option value="ACTIVE">Đang mở</option><option value="DRAFT">Bản nháp</option><option value="CLOSED">Đã đóng</option>
              </select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead><tr className="bg-slate-50 text-[11px] font-semibold text-slate-400"><th className="px-4 py-3">Bài test</th><th className="px-4 py-3">Thời lượng</th><th className="px-4 py-3">Trạng thái</th><th className="px-4 py-3 text-right">Thao tác</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {!loading && filteredTests.length === 0 && <tr><td colSpan={4} className="px-4 py-12 text-center text-slate-400">Chưa có bài test phù hợp.</td></tr>}
                {filteredTests.map((test) => {
                  const testId = idOf(test);
                  const selected = testId === selectedTestId;
                  return <tr key={testId} onClick={() => setSelectedTestId(testId)} className={`cursor-pointer transition-colors ${selected ? "bg-amber-50/70" : "hover:bg-slate-50/70"}`}>
                    <td className="px-4 py-3.5"><p className="font-bold text-slate-800">{test.testName}</p><p className="text-[11px] text-slate-400 mt-0.5">{test.testCode}</p></td>
                    <td className="px-4 py-3.5 text-slate-600">{test.durationMinutes ?? "—"} phút</td>
                    <td className="px-4 py-3.5"><span className={`px-2 py-1 rounded-md text-[10px] font-bold ${test.status === "ACTIVE" ? "bg-emerald-50 text-emerald-700" : test.status === "DRAFT" ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-500"}`}>{statusLabel[test.status] ?? test.status}</span></td>
                    <td className="px-4 py-3.5"><div className="flex justify-end gap-1">
                      <button onClick={(event) => { event.stopPropagation(); setTestModal({ id: testId, form: { testCode: test.testCode, testName: test.testName, description: test.description ?? "", durationMinutes: String(test.durationMinutes ?? 15), passingScore: String(test.passingScore ?? 70), status: test.status } }); }} aria-label={`Sửa ${test.testName}`} className="p-2 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50"><Pencil className="w-3.5 h-3.5" /></button>
                      <button onClick={(event) => { event.stopPropagation(); void removeTest(test); }} aria-label={`Xóa ${test.testName}`} className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div></td>
                  </tr>;
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div><h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">Ngân hàng câu hỏi</h2><p className="text-[11px] text-slate-400 mt-1">{selectedTest?.testName ?? "Chọn một bài test để xem chi tiết"}</p></div>
            {selectedTest && <button onClick={() => setQuestionModal({ text: "", score: "1" })} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 text-white text-[11px] font-bold hover:bg-slate-700"><Plus className="w-3.5 h-3.5" /> Thêm câu</button>}
          </div>
          {!selectedTest ? <div className="p-10 text-center text-slate-400 text-xs"><FileQuestion className="w-8 h-8 mx-auto mb-2 text-slate-300" />Chọn bài test bên trái.</div> :
            <div className="p-3 space-y-2 max-h-[470px] overflow-y-auto">
              {selectedQuestions.length === 0 && <div className="p-8 text-center text-slate-400 text-xs">Bài test chưa có câu hỏi.</div>}
              {selectedQuestions.map((question, index) => <div key={idOf(question)} className="p-3 rounded-xl border border-slate-100 hover:border-amber-200 transition-colors">
                <div className="flex items-start gap-3"><span className="w-6 h-6 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center text-[11px] font-black shrink-0">{index + 1}</span><div className="min-w-0 flex-1"><p className="text-xs font-semibold text-slate-700">{question.questionText}</p><p className="text-[10px] text-slate-400 mt-1">{question.questionType} · {question.score ?? 1} điểm · {options.filter((option) => option.questionId === idOf(question)).length} đáp án</p></div>
                  <button onClick={() => setQuestionModal({ id: idOf(question), text: question.questionText, score: String(question.score ?? 1) })} aria-label="Sửa câu hỏi" className="p-1.5 text-slate-400 hover:text-amber-600"><Pencil className="w-3.5 h-3.5" /></button><button onClick={() => void removeQuestion(question)} aria-label="Xóa câu hỏi" className="p-1.5 text-slate-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>)}
            </div>}
        </section>
      </div>

      {testModal && <Modal title={testModal.id ? "Chỉnh sửa bài test" : "Tạo bài test mới"} onClose={() => setTestModal(null)}>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Mã bài test" value={testModal.form.testCode} onChange={(value) => setTestModal({ ...testModal, form: { ...testModal.form, testCode: value } })} />
          <Field label="Tên bài test" value={testModal.form.testName} onChange={(value) => setTestModal({ ...testModal, form: { ...testModal.form, testName: value } })} />
          <Field label="Thời lượng (phút)" type="number" value={testModal.form.durationMinutes} onChange={(value) => setTestModal({ ...testModal, form: { ...testModal.form, durationMinutes: value } })} />
          <Field label="Điểm đạt" type="number" value={testModal.form.passingScore} onChange={(value) => setTestModal({ ...testModal, form: { ...testModal.form, passingScore: value } })} />
        </div>
        <label className="block mt-3 text-xs font-semibold text-slate-600">Mô tả<textarea value={testModal.form.description} onChange={(event) => setTestModal({ ...testModal, form: { ...testModal.form, description: event.target.value } })} rows={3} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:border-amber-400" /></label>
        <label className="block mt-3 text-xs font-semibold text-slate-600">Trạng thái<select value={testModal.form.status} onChange={(event) => setTestModal({ ...testModal, form: { ...testModal.form, status: event.target.value } })} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:border-amber-400"><option value="DRAFT">Bản nháp</option><option value="ACTIVE">Đang mở</option><option value="CLOSED">Đã đóng</option></select></label>
        <ModalActions saving={saving} onClose={() => setTestModal(null)} onSave={() => void saveTest()} />
      </Modal>}

      {questionModal && <Modal title={questionModal.id ? "Chỉnh sửa câu hỏi" : "Thêm câu hỏi"} onClose={() => setQuestionModal(null)}>
        <label className="block text-xs font-semibold text-slate-600">Nội dung câu hỏi<textarea autoFocus value={questionModal.text} onChange={(event) => setQuestionModal({ ...questionModal, text: event.target.value })} rows={4} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:border-amber-400" /></label>
        <Field label="Điểm" type="number" value={questionModal.score} onChange={(value) => setQuestionModal({ ...questionModal, score: value })} />
        <ModalActions saving={saving} onClose={() => setQuestionModal(null)} onSave={() => void saveQuestion()} />
      </Modal>}
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return <label className="block text-xs font-semibold text-slate-600">{label}<input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:border-amber-400" /></label>;
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-sm"><div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200"><div className="flex items-center justify-between px-5 py-4 border-b border-slate-100"><h2 className="text-sm font-black text-slate-800">{title}</h2><button onClick={onClose} aria-label="Đóng" className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"><X className="w-4 h-4" /></button></div><div className="p-5">{children}</div></div></div>;
}

function ModalActions({ saving, onClose, onSave }: { saving: boolean; onClose: () => void; onSave: () => void }) {
  return <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-slate-100"><button onClick={onClose} className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100">Hủy</button><button disabled={saving} onClick={onSave} className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-xs font-bold text-slate-950">{saving ? "Đang lưu..." : "Lưu thay đổi"}</button></div>;
}
