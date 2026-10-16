"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle2, Clock, ListTodo, Plus } from "lucide-react";
import { storeManagerApi } from "@/lib/api";
import { FALLBACK_TASKS, priorityToApi, toTask, type TaskItem } from "./model";
import { TaskTable } from "./TaskTable";
import { QuickAddTaskForm, type NewTask } from "./QuickAddTaskForm";

const errorText = (cause: unknown) => (cause instanceof Error ? cause.message : String(cause));

/** Todo list của cửa hàng: theo dõi, đánh dấu hoàn thành và giao việc nhanh. */
export default function StoreManagerTodoListPage() {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    storeManagerApi
      .getTodos()
      .then(({ data }) => active && setTasks(data.map(toTask)))
      .catch((cause) => {
        if (!active) return;
        setError(errorText(cause));
        setTasks(FALLBACK_TASKS);
      });
    return () => {
      active = false;
    };
  }, []);

  const toggle = async (task: TaskItem) => {
    const status = task.status === "DONE" ? "TODO" : "DONE";
    try {
      await storeManagerApi.updateTodo(task.id, {
        todoId: task.id,
        title: task.title,
        description: task.sub,
        dueDate: task.due,
        priority: priorityToApi(task.priority),
        status,
      });
      setTasks((prev) => prev.map((item) => (item.id === task.id ? { ...item, status } : item)));
    } catch (cause) {
      setError(errorText(cause));
    }
  };

  const add = async (task: NewTask) => {
    const description = "Giao việc mới từ Trưởng cửa hàng";
    try {
      const { data } = await storeManagerApi.createTodo({
        title: task.title,
        description,
        assigneeCode: task.assigneeCode,
        dueDate: task.due,
        priority: priorityToApi(task.priority),
        status: "TODO",
      });
      const created: TaskItem = {
        id: Number(data.todoId ?? data.id),
        title: String(data.title ?? task.title),
        sub: String(data.description ?? description),
        assignee: String(data.assigneeName ?? task.assigneeName),
        assigneeCode: String(data.assigneeCode ?? task.assigneeCode),
        due: String(data.dueDate ?? task.due),
        priority: task.priority,
        status: "TODO",
      };
      setTasks((prev) => [created, ...prev]);
      return true;
    } catch (cause) {
      setError(errorText(cause));
      return false;
    }
  };

  const countOf = (status: TaskItem["status"]) => tasks.filter((task) => task.status === status).length;
  const stats = [
    { label: "Cần làm", count: countOf("TODO"), hint: "2 công việc hạn hôm nay", icon: ListTodo, tone: "bg-brand-50 text-brand-600" },
    { label: "Đang thực hiện", count: countOf("DOING"), hint: "1 công việc hạn hôm nay", icon: Clock, tone: "bg-blue-50 text-blue-600" },
    { label: "Đã hoàn thành", count: countOf("DONE"), hint: "Cập nhật lúc 09:25, 05/10", icon: CheckCircle2, tone: "bg-emerald-50 text-emerald-600" },
  ];

  return (
    <div className="page">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-800">Todo list</h1>
          <p className="mt-1 text-xs text-slate-500">Theo dõi công việc và người phụ trách tại BLOAN Nguyễn Trãi.</p>
        </div>
        {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">{error}</div>}
        <a href="#add-task-form" className="btn btn-primary px-5 shadow-sm shadow-brand-200">
          <Plus className="h-4 w-4 stroke-[3]" />
          <span>Thêm công việc</span>
        </a>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {stats.map(({ label, count, hint, icon: Icon, tone }) => (
          <div key={label} className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-surface p-5 shadow-xs">
            <div>
              <span className="text-xs font-semibold text-slate-500">{label}</span>
              <div className="mt-1 text-3xl font-black text-slate-800">{count} công việc</div>
              <p className="mt-1 text-[11px] text-slate-400">{hint}</p>
            </div>
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${tone}`}>
              <Icon className="h-5 w-5" />
            </div>
          </div>
        ))}
      </div>

      <TaskTable tasks={tasks} onToggle={(task) => void toggle(task)} />
      <QuickAddTaskForm onAdd={add} />
    </div>
  );
}
