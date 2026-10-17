"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Bell, CheckCheck, Loader2 } from "lucide-react";
import { notificationApi, type NotificationResponse, type NotificationStatus } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/cn";

/** Chu kỳ làm mới số thông báo chưa đọc (chỉ gọi API đếm, rất nhẹ). */
const POLL_INTERVAL_MS = 60_000;

interface TabState {
  items: NotificationResponse[];
  page: number;
  hasMore: boolean;
  loaded: boolean;
}

const EMPTY_TAB: TabState = { items: [], page: -1, hasMore: false, loaded: false };
const TABS: { key: NotificationStatus; label: string }[] = [
  { key: "unread", label: "Chưa đọc" },
  { key: "read", label: "Đã đọc" },
];

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

/** Chuông thông báo: số chưa đọc, 2 tab Chưa đọc / Đã đọc, tải 20 thông báo mỗi lần. */
export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<NotificationStatus>("unread");
  const [tabs, setTabs] = useState<Record<NotificationStatus, TabState>>({ unread: EMPTY_TAB, read: EMPTY_TAB });
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const refreshCount = useCallback(async () => {
    try {
      const { data } = await notificationApi.getUnreadCount();
      setUnreadCount(Number(data?.unreadCount ?? 0));
    } catch {
      // Giữ số cũ nếu lỗi mạng; không làm phiền người dùng
    }
  }, []);

  // Đếm chưa đọc khi mount, định kỳ và khi quay lại tab trình duyệt
  useEffect(() => {
    const first = window.setTimeout(() => void refreshCount(), 0);
    const timer = window.setInterval(() => void refreshCount(), POLL_INTERVAL_MS);
    const onFocus = () => void refreshCount();
    window.addEventListener("focus", onFocus);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(timer);
      window.removeEventListener("focus", onFocus);
    };
  }, [refreshCount]);

  /** Tải trang tiếp theo của một tab (trang 0 nếu reset). */
  const loadPage = useCallback(
    async (status: NotificationStatus, reset = false) => {
      setLoading(true);
      setError("");
      try {
        const current = reset ? EMPTY_TAB : tabs[status];
        const nextPage = current.page + 1;
        const { data } = await notificationApi.getMine(status, nextPage);
        setTabs((prev) => ({
          ...prev,
          [status]: {
            items: reset ? data.items : [...prev[status].items, ...data.items],
            page: data.page,
            hasMore: data.hasMore,
            loaded: true,
          },
        }));
        setUnreadCount(Number(data.unreadCount ?? 0));
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Không thể tải thông báo");
      } finally {
        setLoading(false);
      }
    },
    [tabs]
  );

  const toggle = () => {
    const next = !open;
    setOpen(next);
    // Mỗi lần mở chuông tải lại trang đầu của tab hiện tại để có dữ liệu mới
    if (next) void loadPage(tab, true);
  };

  const switchTab = (status: NotificationStatus) => {
    setTab(status);
    if (!tabs[status].loaded) void loadPage(status, true);
  };

  const markRead = async (item: NotificationResponse) => {
    if (item.isRead) return;
    const id = idOf(item);
    try {
      await notificationApi.markRead(id);
      setTabs((prev) => ({
        unread: { ...prev.unread, items: prev.unread.items.filter((entry) => idOf(entry) !== id) },
        // Tab "Đã đọc" sẽ tải lại khi mở để đúng thứ tự
        read: EMPTY_TAB,
      }));
      setUnreadCount((count) => Math.max(0, count - 1));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể cập nhật thông báo");
    }
  };

  const markAllRead = async () => {
    try {
      await notificationApi.markAllRead();
      setTabs({ unread: { ...EMPTY_TAB, loaded: true, page: 0 }, read: EMPTY_TAB });
      setUnreadCount(0);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể cập nhật thông báo");
    }
  };

  const current = tabs[tab];
  const badge = unreadCount > 99 ? "99+" : String(unreadCount);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={toggle}
        className="relative rounded-xl border border-slate-200 p-2 text-slate-600 transition-colors hover:bg-slate-50"
        title="Thông báo"
        aria-label={unreadCount ? `Thông báo, ${unreadCount} chưa đọc` : "Thông báo"}
        aria-expanded={open}
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-black leading-none text-white ring-2 ring-white">
            {badge}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-50 mt-2 flex max-h-[70vh] w-96 max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-surface shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <h3 className="text-sm font-black text-slate-800">Thông báo</h3>
              {tab === "unread" && unreadCount > 0 && (
                <button type="button" onClick={() => void markAllRead()} className="flex items-center gap-1 text-[11px] font-bold text-brand-700 hover:underline">
                  <CheckCheck className="h-3.5 w-3.5" /> Đánh dấu tất cả đã đọc
                </button>
              )}
            </div>

            <div className="flex gap-1 border-b border-slate-100 px-3 py-2" role="tablist">
              {TABS.map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={tab === key}
                  onClick={() => switchTab(key)}
                  className={cn(
                    "flex-1 rounded-lg px-3 py-1.5 text-xs font-bold transition",
                    tab === key ? "bg-brand-500 text-brand-contrast" : "text-slate-500 hover:bg-slate-100"
                  )}
                >
                  {label}
                  {key === "unread" && unreadCount > 0 && <span className="ml-1">({badge})</span>}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto">
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
                <p className="py-8 text-center text-xs text-slate-400">{tab === "unread" ? "Bạn đã đọc hết thông báo." : "Chưa có thông báo đã đọc."}</p>
              )}

              {!loading && current.hasMore && (
                <button type="button" onClick={() => void loadPage(tab)} className="w-full py-2.5 text-xs font-bold text-brand-700 hover:bg-brand-50">
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
