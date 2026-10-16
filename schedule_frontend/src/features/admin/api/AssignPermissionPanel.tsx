import React, { useState } from "react";
import { X } from "lucide-react";
import type { PermissionResponse } from "@/lib/api";

interface Props {
  roleCode: string;
  permissions: PermissionResponse[];
  onAssign: (permissionIds: number[]) => Promise<void>;
  onClose: () => void;
}

/** Chọn các permission chưa cấp để gán cho role. */
export function AssignPermissionPanel({ roleCode, permissions, onAssign, onClose }: Props) {
  const [selected, setSelected] = useState<number[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggle = (id: number) => setSelected((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      await onAssign(selected);
      onClose();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể gán permission cho role.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="border-b border-slate-100 bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-black text-slate-800">Gán permission cho role {roleCode}</h3>
          <p className="mt-1 text-[11px] text-slate-500">Chọn một hoặc nhiều permission chưa được cấp cho role này.</p>
        </div>
        <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Đóng cửa sổ gán quyền">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-4 grid max-h-72 grid-cols-1 gap-2 overflow-y-auto sm:grid-cols-2">
        {permissions.map((permission) => {
          const checked = selected.includes(permission.permissionId);
          return (
            <label
              key={permission.permissionId}
              className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors ${checked ? "border-brand-400 bg-brand-50" : "border-slate-200 hover:border-slate-300"}`}
            >
              <input type="checkbox" checked={checked} onChange={() => toggle(permission.permissionId)} className="mt-0.5 accent-brand-500" />
              <span className="min-w-0">
                <span className="block truncate text-xs font-bold text-slate-800">{permission.permissionName}</span>
                <span className="mt-1 block truncate font-mono text-[10px] text-slate-500">
                  {permission.method || "—"} {permission.apiPath || "—"}
                </span>
              </span>
            </label>
          );
        })}
      </div>

      {permissions.length === 0 && <p className="mt-4 text-xs text-emerald-700">Role này đã được cấp toàn bộ permission hiện có.</p>}
      {error && <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">{error}</p>}
      <div className="mt-4 flex justify-end gap-2">
        <button type="button" onClick={onClose} className="btn btn-secondary btn-sm">Hủy</button>
        <button type="button" onClick={() => void submit()} disabled={busy || selected.length === 0} className="btn btn-primary btn-sm font-black">
          {busy ? "Đang gán..." : `Gán ${selected.length} quyền`}
        </button>
      </div>
    </div>
  );
}
