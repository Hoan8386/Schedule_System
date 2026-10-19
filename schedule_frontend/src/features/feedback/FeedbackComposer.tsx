"use client";

import React, { useEffect, useRef, useState } from "react";
import { ImagePlus, Loader2, Send, X } from "lucide-react";
import { Button, Field, Input, Select, Textarea } from "@/components/ui";
import {
  managerApi,
  statisticsApi,
  type FeedbackItem,
  type FeedbackRole,
  type FeedbackType,
  type StatShift,
  type StatStoreOption,
} from "@/lib/api";
import { localKey } from "@/lib/format";
import { notify } from "@/lib/toast";
import { cn } from "@/lib/cn";
import {
  MAX_IMAGES,
  MAX_IMAGE_BYTES,
  TARGETS_BY_ROLE,
  TARGET_META,
  TYPE_META,
  isShiftFeedbackOpen,
  useNow,
} from "./model";

/** Ca được chọn sẵn khi gửi phản hồi trực tiếp từ thời khóa biểu. */
export interface FeedbackShiftContext {
  shiftByDateId: number;
  storeId?: number | null;
  label: string;
}

interface FeedbackComposerProps {
  /** Vai trò người gửi – quyết định danh sách đối tượng nhận */
  role: FeedbackRole;
  shift?: FeedbackShiftContext;
  onSent?: (item: FeedbackItem) => void;
  onCancel?: () => void;
}

interface UploadedImage {
  key: string;
  name: string;
  preview: string;
  attachmentId?: number;
  uploading: boolean;
}

const TYPES: FeedbackType[] = ["SHIFT", "SYSTEM", "EMPLOYEE", "OTHER"];

const addDays = (date: Date, days: number) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);

