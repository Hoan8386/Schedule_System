import { notify } from "@/lib/toast";
import React, { useState } from "react";
import { Send } from "lucide-react";
import { DRAFT_OPTIONS, STORE_STAFF } from "./model";

const inputClass = "w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-medium outline-hidden";

export interface TestDraft {
  testName: string;
  duration: string;
}

interface EditorProps {
  draft: TestDraft;
  onChange: (draft: TestDraft) => void;
}

/** Khung soạn bài: tên, thời lượng và câu hỏi đang soạn. */
export function TestEditor({ draft, onChange }: EditorProps) {
  const [question, setQuestion] = useState("Sau khi vệ sinh dụng cụ, cần bảo quản như thế nào trước ca tiếp theo?");
  const [correct, setCorrect] = useState("B");

  return (
    <div className="space-y-5 rounded-2xl border border-slate-200/80 bg-surface p-6 shadow-xs lg:col-span-2">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h4 className="text-sm font-bold text-slate-800">Soạn bài · Quy trình vệ sinh cuối ca</h4>
          <p className="text-[11px] text-slate-400">Nháp · VS-10</p>
        </div>
        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">Một đáp án</span>
      </div>

      <div className="grid grid-cols-1 gap-4 text-xs sm:grid-cols-3">
        <div className="space-y-1.5 sm:col-span-2">
          <label className="font-bold text-slate-700">
            Tên bài test <span className="text-red-500">*</span>
          </label>
          <input type="text" value={draft.testName} onChange={(event) => onChange({ ...draft, testName: event.target.value })} className={inputClass} />
        </div>
        <div className="space-y-1.5">
          <label className="font-bold text-slate-700">Thời lượng</label>
          <input type="text" value={draft.duration} onChange={(event) => onChange({ ...draft, duration: event.target.value })} className={inputClass} />
        </div>
      </div>

      <div className="space-y-3 pt-2 text-xs">
        <span className="font-bold text-slate-800">Câu hỏi đang soạn · Câu 1 / 2</span>
        <div className="space-y-1.5">
          <label className="font-bold text-slate-700">
            Nội dung câu hỏi <span className="text-red-500">*</span>
          </label>
          <textarea rows={3} value={question} onChange={(event) => setQuestion(event.target.value)} className={`${inputClass} resize-none p-3 leading-relaxed`} />
        </div>

        <div className="space-y-2 pt-1">
          {DRAFT_OPTIONS.map((option) => (
            <div
              key={option.key}
              onClick={() => setCorrect(option.key)}
              className={`flex cursor-pointer items-center justify-between rounded-xl border p-3 transition-all ${
                correct === option.key ? "border-brand-400 bg-brand-50/70 font-semibold" : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="font-bold text-slate-700">{option.key}.</span>
                <span className="text-slate-800">{option.text}</span>
              </div>
              {correct === option.key && <span className="rounded-md bg-brand-100 px-2 py-0.5 text-[10px] font-bold text-brand-700">Đáp án đúng</span>}
            </div>
          ))}
        </div>

        <div className="space-y-1.5 pt-2">
          <label className="font-bold text-slate-700">Giải thích đáp án</label>
          <input type="text" defaultValue="Dụng cụ sạch, khô và được bảo quản đúng nơi giúp tránh nhiễm bẩn trước ca tiếp theo." className={inputClass} />
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 pt-3">
          <button type="button" onClick={() => notify.success("Đã thêm câu hỏi thứ 3 vào bài test!")} className="btn btn-secondary btn-sm">
            + Thêm câu hỏi
          </button>
          <button type="button" onClick={() => notify.success("Đã lưu bản nháp thành công!")} className="btn btn-primary btn-sm px-5">
            Lưu bản nháp
          </button>
        </div>
      </div>
    </div>
  );
}

interface AssignProps {
  selected: string[];
  onToggle: (code: string) => void;
  onAssign: () => void;
}

/** Danh sách câu hỏi và chọn nhân viên để giao bài. */
export function AssignPanel({ selected, onToggle, onAssign }: AssignProps) {
  return (
    <div className="space-y-6 text-xs">
      <div className="space-y-3 rounded-2xl border border-slate-200/80 bg-surface p-5 shadow-xs">
        <h4 className="text-sm font-bold text-slate-800">Danh sách câu hỏi</h4>
        <div className="space-y-2">
          <div className="rounded-xl border border-brand-300 bg-brand-50/60 p-2.5 font-bold text-slate-800">Câu 1 · Bảo quản dụng cụ sạch</div>
          <div className="rounded-xl border border-slate-200 p-2.5 text-slate-600 hover:border-slate-300">Câu 2 · Kiểm tra khu vực cuối ca</div>
        </div>
        <p className="pt-1 text-[11px] text-slate-400">2 câu · 50 điểm / câu · Tổng 100 điểm</p>
      </div>

      <div className="space-y-4 rounded-2xl border border-slate-200/80 bg-surface p-5 shadow-xs">
        <h4 className="text-sm font-bold text-slate-800">Giao bài cho nhân viên</h4>
        <p className="text-[11px] text-slate-400">Chỉ chọn nhân viên thuộc BLOAN Nguyễn Trãi. Bài đang soạn chưa được giao.</p>
        <div className="space-y-2">
          {STORE_STAFF.map((staff) => (
            <label key={staff.code} className="flex cursor-pointer items-center gap-2.5 rounded-lg p-1.5 hover:bg-slate-50">
              <input
                type="checkbox"
                checked={selected.includes(staff.code)}
                onChange={() => onToggle(staff.code)}
                className="h-4 w-4 rounded-sm border-slate-300 text-brand-500 focus:ring-brand-400"
              />
              <span className="font-semibold text-slate-800">
                {staff.name} · {staff.code}
              </span>
            </label>
          ))}
        </div>
        <div className="space-y-2 border-t border-slate-100 pt-3">
          <p className="text-[11px] font-bold text-slate-600">
            Đã chọn {selected.length} / {STORE_STAFF.length} nhân viên
          </p>
          <button onClick={onAssign} className="btn btn-primary w-full">
            <Send className="h-4 w-4" />
            <span>Lưu và giao bài</span>
          </button>
        </div>
      </div>
    </div>
  );
}
