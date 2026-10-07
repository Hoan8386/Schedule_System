"use client";

import React, { useState } from "react";
import {
  FileCheck,
  Search,
  Plus,
  Send,
  AlertCircle,
  Check,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  CheckSquare,
} from "lucide-react";

interface TestPlan {
  id: string;
  code: string;
  title: string;
  duration: string;
  status: "ASSIGNED" | "CLOSED" | "DRAFT";
  dueDate: string;
  questionCount: number;
  submittedCount: number;
  totalAssigned: number;
}

const mockTests: TestPlan[] = [
  {
    id: "1",
    code: "ATTP-10",
    title: "An toàn thực phẩm tại cửa hàng",
    duration: "20 phút",
    status: "ASSIGNED",
    dueDate: "07/10/2026 23:59",
    questionCount: 20,
    submittedCount: 3,
    totalAssigned: 6,
  },
  {
    id: "2",
    code: "PVKH-10",
    title: "Kỹ năng phục vụ khách hàng",
    duration: "15 phút",
    status: "ASSIGNED",
    dueDate: "09/10/2026 23:59",
    questionCount: 15,
    submittedCount: 2,
    totalAssigned: 6,
  },
  {
    id: "3",
    code: "VH-09",
    title: "Văn hóa và tiêu chuẩn BLOAN",
    duration: "10 phút",
    status: "CLOSED",
    dueDate: "25/09/2026 23:59",
    questionCount: 10,
    submittedCount: 6,
    totalAssigned: 6,
  },
  {
    id: "4",
    code: "VS-10",
    title: "Quy trình vệ sinh cuối ca",
    duration: "10 phút",
    status: "DRAFT",
    dueDate: "12/10/2026 23:59",
    questionCount: 2,
    submittedCount: 0,
    totalAssigned: 0,
  },
];

interface StoreManagerTestManagementPageProps {
  mode?: string;
}

