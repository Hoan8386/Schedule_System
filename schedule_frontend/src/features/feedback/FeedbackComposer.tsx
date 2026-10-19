"use client";

import React, { useEffect, useRef, useState } from "react";
import { ImagePlus, Info, Loader2, Send, X } from "lucide-react";
import { Button, Field, Input, Select, Textarea } from "@/components/ui";
import {
  managerApi,
  statisticsApi,
  type FeedbackColleague,
  type FeedbackItem,
  type FeedbackRole,
  type FeedbackType,
  type StatShift,
  type StatStoreOption,
} from "@/lib/api";
import { localKey } from "@/lib/format";
import { notify } from "@/lib/toast";
import { cn } from "@/lib/cn";
import { MAX_IMAGES, MAX_IMAGE_BYTES, TARGETS_BY_ROLE, TARGET_META, TYPES_BY_ROLE, TYPE_META, isShiftFeedbackOpen, useNow } from "./model";

/** Ca được chọn sẵn khi gửi phản hồi trực tiếp từ thời khóa biểu. */
export interface FeedbackShiftContext {
  shiftByDateId: number;
  storeId?: number | null;
  label: string;
}

interface FeedbackComposerProps {
  /** Vai trò người gửi – quyết định loại phản hồi và người nhận */
  role: FeedbackRole;
  /** Có ca sẵn (từ thời khóa biểu) → khóa loại Ca làm */
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

const addDays = (date: Date, days: number) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);

const shiftOptionLabel = (item: StatShift) =>
  `${item.workDate ? item.workDate.split("-").reverse().join("/") : ""} · ${item.shiftName ?? "Ca"} · ${item.startTime ?? ""}–${item.endTime ?? ""}${item.storeName ? ` · ${item.storeName}` : ""}`;

/**
 * Form gửi phản hồi.
 * - Ca làm: bắt buộc chọn ca (đã duyệt, đang diễn ra) · Đồng nghiệp: chọn người (không bắt buộc) · Hệ thống: tự gửi admin.
 */
