"use client";

import React, { useState } from "react";
import { CreditCard, Sparkles } from "lucide-react";
import { Alert, Modal } from "@/components/ui";
import { managerApi, type EmployeeRequest, type EmployeeResponse, type EmployeeStoreResponse, type StoreResponse } from "@/lib/api";
import { attachmentUrl, currentAssignmentOf, toEmployeeForm, value, type EmployeeStoreForm } from "../utils";
import { AvatarField, IdCardSide } from "./ImageUploadFields";

interface Props {
  /** null = tạo mới */
  employee: EmployeeResponse | null;
  assignments: EmployeeStoreResponse[];
  stores: StoreResponse[];
  onClose: () => void;
  onSaved: (message: string) => void;
}

type UploadTarget = "avatar" | "front" | "back";

const inputClass = "mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-normal";

export function EmployeeFormModal({ employee, assignments, stores, onClose, onSaved }: Props) {
  const isEdit = Boolean(employee);
  const currentAssignment = employee ? currentAssignmentOf(assignments) : undefined;
  const [form, setForm] = useState<EmployeeRequest>(() => toEmployeeForm(employee));
  const [storeForm, setStoreForm] = useState<EmployeeStoreForm>(() => ({
    storeId: currentAssignment?.storeId ?? stores[0]?.id ?? 0,
    startDate: currentAssignment?.startDate ?? employee?.hireDate ?? "",
    isPrimary: currentAssignment?.isPrimary ?? true,
    status: currentAssignment?.status ?? "ACTIVE",
  }));
  const [uploading, setUploading] = useState<UploadTarget | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = <K extends keyof EmployeeRequest>(key: K, next: EmployeeRequest[K]) => setForm((prev) => ({ ...prev, [key]: next }));

  const upload = async (target: UploadTarget, file: File) => {
    setUploading(target);
    setError("");
    try {
      const { data } = await managerApi.uploadAttachment(file);
      if (target === "avatar") {
        const url = attachmentUrl(data);
        if (url) set("avatar", url);
      } else if (data?.attachmentId) {
        set(target === "front" ? "idCardFrontId" : "idCardBackId", data.attachmentId);
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Tải ảnh lên thất bại");
    } finally {
      setUploading(null);
    }
  };

  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.fullName?.trim() || !form.employeeCode?.trim()) return setError("Vui lòng nhập đầy đủ Mã nhân viên và Họ tên.");
    if (!isEdit && !form.email?.trim()) {
      return setError("Vui lòng nhập Email để hệ thống tạo tài khoản User và gửi thông tin đăng nhập cho nhân viên.");
    }

    setSaving(true);
    setError("");
    try {
      const response = employee ? await managerApi.updateEmployee(employee.id, form) : await managerApi.createEmployee(form);
      if (storeForm.storeId) {
        const payload = {
          employeeId: employee?.id ?? response.data.id,
          storeId: storeForm.storeId,
          startDate: storeForm.startDate || null,
          endDate: null,
          isPrimary: storeForm.isPrimary,
          status: storeForm.status,
          assignedBy: null,
        };
        if (currentAssignment) await managerApi.updateEmployeeStore(currentAssignment.employeeStoreId, payload);
        else await managerApi.createEmployeeStore(payload);
      }
      onSaved(isEdit ? "Cập nhật hồ sơ nhân viên thành công!" : "Tạo nhân viên thành công! Hệ thống đã tạo tài khoản và gửi email thông tin đăng nhập.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể lưu nhân viên");
    } finally {
      setSaving(false);
    }
  };

  const text = (key: keyof EmployeeRequest, label: React.ReactNode, props: React.InputHTMLAttributes<HTMLInputElement> = {}, wide = false) => (
    <label className={`text-xs font-bold text-slate-700 ${wide ? "sm:col-span-2" : ""}`}>
      {label}
      <input value={String(form[key] ?? "")} onChange={(event) => set(key, event.target.value as never)} className={inputClass} {...props} />
    </label>
  );

  return (
    <Modal open size="max-w-2xl" title={isEdit ? "Sửa hồ sơ nhân viên" : "Thêm mới nhân viên"} onClose={onClose}>
      <form onSubmit={save} className="space-y-4">
        <p className="-mt-3 text-[11px] text-slate-400">
          {employee ? `Cập nhật thông tin nhân viên ${employee.fullName}` : "Điền thông tin nhân viên để tạo hồ sơ và tự động kích hoạt tài khoản"}
        </p>

        {!employee ? (
          <div className="flex items-start gap-2.5 rounded-xl border border-brand-200/80 bg-gradient-to-r from-brand-50 to-orange-50 p-3 text-xs text-brand-900 shadow-xs">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
            <div>
              <strong className="text-brand-950">Tự động khởi tạo tài khoản & gửi Email:</strong>
              <p className="mt-0.5 text-[11px] text-brand-800">
                Hệ thống sẽ tự động tạo tài khoản User (quyền Nhân viên) và gửi Email chứa tên đăng nhập & mật khẩu khởi tạo trực tiếp đến Email dưới đây.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-600">
            <span>
              User ID liên kết: <strong className="font-mono text-slate-800">#{form.userId ?? "Chưa có"}</strong>
            </span>
            <span className="text-[11px] font-medium text-slate-400">Hồ sơ: {employee.employeeCode}</span>
          </div>
        )}

        <AvatarField
          avatar={form.avatar ?? ""}
          gender={form.gender}
          busy={uploading === "avatar"}
          onChange={(avatar) => set("avatar", avatar)}
          onUpload={(file) => void upload("avatar", file)}
        />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {text("employeeCode", <>Mã nhân viên <span className="text-rose-500">*</span></>, { required: true, placeholder: "VD: NV001" })}
          {text("fullName", <>Họ và tên <span className="text-rose-500">*</span></>, { required: true, placeholder: "VD: Nguyễn Văn A" })}
          {text("email", <>Email {!isEdit && <span className="text-rose-500">* (để nhận mật khẩu)</span>}</>, {
            required: !isEdit,
            type: "email",
            placeholder: "nhanvien@gmail.com",
          })}
          {text("phone", "Số điện thoại", { placeholder: "VD: 0987654321" })}
          {text("dateOfBirth", "Ngày sinh", { type: "date" })}
          <label className="text-xs font-bold text-slate-700">
            Giới tính
            <select value={form.gender ?? ""} onChange={(event) => set("gender", event.target.value)} className={inputClass}>
              <option value="">Chọn giới tính</option>
              <option value="MALE">Nam</option>
              <option value="FEMALE">Nữ</option>
              <option value="OTHER">Khác</option>
            </select>
          </label>
          {text("hireDate", "Ngày bắt đầu làm việc", { type: "date" })}
          <label className="text-xs font-bold text-slate-700">
            Trạng thái làm việc
            <select value={form.status} onChange={(event) => set("status", event.target.value)} className={inputClass}>
              <option value="ACTIVE">ACTIVE (Đang làm việc)</option>
              <option value="INACTIVE">INACTIVE (Tạm ngưng)</option>
              <option value="RESIGNED">RESIGNED (Đã nghỉ việc)</option>
            </select>
          </label>
          {text("address", "Địa chỉ", { placeholder: "VD: 123 Nguyễn Văn Cừ, Quận 5, TP.HCM" }, true)}

          <div className="space-y-3 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3.5 sm:col-span-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                <CreditCard className="h-4 w-4 text-brand-500" />
                Ảnh Căn cước công dân (CCCD / CMND)
              </span>
              <span className="text-[11px] text-slate-400">Tùy chọn tải lên định danh nhân sự</span>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <IdCardSide
                side="front"
                attachmentId={form.idCardFrontId}
                busy={uploading === "front"}
                onRemove={() => set("idCardFrontId", null)}
                onUpload={(file) => void upload("front", file)}
              />
              <IdCardSide
                side="back"
                attachmentId={form.idCardBackId}
                busy={uploading === "back"}
                onRemove={() => set("idCardBackId", null)}
                onUpload={(file) => void upload("back", file)}
              />
            </div>
          </div>

          <label className="text-xs font-bold text-slate-700">
            Cửa hàng phân bổ
            <select value={storeForm.storeId} onChange={(event) => setStoreForm({ ...storeForm, storeId: Number(event.target.value) })} className={inputClass}>
              <option value={0}>Chưa phân bổ</option>
              {stores.map((store) => (
                <option key={store.id} value={store.id}>
                  {value(store.storeName)} ({value(store.storeCode)})
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-bold text-slate-700">
            Ngày bắt đầu tại cửa hàng
            <input type="date" value={storeForm.startDate} onChange={(event) => setStoreForm({ ...storeForm, startDate: event.target.value })} className={inputClass} />
          </label>
          <label className="text-xs font-bold text-slate-700 sm:col-span-2">
            Ghi chú
            <textarea rows={2} placeholder="Ghi chú thêm về nhân viên..." value={form.note ?? ""} onChange={(event) => set("note", event.target.value)} className={inputClass} />
          </label>
        </div>

        {error && <Alert>{error}</Alert>}

        <div className="flex justify-end gap-2 border-t border-slate-100 pt-2">
          <button type="button" onClick={onClose} className="btn btn-secondary btn-sm">
            Hủy
          </button>
          <button type="submit" disabled={saving || uploading === "avatar"} className="btn btn-primary btn-sm px-5">
            {saving ? "Đang lưu..." : isEdit ? "Cập nhật" : "Tạo nhân viên"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
