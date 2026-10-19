"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock,
  ImageIcon,
  Inbox,
  MessageSquare,
  RefreshCw,
  Search,
  Send,
} from "lucide-react";
import {
  Alert,
  Button,
  Card,
  CardHeader,
  EmptyState,
  Modal,
  PageHeader,
  Spinner,
  Tabs,
} from "@/components/ui";
import {
  managerApi,
  type FeedbackItem,
  type FeedbackRole,
  type FeedbackStatus,
} from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/cn";
import FeedbackComposer from "./FeedbackComposer";
import FeedbackDetailModal from "./FeedbackDetailModal";
import {
  ROLE_LABEL,
  STATUS_META,
  TARGET_META,
  TARGETS_BY_ROLE,
  feedbackCode,
  statusMeta,
  targetMeta,
  typeMeta,
} from "./model";

export type FeedbackTab = "inbox" | "sent";

interface FeedbackPageProps {
  role: FeedbackRole;
  initialTab?: FeedbackTab;
}

const SUBTITLE: Record<FeedbackRole, string> = {
  EMPLOYEE:
    "Gửi phản hồi tới trưởng cửa hàng, quản lý hoặc quản trị viên và theo dõi trả lời.",
  STORE_MANAGER:
    "Xem và trả lời phản hồi của nhân viên tại cửa hàng; gửi phản hồi tới quản lý hoặc quản trị viên.",
  MANAGER: "Toàn bộ phản hồi trong chuỗi – xem, trả lời và theo dõi xử lý.",
  ADMIN: "Phản hồi từ nhân viên, trưởng cửa hàng và quản lý.",
};

