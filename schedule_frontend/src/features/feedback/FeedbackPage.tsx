"use client";

import React, { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Eye, ImageIcon, Lock, MessageSquare, RefreshCw, Search, Send } from "lucide-react";
import { Alert, Button, Card, CardHeader, EmptyState, Modal, PageHeader, Spinner } from "@/components/ui";
import { managerApi, type FeedbackItem, type FeedbackRole, type FeedbackStatus, type FeedbackType } from "@/lib/api";
import { formatDateTime, localKey } from "@/lib/format";
import { cn } from "@/lib/cn";
import FeedbackComposer from "./FeedbackComposer";
import FeedbackDetailModal from "./FeedbackDetailModal";
import { ROLE_LABEL, STATUS_META, TARGET_META, TYPES_BY_ROLE, TYPE_META, feedbackCode, statusMeta, targetMeta, typeMeta } from "./model";

interface FeedbackPageProps {
  role: FeedbackRole;
}

const PAGE_TEXT: Record<FeedbackRole, { title: string; subtitle: string; send?: string }> = {
  EMPLOYEE: {
    title: "Feedback",
    subtitle: "Gửi phản hồi về ca làm, đồng nghiệp hoặc hệ thống và xem lại phản hồi đã gửi.",
  },
  STORE_MANAGER: {
    title: "Quản lý phản hồi",
    subtitle: "Phản hồi của nhân viên tại cửa hàng gửi tới trưởng cửa hàng. Bấm “Gửi phản hồi” để gửi lên quản lý hoặc admin.",
    send: "Gửi phản hồi",
  },
  MANAGER: {
    title: "Phản hồi",
    subtitle: "Toàn bộ phản hồi trong chuỗi – xem và xử lý. Quản lý chỉ gửi được phản hồi loại Hệ thống tới admin.",
    send: "Gửi phản hồi hệ thống",
  },
  ADMIN: { title: "Phản hồi", subtitle: "Phản hồi từ nhân viên, trưởng cửa hàng và quản lý." },
};

/**
 * Trang phản hồi dùng chung (backend lọc phạm vi dữ liệu theo vai trò).
 * - Nhân viên: form gửi + danh sách đã gửi (chỉ xem lại).
 * - Trưởng cửa hàng / Quản lý / Admin: danh sách phản hồi nhận được; nút "Gửi phản hồi" mở popup (nếu được gửi).
 */
