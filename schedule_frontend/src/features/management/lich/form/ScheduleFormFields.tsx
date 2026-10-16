import React from "react";
import { FormSection } from "@/components/ui";
import { STATUS_OPTIONS, TYPE_OPTIONS, type Kind } from "../constants";
import type { ScheduleLookups } from "../useScheduleLookups";
import type { FieldFactory } from "./fieldFactory";

interface Props {
  kind: Kind;
  f: FieldFactory;
  options: ScheduleLookups["options"];
}

/** Các trường nhập theo từng loại bản ghi. */
export function ScheduleFormFields({ kind, f, options }: Props) {
  switch (kind) {
    case "period":
      return (
        <>
          {f.input("periodName", "Tên kỳ", "text", true)}
          {f.enumSelect("periodType", "Loại kỳ", TYPE_OPTIONS.period)}
          <FormSection title="1. Thời gian áp dụng" hint="Thiết lập trước tiên – khoảng ngày lịch có hiệu lực (tối thiểu 1 tuần)" />
          {f.input("effectiveStartDate", "Áp dụng từ", "date", true)}
          {f.input("effectiveEndDate", "Áp dụng đến", "date", true)}
          <FormSection title="2. Khung thời gian của kỳ" hint="Bao gồm các đợt đăng ký và thời gian duyệt" />
          {f.input("startDate", "Kỳ bắt đầu", "date", true)}
          {f.input("endDate", "Kỳ kết thúc", "date", true)}
          {f.input("registrationOpenAt", "Mở đăng ký", "datetime-local")}
          {f.input("registrationCloseAt", "Đóng đăng ký", "datetime-local")}
          {f.enumSelect("status", "Trạng thái", STATUS_OPTIONS.period)}
          {f.textarea("description", "Mô tả")}
        </>
      );

    case "shift":
      return (
        <>
          {f.select("store", "Cửa hàng", options.stores)}
          {f.select("shiftGroup", "Nhóm ca", options.groups, false)}
          {f.input("shiftCode", "Mã ca", "text", true)}
          {f.input("shiftName", "Tên ca", "text", true)}
          {f.input("startTime", "Bắt đầu", "time", true)}
          {f.input("endTime", "Kết thúc", "time", true)}
          {f.input("maxCapacity", "Số lượng", "number", true)}
          {f.input("payRate", "Lương theo giờ", "number")}
          {f.enumSelect("status", "Trạng thái", STATUS_OPTIONS.shift)}
        </>
      );

    case "shiftDate":
      return (
        <>
          {f.select("shift", "Ca mẫu", options.shifts)}
          {f.select("scheduleRound", "Đợt đăng ký", options.rounds, false)}
          {f.select("scheduleSession", "Phiên đăng ký", options.sessions, false)}
          {f.select("schedulePeriod", "Kỳ lập lịch (bỏ trống = theo đợt)", options.periods, false)}
          {f.input("workDate", "Ngày làm", "date", true)}
          {f.input("maxCapacity", "Số người tối đa", "number")}
          {f.input("shiftName", "Tên ca hiển thị")}
          {f.input("startTime", "Bắt đầu", "time")}
          {f.input("endTime", "Kết thúc", "time")}
          {f.input("payRate", "Đơn giá", "number")}
          {f.enumSelect("status", "Trạng thái", STATUS_OPTIONS.shiftDate)}
          {f.input("managerNote", "Ghi chú quản lý")}
        </>
      );

    case "assignment":
      return (
        <>
          {f.select("shiftByDate", "Ca theo ngày", options.shiftDates)}
          {f.select("employee", "Nhân viên", options.employees)}
          {f.enumSelect("status", "Trạng thái", STATUS_OPTIONS.assignment)}
          {f.input("note", "Ghi chú")}
          {f.input("cancellationReason", "Lý do hủy (khi hủy)")}
        </>
      );

    case "round":
      return (
        <>
          {f.select("schedulePeriodId", "Thuộc kỳ", options.periods)}
          {f.select("storeId", "Cửa hàng", options.stores)}
          {f.wide(f.input("roundName", "Tên đợt đăng ký", "text", true))}
          {f.input("registrationStartAt", "Bắt đầu đăng ký", "datetime-local", true)}
          {f.input("registrationEndAt", "Kết thúc đăng ký", "datetime-local", true)}
          {f.enumSelect("status", "Trạng thái", STATUS_OPTIONS.round)}
          {f.textarea("description", "Mô tả")}
          <p className="text-[10px] text-slate-400 sm:col-span-2">Đợt không có phiên: tất cả nhóm ca đều được đăng ký trong suốt đợt.</p>
        </>
      );

    case "session":
      return (
        <>
          {f.select("scheduleRoundId", "Thuộc đợt", options.rounds)}
          {f.select("shiftGroupId", "Nhóm ca được đăng ký", options.groups)}
          {f.wide(f.input("sessionName", "Tên phiên", "text", true))}
          {f.input("sessionOpenAt", "Mở phiên", "datetime-local", true)}
          {f.input("sessionCloseAt", "Đóng phiên", "datetime-local", true)}
          {f.enumSelect("status", "Trạng thái", STATUS_OPTIONS.session)}
          {f.textarea("description", "Mô tả")}
        </>
      );

    case "group":
      return (
        <>
          {f.select("storeId", "Cửa hàng", options.stores)}
          {f.input("shiftGroupCode", "Mã nhóm ca", "text", true)}
          {f.input("shiftGroupName", "Tên nhóm ca", "text", true)}
          {f.input("description", "Mô tả")}
          {f.input("payRate", "Mức lương", "number")}
          {f.enumSelect("status", "Trạng thái", STATUS_OPTIONS.group)}
        </>
      );

    case "event":
      return (
        <>
          {f.input("eventName", "Tên sự kiện", "text", true)}
          {f.input("description", "Mô tả")}
          {f.enumSelect("eventType", "Loại sự kiện", TYPE_OPTIONS.event)}
          {f.input("startDate", "Ngày bắt đầu", "date", true)}
          {f.input("endDate", "Ngày kết thúc", "date", true)}
          {f.enumSelect("status", "Trạng thái", STATUS_OPTIONS.event)}
        </>
      );

    case "emergency":
      return (
        <>
          {f.select("employeeId", "Nhân viên", options.employees)}
          {f.enumSelect("requestType", "Loại yêu cầu", TYPE_OPTIONS.emergency)}
          {f.input("fromShiftAssignmentId", "Phân bổ gốc (ID)", "number")}
          {f.input("toAssignmentId", "Phân bổ đích (ID)", "number")}
          {f.input("reason", "Lý do", "text", true)}
          {f.enumSelect("status", "Trạng thái", STATUS_OPTIONS.emergency)}
        </>
      );
  }
}