/** Trang phản hồi dùng chung cho mọi vai trò (backend lọc phạm vi dữ liệu theo vai trò). */
export default function FeedbackPage({ role, initialTab }: FeedbackPageProps) {
  const canSend = TARGETS_BY_ROLE[role].length > 0;
  const canReceive = role !== "EMPLOYEE";
  // Quản lý chỉ gửi được tới admin: dùng nút + popup thay cho tab "Gửi phản hồi"
  const quickSend = role === "MANAGER";
  const [composeOpen, setComposeOpen] = useState(false);
  const [tab, setTab] = useState<FeedbackTab>(
    initialTab ?? (canReceive ? "inbox" : "sent"),
  );
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
        ? current.map((entry) =>
            entry.feedbackId === item.feedbackId ? item : entry,
          )
        : [item, ...current],
    );
  const remove = (id: number) =>
    setItems((current) => current.filter((entry) => entry.feedbackId !== id));

  const received = useMemo(() => items.filter((item) => !item.mine), [items]);
  const sent = useMemo(() => items.filter((item) => item.mine), [items]);
  const active = items.find((item) => item.feedbackId === activeId) ?? null;
  const waiting = received.filter(
    (item) => item.canReply && item.status === "PENDING",
  ).length;

  return (
    <div className="page">
      <PageHeader
        title={canReceive ? "Phản hồi" : "Feedback"}
        subtitle={SUBTITLE[role]}
        actions={
          <>
            <Button
              variant="secondary"
              icon={RefreshCw}
              onClick={reload}
              disabled={loading}
            >
              Tải lại
            </Button>
            {quickSend && (
              <Button icon={Send} onClick={() => setComposeOpen(true)}>
                Gửi phản hồi tới Admin
              </Button>
            )}
          </>
        }
      />

      {canReceive && canSend && !quickSend && (
        <Tabs<FeedbackTab>
          active={tab}
          onChange={setTab}
          items={[
            {
              key: "inbox",
              label: `Phản hồi nhận được${waiting ? ` (${waiting} mới)` : ""}`,
              icon: Inbox,
            },
            { key: "sent", label: "Gửi phản hồi", icon: Send },
          ]}
        />
      )}

      {error && <Alert>{error}</Alert>}

      {(tab === "inbox" || quickSend) && canReceive ? (
        <InboxView
          role={role}
          items={received}
          loading={loading}
          onOpen={setActiveId}
        />
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
            <CardHeader
              title={`Phản hồi đã gửi (${sent.length})`}
              icon={MessageSquare}
            />
            <div className="max-h-[42rem] space-y-2 overflow-y-auto p-4">
              {loading && <Spinner label="Đang tải..." />}
              {!loading && sent.length === 0 && (
                <EmptyState>Bạn chưa gửi phản hồi nào.</EmptyState>
              )}
              {sent.map((item) => (
                <FeedbackCard
                  key={item.feedbackId}
                  item={item}
                  onOpen={() => setActiveId(item.feedbackId)}
                  showTarget
                />
              ))}
            </div>
          </Card>
        </div>
      )}

      {quickSend && (
        <Modal
          open={composeOpen}
          onClose={() => setComposeOpen(false)}
          title="Gửi phản hồi tới Admin"
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
              <p className="text-xs font-bold text-slate-700">
                Đã gửi tới Admin ({sent.length})
              </p>
              <div className="max-h-64 space-y-2 overflow-y-auto">
                {sent.map((item) => (
                  <FeedbackCard
                    key={item.feedbackId}
                    item={item}
                    onOpen={() => {
                      setComposeOpen(false);
                      setActiveId(item.feedbackId);
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </Modal>
      )}

      <FeedbackDetailModal
        item={active}
        onClose={() => setActiveId(null)}
        onChanged={upsert}
        onDeleted={remove}
      />
    </div>
  );
}

// ------------------------------------------------------------------ Hộp thư nhận

type StatusFilter = "all" | FeedbackStatus;

function InboxView({
  role,
  items,
  loading,
  onOpen,
}: {
  role: FeedbackRole;
  items: FeedbackItem[];
  loading: boolean;
  onOpen: (id: number) => void;
}) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [target, setTarget] = useState<"all" | FeedbackRole>(
    role === "ADMIN" ? "ADMIN" : "all",
  );
  const [store, setStore] = useState("");
  const global = role === "MANAGER" || role === "ADMIN";

  const storeNames = useMemo(
    () =>
      [
        ...new Set(
          items
            .map((item) => item.storeName)
            .filter((name): name is string => Boolean(name)),
        ),
      ].sort(),
    [items],
  );

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return items.filter(
      (item) =>
        (status === "all" || item.status === status) &&
        (target === "all" || item.targetRole === target) &&
        (!store || item.storeName === store) &&
        (!keyword ||
          [
            item.title,
            item.content,
            item.senderName,
            item.senderCode,
            feedbackCode(item),
          ].some((value) => value?.toLowerCase().includes(keyword))),
    );
  }, [items, search, status, target, store]);

  const count = (value: FeedbackStatus) =>
    items.filter((item) => item.status === value).length;
  const controlClass =
    "rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium outline-hidden";

  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard
          label="Chờ xử lý"
          value={count("PENDING")}
          hint="Chưa có trả lời"
          icon={MessageSquare}
          tone="bg-brand-50 text-brand-600"
        />
        <StatCard
          label="Đang xử lý"
          value={count("PROCESSING")}
          hint="Cần theo dõi thêm"
          icon={Clock}
          tone="bg-blue-50 text-blue-600"
        />
        <StatCard
          label="Đã trả lời"
          value={count("RESOLVED") + count("REJECTED")}
          hint="Đã phản hồi người gửi"
          icon={CheckCircle2}
          tone="bg-emerald-50 text-emerald-600"
        />
      </div>

      <Card className="overflow-hidden">
        <div className="flex flex-col justify-between gap-3 border-b border-slate-100 p-4 md:flex-row md:items-center">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Danh sách phản hồi ({filtered.length})
          </h3>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="relative min-w-52">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm tiêu đề, người gửi, mã..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className={cn(controlClass, "w-full pl-8")}
              />
            </div>
            <select
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as StatusFilter)
              }
              className={controlClass}
              aria-label="Trạng thái"
            >
              <option value="all">Mọi trạng thái</option>
              {(Object.keys(STATUS_META) as FeedbackStatus[]).map((key) => (
                <option key={key} value={key}>
                  {STATUS_META[key].label}
                </option>
              ))}
            </select>
            {global && (
              <select
                value={target}
                onChange={(event) =>
                  setTarget(event.target.value as "all" | FeedbackRole)
                }
                className={controlClass}
                aria-label="Gửi tới"
              >
                <option value="all">Gửi tới: tất cả</option>
                {(["STORE_MANAGER", "MANAGER", "ADMIN"] as FeedbackRole[]).map(
                  (key) => (
                    <option key={key} value={key}>
                      Gửi tới: {TARGET_META[key].label}
                    </option>
                  ),
                )}
              </select>
            )}
            {storeNames.length > 1 && (
              <select
                value={store}
                onChange={(event) => setStore(event.target.value)}
                className={controlClass}
                aria-label="Cửa hàng"
              >
                <option value="">Mọi cửa hàng</option>
                {storeNames.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
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
                  <tr
                    key={item.feedbackId}
                    className="cursor-pointer transition-colors hover:bg-slate-50/70"
                    onClick={() => onOpen(item.feedbackId)}
                  >
                    <td className="px-4 py-3.5">
                      <p className="font-bold text-slate-800">
                        {item.senderName ?? `Nhân viên #${item.employeeId}`}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {[
                          item.senderCode,
                          item.senderRole ? ROLE_LABEL[item.senderRole] : null,
                          feedbackCode(item),
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    </td>
                    <td className="max-w-md px-4 py-3.5">
                      <p className="font-bold text-slate-800">
                        <span className="mr-1.5 rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-slate-500">
                          {typeMeta(item.feedbackType).label}
                        </span>
                        {item.title || "Phản hồi"}
                        {item.attachmentIdList.length > 0 && (
                          <span className="ml-1.5 inline-flex items-center gap-0.5 text-[10px] font-semibold text-slate-400">
                            <ImageIcon className="h-3 w-3" />
                            {item.attachmentIdList.length}
                          </span>
                        )}
                      </p>
                      <p className="mt-0.5 line-clamp-2 text-[11px] text-slate-500">
                        {item.content}
                      </p>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">
                      <p>{item.storeName ?? "—"}</p>
                      {item.shiftLabel && (
                        <p className="text-[11px] text-slate-400">
                          {item.shiftLabel}
                        </p>
                      )}
                    </td>
                    {global && (
                      <td className="px-4 py-3.5 text-slate-600">
                        {targetMeta(item.targetRole).label}
                      </td>
                    )}
                    <td className="whitespace-nowrap px-4 py-3.5 text-slate-500">
                      {formatDateTime(item.createdAt)}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={cn(
                          "rounded-md border px-2 py-0.5 text-[10px] font-bold",
                          meta.className,
                        )}
                      >
                        {meta.label}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <Button variant="secondary" size="sm">
                        {item.canReply && item.status === "PENDING"
                          ? "Trả lời"
                          : "Xem"}
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {loading && <Spinner className="p-6" label="Đang tải phản hồi..." />}
          {!loading && filtered.length === 0 && (
            <EmptyState className="m-4">
              Không có phản hồi nào{items.length ? " khớp bộ lọc" : ""}.
            </EmptyState>
          )}
        </div>
      </Card>
    </>
  );
}

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number;
  hint: string;
  icon: typeof Clock;
  tone: string;
}) {
  return (
    <Card className="flex items-center justify-between p-5">
      <div>
        <span className="text-xs font-semibold text-slate-500">{label}</span>
        <div className="mt-1 text-3xl font-black text-slate-800">{value}</div>
        <p className="mt-1 text-[11px] text-slate-400">{hint}</p>
      </div>
      <div
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-xl",
          tone,
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
    </Card>
  );
}

/** Thẻ phản hồi gọn (danh sách đã gửi). */
export function FeedbackCard({
  item,
  onOpen,
  showTarget = false,
}: {
  item: FeedbackItem;
  onOpen: () => void;
  showTarget?: boolean;
}) {
  const meta = statusMeta(item.status);
  return (
    <button
      type="button"
      onClick={onOpen}
      className="block w-full rounded-xl border border-slate-100 p-3 text-left transition-colors hover:bg-slate-50/70"
    >
      <span className="text-[10px] text-slate-400">
        {feedbackCode(item)} · {typeMeta(item.feedbackType).label}
        {showTarget ? ` · tới ${targetMeta(item.targetRole).label}` : ""} ·{" "}
        {formatDateTime(item.createdAt)}
      </span>
      <p className="mt-0.5 font-bold text-slate-800">
        {item.title || "Phản hồi"}
      </p>
      {item.shiftLabel && (
        <p className="text-[11px] text-slate-500">{item.shiftLabel}</p>
      )}
      <div className="mt-2 flex items-center gap-2">
        <span
          className={cn(
            "rounded-md border px-2 py-0.5 text-[10px] font-bold",
            meta.className,
          )}
        >
          {meta.label}
        </span>
        {item.attachmentIdList.length > 0 && (
          <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-slate-400">
            <ImageIcon className="h-3 w-3" />
            {item.attachmentIdList.length}
          </span>
        )}
        {item.response && (
          <span className="truncate text-[10px] text-emerald-700">
            ↳ {item.response}
          </span>
        )}
      </div>
    </button>
  );
}
