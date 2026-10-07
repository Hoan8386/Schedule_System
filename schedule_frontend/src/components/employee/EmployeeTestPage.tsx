"use client";

import React, { useState } from "react";
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  ChevronLeft,
  ChevronRight,
  Play,
  X,
  Check,
} from "lucide-react";

interface TestItem {
  id: string;
  title: string;
  code: string;
  type: string;
  questions: number;
  duration: number;
  dueDate: string;
  isUrgent?: boolean;
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
  score?: number;
}

const initialTests: TestItem[] = [
  {
    id: "t1",
    title: "An toàn thực phẩm tại cửa hàng",
    code: "ATTP-10",
    type: "Đào tạo bắt buộc",
    questions: 20,
    duration: 20,
    dueDate: "07/10/2026 23:59",
    isUrgent: true,
    status: "NOT_STARTED",
  },
  {
    id: "t2",
    title: "Kỹ năng phục vụ khách hàng",
    code: "PVKH-10",
    type: "Đào tạo nghiệp vụ",
    questions: 15,
    duration: 15,
    dueDate: "09/10/2026 23:59",
    status: "IN_PROGRESS",
  },
  {
    id: "t3",
    title: "Quy trình bán hàng & thu ngân",
    code: "BH-09",
    type: "Đào tạo nghiệp vụ",
    questions: 20,
    duration: 20,
    dueDate: "30/09/2026 23:59",
    status: "COMPLETED",
    score: 90,
  },
  {
    id: "t4",
    title: "Văn hóa và tiêu chuẩn BLOAN",
    code: "VH-09",
    type: "Hội nhập đội ngũ",
    questions: 10,
    duration: 10,
    dueDate: "25/09/2026 23:59",
    status: "COMPLETED",
    score: 85,
  },
];

