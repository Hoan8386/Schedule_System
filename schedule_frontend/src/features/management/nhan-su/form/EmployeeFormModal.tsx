"use client";

import React, { useState } from "react";
import { CreditCard, PenLine, Sparkles, Store } from "lucide-react";
import { Alert, Modal, useConfirm } from "@/components/ui";
import { managerApi, type EmployeeRequest, type EmployeeResponse, type EmployeeStoreResponse, type StoreResponse } from "@/lib/api";
import {
  activeAssignmentsOf,
  attachmentUrl,
  GENDER_OPTIONS,
  POSITION_OPTIONS,
  positionName,
  STATUS_OPTIONS,
  toEmployeeForm,
  value,
} from "../utils";
import { AttachmentSlot, AvatarField, IdCardSide } from "./ImageUploadFields";

interface Props {
  /** null = tạo mới */
  employee: EmployeeResponse | null;
  assignments: EmployeeStoreResponse[];
  stores: StoreResponse[];
  onClose: () => void;
  onSaved: (message: string) => void;
}

type UploadTarget = "avatar" | "front" | "back" | "signature";

const inputClass = "mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-normal";
const required = <span className="text-rose-500">*</span>;

export function EmployeeFormModal({ employee, assignments, stores, onClose, onSaved }: Props) {
  const isEdit = Boolean(employee);
  const currentAssignments = activeAssignmentsOf(assignments);
  const initialStoreIds = [...new Set(currentAssignments.map((assignment) => assignment.storeId))];
  const [form, setForm] = useState<EmployeeRequest>(() => toEmployeeForm(employee));
  const [storeIds, setStoreIds] = useState<number[]>(initialStoreIds);
  const [primaryStoreId, setPrimaryStoreId] = useState<number | null>(
    currentAssignments.find((assignment) => assignment.isPrimary)?.storeId ?? initialStoreIds[0] ?? null
  );
  const [storeStartDate, setStoreStartDate] = useState("");
  const [uploading, setUploading] = useState<UploadTarget | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const { confirm, dialog } = useConfirm();

  const set = <K extends keyof EmployeeRequest>(key: K, next: EmployeeRequest[K]) => setForm((prev) => ({ ...prev, [key]: next }));
  const storeName = (id: number) => value(stores.find((store) => store.id === id)?.storeName, `Cửa hàng #${id}`);

  const toggleStore = (id: number) => {
    const next = storeIds.includes(id) ? storeIds.filter((storeId) => storeId !== id) : [...storeIds, id];
    setStoreIds(next);
    if (!next.includes(primaryStoreId ?? -1)) setPrimaryStoreId(next[0] ?? null);
  };

  const upload = async (target: UploadTarget, file: File) => {
    setUploading(target);
    setError("");
    try {
      const { data } = await managerApi.uploadAttachment(file);
      if (target === "avatar") {
        const url = attachmentUrl(data);
        if (url) set("avatar", url);
      } else if (data?.attachmentId) {
        const key = target === "front" ? "idCardFrontId" : target === "back" ? "idCardBackId" : "signatureId";
        set(key, data.attachmentId);
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Tải ảnh lên thất bại");
    } finally {
      setUploading(null);
    }
  };

  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.fullName?.trim()) return setError("Vui lòng nhập Họ và tên.");
    if (!form.dateOfBirth) return setError("Vui lòng nhập Ngày sinh.");
    if (!form.gender) return setError("Vui lòng chọn Giới tính.");
    if (!form.position) return setError("Vui lòng chọn Vị trí của nhân viên.");
    if (!isEdit && !form.email?.trim()) {
      return setError("Vui lòng nhập Email để hệ thống tạo tài khoản và gửi thông tin đăng nhập cho nhân viên.");
    }

    let status = form.status;
    // Đổi vị trí → quyền tài khoản đổi theo
    if (isEdit && employee?.position && form.position !== employee.position) {
      const ok = await confirm({
        title: "Xác nhận đổi vị trí",
        message: (
          <>
            Đổi vị trí của <b>{form.fullName}</b> từ <b>{positionName(employee.position)}</b> sang <b>{positionName(form.position)}</b>?
            Quyền đăng nhập của tài khoản sẽ thay đổi theo vị trí mới.
          </>
        ),
        confirmLabel: "Đổi vị trí",
      });
      if (!ok) return;
    }
    // Bỏ cửa hàng đang làm → xác nhận
    const removed = initialStoreIds.filter((id) => !storeIds.includes(id));
    const added = storeIds.filter((id) => !initialStoreIds.includes(id));
    if (isEdit && (removed.length > 0 || added.length > 0) && storeIds.length > 0) {
      const ok = await confirm({
        title: "Xác nhận thay đổi cửa hàng phân bổ",
        message: (
          <ul className="list-disc space-y-1 pl-4">
            {added.length > 0 && <li>Thêm vào: <b>{added.map(storeName).join(", ")}</b></li>}
            {removed.length > 0 && <li>Rời khỏi: <b>{removed.map(storeName).join(", ")}</b></li>}
          </ul>
        ),
      });
      if (!ok) return;
    }
    // Nhân viên đang làm việc phải thuộc ít nhất một cửa hàng
    if (status === "ACTIVE" && storeIds.length === 0) {
      const ok = await confirm({
        tone: "danger",
        title: "Nhân viên chưa thuộc cửa hàng nào",
        message: (
          <>
            Nhân viên đang làm việc phải thuộc ít nhất <b>1 cửa hàng</b>. Nếu tiếp tục lưu mà không chọn cửa hàng,
            <b> {form.fullName}</b> sẽ được chuyển sang trạng thái <b>Tạm nghỉ</b>.
          </>
        ),
        confirmLabel: "Lưu và chuyển tạm nghỉ",
      });
      if (!ok) return;
      status = "INACTIVE";
    }

    setSaving(true);
    setError("");
    try {
      const payload: EmployeeRequest = {
        ...form,
        status,
        storeIds,
        primaryStoreId,
        storeStartDate: storeStartDate || null,
      };
      if (employee) await managerApi.updateEmployee(employee.id, payload);
      else await managerApi.createEmployee(payload);
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

  const select = (key: keyof EmployeeRequest, label: React.ReactNode, options: { value: string; label: string }[], placeholder?: string) => (
    <label className="text-xs font-bold text-slate-700">
      {label}
      <select value={String(form[key] ?? "")} onChange={(event) => set(key, event.target.value as never)} className={inputClass} required={Boolean(placeholder)}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </label>
  );

  const busy = uploading !== null;

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
                Hệ thống tự sinh mã nhân viên, tạo tài khoản với quyền theo <b>vị trí</b> bạn chọn bên dưới và gửi Email chứa tên đăng nhập &
                mật khẩu khởi tạo đến Email của nhân viên.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-600">
            <span>
              Mã nhân viên: <strong className="font-mono text-slate-800">{value(employee.employeeCode)}</strong>
            </span>
            <span className="text-[11px] font-medium text-slate-400">Mã do hệ thống tự sinh, không chỉnh sửa</span>
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
          {text("fullName", <>Họ và tên {required}</>, { required: true, placeholder: "VD: Nguyễn Văn A" })}
          {select("position", <>Vị trí {required}</>, POSITION_OPTIONS, "Chọn vị trí")}
          {text("email", <>Email {!isEdit && <span className="text-rose-500">* (để nhận mật khẩu)</span>}</>, {
            required: !isEdit,
            type: "email",
            placeholder: "nhanvien@gmail.com",
          })}
          {text("phone", "Số điện thoại", { placeholder: "VD: 0987654321" })}
          {text("dateOfBirth", <>Ngày sinh {required}</>, { type: "date", required: true, max: new Date().toISOString().slice(0, 10) })}
          {select("gender", <>Giới tính {required}</>, GENDER_OPTIONS, "Chọn giới tính")}
          {text("hireDate", "Ngày bắt đầu làm việc", { type: "date" })}
          {select("status", "Trạng thái làm việc", STATUS_OPTIONS)}
          {text("address", "Địa chỉ", { placeholder: "VD: 123 Nguyễn Văn Cừ, Quận 5, TP.HCM" }, true)}

          <div className="space-y-3 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3.5 sm:col-span-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                <CreditCard className="h-4 w-4 text-brand-500" />
                Ảnh Căn cước công dân & chữ ký
              </span>
              <span className="text-[11px] text-slate-400">Tùy chọn tải lên định danh nhân sự</span>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
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
              <AttachmentSlot
                title="Chữ ký"
                name="chữ ký"
                dotClass="bg-indigo-500"
                fit="contain"
                emptyIcon={PenLine}
                attachmentId={form.signatureId}
                busy={uploading === "signature"}
                onRemove={() => set("signatureId", null)}
                onUpload={(file) => void upload("signature", file)}
              />
            </div>
          </div>

          <div className="space-y-2 rounded-2xl border border-slate-200/80 p-3.5 sm:col-span-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                <Store className="h-4 w-4 text-emerald-600" />
                Cửa hàng phân bổ <span className="font-normal text-slate-400">(chọn một hoặc nhiều)</span>
              </span>
              <label className="flex items-center gap-2 text-[11px] font-semibold text-slate-500">
                Ngày bắt đầu tại cửa hàng mới
                <input type="date" value={storeStartDate} onChange={(event) => setStoreStartDate(event.target.value)} className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-normal" />
              </label>
            </div>
            {stores.length === 0 ? (
              <p className="text-[11px] text-slate-400">Chưa có cửa hàng nào.</p>
            ) : (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {stores.map((store) => {
                  const checked = storeIds.includes(store.id);
                  return (
                    <div
                      key={store.id}
                      className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-2 text-xs ${checked ? "border-brand-300 bg-brand-50/70" : "border-slate-200"}`}
                    >
                      <label className="flex min-w-0 cursor-pointer items-center gap-2 font-semibold text-slate-700">
                        <input type="checkbox" checked={checked} onChange={() => toggleStore(store.id)} className="h-4 w-4 accent-brand-500" />
                        <span className="truncate">{value(store.storeName)}</span>
                      </label>
                      {checked && (
                        <label className="flex shrink-0 cursor-pointer items-center gap-1 text-[10px] font-bold text-slate-500">
                          <input type="radio" name="primaryStore" checked={primaryStoreId === store.id} onChange={() => setPrimaryStoreId(store.id)} className="accent-brand-500" />
                          Cửa hàng chính
                        </label>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            {form.status === "ACTIVE" && storeIds.length === 0 && (
              <p className="text-[11px] font-semibold text-rose-600">Nhân viên đang làm việc phải thuộc ít nhất 1 cửa hàng.</p>
            )}
          </div>

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
          <button type="submit" disabled={saving || busy} className="btn btn-primary btn-sm px-5">
            {saving ? "Đang lưu..." : isEdit ? "Cập nhật" : "Tạo nhân viên"}
          </button>
        </div>
      </form>
      {dialog}
    </Modal>
  );
}
