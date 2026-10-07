"use client";

import React, { useState } from "react";
import {
  ListTodo,
  Clock,
  CheckCircle2,
  Search,
  Plus,
  Check,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";

interface TaskItem {
  id: number;
  title: string;
  sub: string;
  assignee: string;
  assigneeCode: string;
  due: string;
  priority: "Cao" | "Vừa" | "Thấp";
  status: "TODO" | "DOING" | "DONE";
}

const initialTasks: TaskItem[] = [
  {
    id: 1,
    title: "Duyệt yêu cầu ca tuần tới",
    sub: "6 yêu cầu chờ duyệt · Kỳ 12 – 18/10",
    assignee: "Trần Thu Hà",
    assigneeCode: "CH001 · Trưởng cửa hàng",
    due: "05/10/2026 12:00",
    priority: "Cao",
    status: "TODO",
  },
  {
    id: 2,
    title: "Trao đổi sự việc VP-012",
    sub: "Xác minh phản hồi của Minh Anh",
    assignee: "Trần Thu Hà",
    assigneeCode: "CH001",
    due: "05/10/2026 15:00",
    priority: "Cao",
    status: "TODO",
  },
  {
    id: 3,
    title: "Kiểm tra dụng cụ ca tối",
    sub: "FB-021 · Kiểm tra 3 kẹp gắp",
    assignee: "Lê Quốc Bảo",
    assigneeCode: "NV025",
    due: "05/10/2026 16:00",
    priority: "Cao",
    status: "DOING",
  },
  {
    id: 4,
    title: "Rà soát mẫu bàn giao",
    sub: "FB-020 · Bổ sung mục hàng tồn",
    assignee: "Nguyễn Minh Anh",
    assigneeCode: "NV024",
    due: "06/10/2026 14:00",
    priority: "Vừa",
    status: "DOING",
  },
  {
    id: 5,
    title: "Nhắc hoàn thành bài ATTP-10",
    sub: "3 nhân viên chưa nộp bài",
    assignee: "Trần Thu Hà",
    assigneeCode: "CH001",
    due: "07/10/2026 18:00",
    priority: "Vừa",
    status: "TODO",
  },
  {
    id: 6,
    title: "Kiểm tra checklist vệ sinh",
    sub: "Đã hoàn thành 05/10 · 09:25",
    assignee: "Trần Minh Phúc",
    assigneeCode: "NV029",
    due: "05/10/2026 09:30",
    priority: "Vừa",
    status: "DONE",
  },
];

export default function StoreManagerTodoListPage() {
  const [tasks, setTasks] = useState<TaskItem[]>(initialTasks);
  const [activeTab, setActiveTab] = useState<"ALL" | "TODO" | "DOING" | "DONE">("ALL");
  const [search, setSearch] = useState("");
  const [assigneeFilter, setAssigneeFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  // New task form state
  const [newTitle, setNewTitle] = useState("");
  const [newAssignee, setNewAssignee] = useState("Võ Thanh Thảo · NV028");
  const [newDue, setNewDue] = useState("06/10/2026 · 16:00");
  const [newPriority, setNewPriority] = useState<"Cao" | "Vừa" | "Thấp">("Vừa");

  const toggleTaskStatus = (id: number) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const nextStatus = t.status === "DONE" ? "TODO" : "DONE";
          return { ...t, status: nextStatus };
        }
        return t;
      })
    );
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const newTask: TaskItem = {
      id: Date.now(),
      title: newTitle,
      sub: "Giao việc mới từ Trưởng cửa hàng",
      assignee: newAssignee.split(" · ")[0],
      assigneeCode: newAssignee.split(" · ")[1] || "NV",
      due: newDue,
      priority: newPriority,
      status: "TODO",
    };
    setTasks([...tasks, newTask]);
    setNewTitle("");
    alert("Đã thêm công việc mới vào danh sách!");
  };

  const filtered = tasks.filter((t) => {
    if (activeTab === "TODO" && t.status !== "TODO") return false;
    if (activeTab === "DOING" && t.status !== "DOING") return false;
    if (activeTab === "DONE" && t.status !== "DONE") return false;
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (priorityFilter !== "all" && t.priority !== priorityFilter) return false;
    return true;
  });

  const todoCount = tasks.filter((t) => t.status === "TODO").length;
  const doingCount = tasks.filter((t) => t.status === "DOING").length;
  const doneCount = tasks.filter((t) => t.status === "DONE").length;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">
            Todo list
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Theo dõi công việc và người phụ trách tại BLOAN Nguyễn Trãi.
          </p>
        </div>
        <a
          href="#add-task-form"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-900 text-xs font-bold transition-all shadow-sm shadow-amber-200"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Thêm công việc</span>
        </a>
      </div>

      {/* 3 Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Cần làm</span>
            <div className="text-3xl font-black text-slate-800 mt-1">
              {todoCount} công việc
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              2 công việc hạn hôm nay
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
            <ListTodo className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">
              Đang thực hiện
            </span>
            <div className="text-3xl font-black text-slate-800 mt-1">
              {doingCount} công việc
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              1 công việc hạn hôm nay
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">
              Đã hoàn thành
            </span>
            <div className="text-3xl font-black text-slate-800 mt-1">
              {doneCount} công việc
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Cập nhật lúc 09:25, 05/10
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Task List Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Header & Tabs */}
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Công việc cửa hàng
          </h3>

          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs">
            <button
              onClick={() => setActiveTab("ALL")}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                activeTab === "ALL"
                  ? "bg-white text-slate-800 shadow-xs"
                  : "text-slate-500"
              }`}
            >
              Tất cả ({tasks.length})
            </button>
            <button
              onClick={() => setActiveTab("TODO")}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                activeTab === "TODO"
                  ? "bg-white text-slate-800 shadow-xs"
                  : "text-slate-500"
              }`}
            >
              Cần làm ({todoCount})
            </button>
            <button
              onClick={() => setActiveTab("DOING")}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                activeTab === "DOING"
                  ? "bg-white text-slate-800 shadow-xs"
                  : "text-slate-500"
              }`}
            >
              Đang làm ({doingCount})
            </button>
            <button
              onClick={() => setActiveTab("DONE")}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                activeTab === "DONE"
                  ? "bg-white text-slate-800 shadow-xs"
                  : "text-slate-500"
              }`}
            >
              Hoàn thành ({doneCount})
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm tên công việc"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl outline-hidden hover:border-slate-300"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <select
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium outline-hidden"
            >
              <option value="all">Tất cả người phụ trách</option>
              <option value="thuha">Trần Thu Hà</option>
              <option value="minhanh">Nguyễn Minh Anh</option>
              <option value="quocbao">Lê Quốc Bảo</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium outline-hidden"
            >
              <option value="all">Tất cả ưu tiên</option>
              <option value="Cao">Cao</option>
              <option value="Vừa">Vừa</option>
            </select>

            <select className="px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium outline-hidden">
              <option>Tuần 05 – 11/10</option>
              <option>Tuần 12 – 18/10</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-semibold text-slate-400 border-b border-slate-100">
                <th className="py-3 px-4 w-10 text-center">✓</th>
                <th className="py-3 px-4">Công việc</th>
                <th className="py-3 px-4">Người phụ trách</th>
                <th className="py-3 px-4">Hạn hoàn thành</th>
                <th className="py-3 px-4">Ưu tiên</th>
                <th className="py-3 px-4">Trạng thái</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={() => toggleTaskStatus(t.id)}
                      className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                        t.status === "DONE"
                          ? "bg-amber-500 border-amber-500 text-slate-900"
                          : "border-slate-300 hover:border-amber-400"
                      }`}
                    >
                      {t.status === "DONE" && (
                        <Check className="w-3 h-3 stroke-[3]" />
                      )}
                    </button>
                  </td>
                  <td className="py-3.5 px-4">
                    <p
                      className={`font-bold ${
                        t.status === "DONE"
                          ? "line-through text-slate-400"
                          : "text-slate-800"
                      }`}
                    >
                      {t.title}
                    </p>
                    <p className="text-[11px] text-slate-400">{t.sub}</p>
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-slate-800">{t.assignee}</p>
                    <p className="text-[10px] text-slate-400">{t.assigneeCode}</p>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-600">
                    {t.due}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        t.priority === "Cao"
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {t.priority}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    {t.status === "TODO" && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                        Cần làm
                      </span>
                    )}
                    {t.status === "DOING" && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                        Đang làm
                      </span>
                    )}
                    {t.status === "DONE" && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Hoàn thành
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => alert(`Xem chi tiết công việc: ${t.title}`)}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 font-bold text-slate-700"
                    >
                      Chi tiết
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Hiển thị 1–{filtered.length} trong {filtered.length} công việc · Đánh dấu ô để hoàn thành</span>
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

      {/* Quick Add Form Banner */}
      <div
        id="add-task-form"
        className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs"
      >
        <h4 className="text-sm font-bold text-slate-800 mb-4">
          Thêm công việc nhanh
        </h4>

        <form onSubmit={handleAddTask} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1 space-y-1.5">
              <label className="font-bold text-slate-700">
                Tên công việc <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Kiểm tra tồn kho găng tay..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-amber-400 font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">
                Người phụ trách <span className="text-red-500">*</span>
              </label>
              <select
                value={newAssignee}
                onChange={(e) => setNewAssignee(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-hidden font-medium"
              >
                <option>Võ Thanh Thảo · NV028</option>
                <option>Lê Quốc Bảo · NV025</option>
                <option>Nguyễn Minh Anh · NV024</option>
                <option>Trần Minh Phúc · NV029</option>
                <option>Trần Thu Hà · CH001</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">
                Hạn hoàn thành <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={newDue}
                onChange={(e) => setNewDue(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-hidden font-medium"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-3">
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as any)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-hidden"
              >
                <option value="Vừa">Ưu tiên: Vừa</option>
                <option value="Cao">Ưu tiên: Cao</option>
                <option value="Thấp">Ưu tiên: Thấp</option>
              </select>
              <span className="text-[11px] text-slate-400">
                Người phụ trách chỉ thuộc cửa hàng Nguyễn Trãi.
              </span>
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold transition-all shadow-xs"
            >
              Thêm công việc
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
