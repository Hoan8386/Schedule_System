"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle2, Eye, ImageOff, Loader2, Lock, X } from "lucide-react";
import { Button, Modal, Textarea } from "@/components/ui";
import { managerApi, type FeedbackImage, type FeedbackItem, type FeedbackReplyBody } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/cn";
import { ACTION_LABEL, ROLE_LABEL, feedbackCode, statusMeta, targetMeta, typeMeta } from "./model";

interface FeedbackDetailModalProps {
  item: FeedbackItem | null;
  onClose: () => void;
  onChanged: (item: FeedbackItem) => void;
}

const ACTION_ICON = { REVIEWED: Eye, RESOLVED: CheckCircle2, CLOSED: Lock } as const;
const ACTION_VARIANT = { REVIEWED: "secondary", RESOLVED: "primary", CLOSED: "ghost" } as const;

/**
 * Chi tiết phản hồi (người gửi chỉ xem lại).
 * Người xử lý chuyển trạng thái theo luồng PENDING → REVIEWED → RESOLVED, đóng (CLOSED) từ PENDING / RESOLVED.
 */
export default function FeedbackDetailModal({ item, onClose, onChanged }: FeedbackDetailModalProps) {
  const [reply, setReply] = useState("");
  const [busy, setBusy] = useState(false);
  const [lastId, setLastId] = useState<number | null>(null);
  // Ảnh đính kèm tải từ API chi tiết (nhúng sẵn data URL như ảnh cửa hàng)
  const [images, setImages] = useState<{ id: number; items: FeedbackImage[] } | null>(null);
  const [zoomed, setZoomed] = useState<FeedbackImage | null>(null);

  const feedbackId = item?.feedbackId;
  const hasImages = Boolean(item?.attachmentIdList.length);
  useEffect(() => {
    if (!feedbackId || !hasImages) return;
    let active = true;
    managerApi
      .getFeedbackDetail(feedbackId)
      .then(({ data }) => active && setImages({ id: feedbackId, items: data.attachments ?? [] }))
      .catch(() => active && setImages({ id: feedbackId, items: [] }));
    return () => {
      active = false;
    };
  }, [feedbackId, hasImages]);

  // Mở phản hồi khác → điền sẵn câu trả lời hiện có
  if (item && item.feedbackId !== lastId) {
    setLastId(item.feedbackId);
    setReply(item.response ?? "");
  }
  if (!item) return null;
  const loadedImages = images?.id === item.feedbackId ? images.items : null;

  const status = statusMeta(item.status);
  const type = typeMeta(item.feedbackType);
  const actions = (item.nextStatuses ?? []).filter((next): next is FeedbackReplyBody["status"] => next !== "PENDING");
  // Thứ tự nút: xem xét → giải quyết → đóng
  const ordered = (["REVIEWED", "RESOLVED", "CLOSED"] as const).filter((next) => actions.includes(next));

  const handle = async (nextStatus: FeedbackReplyBody["status"]) => {
    if (nextStatus === "CLOSED" && !window.confirm("Đóng phản hồi? Phản hồi đã đóng không thể chuyển sang trạng thái khác.")) return;
    setBusy(true);
    try {
      const { data } = await managerApi.replyFeedback(item.feedbackId, { status: nextStatus, response: reply.trim() || undefined });
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

        {item.response && !ordered.length && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3.5">
            <p className="text-[10px] font-bold uppercase text-emerald-700">
              Trả lời từ {item.handlerName ?? "người xử lý"} · {formatDateTime(item.handledAt)}
            </p>
            <p className="mt-1 whitespace-pre-line text-[13px] leading-relaxed text-slate-800">{item.response}</p>
          </div>
        )}

        {item.canReply && item.status === "CLOSED" && (
          <p className="flex items-center gap-1.5 border-t border-slate-100 pt-3 text-[11px] font-semibold text-slate-400">
            <Lock className="h-3.5 w-3.5" /> Phản hồi đã đóng – không thể chuyển sang trạng thái khác.
          </p>
        )}

        {ordered.length > 0 && (
          <div className="space-y-2 border-t border-slate-100 pt-3">
            <label className="font-bold text-slate-700" htmlFor="feedback-reply">
              Ghi chú trả lời (không bắt buộc)
              {item.handledAt && (
                <span className="ml-1 font-normal text-slate-400">
                  (cập nhật lần cuối bởi {item.handlerName ?? "—"} · {formatDateTime(item.handledAt)})
                </span>
              )}
            </label>
            <Textarea
              id="feedback-reply"
              rows={4}
              value={reply}
              onChange={(event) => setReply(event.target.value)}
              placeholder="Nhập nội dung trả lời / hướng xử lý cho người gửi..."
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
