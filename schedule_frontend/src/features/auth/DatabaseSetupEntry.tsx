"use client";

import React, { useCallback, useEffect, useState } from "react";
import { DatabaseBackup } from "lucide-react";
import { Modal } from "@/components/ui";
import { databaseApi, type DatabaseStatus } from "@/lib/api";
import DatabaseImportForm from "@/features/admin/sao-luu/DatabaseImportForm";

/**
 * Nhập database từ màn hình đăng nhập (không cần tài khoản):
 * - Database trống → hiện thông báo nhập dữ liệu lần đầu.
 * - Máy chủ có DB_SETUP_KEY → hiện liên kết khôi phục, cần nhập setup key.
 */
export default function DatabaseSetupEntry() {
  const [status, setStatus] = useState<DatabaseStatus | null>(null);
  const [open, setOpen] = useState(false);

  const load = useCallback(() => {
    databaseApi
      .getStatus()
      .then(setStatus)
      .catch(() => setStatus(null));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (!status || (status.initialized && !status.setupKeyRequired)) return null;

  const firstSetup = !status.initialized;

  return (
    <>
      {firstSetup ? (
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-bold">Hệ thống chưa có dữ liệu</p>
          <p className="mt-1 text-xs leading-relaxed">Chưa có tài khoản nào để đăng nhập. Hãy nhập file database (.sql) để bắt đầu.</p>
          <button type="button" onClick={() => setOpen(true)} className="btn btn-primary btn-sm mt-3">
            <DatabaseBackup className="h-4 w-4" />
            Nhập database
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mx-auto mt-6 flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-brand-600"
        >
          <DatabaseBackup className="h-3.5 w-3.5" />
          Khôi phục database
        </button>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={firstSetup ? "Nhập dữ liệu lần đầu" : "Khôi phục database"}>
        <DatabaseImportForm
          askSetupKey={status.setupKeyRequired}
          onImported={() => {
            setOpen(false);
            load();
          }}
        />
      </Modal>
    </>
  );
}