export default function EmployeeTestPage() {
  const [tests, setTests] = useState<TestItem[]>(initialTests);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeQuizModal, setActiveQuizModal] = useState<TestItem | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isQuizSubmitted, setIsQuizSubmitted] = useState(false);

  const handleStartTest = (test: TestItem) => {
    setActiveQuizModal(test);
    setCurrentQuestion(1);
    setSelectedAnswer(null);
    setIsQuizSubmitted(false);
  };

  const handleSubmitQuiz = () => {
    setIsQuizSubmitted(true);
    setTimeout(() => {
      if (activeQuizModal) {
        setTests((prev) =>
          prev.map((t) =>
            t.id === activeQuizModal.id
              ? { ...t, status: "COMPLETED", score: 95 }
              : t
          )
        );
      }
      setTimeout(() => {
        setActiveQuizModal(null);
      }, 1500);
    }, 800);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">
          Bài kiểm tra
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Hoàn thành đào tạo để tự tin làm việc và phục vụ khách hàng tốt hơn.
        </p>
      </div>

      {/* 3 Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">
              Bài được giao
            </span>
            <div className="text-3xl font-black text-slate-800 mt-1">4 bài</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">
              Cần hoàn thành
            </span>
            <div className="text-3xl font-black text-amber-600 mt-1">2 bài</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">
              Đã hoàn thành
            </span>
            <div className="text-3xl font-black text-emerald-600 mt-1">2 bài</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Warning Notice Banner */}
      <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-center gap-3 text-xs text-amber-900">
        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
        <p>
          An toàn thực phẩm tại cửa hàng hết hạn vào 23:59 ngày 07/10/2026. Hãy dành 20 phút để hoàn thành bài kiểm tra.
        </p>
      </div>

      {/* Test List Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Danh sách bài kiểm tra
          </h3>

          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            <div className="relative min-w-[200px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm tên bài kiểm tra"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-hidden hover:border-slate-300"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-hidden"
            >
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
              <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-semibold text-slate-400">
                <th className="py-3 px-4">Bài kiểm tra</th>
                <th className="py-3 px-4">Thời lượng</th>
                <th className="py-3 px-4">Hạn hoàn thành</th>
                <th className="py-3 px-4">Trạng thái</th>
                <th className="py-3 px-4 text-center">Điểm</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {tests.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-slate-800">{t.title}</p>
                    <p className="text-[11px] text-slate-400">
                      {t.code} · {t.type}
                    </p>
                  </td>
                  <td className="py-3.5 px-4">
                    {t.questions} câu · {t.duration} phút
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`font-semibold ${
                        t.isUrgent ? "text-red-600" : "text-slate-600"
                      }`}
                    >
                      {t.dueDate}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    {t.status === "NOT_STARTED" && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                        Chưa làm
                      </span>
                    )}
                    {t.status === "IN_PROGRESS" && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                        Đang làm
                      </span>
                    )}
                    {t.status === "COMPLETED" && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                        Hoàn thành
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-slate-800">
                    {t.score ? `${t.score}/100` : "—"}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {t.status === "NOT_STARTED" && (
                      <button
                        onClick={() => handleStartTest(t)}
                        className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold shadow-xs transition-all"
                      >
                        Bắt đầu
                      </button>
                    )}
                    {t.status === "IN_PROGRESS" && (
                      <button
                        onClick={() => handleStartTest(t)}
                        className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 font-bold text-slate-700 transition-all"
                      >
                        Tiếp tục
                      </button>
                    )}
                    {t.status === "COMPLETED" && (
                      <button
                        onClick={() => alert(`Kết quả kiểm tra: ${t.score}/100 điểm. Đạt tiêu chuẩn phục vụ.`)}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold transition-all"
                      >
                        Xem kết quả
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Hiển thị 1–4 trong 4 bài kiểm tra</span>
          <div className="flex items-center gap-1.5">
            <button className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-400">
              Trước
            </button>
            <button className="w-8 h-8 rounded-lg bg-amber-500 text-slate-900 font-bold flex items-center justify-center">
              1
            </button>
            <button className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-400">
              Sau
            </button>
          </div>
        </div>
      </div>

      {/* Guidelines footer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-1.5">
          <h4 className="font-bold text-slate-800">Trước khi bắt đầu</h4>
          <p className="text-slate-500 leading-relaxed text-[11px]">
            Kiểm tra kết nối và dành đủ thời gian. Thời gian làm bài bắt đầu khi bạn chọn “Bắt đầu”.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-1.5">
          <h4 className="font-bold text-slate-800">Kết quả và tiêu chuẩn</h4>
          <p className="text-slate-500 leading-relaxed text-[11px]">
            Điểm đạt từ 80/100. Bạn có thể xem lại kết quả sau khi nộp bài; liên hệ quản lý nếu cần được giao lại bài.
          </p>
        </div>
      </div>

      {/* Modal Làm bài kiểm tra */}
      {activeQuizModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-amber-600 uppercase">
                  {activeQuizModal.code} · {activeQuizModal.type}
                </span>
                <h3 className="text-base font-extrabold text-slate-800 mt-0.5">
                  {activeQuizModal.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveQuizModal(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isQuizSubmitted ? (
              <div className="p-8 text-center space-y-3">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6 stroke-[3]" />
                </div>
                <h4 className="text-base font-bold text-slate-800">
                  Chúc mừng! Bạn đã đạt 95/100 điểm.
                </h4>
                <p className="text-xs text-slate-500">
                  Kết quả đã được cập nhật vào hồ sơ đào tạo của bạn.
                </p>
              </div>
            ) : (
              <div className="p-6 space-y-5 text-xs">
                <div className="flex items-center justify-between text-slate-500 pb-3 border-b border-slate-100">
                  <span className="font-bold text-slate-700">
                    Câu hỏi {currentQuestion} / 5
                  </span>
                  <span className="flex items-center gap-1.5 text-amber-600 font-bold">
                    <Clock className="w-3.5 h-3.5" />
                    18:45 còn lại
                  </span>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-bold text-slate-800 leading-snug">
                    Sau khi sử dụng xong dụng cụ chế biến đồ ăn vặt tại quầy, quy trình bảo quản đúng theo tiêu chuẩn BLOAN là gì?
                  </p>

                  <div className="space-y-2 pt-2">
                    {[
                      { id: "A", text: "Để dụng cụ ướt trên khay cho ráo tự nhiên." },
                      {
                        id: "B",
                        text: "Làm khô và cất ở nơi sạch sẽ, khô ráo theo đúng hướng dẫn phân loại.",
                      },
                      { id: "C", text: "Cất chung với dụng cụ chưa vệ sinh để tiện ca sau." },
                      { id: "D", text: "Chỉ cần bọc vào túi kín." },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setSelectedAnswer(opt.id)}
                        className={`w-full p-3 rounded-xl border text-left flex items-start gap-3 transition-all ${
                          selectedAnswer === opt.id
                            ? "border-amber-400 bg-amber-50/60 font-semibold text-slate-800 shadow-xs"
                            : "border-slate-200 hover:border-slate-300 text-slate-700"
                        }`}
                      >
                        <span className="font-bold text-amber-600 mt-0.5">
                          {opt.id}.
                        </span>
                        <span>{opt.text}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => setActiveQuizModal(null)}
                    className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50"
                  >
                    Tạm dừng
                  </button>
                  <button
                    onClick={handleSubmitQuiz}
                    disabled={!selectedAnswer}
                    className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold rounded-xl transition-all shadow-xs disabled:opacity-50"
                  >
                    Nộp bài
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