export default function StoreManagerTestManagementPage({
  mode = "quanlytest",
}: StoreManagerTestManagementPageProps) {
  const [tests, setTests] = useState<TestPlan[]>(mockTests);
  const [search, setSearch] = useState("");
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);

  // Draft form states
  const [testName, setTestName] = useState("Quy trình vệ sinh cuối ca");
  const [dueDate, setDueDate] = useState("12/10/2026 · 23:59");
  const [duration, setDuration] = useState("10 phút");
  const [questionContent, setQuestionContent] = useState(
    "Sau khi vệ sinh dụng cụ, cần bảo quản như thế nào trước ca tiếp theo?"
  );
  const [correctOption, setCorrectOption] = useState("B");

  // Assigned staff checkboxes
  const [selectedStaff, setSelectedStaff] = useState<string[]>([
    "NV024",
    "NV025",
    "NV026",
    "NV027",
    "NV028",
    "NV029",
  ]);

  const toggleStaff = (code: string) => {
    setSelectedStaff((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const handleSaveAndAssign = () => {
    alert(
      `Đã lưu và giao bài test "${testName}" thành công tới ${selectedStaff.length} nhân viên của cửa hàng!`
    );
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">
            Quản lý bài test
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Soạn nội dung, giao và theo dõi bài test cho nhân viên tại BLOAN Nguyễn Trãi.
          </p>
        </div>
        <button
          onClick={() => {
            setTestName("Bài kiểm tra mới");
            alert("Đã mở mẫu soạn bài kiểm tra mới!");
          }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-900 text-xs font-bold transition-all shadow-sm shadow-amber-200"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Tạo bài test</span>
        </button>
      </div>

      {/* Test List Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Danh sách bài test
          </h3>

          <div className="flex items-center gap-2.5 text-xs">
            <div className="relative min-w-[200px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm tên hoặc mã bài test"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl outline-hidden"
              />
            </div>

            <select className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-hidden">
              <option>Tất cả trạng thái</option>
              <option>Đã giao</option>
              <option>Đóng</option>
              <option>Nháp</option>
            </select>

            <select className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-hidden">
              <option>Tháng 10/2026</option>
              <option>Tháng 09/2026</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-semibold text-slate-400 border-b border-slate-100">
                <th className="py-3 px-4">Bài test</th>
                <th className="py-3 px-4">Trạng thái</th>
                <th className="py-3 px-4">Hạn nộp</th>
                <th className="py-3 px-4 text-center">Số câu</th>
                <th className="py-3 px-4 text-center">Đã giao / Nộp</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {tests.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-slate-800">{t.title}</p>
                    <p className="text-[11px] text-slate-400">
                      {t.code} · {t.duration}
                    </p>
                  </td>
                  <td className="py-3.5 px-4">
                    {t.status === "ASSIGNED" && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                        Đã giao
                      </span>
                    )}
                    {t.status === "CLOSED" && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-500">
                        Đóng
                      </span>
                    )}
                    {t.status === "DRAFT" && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                        Nháp
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-600">
                    {t.dueDate}
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-slate-700">
                    {t.questionCount}
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-slate-700">
                    {t.totalAssigned > 0
                      ? `${t.totalAssigned} / ${t.submittedCount}`
                      : "0 / 0"}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => alert(`Xem chi tiết bài test: ${t.title}`)}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 font-medium text-slate-700"
                      >
                        {t.status === "CLOSED" ? "Xem kết quả" : "Xem"}
                      </button>
                      {t.status !== "CLOSED" && (
                        <button
                          onClick={() => alert(`Đã phân phối bài test: ${t.title}`)}
                          className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 font-bold text-slate-700"
                        >
                          Giao bài
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Editor & Assignment Two-Column Block */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Editor (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h4 className="text-sm font-bold text-slate-800">
                Soạn bài · Quy trình vệ sinh cuối ca
              </h4>
              <p className="text-[11px] text-slate-400">Nháp · VS-10</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
              Một đáp án
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="font-bold text-slate-700">
                Tên bài test <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={testName}
                onChange={(e) => setTestName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-hidden"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Thời lượng</label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-hidden"
              />
            </div>
          </div>

          {/* Question area */}
          <div className="pt-2 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800">
                Câu hỏi đang soạn · Câu 1 / 2
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">
                Nội dung câu hỏi <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                value={questionContent}
                onChange={(e) => setQuestionContent(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-hidden resize-none leading-relaxed"
              />
            </div>

            {/* Answer Options */}
            <div className="space-y-2 pt-1">
              {[
                { key: "A", text: "Để dụng cụ ướt trên quầy." },
                {
                  key: "B",
                  text: "Làm khô và cất ở nơi sạch theo hướng dẫn.",
                  isCorrect: true,
                },
                { key: "C", text: "Cất chung với dụng cụ chưa vệ sinh." },
                { key: "D", text: "Chỉ cần để trong túi kín." },
              ].map((opt) => (
                <div
                  key={opt.key}
                  onClick={() => setCorrectOption(opt.key)}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    correctOption === opt.key
                      ? "border-amber-400 bg-amber-50/70 font-semibold"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="font-bold text-slate-700">{opt.key}.</span>
                    <span className="text-slate-800">{opt.text}</span>
                  </div>
                  {correctOption === opt.key && (
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
                      Đáp án đúng
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Explanation */}
            <div className="space-y-1.5 pt-2">
              <label className="font-bold text-slate-700">Giải thích đáp án</label>
              <input
                type="text"
                defaultValue="Dụng cụ sạch, khô và được bảo quản đúng nơi giúp tránh nhiễm bẩn trước ca tiếp theo."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-hidden"
              />
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => alert("Đã thêm câu hỏi thứ 3 vào bài test!")}
                className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-slate-50"
              >
                + Thêm câu hỏi
              </button>
              <button
                type="button"
                onClick={() => alert("Đã lưu bản nháp thành công!")}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold rounded-xl transition-all shadow-xs"
              >
                Lưu bản nháp
              </button>
            </div>
          </div>
        </div>

        {/* Right side: Questions list & Assignment (1 col) */}
        <div className="space-y-6 text-xs">
          {/* Danh sách câu hỏi */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
            <h4 className="font-bold text-slate-800 text-sm">Danh sách câu hỏi</h4>
            <div className="space-y-2">
              <div className="p-2.5 rounded-xl border border-amber-300 bg-amber-50/60 font-bold text-slate-800">
                Câu 1 · Bảo quản dụng cụ sạch
              </div>
              <div className="p-2.5 rounded-xl border border-slate-200 hover:border-slate-300 text-slate-600">
                Câu 2 · Kiểm tra khu vực cuối ca
              </div>
            </div>
            <p className="text-[11px] text-slate-400 pt-1">
              2 câu · 50 điểm / câu · Tổng 100 điểm
            </p>
          </div>

          {/* Giao bài cho nhân viên */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
            <h4 className="font-bold text-slate-800 text-sm">
              Giao bài cho nhân viên
            </h4>
            <p className="text-slate-400 text-[11px]">
              Chỉ chọn nhân viên thuộc BLOAN Nguyễn Trãi. Bài đang soạn chưa được giao.
            </p>

            <div className="space-y-2">
              {[
                { code: "NV024", name: "Nguyễn Minh Anh" },
                { code: "NV025", name: "Lê Quốc Bảo" },
                { code: "NV026", name: "Phạm Ngọc Linh" },
                { code: "NV027", name: "Đặng Gia Huy" },
                { code: "NV028", name: "Võ Thanh Thảo" },
                { code: "NV029", name: "Trần Minh Phúc" },
              ].map((staff) => (
                <label
                  key={staff.code}
                  className="flex items-center gap-2.5 p-1.5 hover:bg-slate-50 rounded-lg cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedStaff.includes(staff.code)}
                    onChange={() => toggleStaff(staff.code)}
                    className="w-4 h-4 rounded-sm border-slate-300 text-amber-500 focus:ring-amber-400"
                  />
                  <span className="font-semibold text-slate-800">
                    {staff.name} · {staff.code}
                  </span>
                </label>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-2">
              <p className="text-[11px] font-bold text-slate-600">
                Đã chọn {selectedStaff.length} / 6 nhân viên
              </p>
              <button
                onClick={handleSaveAndAssign}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Lưu và giao bài</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Notice footer */}
      <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-center gap-3 text-xs text-amber-900">
        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
        <p>
          Lưu nháp trước khi giao bài. Nội dung bài đã giao được giữ nguyên để đảm bảo kết quả nhất quán.
        </p>
      </div>
    </div>
  );
}
