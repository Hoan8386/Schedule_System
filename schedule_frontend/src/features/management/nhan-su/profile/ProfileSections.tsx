import React from "react";
import { Building2, Clock, MapPin, ShieldCheck, User as UserIcon } from "lucide-react";
import { managerApi, type EmployeeResponse, type EmployeeStoreResponse, type StoreResponse } from "@/lib/api";
import { date, dateTime, genderName, isActive, positionName, value } from "../utils";

function Section({ icon: Icon, iconClass, title, aside, children }: {
  icon: React.ComponentType<{ className?: string }>;
  iconClass: string;
  title: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
          <Icon className={`h-4 w-4 ${iconClass}`} />
          <span>{title}</span>
        </div>
        {aside}
      </div>
      {children}
    </div>
  );
}

function Info({ label, children, wide }: { label: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className={wide ? "sm:col-span-2" : undefined}>
      <span className="block text-[11px] text-slate-400">{label}</span>
      {children}
    </div>
  );
}

export function PersonalSection({ profile }: { profile: EmployeeResponse }) {
  return (
    <Section icon={UserIcon} iconClass="text-brand-500" title="Thông tin cá nhân">
      <div className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-2">
        <Info label="Họ và tên"><span className="font-semibold text-slate-700">{value(profile.fullName)}</span></Info>
        <Info label="Mã nhân sự"><span className="font-mono font-semibold text-slate-700">{value(profile.employeeCode)}</span></Info>
        <Info label="Giới tính"><span className="font-medium text-slate-700">{genderName(profile.gender)}</span></Info>
        <Info label="Ngày sinh"><span className="font-medium text-slate-700">{date(profile.dateOfBirth)}</span></Info>
        <Info label="Ngày bắt đầu làm việc"><span className="font-medium text-slate-700">{date(profile.hireDate)}</span></Info>
        <Info label="CCCD / CMND">
          <span className="font-medium text-slate-700">{profile.idCardFrontId || profile.idCardBackId ? "Đã lưu trữ hồ sơ định danh" : "Chưa cập nhật"}</span>
        </Info>
        <Info label="Chữ ký" wide>
          {profile.signatureId ? (
            // eslint-disable-next-line @next/next/no-img-element -- ảnh từ backend
            <img
              src={managerApi.getAttachmentFileUrl(profile.signatureId)}
              alt={`Chữ ký ${value(profile.fullName, "")}`}
              className="mt-1 h-20 max-w-60 rounded-lg border border-slate-200 bg-white object-contain p-1"
            />
          ) : (
            <span className="font-medium text-slate-700">Chưa cập nhật</span>
          )}
        </Info>
        <Info label="Địa chỉ liên hệ" wide>
          <div className="mt-0.5 flex items-start gap-1.5">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
            <span className="text-slate-700">{value(profile.address)}</span>
          </div>
        </Info>
      </div>
    </Section>
  );
}

export function AccountSection({ profile }: { profile: EmployeeResponse }) {
  return (
    <Section icon={ShieldCheck} iconClass="text-indigo-500" title="Tài khoản hệ thống & Đăng nhập">
      <div className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-2">
        <Info label="User ID liên kết">
          {profile.userId ? (
            <span className="rounded-lg border border-indigo-100 bg-indigo-50 px-2 py-0.5 font-mono font-bold text-indigo-600">#{profile.userId}</span>
          ) : (
            <span className="italic text-slate-400">Chưa liên kết User ID</span>
          )}
        </Info>
        <Info label="Email đăng nhập"><span className="font-medium text-slate-700">{value(profile.email)}</span></Info>
        <Info label="Số điện thoại liên hệ"><span className="font-medium text-slate-700">{value(profile.phone)}</span></Info>
        <Info label="Vị trí">
          <span className="font-medium text-slate-700">{positionName(profile.position)}</span>
        </Info>
      </div>
    </Section>
  );
}

export function StoreSection({ assignments, storeMap }: { assignments: EmployeeStoreResponse[]; storeMap: Map<number, StoreResponse> }) {
  return (
    <Section
      icon={Building2}
      iconClass="text-emerald-500"
      title="Cửa hàng phân bổ công tác"
      aside={<span className="text-[11px] text-slate-400">{assignments.length} chi nhánh</span>}
    >
      {assignments.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center text-xs text-slate-400">Nhân viên hiện chưa được phân bổ vào cửa hàng nào.</div>
      ) : (
        <div className="space-y-2">
          {assignments.map((assignment) => {
            const store = storeMap.get(assignment.storeId);
            return (
              <div
                key={assignment.employeeStoreId}
                className="flex flex-col justify-between gap-2 rounded-xl border border-slate-200/80 bg-slate-50 p-3 sm:flex-row sm:items-center"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800">{store?.storeName ?? `Cửa hàng #${assignment.storeId}`}</span>
                    {store?.storeCode && <span className="rounded bg-slate-200 px-1.5 py-0.5 font-mono text-[10px] text-slate-600">{store.storeCode}</span>}
                    {assignment.isPrimary && (
                      <span className="rounded-full border border-brand-200 bg-brand-100 px-1.5 py-0.5 text-[10px] font-bold text-brand-800">Chi nhánh chính</span>
                    )}
                  </div>
                  {store?.address && (
                    <p className="flex items-center gap-1 text-[11px] text-slate-500">
                      <MapPin className="h-3 w-3 shrink-0 text-slate-400" />
                      <span>{store.address}</span>
                    </p>
                  )}
                  <p className="text-[11px] text-slate-400">
                    Bắt đầu: {date(assignment.startDate)}
                    {assignment.endDate ? ` · Kết thúc: ${date(assignment.endDate)}` : " · Đang công tác"}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-md px-2 py-0.5 text-[10px] font-bold ${isActive(assignment.status) ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"}`}
                >
                  {isActive(assignment.status ?? "ACTIVE") ? "Đang làm" : "Đã rời"}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </Section>
  );
}

export function NoteSection({ profile }: { profile: EmployeeResponse }) {
  return (
    <Section icon={Clock} iconClass="text-slate-400" title="Ghi chú & Dấu thời gian">
      <div className="space-y-2 text-xs">
        <Info label="Ghi chú hồ sơ">
          <p className="mt-0.5 whitespace-pre-wrap rounded-xl border border-slate-200/60 bg-slate-50 p-2.5 text-xs text-slate-700">
            {profile.note ? profile.note : "Không có ghi chú thêm."}
          </p>
        </Info>
        <div className="grid grid-cols-1 gap-2 pt-1 text-[11px] text-slate-400 sm:grid-cols-2">
          <div>
            Ngày tạo: <span className="font-medium text-slate-600">{dateTime(profile.createdAt)}</span>
          </div>
          <div>
            Cập nhật gần nhất: <span className="font-medium text-slate-600">{dateTime(profile.updatedAt)}</span>
          </div>
        </div>
      </div>
    </Section>
  );
}
