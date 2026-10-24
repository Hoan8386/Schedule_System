"use client";

import React, { useRef, useState } from "react";
import { FileUp, Loader2, Upload } from "lucide-react";
import { Button, Field, Input } from "@/components/ui";
import { databaseApi } from "@/lib/api";
import { cn } from "@/lib/cn";

interface DatabaseImportFormProps {
  /** Đang đăng nhập ADMIN → gửi token; màn hình đăng nhập → không */
  withToken?: boolean;
  /** Hiện ô nhập setup key (nhập khi chưa đăng nhập trên máy chủ có DB_SETUP_KEY) */
  askSetupKey?: boolean;
  onImported?: (statements: number) => void;
}

const MAX_BYTES = 50 * 1024 * 1024;

/** Chọn file .sql → xác nhận ghi đè → gửi lên backend. */
export default function DatabaseImportForm({ withToken, askSetupKey, onImported }: DatabaseImportFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [setupKey, setSetupKey] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  const pick = (picked: File | undefined) => {
    if (fileInput.current) fileInput.current.value = "";
    if (!picked) return;
    if (!picked.name.toLowerCase().endsWith(".sql")) {
      setError("Chỉ hỗ trợ file .sql");
      return;
    }
    if (picked.size > MAX_BYTES) {
      setError("File không được vượt quá 50 MB");
      return;
    }
    setError("");
    setFile(picked);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!file || !confirmed) return;
    setImporting(true);
    setError("");
    try {
      const statements = await databaseApi.importSql(file, { withToken, setupKey: askSetupKey ? setupKey : undefined });
      setFile(null);
      setConfirmed(false);
      onImported?.(statements);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Nhập database thất bại");
    } finally {
      setImporting(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <button
        type="button"
        onClick={() => fileInput.current?.click()}
        disabled={importing}
        className={cn(
          "flex w-full flex-col items-center justify-center gap-1 rounded-xl border border-dashed px-4 py-6 text-center transition",
          file ? "border-brand-300 bg-brand-50 text-brand-700" : "border-slate-300 text-slate-500 hover:border-brand-400 hover:text-brand-600"
        )}
      >
        <FileUp className="h-6 w-6" />
        <span className="text-sm font-bold">{file ? file.name : "Chọn file .sql"}</span>
        <span className="text-[11px] text-slate-400">
          {file ? `${(file.size / 1024).toFixed(0)} KB · bấm để đổi file` : "File xuất từ hệ thống hoặc mysqldump · tối đa 50 MB"}
        </span>
      </button>
      <input ref={fileInput} type="file" accept=".sql" hidden onChange={(event) => pick(event.target.files?.[0])} />

      {askSetupKey && (
        <Field label="Setup key">
          <Input
            type="password"
            autoComplete="off"
            value={setupKey}
            onChange={(event) => setSetupKey(event.target.value)}
            placeholder="Giá trị DB_SETUP_KEY trên máy chủ"
          />
        </Field>
      )}

      <label className="flex items-start gap-2 text-xs text-slate-600">
        <input type="checkbox" className="mt-0.5" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} />
        <span>Tôi hiểu các bảng có trong file sẽ bị xóa và thay bằng dữ liệu trong file. Thao tác không thể hoàn tác.</span>
      </label>

      {error && <p className="text-xs font-semibold text-rose-600">{error}</p>}

      <Button
        type="submit"
        variant="danger"
        icon={importing ? Loader2 : Upload}
        disabled={!file || !confirmed || importing || (askSetupKey && !setupKey.trim())}
        className="w-full justify-center"
      >
        {importing ? "Đang nhập dữ liệu..." : "Nhập database"}
      </Button>
    </form>
  );
}
