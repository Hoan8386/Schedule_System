import React, { useState } from "react";
import type { Priority } from "./model";

export interface NewTask {
  title: string;
  assigneeName: string;
  assigneeCode: string;
  due: string;
  priority: Priority;
}

const ASSIGNEES = ["Võ Thanh Thảo · NV028", "Lê Quốc Bảo · NV025", "Nguyễn Minh Anh · NV024", "Trần Minh Phúc · NV029", "Trần Thu Hà · CH001"];
const fieldClass = "w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 font-medium outline-hidden";

/** Form thêm nhanh công việc; trả về true khi lưu thành công để xóa ô tiêu đề. */
export function QuickAddTaskForm({ onAdd }: { onAdd: (task: NewTask) => Promise<boolean> }) {
  const [title, setTitle] = useState("");
  const [assignee, setAssignee] = useState(ASSIGNEES[0]);
  const [due, setDue] = useState("06/10/2026 · 16:00");
  const [priority, setPriority] = useState<Priority>("Vừa");

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim()) return;
    const [assigneeName, assigneeCode] = assignee.split(" · ");
    if (await onAdd({ title: title.trim(), assigneeName, assigneeCode: assigneeCode || "NV", due, priority })) setTitle("");
  };

  return (
    <div id="add-task-form" className="rounded-2xl border border-slate-200/80 bg-surface p-5 shadow-xs">
      <h4 className="mb-4 text-sm font-bold text-slate-800">Thêm công việc nhanh</h4>
      <form onSubmit={submit} className="space-y-4 text-xs">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">
              Tên công việc <span className="text-red-500">*</span>
            </label>
            <input type="text" required placeholder="Kiểm tra tồn kho găng tay..." value={title} onChange={(event) => setTitle(event.target.value)} className={`${fieldClass} focus:border-brand-400`} />
          </div>
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">
              Người phụ trách <span className="text-red-500">*</span>
            </label>
            <select value={assignee} onChange={(event) => setAssignee(event.target.value)} className={fieldClass}>
              {ASSIGNEES.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">
              Hạn hoàn thành <span className="text-red-500">*</span>
            </label>
            <input type="text" value={due} onChange={(event) => setDue(event.target.value)} className={fieldClass} />
          </div>
        </div>

        <div className="flex flex-col justify-between gap-3 pt-2 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <select value={priority} onChange={(event) => setPriority(event.target.value as Priority)} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-medium outline-hidden">
              <option value="Vừa">Ưu tiên: Vừa</option>
              <option value="Cao">Ưu tiên: Cao</option>
              <option value="Thấp">Ưu tiên: Thấp</option>
            </select>
            <span className="text-[11px] text-slate-400">Người phụ trách chỉ thuộc cửa hàng Nguyễn Trãi.</span>
          </div>
          <button type="submit" className="btn btn-primary px-5">Thêm công việc</button>
        </div>
      </form>
    </div>
  );
}
