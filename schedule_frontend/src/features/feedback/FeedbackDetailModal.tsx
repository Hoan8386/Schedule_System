"use client";

import React, { useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, Eye, History, ImageOff, Info as InfoIcon, Loader2, Lock, X } from "lucide-react";
import { Button, Modal, Textarea } from "@/components/ui";
import { managerApi, type FeedbackHistoryEntry, type FeedbackImage, type FeedbackItem, type FeedbackReplyBody, type FeedbackRole } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/cn";
import { ACTION_LABEL, ROLE_LABEL, feedbackCode, statusMeta, targetMeta, typeMeta } from "./model";

interface FeedbackDetailModalProps {
  /** Vai trò người đang xem – để báo khi quản lý phản hồi thay trưởng cửa hàng */
  role?: FeedbackRole;
  item: FeedbackItem | null;
  onClose: () => void;
  onChanged: (item: FeedbackItem) => void;
}

const ACTION_ICON = { REVIEWED: Eye, RESOLVED: CheckCircle2, CLOSED: Lock } as const;
const ACTION_VARIANT = { REVIEWED: "secondary", RESOLVED: "primary", CLOSED: "ghost" } as const;

/**
 * Chi tiết phản hồi (người gửi chỉ xem lại).
 * Người xử lý chuyển trạng thái theo luồng PENDING → REVIEWED → RESOLVED, đóng (CLOSED) từ PENDING / RESOLVED;
 * mỗi lần chuyển kèm một ghi chú (nhận xét) riêng, hiển thị thành lịch sử xử lý.
 * Quản lý chuỗi xử lý được phản hồi gửi tới trưởng cửa hàng (phản hồi thay).
 */
