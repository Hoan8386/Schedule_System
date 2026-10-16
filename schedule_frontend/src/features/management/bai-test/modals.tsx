import React, { useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import type { QuestionDraft, TestForm } from "./model";

const inputClass = "mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:border-brand-400";

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return (
    <label className="block text-xs font-semibold text-slate-600">
      {label}
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} className={inputClass} />
    </label>
  );
}

function Dialog({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-surface shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="text-sm font-black text-slate-800">{title}</h2>
          <button onClick={onClose} aria-label="Đóng" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function Actions({ saving, onClose, onSave }: { saving: boolean; onClose: () => void; onSave: () => void }) {
  return (
    <div className="mt-5 flex justify-end gap-2 border-t border-slate-100 pt-4">
      <button onClick={onClose} className="btn btn-ghost btn-sm">Hủy</button>
      <button disabled={saving} onClick={onSave} className="btn btn-primary btn-sm">
        {saving ? "Đang lưu..." : "Lưu thay đổi"}
      </button>
    </div>
  );
}

interface TestModalProps {
  id?: number;
  initial: TestForm;
  saving: boolean;
  onClose: () => void;
  onSave: (id: number | undefined, form: TestForm) => void;
}

export function TestFormModal({ id, initial, saving, onClose, onSave }: TestModalProps) {
  const [form, setForm] = useState(initial);
  const set = (key: keyof TestForm) => (next: string) => setForm((prev) => ({ ...prev, [key]: next }));

  return (
    <Dialog title={id ? "Chỉnh sửa bài test" : "Tạo bài test mới"} onClose={onClose}>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Mã bài test" value={form.testCode} onChange={set("testCode")} />
        <Field label="Tên bài test" value={form.testName} onChange={set("testName")} />
        <Field label="Thời lượng (phút)" type="number" value={form.durationMinutes} onChange={set("durationMinutes")} />
        <Field label="Điểm đạt" type="number" value={form.passingScore} onChange={set("passingScore")} />
      </div>
      <label className="mt-3 block text-xs font-semibold text-slate-600">
        Mô tả
        <textarea value={form.description} onChange={(event) => set("description")(event.target.value)} rows={3} className={inputClass} />
      </label>
      <label className="mt-3 block text-xs font-semibold text-slate-600">
        Trạng thái
        <select value={form.status} onChange={(event) => set("status")(event.target.value)} className={inputClass}>
          <option value="DRAFT">Bản nháp</option>
          <option value="ACTIVE">Đang mở</option>
          <option value="CLOSED">Đã đóng</option>
        </select>
      </label>
      <Actions saving={saving} onClose={onClose} onSave={() => onSave(id, form)} />
    </Dialog>
  );
}

interface QuestionModalProps {
  initial: QuestionDraft;
  saving: boolean;
  onClose: () => void;
  onSave: (draft: QuestionDraft) => void;
}

export function QuestionFormModal({ initial, saving, onClose, onSave }: QuestionModalProps) {
  const [draft, setDraft] = useState(initial);
  const updateOption = (index: number, patch: Partial<QuestionDraft["options"][number]>) =>
    setDraft((prev) => ({ ...prev, options: prev.options.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)) }));

  return (
    <Dialog title={draft.id ? "Chỉnh sửa câu hỏi" : "Thêm câu hỏi"} onClose={onClose}>
      <label className="block text-xs font-semibold text-slate-600">
        Nội dung câu hỏi
        <textarea autoFocus value={draft.text} onChange={(event) => setDraft({ ...draft, text: event.target.value })} rows={4} className={inputClass} />
      </label>
      <Field label="Điểm" type="number" value={draft.score} onChange={(score) => setDraft({ ...draft, score })} />

      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-600">Đáp án</p>
          <button
            type="button"
            onClick={() => setDraft({ ...draft, options: [...draft.options, { text: "", isCorrect: false }] })}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Plus className="h-3.5 w-3.5" /> Thêm
          </button>
        </div>
        <div className="space-y-2">
          {draft.options.map((option, index) => (
            <div key={index} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2">
              <button
                type="button"
                onClick={() => updateOption(index, { isCorrect: !option.isCorrect })}
                className={`h-7 w-7 rounded-lg border text-[11px] font-bold ${option.isCorrect ? "border-emerald-200 bg-emerald-100 text-emerald-700" : "border-slate-200 bg-white text-slate-500"}`}
              >
                {option.isCorrect ? "Đ" : "A"}
              </button>
              <input
                value={option.text}
                onChange={(event) => updateOption(index, { text: event.target.value })}
                placeholder={`Đáp án ${index + 1}`}
                className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-brand-400"
              />
              <button
                type="button"
                onClick={() => setDraft({ ...draft, options: draft.options.filter((_, itemIndex) => itemIndex !== index) })}
                className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                aria-label="Xóa đáp án"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <Actions saving={saving} onClose={onClose} onSave={() => onSave(draft)} />
    </Dialog>
  );
}
