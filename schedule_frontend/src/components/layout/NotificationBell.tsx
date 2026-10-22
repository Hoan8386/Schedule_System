"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { AlertCircle, Bell, CheckCheck, ChevronRight, Info, Loader2 } from "lucide-react";
import { notificationApi, type NotificationResponse, type NotificationTask } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/cn";

/** Chu kỳ làm mới số thông báo chưa đọc (chỉ gọi API đếm, rất nhẹ). */
const POLL_INTERVAL_MS = 60_000;
/** Khoảng tối thiểu giữa hai lần làm mới khi cửa sổ được focus lại. */
const FOCUS_REFRESH_GAP_MS = 15_000;

interface ListState {
  items: NotificationResponse[];
  page: number;
  hasMore: boolean;
  loaded: boolean;
}

const EMPTY_LIST: ListState = { items: [], page: -1, hasMore: false, loaded: false };

const idOf = (item: NotificationResponse) => Number(item.notificationId ?? item.id ?? 0);

/** "5 phút trước" cho thông báo gần đây, ngày giờ đầy đủ cho thông báo cũ. */
function timeAgo(value?: string) {
  if (!value) return "";
  const time = new Date(value).getTime();
  if (Number.isNaN(time)) return formatDateTime(value);
  const minutes = Math.floor((Date.now() - time) / 60_000);
  if (minutes < 1) return "Vừa xong";
  if (minutes < 60) return `${minutes} phút trước`;
  if (minutes < 24 * 60) return `${Math.floor(minutes / 60)} giờ trước`;
  if (minutes < 7 * 24 * 60) return `${Math.floor(minutes / 1440)} ngày trước`;
  return formatDateTime(value);
}

/**
 * Chuông thông báo: việc cần xử lý / thông báo cần quan tâm theo vai trò (bấm để mở trang tương ứng),
 * số chưa đọc và một danh sách chung (chưa đọc được tô nổi), tải 20 thông báo mỗi lần.
 */