export default function FeedbackDetailModal({ role, item, onClose, onChanged }: FeedbackDetailModalProps) {
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [lastId, setLastId] = useState<number | null>(null);
  // Ảnh đính kèm (nhúng sẵn data URL như ảnh cửa hàng) + lịch sử chuyển trạng thái tải từ API chi tiết
  const [detail, setDetail] = useState<{ id: number; images: FeedbackImage[]; history: FeedbackHistoryEntry[] } | null>(null);
  const [zoomed, setZoomed] = useState<FeedbackImage | null>(null);

  const feedbackId = item?.feedbackId;
  useEffect(() => {
    if (!feedbackId) return;
    let active = true;
    managerApi
      .getFeedbackDetail(feedbackId)
      .then(({ data }) => active && setDetail({ id: feedbackId, images: data.attachments ?? [], history: data.history ?? [] }))
      .catch(() => active && setDetail({ id: feedbackId, images: [], history: [] }));
    return () => {
      active = false;
    };
  }, [feedbackId]);

  // Mở phản hồi khác → ghi chú mới cho lần chuyển trạng thái tiếp theo
  if (item && item.feedbackId !== lastId) {
    setLastId(item.feedbackId);
    setNote("");
  }
  if (!item) return null;
  const current = detail?.id === item.feedbackId ? detail : null;
  const loadedImages = current?.images ?? null;
  const history = current?.history ?? null;
  const onBehalf = role === "MANAGER" && item.targetRole === "STORE_MANAGER";

  const status = statusMeta(item.status);
  const type = typeMeta(item.feedbackType);
  const actions = (item.nextStatuses ?? []).filter((next): next is FeedbackReplyBody["status"] => next !== "PENDING");
  // Thứ tự nút: xem xét → giải quyết → đóng
  const ordered = (["REVIEWED", "RESOLVED", "CLOSED"] as const).filter((next) => actions.includes(next));

  const handle = async (nextStatus: FeedbackReplyBody["status"]) => {
    if (nextStatus === "CLOSED" && !window.confirm("Đóng phản hồi? Phản hồi đã đóng không thể chuyển sang trạng thái khác.")) return;
    setBusy(true);
    try {
      const { data } = await managerApi.replyFeedback(item.feedbackId, { status: nextStatus, response: note.trim() || undefined });
      setDetail((value) => ({
        id: data.feedbackId,
        images: value?.id === data.feedbackId ? value.images : [],
        history: data.history ?? (value?.id === data.feedbackId ? value.history : []),
      }));
      setNote("");
      onChanged(data);
    } catch {
      // toast đã hiển thị
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      size="max-w-2xl"
      className="max-h-[90vh] overflow-y-auto"
      title={
        <span className="flex flex-col">
          <span className="text-[10px] font-bold uppercase tracking-wide text-brand-600">
            {feedbackCode(item)} · {type.label} · Gửi tới {targetMeta(item.targetRole).label}
          </span>
          <span>{item.title || "Phản hồi"}</span>
        </span>
      }
    >
      <div className="space-y-4 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className={cn("rounded-md border px-2 py-0.5 text-[10px] font-bold", status.className)}>{status.label}</span>
          <span className="text-slate-500">
            <b className="text-slate-800">{item.mine ? "Bạn" : item.senderName ?? `Nhân viên #${item.employeeId}`}</b>
            {item.senderCode && !item.mine ? ` (${item.senderCode})` : ""}
            {item.senderRole ? ` · ${ROLE_LABEL[item.senderRole] ?? item.senderRole}` : ""} · {formatDateTime(item.createdAt)}
          </span>
        </div>

        {(item.storeName || item.shiftLabel || item.targetEmployeeName) && (
          <div className="grid gap-2 rounded-xl border border-slate-100 bg-slate-50 p-3 sm:grid-cols-2">
            {item.storeName && <Info label="Cửa hàng" value={item.storeName} />}
            {item.shiftLabel && <Info label="Ca làm" value={item.shiftLabel} />}
            {item.targetEmployeeName && <Info label="Đồng nghiệp liên quan" value={item.targetEmployeeName} />}
          </div>
        )}

        <p className="whitespace-pre-line rounded-xl border border-slate-100 p-3.5 text-[13px] leading-relaxed text-slate-800">{item.content}</p>

        {item.attachmentIdList.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {!loadedImages &&
              item.attachmentIdList.map((id) => (
                <div key={id} className="flex h-28 w-28 items-center justify-center rounded-xl border border-slate-200 bg-slate-50">
                  <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                </div>
              ))}
            {loadedImages?.map((image) =>
              image.dataUrl ? (
                <button
                  key={image.attachmentId}
                  type="button"
                  onClick={() => setZoomed(image)}
                  title="Bấm để phóng to"
                  className="h-28 w-28 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 transition hover:ring-2 hover:ring-brand-300"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={image.dataUrl} alt={image.fileName ?? `Ảnh đính kèm ${image.attachmentId}`} className="h-full w-full object-cover" />
                </button>
              ) : (
                <div key={image.attachmentId} className="flex h-28 w-28 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-slate-200 text-[10px] text-slate-400">
                  <ImageOff className="h-5 w-5" />
                  Không tải được ảnh
                </div>
              )
            )}
          </div>
        )}

        {zoomed?.dataUrl && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/85 p-4" onClick={() => setZoomed(null)}>
            <button type="button" aria-label="Đóng ảnh" onClick={() => setZoomed(null)} className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20">
              <X className="h-5 w-5" />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={zoomed.dataUrl} alt={zoomed.fileName ?? "Ảnh đính kèm"} className="max-h-[90vh] max-w-full rounded-xl object-contain shadow-2xl" onClick={(event) => event.stopPropagation()} />
          </div>
        )}

        <div className="space-y-2 border-t border-slate-100 pt-3">
          <p className="flex flex-wrap items-center gap-1.5 font-bold text-slate-700">
            <History className="h-3.5 w-3.5 text-slate-400" /> Lịch sử xử lý
            {item.handledOnBehalf && (
              <span className="rounded-md border border-violet-200 bg-violet-50 px-1.5 py-0.5 text-[10px] font-bold text-violet-700">
                Quản lý phản hồi thay trưởng cửa hàng
              </span>
            )}
          </p>
          {history === null ? (
            <p className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Đang tải...
            </p>
          ) : history.length > 0 ? (
            <ol className="space-y-2">
              {history.map((entry) => (
                <HistoryRow key={entry.historyId} entry={entry} />
              ))}
            </ol>
          ) : item.response ? (
            // Dữ liệu cũ chưa có lịch sử: hiển thị ghi chú cuối cùng
            <ol>
              <HistoryRow
                entry={{
                  historyId: 0,
                  fromStatus: null,
                  toStatus: item.status,
                  note: item.response,
                  handledBy: item.handledBy,
                  handlerName: item.handlerName,
                  handlerRole: item.handlerRole,
                  createdAt: item.handledAt,
                }}
              />
            </ol>
          ) : (
            <p className="text-[11px] text-slate-400">Chưa được xử lý.</p>
          )}
        </div>

        {item.canReply && item.status === "CLOSED" && (
          <p className="flex items-center gap-1.5 border-t border-slate-100 pt-3 text-[11px] font-semibold text-slate-400">
            <Lock className="h-3.5 w-3.5" /> Phản hồi đã đóng – không thể chuyển sang trạng thái khác.
          </p>
        )}

        {ordered.length > 0 && (
          <div className="space-y-2 border-t border-slate-100 pt-3">
            {onBehalf && (
              <p className="flex items-center gap-1.5 rounded-lg border border-violet-200 bg-violet-50 px-2.5 py-1.5 text-[11px] font-semibold text-violet-700">
                <InfoIcon className="h-3.5 w-3.5 shrink-0" /> Phản hồi này gửi tới trưởng cửa hàng – bạn đang phản hồi thay với vai trò quản lý chuỗi.
              </p>
            )}
            <label className="font-bold text-slate-700" htmlFor="feedback-note">
              Nhận xét / ghi chú cho lần chuyển trạng thái này
            </label>
            <Textarea
              id="feedback-note"
              rows={3}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Nhập nhận xét, hướng xử lý cho người gửi (lưu kèm lần chuyển trạng thái)..."
              className="resize-y"
            />
            <div className="flex flex-wrap items-center justify-end gap-2">
              {ordered.map((next) => (
                <Button key={next} variant={ACTION_VARIANT[next]} icon={ACTION_ICON[next]} disabled={busy} onClick={() => void handle(next)}>
                  {ACTION_LABEL[next]}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <p>
      <span className="block text-[10px] font-semibold uppercase text-slate-400">{label}</span>
      <span className="font-bold text-slate-700">{value}</span>
    </p>
  );
}

function HistoryRow({ entry }: { entry: FeedbackHistoryEntry }) {
  const from = entry.fromStatus ? statusMeta(entry.fromStatus) : null;
  const to = statusMeta(entry.toStatus);
  return (
    <li className="list-none rounded-xl border border-slate-100 bg-slate-50/70 p-3">
      <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
        {from && (
          <>
            <span className={cn("rounded-md border px-1.5 py-0.5 text-[10px] font-bold", from.className)}>{from.label}</span>
            <ArrowRight className="h-3 w-3 text-slate-400" />
          </>
        )}
        <span className={cn("rounded-md border px-1.5 py-0.5 text-[10px] font-bold", to.className)}>{to.label}</span>
        <span>
          · <b className="text-slate-700">{entry.handlerName ?? "—"}</b>
          {entry.handlerRole ? ` (${ROLE_LABEL[entry.handlerRole] ?? entry.handlerRole})` : ""} · {formatDateTime(entry.createdAt)}
        </span>
      </div>
      {entry.note ? (
        <p className="mt-1.5 whitespace-pre-line text-[13px] leading-relaxed text-slate-800">{entry.note}</p>
      ) : (
        <p className="mt-1 text-[11px] italic text-slate-400">Không có ghi chú</p>
      )}
    </li>
  );
}
