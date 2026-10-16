import React from "react";
import { CreditCard, Upload } from "lucide-react";
import { managerApi } from "@/lib/api";
import { EmployeeAvatar } from "../components/EmployeeAvatar";

interface FileButtonProps {
  label: string;
  busy: boolean;
  onFile: (file: File) => void;
  className?: string;
}

/** Nút chọn tệp ảnh. */
export function FileButton({ label, busy, onFile, className = "" }: FileButtonProps) {
  return (
    <label className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 transition-colors ${className}`}>
      <Upload className="h-3.5 w-3.5 text-slate-500" />
      <span>{busy ? "Đang tải..." : label}</span>
      <input
        type="file"
        accept="image/*"
        className="hidden"
        disabled={busy}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onFile(file);
        }}
      />
    </label>
  );
}

interface AvatarFieldProps {
  avatar: string;
  gender?: string;
  busy: boolean;
  onChange: (avatar: string) => void;
  onUpload: (file: File) => void;
}

/** Ảnh đại diện: dán URL hoặc tải lên. */
export function AvatarField({ avatar, gender, busy, onChange, onUpload }: AvatarFieldProps) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-brand-200 bg-brand-100 shadow-xs">
        <EmployeeAvatar src={avatar} gender={gender} alt="Avatar Preview" />
      </div>
      <div className="flex-1 space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700">Ảnh đại diện (Avatar)</span>
          {avatar && (
            <button type="button" onClick={() => onChange("")} className="text-[11px] text-rose-600 hover:underline">
              Xóa ảnh
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Dán URL ảnh hoặc nhấn Tải ảnh..."
            value={avatar}
            onChange={(event) => onChange(event.target.value)}
            className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-brand-400"
          />
          <FileButton label="Tải ảnh" busy={busy} onFile={onUpload} className="shrink-0 bg-white px-3 py-2 shadow-xs hover:bg-slate-50" />
        </div>
      </div>
    </div>
  );
}

interface IdCardSideProps {
  side: "front" | "back";
  attachmentId: number | null | undefined;
  busy: boolean;
  onRemove: () => void;
  onUpload: (file: File) => void;
}

/** Một mặt CCCD: xem trước, xóa và tải lên. */
export function IdCardSide({ side, attachmentId, busy, onRemove, onUpload }: IdCardSideProps) {
  const name = side === "front" ? "mặt trước" : "mặt sau";
  return (
    <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-3">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1 text-[11px] font-bold text-slate-700">
          <span className={`h-2 w-2 rounded-full ${side === "front" ? "bg-brand-500" : "bg-orange-500"}`} />
          {side === "front" ? "Mặt trước" : "Mặt sau"}
        </span>
        {attachmentId ? (
          <button type="button" onClick={onRemove} className="text-[11px] text-rose-600 hover:underline">
            Xóa ảnh
          </button>
        ) : null}
      </div>
      {attachmentId ? (
        <div className="relative aspect-[16/10] overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
          {/* eslint-disable-next-line @next/next/no-img-element -- ảnh từ backend */}
          <img src={managerApi.getAttachmentFileUrl(attachmentId)} alt={`CCCD ${name}`} className="h-full w-full object-cover" />
        </div>
      ) : (
        <div className="flex aspect-[16/10] flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 text-[11px] text-slate-400">
          <CreditCard className="mb-1 h-5 w-5 text-slate-300" />
          <span>Chưa có ảnh {name}</span>
        </div>
      )}
      <FileButton
        label={attachmentId ? `Đổi ảnh ${name}` : `Tải ảnh ${name}`}
        busy={busy}
        onFile={onUpload}
        className="w-full bg-slate-50 py-2 hover:bg-slate-100"
      />
    </div>
  );
}
