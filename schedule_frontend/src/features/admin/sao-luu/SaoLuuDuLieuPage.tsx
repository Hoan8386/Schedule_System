"use client";

import React, { useState } from "react";
import { DatabaseBackup, Download, Info, Loader2, Upload } from "lucide-react";
import { Button, Card, CardHeader, PageHeader } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { databaseApi } from "@/lib/api";
import DatabaseImportForm from "./DatabaseImportForm";

/** Sao lưu & khôi phục toàn bộ database dưới dạng file .sql. */
export default function SaoLuuDuLieuPage() {
  const { logout } = useAuth();
  const [exporting, setExporting] = useState(false);

  const exportSql = async () => {
    setExporting(true);
    try {
      await databaseApi.exportSql();
    } catch {
      // Lỗi đã hiện bằng toast
    } finally {
      setExporting(false);
    }
  };

  // Tài khoản / quyền có thể đã thay đổi theo dữ liệu mới → đăng nhập lại
  const afterImport = () => window.setTimeout(logout, 1500);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Sao lưu & khôi phục dữ liệu"
        subtitle="Xuất toàn bộ database ra file .sql hoặc nhập lại từ file đã sao lưu"
      />

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader title="Xuất database" icon={Download} />
          <div className="space-y-4 p-5">
            <p className="text-sm leading-relaxed text-slate-600">
              Tải về một file .sql chứa cấu trúc và dữ liệu của tất cả các bảng. File mở được bằng MySQL Workbench và nhập lại được bằng{" "}
              <code className="rounded bg-slate-100 px-1">mysql</code> hoặc ngay tại trang này.
            </p>
            <p className="text-xs text-slate-500">Ảnh và tệp đính kèm nằm trên Cloudflare R2, không có trong file sao lưu (chỉ có đường dẫn).</p>
            <Button icon={exporting ? Loader2 : DatabaseBackup} onClick={exportSql} disabled={exporting}>
              {exporting ? "Đang xuất..." : "Xuất file .sql"}
            </Button>
          </div>
        </Card>

        <Card>
          <CardHeader title="Nhập database" icon={Upload} iconClassName="text-rose-600" />
          <div className="space-y-4 p-5">
            <div className="flex gap-2 rounded-xl bg-amber-50 p-3 text-xs leading-relaxed text-amber-800">
              <Info className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                Nên xuất bản sao lưu hiện tại trước khi nhập. Sau khi nhập xong bạn sẽ được đăng xuất để đăng nhập lại theo dữ liệu mới.
              </span>
            </div>
            <DatabaseImportForm withToken onImported={afterImport} />
          </div>
        </Card>
      </div>
    </div>
  );
}