export default function FeedbackPage({ role }: FeedbackPageProps) {
  const text = PAGE_TEXT[role];
  const canSend = TYPES_BY_ROLE[role].length > 0;
  const canReceive = role !== "EMPLOYEE";
  const [composeOpen, setComposeOpen] = useState(false);
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeId, setActiveId] = useState<number | null>(null);
  const [version, setVersion] = useState(0);

  const reload = () => {
    setLoading(true);
    setVersion((value) => value + 1);
  };

  useEffect(() => {
    let active = true;
    managerApi
      .getFeedback()
      .then(({ data }) => {
        if (!active) return;
        setItems(data);
        setError("");
      })
      .catch((requestError: Error) => active && setError(requestError.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [version]);

  const upsert = (item: FeedbackItem) =>
    setItems((current) =>
      current.some((entry) => entry.feedbackId === item.feedbackId)
        ? current.map((entry) => (entry.feedbackId === item.feedbackId ? item : entry))
        : [item, ...current]
    );

  const received = useMemo(() => items.filter((item) => !item.mine), [items]);
  const sent = useMemo(() => items.filter((item) => item.mine), [items]);
  const active = items.find((item) => item.feedbackId === activeId) ?? null;

  const sentList = (onOpen: (id: number) => void) =>
    sent.map((item) => <FeedbackCard key={item.feedbackId} item={item} onOpen={() => onOpen(item.feedbackId)} showTarget />);

  return (
    <div className="page">
      <PageHeader
        title={text.title}
        subtitle={text.subtitle}
        actions={
          <>
            <Button variant="secondary" icon={RefreshCw} onClick={reload} disabled={loading}>
              Tải lại
            </Button>
            {canReceive && canSend && text.send && (
              <Button icon={Send} onClick={() => setComposeOpen(true)}>
                {text.send}
              </Button>
            )}
          </>
        }
      />

      {error && <Alert>{error}</Alert>}

      {canReceive ? (
        <InboxView role={role} items={received} loading={loading} onOpen={setActiveId} />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <Card className="lg:col-span-3">
            <CardHeader title="Gửi phản hồi" icon={Send} />
            <div className="p-5">
              <FeedbackComposer
                role={role}
                onSent={(item) => {
                  upsert(item);
                  setActiveId(item.feedbackId);
                }}
              />
            </div>
          </Card>
          <Card className="lg:col-span-2">
            <CardHeader title={`Phản hồi đã gửi (${sent.length})`} icon={MessageSquare} />
            <div className="max-h-[42rem] space-y-2 overflow-y-auto p-4">
              {loading && <Spinner label="Đang tải..." />}
              {!loading && sent.length === 0 && <EmptyState>Bạn chưa gửi phản hồi nào.</EmptyState>}
              {sentList(setActiveId)}
            </div>
          </Card>
        </div>
      )}

      {canReceive && canSend && (
        <Modal
          open={composeOpen}
          onClose={() => setComposeOpen(false)}
          title={text.send ?? "Gửi phản hồi"}
          size="max-w-2xl"
          className="max-h-[90vh] overflow-y-auto"
        >
          <FeedbackComposer
            role={role}
            onCancel={() => setComposeOpen(false)}
            onSent={(item) => {
              upsert(item);
              setComposeOpen(false);
              setActiveId(item.feedbackId);
            }}
          />
          {sent.length > 0 && (
            <div className="space-y-2 border-t border-slate-100 pt-4">
              <p className="text-xs font-bold text-slate-700">Phản hồi bạn đã gửi ({sent.length})</p>
              <div className="max-h-64 space-y-2 overflow-y-auto">
                {sentList((id) => {
                  setComposeOpen(false);
                  setActiveId(id);
                })}
              </div>
            </div>
          )}
        </Modal>
      )}

      <FeedbackDetailModal item={active} onClose={() => setActiveId(null)} onChanged={upsert} />
    </div>
  );
}

// ------------------------------------------------------------------ Danh sách nhận được

type StatusFilter = "all" | FeedbackStatus;

const STAT_CARDS: { status: FeedbackStatus; hint: string; icon: typeof Eye; tone: string }[] = [
  { status: "PENDING", hint: "Mới gửi, chưa xem xét", icon: MessageSquare, tone: "bg-brand-50 text-brand-600" },
  { status: "REVIEWED", hint: "Đã tiếp nhận, đang xử lý", icon: Eye, tone: "bg-blue-50 text-blue-600" },
  { status: "RESOLVED", hint: "Đã giải quyết (có thể mở lại)", icon: CheckCircle2, tone: "bg-emerald-50 text-emerald-600" },
  { status: "CLOSED", hint: "Đã đóng – không thay đổi được", icon: Lock, tone: "bg-slate-100 text-slate-500" },
];

function InboxView({ role, items, loading, onOpen }: { role: FeedbackRole; items: FeedbackItem[]; loading: boolean; onOpen: (id: number) => void }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [type, setType] = useState<"all" | FeedbackType>("all");
  const [senderRole, setSenderRole] = useState<"all" | FeedbackRole>("all");
  const [target, setTarget] = useState<"all" | FeedbackRole>("all");
  const [store, setStore] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const global = role === "MANAGER" || role === "ADMIN";

  const storeNames = useMemo(
    () => [...new Set(items.map((item) => item.storeName).filter((name): name is string => Boolean(name)))].sort(),
    [items]
  );

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return items.filter((item) => {
      const sentDay = item.createdAt ? localKey(new Date(item.createdAt)) : "";
      return (
        (status === "all" || item.status === status) &&
        (type === "all" || item.feedbackType === type) &&
        (senderRole === "all" || item.senderRole === senderRole) &&
        (target === "all" || item.targetRole === target) &&
        (!store || item.storeName === store) &&
        (!from || (sentDay && sentDay >= from)) &&
        (!to || (sentDay && sentDay <= to)) &&
        (!keyword ||
          [item.title, item.content, item.senderName, item.senderCode, feedbackCode(item)].some((value) => value?.toLowerCase().includes(keyword)))
      );
    });
  }, [items, search, status, type, senderRole, target, store, from, to]);

  const count = (value: FeedbackStatus) => items.filter((item) => item.status === value).length;
  const hasFilter = Boolean(search || status !== "all" || type !== "all" || senderRole !== "all" || target !== "all" || store || from || to);
  const resetFilters = () => {
    setSearch("");
    setStatus("all");
    setType("all");
    setSenderRole("all");
    setTarget("all");
    setStore("");
    setFrom("");
    setTo("");
  };
  const controlClass = "rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium outline-hidden";
  // Vai trò có thể là người gửi phản hồi tới người đang xem
  const senderRoles: FeedbackRole[] = role === "STORE_MANAGER" ? ["EMPLOYEE"] : ["EMPLOYEE", "STORE_MANAGER", ...(role === "ADMIN" ? (["MANAGER"] as FeedbackRole[]) : [])];

  return (
    <>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {STAT_CARDS.map((card) => (
          <button
            key={card.status}
            type="button"
            onClick={() => setStatus(status === card.status ? "all" : card.status)}
            className={cn("text-left", status === card.status && "rounded-2xl ring-2 ring-brand-300")}
          >
            <StatCard label={STATUS_META[card.status].label} value={count(card.status)} hint={card.hint} icon={card.icon} tone={card.tone} />
          </button>
        ))}
      </div>

      <Card className="overflow-hidden">
        <div className="space-y-3 border-b border-slate-100 p-4">
          <div className="flex flex-col justify-between gap-2 md:flex-row md:items-center">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Danh sách phản hồi ({filtered.length})</h3>
            <div className="relative min-w-60">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm tiêu đề, nội dung, người gửi, mã..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className={cn(controlClass, "w-full pl-8")}
              />
            </div>
          </div>
          <div className="flex flex-wrap items-end gap-2 text-xs">
            <label className="flex flex-col gap-1 text-[10px] font-semibold text-slate-500">
              Gửi từ ngày
              <input type="date" value={from} max={to || undefined} onChange={(event) => setFrom(event.target.value)} className={controlClass} />
            </label>
            <label className="flex flex-col gap-1 text-[10px] font-semibold text-slate-500">
              Đến ngày
              <input type="date" value={to} min={from || undefined} onChange={(event) => setTo(event.target.value)} className={controlClass} />
            </label>
            {senderRoles.length > 1 && (
              <label className="flex flex-col gap-1 text-[10px] font-semibold text-slate-500">
                Vai trò người gửi
                <select value={senderRole} onChange={(event) => setSenderRole(event.target.value as "all" | FeedbackRole)} className={controlClass}>
                  <option value="all">Tất cả</option>
                  {senderRoles.map((key) => (
                    <option key={key} value={key}>{ROLE_LABEL[key]}</option>
                  ))}
                </select>
              </label>
            )}
            <label className="flex flex-col gap-1 text-[10px] font-semibold text-slate-500">
              Loại
              <select value={type} onChange={(event) => setType(event.target.value as "all" | FeedbackType)} className={controlClass}>
                <option value="all">Tất cả</option>
                {(Object.keys(TYPE_META) as FeedbackType[]).map((key) => (
                  <option key={key} value={key}>{TYPE_META[key].label}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-[10px] font-semibold text-slate-500">
              Trạng thái
              <select value={status} onChange={(event) => setStatus(event.target.value as StatusFilter)} className={controlClass}>
                <option value="all">Tất cả</option>
                {(Object.keys(STATUS_META) as FeedbackStatus[]).map((key) => (
                  <option key={key} value={key}>{STATUS_META[key].label}</option>
                ))}
              </select>
            </label>
            {global && (
              <label className="flex flex-col gap-1 text-[10px] font-semibold text-slate-500">
                Gửi tới
                <select value={target} onChange={(event) => setTarget(event.target.value as "all" | FeedbackRole)} className={controlClass}>
                  <option value="all">Tất cả</option>
                  {(["STORE_MANAGER", "MANAGER", "ADMIN"] as FeedbackRole[]).map((key) => (
                    <option key={key} value={key}>{TARGET_META[key].label}</option>
                  ))}
                </select>
              </label>
            )}
            {storeNames.length > 1 && (
              <label className="flex flex-col gap-1 text-[10px] font-semibold text-slate-500">
                Cửa hàng
                <select value={store} onChange={(event) => setStore(event.target.value)} className={controlClass}>
                  <option value="">Tất cả</option>
                  {storeNames.map((name) => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </label>
            )}
            {hasFilter && (
              <button type="button" onClick={resetFilters} className="px-2 py-1.5 font-bold text-brand-700 hover:underline">
                Xóa bộ lọc
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-[11px] font-semibold text-slate-400">
                <th className="px-4 py-3">Người gửi</th>
                <th className="px-4 py-3">Chủ đề & nội dung</th>
                <th className="px-4 py-3">Cửa hàng / ca</th>
                {global && <th className="px-4 py-3">Gửi tới</th>}
                <th className="px-4 py-3">Ngày gửi</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.map((item) => {
                const meta = statusMeta(item.status);
                return (
                  <tr key={item.feedbackId} className="cursor-pointer transition-colors hover:bg-slate-50/70" onClick={() => onOpen(item.feedbackId)}>
                    <td className="px-4 py-3.5">
                      <p className="font-bold text-slate-800">{item.senderName ?? `Nhân viên #${item.employeeId}`}</p>
                      <p className="text-[11px] text-slate-400">
                        {[item.senderCode, item.senderRole ? ROLE_LABEL[item.senderRole] : null, feedbackCode(item)].filter(Boolean).join(" · ")}
                      </p>
                    </td>
                    <td className="max-w-md px-4 py-3.5">
                      <p className="font-bold text-slate-800">
                        <span className="mr-1.5 rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-slate-500">{typeMeta(item.feedbackType).label}</span>
                        {item.title || "Phản hồi"}
                        {item.attachmentIdList.length > 0 && (
                          <span className="ml-1.5 inline-flex items-center gap-0.5 text-[10px] font-semibold text-slate-400">
                            <ImageIcon className="h-3 w-3" />
                            {item.attachmentIdList.length}
                          </span>
                        )}
                      </p>
                      <p className="mt-0.5 line-clamp-2 text-[11px] text-slate-500">{item.content}</p>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">
                      <p>{item.storeName ?? "—"}</p>
                      {item.shiftLabel && <p className="text-[11px] text-slate-400">{item.shiftLabel}</p>}
                      {item.targetEmployeeName && <p className="text-[11px] text-slate-400">Về: {item.targetEmployeeName}</p>}
                    </td>
                    {global && <td className="px-4 py-3.5 text-slate-600">{targetMeta(item.targetRole).label}</td>}
                    <td className="whitespace-nowrap px-4 py-3.5 text-slate-500">{formatDateTime(item.createdAt)}</td>
                    <td className="px-4 py-3.5">
                      <span className={cn("rounded-md border px-2 py-0.5 text-[10px] font-bold", meta.className)}>{meta.label}</span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <Button variant="secondary" size="sm">
                        {item.nextStatuses?.length ? "Xử lý" : "Xem"}
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {loading && <Spinner className="p-6" label="Đang tải phản hồi..." />}
          {!loading && filtered.length === 0 && <EmptyState className="m-4">Không có phản hồi nào{items.length ? " khớp bộ lọc" : ""}.</EmptyState>}
        </div>
      </Card>
    </>
  );
}

function StatCard({ label, value, hint, icon: Icon, tone }: { label: string; value: number; hint: string; icon: typeof Eye; tone: string }) {
  return (
    <Card className="flex h-full items-center justify-between p-5">
      <div>
        <span className="text-xs font-semibold text-slate-500">{label}</span>
        <div className="mt-1 text-3xl font-black text-slate-800">{value}</div>
        <p className="mt-1 text-[11px] text-slate-400">{hint}</p>
      </div>
      <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", tone)}>
        <Icon className="h-5 w-5" />
      </div>
    </Card>
  );
}

/** Thẻ phản hồi gọn (danh sách đã gửi – chỉ xem lại). */
export function FeedbackCard({ item, onOpen, showTarget = false }: { item: FeedbackItem; onOpen: () => void; showTarget?: boolean }) {
  const meta = statusMeta(item.status);
  return (
    <button type="button" onClick={onOpen} className="block w-full rounded-xl border border-slate-100 p-3 text-left transition-colors hover:bg-slate-50/70">
      <span className="text-[10px] text-slate-400">
        {feedbackCode(item)} · {typeMeta(item.feedbackType).label}
        {showTarget ? ` · tới ${targetMeta(item.targetRole).label}` : ""} · {formatDateTime(item.createdAt)}
      </span>
      <p className="mt-0.5 font-bold text-slate-800">{item.title || "Phản hồi"}</p>
      {item.shiftLabel && <p className="text-[11px] text-slate-500">{item.shiftLabel}</p>}
      <div className="mt-2 flex items-center gap-2">
        <span className={cn("rounded-md border px-2 py-0.5 text-[10px] font-bold", meta.className)}>{meta.label}</span>
        {item.attachmentIdList.length > 0 && (
          <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-slate-400">
            <ImageIcon className="h-3 w-3" />
            {item.attachmentIdList.length}
          </span>
        )}
        {item.response && <span className="truncate text-[10px] text-emerald-700">↳ {item.response}</span>}
      </div>
    </button>
  );
}