export default function FeedbackComposer({ role, shift, onSent, onCancel }: FeedbackComposerProps) {
  const types = shift ? (["SHIFT"] as FeedbackType[]) : TYPES_BY_ROLE[role];
  const targets = TARGETS_BY_ROLE[role];
  const [type, setType] = useState<FeedbackType>(types[0]);
  const [target, setTarget] = useState<FeedbackRole | undefined>(targets[0]);
  const [storeId, setStoreId] = useState<number | undefined>(shift?.storeId ?? undefined);
  const [shiftByDateId, setShiftByDateId] = useState<number | undefined>(shift?.shiftByDateId);
  const [colleagueId, setColleagueId] = useState<number | undefined>();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [stores, setStores] = useState<StatStoreOption[]>([]);
  const [recentShifts, setRecentShifts] = useState<StatShift[]>([]);
  const [colleagues, setColleagues] = useState<FeedbackColleague[] | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const now = useNow();

  const isSystem = type === "SYSTEM";
  // Chỉ ca đã duyệt và đang diễn ra mới được chọn cho loại Ca làm
  const openShifts = recentShifts.filter((item) => isShiftFeedbackOpen(item, now));

  // Cửa hàng & ca của chính mình quanh hôm nay (hôm qua → ngày mai, đủ cho ca qua đêm)
  const needsMine = !shift && types.some((option) => option !== "SYSTEM");
  useEffect(() => {
    if (!needsMine) return;
    let active = true;
    const today = new Date();
    statisticsApi
      .getMine({ from: localKey(addDays(today, -1)), to: localKey(addDays(today, 1)) })
      .then(({ data }) => {
        if (!active) return;
        setStores(data.stores ?? []);
        setRecentShifts(data.shifts ?? []);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [needsMine]);

  // Đồng nghiệp cùng cửa hàng – chỉ tải khi chọn loại Đồng nghiệp
  const wantsColleagues = type === "EMPLOYEE" && colleagues === null;
  useEffect(() => {
    if (!wantsColleagues) return;
    let active = true;
    managerApi
      .getFeedbackColleagues()
      .then(({ data }) => active && setColleagues(data ?? []))
      .catch(() => active && setColleagues([]));
    return () => {
      active = false;
    };
  }, [wantsColleagues]);

  // Giải phóng URL xem trước khi rời form
  const imagesRef = useRef(images);
  useEffect(() => {
    imagesRef.current = images;
  }, [images]);
  useEffect(() => () => imagesRef.current.forEach((image) => URL.revokeObjectURL(image.preview)), []);

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
    if (files.length > room) notify.error(`Chỉ đính kèm tối đa ${MAX_IMAGES} ảnh`);

    const pending = accepted.map((file) => ({
      file,
      image: { key: `${file.name}-${file.size}-${Math.random()}`, name: file.name, preview: URL.createObjectURL(file), uploading: true },
    }));
    setImages((current) => [...current, ...pending.map((item) => item.image)]);

    await Promise.all(
      pending.map(async ({ file, image }) => {
        try {
          const { data } = await managerApi.uploadAttachment(file);
          setImages((current) => current.map((item) => (item.key === image.key ? { ...item, attachmentId: data.attachmentId, uploading: false } : item)));
        } catch {
          URL.revokeObjectURL(image.preview);
          setImages((current) => current.filter((item) => item.key !== image.key));
        }
      })
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
    if (picked) setStoreId(picked.storeId);
  };

  const uploading = images.some((image) => image.uploading);
  const missingShift = type === "SHIFT" && !shiftByDateId;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!content.trim()) {
      notify.error("Vui lòng nhập nội dung phản hồi");
      return;
    }
    if (missingShift) {
      notify.error("Phản hồi loại Ca làm phải chọn ca cụ thể");
      return;
    }
    if (!isSystem && target === "STORE_MANAGER" && !storeId && !shiftByDateId && stores.length > 1) {
      notify.error("Vui lòng chọn cửa hàng để gửi tới trưởng cửa hàng");
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await managerApi.createFeedback({
        feedbackType: type,
        targetRole: isSystem ? undefined : target,
        title: title.trim(),
        content: content.trim(),
        storeId,
        shiftByDateId: type === "SHIFT" ? shiftByDateId : undefined,
        targetEmployeeId: type === "EMPLOYEE" ? colleagueId : undefined,
        attachmentIds: images.map((image) => image.attachmentId).filter((id): id is number => typeof id === "number"),
      });
      images.forEach((image) => URL.revokeObjectURL(image.preview));
      setImages([]);
      setTitle("");
      setContent("");
      setColleagueId(undefined);
      if (!shift) setShiftByDateId(undefined);
      onSent?.(data);
    } catch {
      // Lỗi đã được hiện bằng toast từ HTTP client
    } finally {
      setSubmitting(false);
    }
  };

  if (!types.length) return null;

  return (
    <form onSubmit={submit} className="space-y-4 text-xs">
      {types.length > 1 && (
        <div className="space-y-2">
          <p className="font-bold text-slate-700">
            Loại phản hồi <span className="text-rose-500">*</span>
          </p>
          <div className="grid gap-2 sm:grid-cols-3">
            {types.map((option) => {
              const meta = TYPE_META[option];
              const Icon = meta.icon;
              const active = type === option;
              return (
                <button
                  key={option}
                  type="button"
                  title={meta.hint}
                  onClick={() => setType(option)}
                  aria-pressed={active}
                  className={cn(
                    "flex items-center gap-2 rounded-xl border p-3 text-left font-bold transition",
                    active ? "border-brand-400 bg-brand-50/70 text-brand-900 ring-1 ring-brand-300" : "border-slate-200 text-slate-600 hover:border-slate-300"
                  )}
                >
                  <Icon className={cn("h-4 w-4 shrink-0", active ? "text-brand-600" : "text-slate-400")} />
                  {meta.label}
                </button>
              );
            })}
          </div>
          <p className="text-[11px] text-slate-400">{TYPE_META[type].hint}</p>
        </div>
      )}

      {isSystem ? (
        <div className="flex items-start gap-2 rounded-xl border border-blue-200 bg-blue-50/60 px-3 py-2.5 text-blue-800">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            Phản hồi <b>Hệ thống</b> được gửi tới <b>Admin</b>. {TYPE_META.SYSTEM.hint}.
          </p>
        </div>
      ) : (
        targets.length > 1 && (
          <div className="space-y-2">
            <p className="font-bold text-slate-700">
              Gửi tới <span className="text-rose-500">*</span>
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
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
                      "flex items-center gap-2 rounded-xl border p-3 text-left font-bold transition",
                      active ? "border-brand-400 bg-brand-50/70 text-brand-900 ring-1 ring-brand-300" : "border-slate-200 text-slate-600 hover:border-slate-300"
                    )}
                  >
                    <Icon className={cn("h-4 w-4 shrink-0", active ? "text-brand-600" : "text-slate-400")} />
                    {meta.label}
                  </button>
                );
              })}
            </div>
          </div>
        )
      )}

      {type === "SHIFT" &&
        (shift ? (
          <div className="rounded-xl border border-brand-200 bg-brand-50/60 px-3 py-2.5">
            <span className="text-[10px] font-bold uppercase text-brand-700">Ca làm</span>
            <p className="mt-0.5 font-bold text-slate-800">{shift.label}</p>
          </div>
        ) : (
          <Field label={<span>Ca làm <span className="text-rose-500">*</span></span>}>
            {openShifts.length ? (
              <Select
                value={shiftByDateId ?? ""}
                onChange={(event) => selectShift(event.target.value)}
                placeholder="Chọn ca đang làm"
                options={openShifts.map((item) => ({ value: item.shiftByDateId, label: shiftOptionLabel(item) }))}
              />
            ) : (
              <p className="rounded-xl border border-dashed border-slate-200 px-3 py-2.5 font-medium text-slate-400">
                Bạn không có ca đã duyệt đang diễn ra. Chỉ phản hồi được ca làm trong thời gian diễn ra ca.
              </p>
            )}
          </Field>
        ))}

      {type === "EMPLOYEE" && (
        <div className={cn("grid gap-3", stores.length > 1 && "sm:grid-cols-2")}>
          <Field label="Đồng nghiệp (không bắt buộc)">
            <Select
              value={colleagueId ?? ""}
              onChange={(event) => setColleagueId(event.target.value ? Number(event.target.value) : undefined)}
              placeholder={colleagues === null ? "Đang tải..." : "Không chỉ đích danh"}
              options={(colleagues ?? []).map((item) => ({
                value: item.employeeId,
                label: `${item.fullName ?? `#${item.employeeId}`}${item.employeeCode ? ` (${item.employeeCode})` : ""}`,
              }))}
            />
          </Field>
          {stores.length > 1 && (
            <Field label="Cửa hàng">
              <Select
                value={storeId ?? ""}
                onChange={(event) => setStoreId(event.target.value ? Number(event.target.value) : undefined)}
                placeholder="Cửa hàng chính của tôi"
                options={stores.map((store) => ({ value: store.storeId, label: store.storeName }))}
              />
            </Field>
          )}
        </div>
      )}

      <Field label="Tiêu đề">
        <Input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={200} placeholder="Tóm tắt ngắn gọn vấn đề" />
      </Field>

      <Field label={<span>Nội dung <span className="text-rose-500">*</span></span>}>
        <Textarea
          rows={5}
          required
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder={TYPE_META[type].hint + "..."}
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
            <div key={image.key} className="group relative h-20 w-20 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image.preview} alt={image.name} className="h-full w-full object-cover" />
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
          <input ref={fileInput} type="file" accept="image/*" multiple hidden onChange={(event) => void pickFiles(event.target.files)} />
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
        {onCancel && (
          <Button variant="secondary" onClick={onCancel}>
            Hủy
          </Button>
        )}
        <Button type="submit" icon={submitting ? Loader2 : Send} disabled={submitting || uploading || missingShift}>
          {uploading ? "Đang tải ảnh..." : submitting ? "Đang gửi..." : "Gửi phản hồi"}
        </Button>
      </div>
    </form>
  );
}
