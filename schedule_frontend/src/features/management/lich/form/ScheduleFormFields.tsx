import React, { useState } from "react";
import { Field, FormSection, Select } from "@/components/ui";
import { relId, text } from "@/lib/format";
import { STATUS_OPTIONS, TYPE_OPTIONS, type Entity, type Kind } from "../constants";
import { useSchedule } from "../ScheduleContext";
import type { ScheduleLookups } from "../useScheduleLookups";
import { defaultValueOf, type FieldFactory } from "./fieldFactory";

interface Props {
  kind: Kind;
  f: FieldFactory;
  options: ScheduleLookups["options"];
  /** Bản ghi đang sửa / dữ liệu điền sẵn */
  item?: Entity;
}

/** Các trường nhập theo từng loại bản ghi. */
export function ScheduleFormFields({ kind, f, options, item }: Props) {
  switch (kind) {
    case "period":
      return (
        <>
          {f.input("periodName", "Tên kỳ", "text", true)}
          <FormSection title="1. Thời gian áp dụng" hint="Thiết lập trước tiên – khoảng ngày lịch có hiệu lực (tối thiểu 1 tuần)" />
          {f.input("effectiveStartDate", "Áp dụng từ", "date", true)}
          {f.input("effectiveEndDate", "Áp dụng đến", "date", true)}
          <FormSection title="2. Khung thời gian của kỳ" hint="Bao gồm các đợt đăng ký và thời gian duyệt" />
          {f.input("startDate", "Kỳ bắt đầu", "date", true)}
          {f.input("endDate", "Kỳ kết thúc", "date", true)}
          <FormSection
            title="3. Đợt đăng ký cho toàn bộ cửa hàng"
            hint="Khi lưu, hệ thống tự tạo (hoặc cập nhật) một đợt đăng ký cho mỗi cửa hàng đang hoạt động theo thời gian dưới đây. Bỏ trống nếu muốn tự tạo đợt riêng."
          />
          {f.input("registrationOpenAt", "Mở đăng ký từ ngày", "date")}
          {f.input("registrationCloseAt", "Đóng đăng ký hết ngày", "date")}
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
          {f.input("registrationStartAt", "Bắt đầu đăng ký từ ngày", "date", true)}
          {f.input("registrationEndAt", "Kết thúc đăng ký hết ngày", "date", true)}
          {f.enumSelect("status", "Trạng thái", STATUS_OPTIONS.round)}
          {f.textarea("description", "Mô tả")}
          <p className="text-[10px] text-slate-400 sm:col-span-2">Đợt không có phiên: tất cả nhóm ca đều được đăng ký trong suốt đợt.</p>
        </>
      );

    case "session":
      return (
        <>
          <SessionRoundAndGroup item={item} roundOptions={options.rounds} />
          {f.wide(f.input("sessionName", "Tên phiên", "text", true))}
          {f.input("sessionOpenAt", "Mở phiên từ ngày", "date", true)}
          {f.input("sessionCloseAt", "Đóng phiên hết ngày", "date", true)}
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

/** Chọn đợt + nhóm ca của phiên: chỉ liệt kê nhóm ca thuộc cửa hàng của đợt đã chọn. */
function SessionRoundAndGroup({ item, roundOptions }: { item?: Entity; roundOptions: ScheduleLookups["options"]["rounds"] }) {
  const { shiftGroups, lookups } = useSchedule();
  const [roundId, setRoundId] = useState(() => defaultValueOf(item, "scheduleRoundId") || defaultValueOf(item, "scheduleRound"));

  const round = lookups.maps.round.get(Number(roundId));
  const storeId = round ? relId(round, "store") : 0;
  const storeName = round?.storeName ?? lookups.maps.store.get(storeId)?.storeName;
  const groupOptions = shiftGroups
    .filter((group) => !storeId || Number(group.storeId) === storeId)
    .map((group) => {
      const id = Number(group.id ?? group.shiftGroupId ?? 0);
      return { value: id, label: text(group.shiftGroupName, `Nhóm ca #${id}`) };
    });

  return (
    <>
      <Field label="Thuộc đợt">
        <Select
          name="scheduleRoundId"
          required
          value={roundId}
          onChange={(event) => setRoundId(event.target.value)}
          options={roundOptions}
          placeholder="Chọn..."
        />
      </Field>
      <Field label={storeName ? `Nhóm ca được đăng ký · ${storeName}` : "Nhóm ca được đăng ký"}>
        {/* key: đổi đợt thì làm mới lựa chọn nhóm ca */}
        <Select
          key={roundId}
          name="shiftGroupId"
          required
          defaultValue={defaultValueOf(item, "shiftGroupId") || defaultValueOf(item, "shiftGroup")}
          options={groupOptions}
          placeholder={!roundId ? "Chọn đợt trước" : groupOptions.length ? "Chọn..." : "Cửa hàng chưa có nhóm ca"}
          disabled={!roundId}
        />
      </Field>
    </>
  );
}
