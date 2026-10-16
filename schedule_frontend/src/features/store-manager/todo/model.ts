/** Kiểu dữ liệu và chuyển đổi cho Todo list của trưởng cửa hàng. */

export interface TaskItem {
  id: number;
  title: string;
  sub: string;
  assignee: string;
  assigneeCode: string;
  due: string;
  priority: "Cao" | "Vừa" | "Thấp";
  status: "TODO" | "DOING" | "DONE";
}

/** Dữ liệu dự phòng khi API todo lỗi */
export const FALLBACK_TASKS: TaskItem[] = [
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


export type Priority = TaskItem["priority"];
export type TaskStatus = TaskItem["status"];

const PRIORITY_TO_API: Record<Priority, string> = { Cao: "HIGH", Vừa: "MEDIUM", Thấp: "LOW" };
export const priorityToApi = (priority: Priority) => PRIORITY_TO_API[priority];

/** Bản ghi todo từ backend -> dòng hiển thị. */
export function toTask(todo: Record<string, unknown>): TaskItem {
  return {
    id: Number(todo.todoId ?? todo.id),
    title: String(todo.title ?? todo.todoName ?? "Công việc"),
    sub: String(todo.description ?? ""),
    assignee: String(todo.assigneeName ?? ""),
    assigneeCode: String(todo.assigneeCode ?? ""),
    due: String(todo.dueAt ?? todo.dueDate ?? ""),
    priority: todo.priority === "HIGH" ? "Cao" : todo.priority === "LOW" ? "Thấp" : "Vừa",
    status: todo.status === "DONE" ? "DONE" : todo.status === "DOING" || todo.status === "IN_PROGRESS" ? "DOING" : "TODO",
  };
}

export const STATUS_BADGE: Record<TaskStatus, { label: string; className: string }> = {
  TODO: { label: "Cần làm", className: "bg-brand-50 text-brand-700 border border-brand-200" },
  DOING: { label: "Đang làm", className: "bg-blue-50 text-blue-700 border border-blue-200" },
  DONE: { label: "Hoàn thành", className: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
};
