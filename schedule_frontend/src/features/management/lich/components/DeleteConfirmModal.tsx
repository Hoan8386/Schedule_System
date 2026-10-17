import React from "react";
import { AlertTriangle, Trash2 } from "lucide-react";
import { Alert, Button, Modal, Spinner } from "@/components/ui";
import type { SchedulePeriodDeletePreview } from "@/lib/api/types/schedule.types";
import { KIND_LABEL } from "../constants";
import { useSchedule } from "../ScheduleContext";

const PREVIEW_LABEL: Record<keyof SchedulePeriodDeletePreview, string> = {
  rounds: "Đợt đăng ký",
  sessions: "Phiên đăng ký",
  shiftByDates: "Ca theo ngày",
  assignments: "Phân bổ nhân viên",
  attendances: "Bản ghi chấm công",
  emergencyRequests: "Yêu cầu khẩn",
  eventScopes: "Phạm vi sự kiện",
};

/** Popup cảnh báo trước khi xóa; với kỳ lập lịch liệt kê dữ liệu sẽ bị xóa theo. */
export function DeleteConfirmModal() {
  const { pendingDelete, confirmDelete, cancelDelete } = useSchedule();
  if (!pendingDelete) return null;

  const { kind, preview, loadingPreview, deleting, error } = pendingDelete;
  const isPeriod = kind === "period";
  const related = preview
    ? (Object.keys(PREVIEW_LABEL) as (keyof SchedulePeriodDeletePreview)[]).filter((key) => preview[key] > 0)
    : [];

  return (
    <Modal
      open
      size="max-w-md"
      onClose={cancelDelete}
      title={
        <span className="flex items-center gap-2 text-rose-600">
          <AlertTriangle className="h-5 w-5" />
          Xóa {KIND_LABEL[kind]}?
        </span>
      }
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={cancelDelete} disabled={deleting}>
            Hủy
          </Button>
          <Button variant="danger" icon={Trash2} onClick={() => void confirmDelete()} disabled={deleting || loadingPreview}>
            {deleting ? "Đang xóa..." : "Xóa vĩnh viễn"}
          </Button>
        </div>
      }
    >
      <p className="text-sm text-slate-600">
        Thao tác này <strong>không thể hoàn tác</strong>.
        {isPeriod && " Toàn bộ dữ liệu lịch thuộc kỳ này cũng sẽ bị xóa."}
      </p>

      {isPeriod && loadingPreview && <Spinner label="Đang kiểm tra dữ liệu liên quan..." />}

      {isPeriod && preview && (
        related.length > 0 ? (
          <ul className="space-y-1 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
            {related.map((key) => (
              <li key={key} className="flex justify-between">
                <span>{PREVIEW_LABEL[key]}</span>
                <strong>{preview[key]}</strong>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500">Kỳ này chưa có dữ liệu liên quan.</p>
        )
      )}

      {isPeriod && preview && preview.attendances > 0 && (
        <p className="text-xs text-slate-500">
          Vi phạm, chi tiết lương, đánh giá và phản hồi gắn với các ca này được giữ lại nhưng sẽ bỏ liên kết tới ca/chấm công.
        </p>
      )}

      {error && <Alert>{error}</Alert>}
    </Modal>
  );
}