export function NotificationBell({ onNavigate }: { onNavigate?: (page: string) => void }) {
  const [open, setOpen] = useState(false);
  const [tasks, setTasks] = useState<NotificationTask[]>([]);
  const [list, setList] = useState<ListState>(EMPTY_LIST);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const lastRefreshAt = useRef(0);

  const refreshCount = useCallback(async () => {
    lastRefreshAt.current = Date.now();
    // Hai API độc lập: gọi song song
    const [count, taskList] = await Promise.allSettled([notificationApi.getUnreadCount(), notificationApi.getTasks()]);
    // Lỗi mạng / chưa có quyền: giữ số và danh sách cũ, không làm phiền người dùng
    if (count.status === "fulfilled") setUnreadCount(Number(count.value.data?.unreadCount ?? 0));
    if (taskList.status === "fulfilled") setTasks(Array.isArray(taskList.value.data) ? taskList.value.data : []);
  }, []);

  // Đếm chưa đọc khi mount, định kỳ (bỏ qua khi tab đang ẩn) và khi quay lại tab trình duyệt (không gọi dồn)
  useEffect(() => {
    const first = window.setTimeout(() => void refreshCount(), 0);
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") void refreshCount();
    }, POLL_INTERVAL_MS);
    const onFocus = () => {
      if (Date.now() - lastRefreshAt.current >= FOCUS_REFRESH_GAP_MS) void refreshCount();
    };
    window.addEventListener("focus", onFocus);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(timer);
      window.removeEventListener("focus", onFocus);
    };
  }, [refreshCount]);

  /** Tải trang tiếp theo (trang 0 nếu reset). */
  const loadPage = useCallback(
    async (reset = false) => {
      setLoading(true);
      setError("");
      try {
        const nextPage = (reset ? EMPTY_LIST : list).page + 1;
        const { data } = await notificationApi.getMine("all", nextPage);
        setList((prev) => ({
          items: reset ? data.items : [...prev.items, ...data.items],
          page: data.page,
          hasMore: data.hasMore,
          loaded: true,
        }));
        setUnreadCount(Number(data.unreadCount ?? 0));
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Không thể tải thông báo");
      } finally {
        setLoading(false);
      }
    },
    [list]
  );

  const toggle = () => {
    const next = !open;
    setOpen(next);
    // Mỗi lần mở chuông tải lại trang đầu và việc cần xử lý để có dữ liệu mới
    if (next) {
      void loadPage(true);
      void refreshCount();
    }
  };

  const markRead = async (item: NotificationResponse) => {
    if (item.isRead) return;
    const id = idOf(item);
    try {
      await notificationApi.markRead(id);
      // Giữ nguyên vị trí trong danh sách, chỉ bỏ trạng thái chưa đọc
      setList((prev) => ({ ...prev, items: prev.items.map((entry) => (idOf(entry) === id ? { ...entry, isRead: true } : entry)) }));
      setUnreadCount((count) => Math.max(0, count - 1));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể cập nhật thông báo");
    }
  };

  const markAllRead = async () => {
    try {
      await notificationApi.markAllRead();
      setList((prev) => ({ ...prev, items: prev.items.map((entry) => ({ ...entry, isRead: true })) }));
      setUnreadCount(0);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể cập nhật thông báo");
    }
  };

  const current = list;
  const badge = unreadCount > 99 ? "99+" : String(unreadCount);
  // Số việc cần xử lý (tone warning) hiện thành chấm cam trên chuông
  const pendingTasks = tasks.filter((task) => task.tone === "warning").reduce((sum, task) => sum + task.count, 0);
  const openTask = (task: NotificationTask) => {
    setOpen(false);
    onNavigate?.(task.page);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={toggle}
        className="relative rounded-xl border border-slate-200 p-2 text-slate-600 transition-colors hover:bg-slate-50"
        title="Thông báo"
        aria-label={`Thông báo${unreadCount ? `, ${unreadCount} chưa đọc` : ""}${pendingTasks ? `, ${pendingTasks} việc cần xử lý` : ""}`}
        aria-expanded={open}
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-black leading-none text-white ring-2 ring-white">
            {badge}
          </span>
        )}
        {pendingTasks > 0 && (
          <span
            title={`${pendingTasks} việc cần xử lý`}
            className="absolute -bottom-1.5 -right-1.5 flex h-[16px] min-w-[16px] items-center justify-center rounded-full bg-amber-500 px-1 text-[9px] font-black leading-none text-white ring-2 ring-white"
          >
            {pendingTasks > 99 ? "99+" : pendingTasks}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-50 mt-2 flex max-h-[70vh] w-96 max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-surface shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <h3 className="text-sm font-black text-slate-800">
                Thông báo
                {unreadCount > 0 && <span className="ml-1.5 rounded-full bg-rose-100 px-1.5 py-0.5 text-[10px] text-rose-600">{badge} chưa đọc</span>}
              </h3>
              {unreadCount > 0 && (
                <button type="button" onClick={() => void markAllRead()} className="flex items-center gap-1 text-[11px] font-bold text-brand-700 hover:underline">
                  <CheckCheck className="h-3.5 w-3.5" /> Đánh dấu tất cả đã đọc
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto">
              {tasks.length > 0 && (
                <div className="border-b border-slate-100 bg-slate-50/70 px-2 py-2">
                  <p className="px-2 pb-1 text-[10px] font-black uppercase tracking-wide text-slate-400">Việc cần xử lý & cần quan tâm</p>
                  {tasks.map((task) => (
                    <button
                      key={task.key}
                      type="button"
                      onClick={() => openTask(task)}
                      disabled={!onNavigate}
                      className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left transition hover:bg-white disabled:cursor-default"
                    >
                      {task.tone === "warning" ? (
                        <AlertCircle className="h-4 w-4 shrink-0 text-amber-500" />
                      ) : (
                        <Info className="h-4 w-4 shrink-0 text-blue-500" />
                      )}
                      <span className="min-w-0 flex-1">
                        <span className="block text-xs font-bold text-slate-800">{task.title}</span>
                        <span className="block truncate text-[11px] text-slate-500">{task.detail}</span>
                      </span>
                      <span
                        className={cn(
                          "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-black",
                          task.tone === "warning" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
                        )}
                      >
                        {task.count}
                      </span>
                      {onNavigate && <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-300" />}
                    </button>
                  ))}
                </div>
              )}
              {error && <p className="m-3 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">{error}</p>}

              {current.items.map((item) => (
                <button
                  key={idOf(item)}
                  type="button"
                  onClick={() => void markRead(item)}
                  className={cn(
                    "flex w-full gap-3 border-b border-slate-100 px-4 py-3 text-left transition last:border-0 hover:bg-slate-50",
                    !item.isRead && "bg-brand-50/40"
                  )}
                >
                  <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", item.isRead ? "bg-transparent" : "bg-brand-500")} />
                  <span className="min-w-0 flex-1">
                    <span className={cn("block text-xs text-slate-800", !item.isRead && "font-bold")}>{item.title}</span>
                    {item.content && <span className="mt-0.5 line-clamp-2 block text-[11px] text-slate-500">{item.content}</span>}
                    <span className="mt-1 block text-[10px] text-slate-400">
                      {timeAgo(item.createdAt)}
                      {item.notificationType ? ` · ${item.notificationType}` : ""}
                    </span>
                  </span>
                </button>
              ))}

              {loading && (
                <div className="flex items-center justify-center gap-2 py-4 text-xs text-slate-400">
                  <Loader2 className="h-4 w-4 animate-spin" /> Đang tải...
                </div>
              )}

              {!loading && current.loaded && current.items.length === 0 && (
                <p className="py-8 text-center text-xs text-slate-400">Bạn chưa có thông báo nào.</p>
              )}

              {!loading && current.hasMore && (
                <button type="button" onClick={() => void loadPage()} className="w-full py-2.5 text-xs font-bold text-brand-700 hover:bg-brand-50">
                  Xem thêm
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
