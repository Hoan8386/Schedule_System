import React, { useState } from "react";
import { Check, Clock, X } from "lucide-react";
import { SAMPLE_QUESTION, type TestItem } from "./model";

interface Props {
  test: TestItem;
  onClose: () => void;
  /** Gọi sau khi nộp bài (đã hiển thị màn hình chúc mừng) */
  onSubmitted: (test: TestItem) => void;
}

/** Khung làm bài kiểm tra (hiện dùng câu hỏi mẫu). */
export function QuizModal({ test, onClose, onSubmitted }: Props) {
  const [answer, setAnswer] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const submit = () => {
    setSubmitted(true);
    setTimeout(() => {
      onSubmitted(test);
      setTimeout(onClose, 1500);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-xl overflow-hidden rounded-3xl border border-slate-100 bg-surface shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 p-5">
          <div>
            <span className="text-[10px] font-bold uppercase text-brand-600">
              {test.code} · {test.type}
            </span>
            <h3 className="mt-0.5 text-base font-extrabold text-slate-800">{test.title}</h3>
          </div>
          <button onClick={onClose} aria-label="Đóng" className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {submitted ? (
          <div className="space-y-3 p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <Check className="h-6 w-6 stroke-[3]" />
            </div>
            <h4 className="text-base font-bold text-slate-800">Chúc mừng! Bạn đã đạt 95/100 điểm.</h4>
            <p className="text-xs text-slate-500">Kết quả đã được cập nhật vào hồ sơ đào tạo của bạn.</p>
          </div>
        ) : (
          <div className="space-y-5 p-6 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 text-slate-500">
              <span className="font-bold text-slate-700">Câu hỏi 1 / 5</span>
              <span className="flex items-center gap-1.5 font-bold text-brand-600">
                <Clock className="h-3.5 w-3.5" />
                18:45 còn lại
              </span>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-bold leading-snug text-slate-800">{SAMPLE_QUESTION.text}</p>
              <div className="space-y-2 pt-2">
                {SAMPLE_QUESTION.options.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setAnswer(option.id)}
                    className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-all ${
                      answer === option.id ? "border-brand-400 bg-brand-50/60 font-semibold text-slate-800 shadow-xs" : "border-slate-200 text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    <span className="mt-0.5 font-bold text-brand-600">{option.id}.</span>
                    <span>{option.text}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-4">
              <button onClick={onClose} className="btn btn-secondary btn-sm">Tạm dừng</button>
              <button onClick={submit} disabled={!answer} className="btn btn-primary btn-sm px-5">Nộp bài</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
