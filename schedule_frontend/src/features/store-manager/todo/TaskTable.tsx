import React, { useState } from "react";
import { Check, Search } from "lucide-react";
import { STATUS_BADGE, type TaskItem, type TaskStatus } from "./model";

type Tab = "ALL" | TaskStatus;

const TAB_LABEL: Record<Tab, string> = { ALL: "Tất cả", TODO: "Cần làm", DOING: "Đang làm", DONE: "Hoàn thành" };
const selectClass = "rounded-xl border border-slate-200 bg-white px-3 py-2 font-medium outline-hidden";

interface Props {
  tasks: TaskItem[];
  onToggle: (task: TaskItem) => void;
}

/** Bảng công việc cửa hàng: tab trạng thái, bộ lọc và đánh dấu hoàn thành. */
export function TaskTable({ tasks, onToggle }: Props) {
  const [tab, setTab] = useState<Tab>("ALL");
  const [search, setSearch] = useState("");
  const [assignee, setAssignee] = useState("all");
  const [priority, setPriority] = useState("all");

  const countOf = (key: Tab) => (key === "ALL" ? tasks.length : tasks.filter((task) => task.status === key).length);
  const filtered = tasks.filter(
    (task) =>
      (tab === "ALL" || task.status === tab) &&
      (!search || task.title.toLowerCase().includes(search.toLowerCase())) &&
      (priority === "all" || task.priority === priority)
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-surface shadow-xs">
      <div className="flex flex-col justify-between gap-3 border-b border-slate-100 p-4 md:flex-row md:items-center">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Công việc cửa hàng</h3>
        <div className="flex items-center gap-1.5 rounded-xl bg-slate-100 p-1 text-xs">
          {(Object.keys(TAB_LABEL) as Tab[]).map((key) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`rounded-lg px-3 py-1 font-bold transition-all ${tab === key ? "bg-white text-slate-800 shadow-xs" : "text-slate-500"}`}
            >
              {TAB_LABEL[key]} ({countOf(key)})
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col justify-between gap-3 border-b border-slate-100 bg-slate-50/50 p-4 text-xs md:flex-row md:items-center">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm tên công việc"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 outline-hidden hover:border-slate-300"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Bộ lọc người phụ trách / tuần hiện chỉ để hiển thị */}
          <select value={assignee} onChange={(event) => setAssignee(event.target.value)} className={selectClass}>
            <option value="all">Tất cả người phụ trách</option>
            <option value="thuha">Trần Thu Hà</option>
            <option value="minhanh">Nguyễn Minh Anh</option>
            <option value="quocbao">Lê Quốc Bảo</option>
          </select>
          <select value={priority} onChange={(event) => setPriority(event.target.value)} className={selectClass}>
            <option value="all">Tất cả ưu tiên</option>
            <option value="Cao">Cao</option>
            <option value="Vừa">Vừa</option>
          </select>
          <select className={selectClass}>
            <option>Tuần 05 – 11/10</option>
            <option>Tuần 12 – 18/10</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50 text-[11px] font-semibold text-slate-400">
              <th className="w-10 px-4 py-3 text-center">✓</th>
              <th className="px-4 py-3">Công việc</th>
              <th className="px-4 py-3">Người phụ trách</th>
              <th className="px-4 py-3">Hạn hoàn thành</th>
              <th className="px-4 py-3">Ưu tiên</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {filtered.map((task) => {
              const done = task.status === "DONE";
              const badge = STATUS_BADGE[task.status];
              return (
                <tr key={task.id} className="transition-colors hover:bg-slate-50/70">
                  <td className="px-4 py-3.5 text-center">
                    <button
                      onClick={() => onToggle(task)}
                      aria-label={done ? "Bỏ hoàn thành" : "Đánh dấu hoàn thành"}
                      className={`flex h-4 w-4 items-center justify-center rounded-md border transition-all ${
                        done ? "border-brand-500 bg-brand-500 text-brand-contrast" : "border-slate-300 hover:border-brand-400"
                      }`}
                    >
                      {done && <Check className="h-3 w-3 stroke-[3]" />}
                    </button>
                  </td>
                  <td className="px-4 py-3.5">
                    <p className={`font-bold ${done ? "text-slate-400 line-through" : "text-slate-800"}`}>{task.title}</p>
                    <p className="text-[11px] text-slate-400">{task.sub}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="font-bold text-slate-800">{task.assignee}</p>
                    <p className="text-[10px] text-slate-400">{task.assigneeCode}</p>
                  </td>
                  <td className="px-4 py-3.5 font-medium text-slate-600">{task.due}</td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                        task.priority === "Cao" ? "border border-brand-200 bg-brand-50 text-brand-700" : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {task.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${badge.className}`}>{badge.label}</span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <button onClick={() => alert(`Xem chi tiết công việc: ${task.title}`)} className="rounded-xl border border-slate-200 px-3 py-1.5 font-bold text-slate-700 hover:bg-slate-50">
                      Chi tiết
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 p-4 text-xs text-slate-500">
        <span>
          Hiển thị 1–{filtered.length} trong {filtered.length} công việc · Đánh dấu ô để hoàn thành
        </span>
        <div className="flex items-center gap-1.5">
          <button className="rounded-lg border border-slate-200 px-3 py-1.5 text-slate-400">Trước</button>
          <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 font-bold text-brand-contrast">1</button>
          <button className="rounded-lg border border-slate-200 px-3 py-1.5 text-slate-400">Sau</button>
        </div>
      </div>
    </div>
  );
}