/** Form gửi phản hồi: chọn đối tượng nhận, loại, ca / cửa hàng liên quan, nội dung và ảnh đính kèm. */
export default function FeedbackComposer({
  role,
  shift,
  onSent,
  onCancel,
}: FeedbackComposerProps) {
  const targets = TARGETS_BY_ROLE[role];
  const [target, setTarget] = useState<FeedbackRole | undefined>(targets[0]);
  const [type, setType] = useState<FeedbackType>(shift ? "SHIFT" : "OTHER");
  const [storeId, setStoreId] = useState<number | undefined>(
    shift?.storeId ?? undefined,
  );
  const [shiftByDateId, setShiftByDateId] = useState<number | undefined>(
    shift?.shiftByDateId,
  );
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [stores, setStores] = useState<StatStoreOption[]>([]);
  const [recentShifts, setRecentShifts] = useState<StatShift[]>([]);
  const fileInput = useRef<HTMLInputElement>(null);
  const now = useNow();
  // Chỉ ca đã duyệt và đang diễn ra mới được gắn vào phản hồi
  const openShifts = recentShifts.filter(
    (item) =>
      isShiftFeedbackOpen(item, now) && (!storeId || item.storeId === storeId),
  );

  // Cửa hàng & ca của chính mình quanh hôm nay (hôm qua → ngày mai, đủ cho ca qua đêm) để chọn ca đang làm
  useEffect(() => {
    if (shift) return;
    let active = true;
    const today = new Date();
    statisticsApi
      .getMine({
        from: localKey(addDays(today, -1)),
        to: localKey(addDays(today, 1)),
      })
      .then(({ data }) => {
        if (!active) return;
        setStores(data.stores ?? []);
        setRecentShifts(
          [...(data.shifts ?? [])]
            .filter((item) => item.workStatus !== "CANCELLED")
            .sort((a, b) =>
              `${b.workDate}${b.startTime}`.localeCompare(
                `${a.workDate}${a.startTime}`,
              ),
            ),
        );
        if (data.stores?.length === 1) setStoreId(data.stores[0].storeId);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [shift]);

  // Giải phóng URL xem trước khi rời form
  const imagesRef = useRef(images);
  useEffect(() => {
    imagesRef.current = images;
  }, [images]);
  useEffect(
    () => () =>
      imagesRef.current.forEach((image) => URL.revokeObjectURL(image.preview)),
    [],
  );

  const pickFiles = async (fileList: FileList | null) => {
    const files = Array.from(fileList ?? []);
    if (fileInput.current) fileInput.current.value = "";
    if (!files.length) return;
    const room = MAX_IMAGES - images.length;
    if (room <= 0) {
      notify.error(`Chỉ đính kèm tối đa ${MAX_IMAGES} ảnh`);
      return;
    }
    const accepted = files.slice(0, room).filter((file) => {
      if (!file.type.startsWith("image/")) {
        notify.error(`"${file.name}" không phải tệp ảnh`);
        return false;
      }
      if (file.size > MAX_IMAGE_BYTES) {
        notify.error(`"${file.name}" vượt quá 10 MB`);
        return false;
      }
      return true;
    });
    if (files.length > room)
      notify.error(`Chỉ đính kèm tối đa ${MAX_IMAGES} ảnh`);

    const pending = accepted.map((file) => ({
      file,
      image: {
        key: `${file.name}-${file.size}-${Math.random()}`,
        name: file.name,
        preview: URL.createObjectURL(file),
        uploading: true,
      },
    }));
    setImages((current) => [...current, ...pending.map((item) => item.image)]);

    await Promise.all(
      pending.map(async ({ file, image }) => {
        try {
          const { data } = await managerApi.uploadAttachment(file);
          setImages((current) =>
            current.map((item) =>
              item.key === image.key
                ? { ...item, attachmentId: data.attachmentId, uploading: false }
                : item,
            ),
          );
        } catch {
          URL.revokeObjectURL(image.preview);
          setImages((current) =>
            current.filter((item) => item.key !== image.key),
          );
        }
      }),
    );
  };

  const removeImage = (key: string) =>
    setImages((current) => {
      const image = current.find((item) => item.key === key);
      if (image) URL.revokeObjectURL(image.preview);
      return current.filter((item) => item.key !== key);
    });

  const selectShift = (value: string) => {
    const id = value ? Number(value) : undefined;
    setShiftByDateId(id);
    const picked = recentShifts.find((item) => item.shiftByDateId === id);
    if (picked) {
      setStoreId(picked.storeId);
      setType("SHIFT");
    }
  };

  const uploading = images.some((image) => image.uploading);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!target) return;
    if (!content.trim()) {
      notify.error("Vui lòng nhập nội dung phản hồi");
      return;
    }
    if (
      target === "STORE_MANAGER" &&
      !storeId &&
      !shiftByDateId &&
      stores.length > 1
    ) {
      notify.error("Vui lòng chọn cửa hàng để gửi tới trưởng cửa hàng");
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await managerApi.createFeedback({
        targetRole: target,
        feedbackType: type,
        title: title.trim(),
        content: content.trim(),
        storeId,
        shiftByDateId,
        attachmentIds: images
          .map((image) => image.attachmentId)
          .filter((id): id is number => typeof id === "number"),
      });
      images.forEach((image) => URL.revokeObjectURL(image.preview));
      setImages([]);
      setTitle("");
      setContent("");
      if (!shift) setShiftByDateId(undefined);
      onSent?.(data);
    } catch {
      // Lỗi đã được hiện bằng toast từ HTTP client
    } finally {
      setSubmitting(false);
    }
  };

  if (!targets.length) return null;

  return (
    <form onSubmit={submit} className="space-y-4 text-xs">
      {/* Chỉ một đối tượng nhận (vd. quản lý → admin) thì không cần chọn */}
      {targets.length > 1 && (
        <div className="space-y-2">
          <p className="font-bold text-slate-700">
            Gửi tới <span className="text-rose-500">*</span>
          </p>
          <div
            className={cn(
              "grid gap-2",
              targets.length === 3
                ? "sm:grid-cols-3"
                : targets.length === 2
                  ? "sm:grid-cols-2"
                  : "",
            )}
          >
            {targets.map((option) => {
              const meta = TARGET_META[option];
              const Icon = meta.icon;
              const active = target === option;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => setTarget(option)}
                  aria-pressed={active}
                  className={cn(
                    "flex items-start gap-2.5 rounded-xl border p-3 text-left transition",
                    active
                      ? "border-brand-400 bg-brand-50/70 ring-1 ring-brand-300"
                      : "border-slate-200 hover:border-slate-300",
                  )}
                >
                  <Icon
                    className={cn(
                      "mt-0.5 h-4 w-4 shrink-0",
                      active ? "text-brand-600" : "text-slate-400",
                    )}
                  />
                  <span>
                    <span
                      className={cn(
                        "block font-bold",
                        active ? "text-brand-900" : "text-slate-700",
                      )}
                    >
                      {meta.label}
                    </span>
                    <span className="mt-0.5 block text-[10px] text-slate-400">
                      {meta.hint}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <p className="font-bold text-slate-700">Loại phản hồi</p>
        <div className="flex flex-wrap gap-2">
          {TYPES.map((option) => {
            const meta = TYPE_META[option];
            const Icon = meta.icon;
            return (
              <button
                key={option}
                type="button"
                onClick={() => setType(option)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-bold transition",
                  type === option
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 text-slate-600 hover:border-slate-300",
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {meta.label}
              </button>
            );
          })}
        </div>
      </div>

      {shift ? (
        <div className="rounded-xl border border-brand-200 bg-brand-50/60 px-3 py-2.5">
          <span className="text-[10px] font-bold uppercase text-brand-700">
            Ca liên quan
          </span>
          <p className="mt-0.5 font-bold text-slate-800">{shift.label}</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Cửa hàng liên quan">
            <Select
              value={storeId ?? ""}
              onChange={(event) =>
                setStoreId(
                  event.target.value ? Number(event.target.value) : undefined,
                )
              }
              placeholder={
                stores.length ? "Cửa hàng chính của tôi" : "Không có cửa hàng"
              }
              options={stores.map((store) => ({
                value: store.storeId,
                label: store.storeName,
              }))}
            />
          </Field>
          <Field label="Ca đang làm (không bắt buộc)">
            <Select
              value={shiftByDateId ?? ""}
              onChange={(event) => selectShift(event.target.value)}
              placeholder={
                openShifts.length
                  ? "Không gắn ca"
                  : "Không có ca đã duyệt đang diễn ra"
              }
              options={openShifts.map((item) => ({
                value: item.shiftByDateId,
                label: `${item.workDate ? item.workDate.split("-").reverse().slice(0, 2).join("/") : ""} · ${item.shiftName ?? "Ca"} · ${item.startTime ?? ""}–${item.endTime ?? ""}`,
              }))}
            />
          </Field>
        </div>
      )}

      <Field label="Tiêu đề">
        <Input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          maxLength={200}
          placeholder="Tóm tắt ngắn gọn vấn đề"
        />
      </Field>

      <Field
        label={
          <span>
            Nội dung <span className="text-rose-500">*</span>
          </span>
        }
      >
        <Textarea
          rows={5}
          required
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="Mô tả rõ tình huống, thời gian, người liên quan để được hỗ trợ nhanh hơn..."
          className="resize-y leading-relaxed"
        />
      </Field>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="font-bold text-slate-700">Ảnh đính kèm</p>
          <span className="text-[10px] text-slate-400">
            {images.length}/{MAX_IMAGES} ảnh · JPG, PNG, WEBP · tối đa 10 MB/ảnh
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {images.map((image) => (
            <div
              key={image.key}
              className="group relative h-20 w-20 overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.preview}
                alt={image.name}
                className="h-full w-full object-cover"
              />
              {image.uploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/70">
                  <Loader2 className="h-5 w-5 animate-spin text-brand-600" />
                </div>
              )}
              <button
                type="button"
                onClick={() => removeImage(image.key)}
                aria-label={`Bỏ ảnh ${image.name}`}
                className="absolute right-1 top-1 rounded-full bg-slate-900/70 p-0.5 text-white hover:bg-slate-900"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          {images.length < MAX_IMAGES && (
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-slate-300 text-slate-400 transition hover:border-brand-400 hover:text-brand-600"
            >
              <ImagePlus className="h-5 w-5" />
              <span className="text-[10px] font-bold">Thêm ảnh</span>
            </button>
          )}
          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(event) => void pickFiles(event.target.files)}
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
        {onCancel && (
          <Button variant="secondary" onClick={onCancel}>
            Hủy
          </Button>
        )}
        <Button
          type="submit"
          icon={submitting ? Loader2 : Send}
          disabled={submitting || uploading || !target}
        >
          {uploading
            ? "Đang tải ảnh..."
            : submitting
              ? "Đang gửi..."
              : "Gửi phản hồi"}
        </Button>
      </div>
    </form>
  );
}
