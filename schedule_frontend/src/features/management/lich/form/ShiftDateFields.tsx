import React, { useState } from "react";
import { Field, Input, Select } from "@/components/ui";
import { dayKey, hhmm, relId, text } from "@/lib/format";
import { STATUS_OPTIONS, type Entity } from "../constants";
import { useSchedule } from "../ScheduleContext";
import { roundIdOfRound, sessionIdOfSession } from "../useScheduleLookups";
import { defaultValueOf, type FieldFactory } from "./fieldFactory";

const required = (label: string) => (
  <span>
    {label} <span className="text-rose-500">*</span>
  </span>
);

/**
 * Thêm / sửa ca theo ngày trên TKB.
 * - Cửa hàng lấy theo bộ lọc hiện tại của TKB.
 * - Chọn theo trình tự Kỳ* → Đợt* → Phiên → Ca mẫu* (chọn trước lọc sau).
 * - Bắt buộc mọi trường trừ đơn giá, số người tối đa, ghi chú; tên ca / giờ điền sẵn theo ca mẫu.
 */
export function ShiftDateFields({ f, item }: { f: FieldFactory; item?: Entity }) {
  const { lookups, storeFilter } = useSchedule();
  const initial = (key: string) => defaultValueOf(item, key);

  const initialShift = lookups.maps.shift.get(Number(initial("shift")));
  // Cửa hàng: theo ca mẫu đang sửa, không thì bộ lọc TKB (mặc định cửa hàng đầu tiên như TKB)
  const storeId = Number(
    (initialShift && Number(initialShift.storeId ?? 0)) || storeFilter || lookups.options.stores[0]?.value || 0
  );
  const initialRound = initial("scheduleRound");
  const roundPeriod = lookups.maps.round.get(Number(initialRound));

  const [periodId, setPeriodId] = useState(initial("schedulePeriod") || (roundPeriod ? String(relId(roundPeriod, "schedulePeriod")) : ""));
  const [roundId, setRoundId] = useState(initialRound);
  const [sessionId, setSessionId] = useState(initial("scheduleSession"));
  const [shiftId, setShiftId] = useState(initial("shift"));
  const [shiftName, setShiftName] = useState(initial("shiftName"));
  const [startTime, setStartTime] = useState(initial("startTime"));
  const [endTime, setEndTime] = useState(initial("endTime"));

  const period = lookups.maps.period.get(Number(periodId));
  const rounds = (lookups.roundsByPeriod.get(Number(periodId)) ?? []).filter(
    (round) => !relId(round, "store") || relId(round, "store") === storeId
  );
  const sessions = lookups.sessionsByRound.get(Number(roundId)) ?? [];
  const session = lookups.maps.session.get(Number(sessionId));
  const sessionGroup = session ? relId(session, "shiftGroup") : 0;
  // Ca mẫu của cửa hàng; chọn phiên của một nhóm ca thì chỉ còn ca mẫu của nhóm đó
  const templates = Array.from(lookups.maps.shift.values()).filter(
    (shift) =>
      Number(shift.storeId ?? 0) === storeId &&
      (!sessionGroup || relId(shift, "shiftGroup") === sessionGroup)
  );

  const pickPeriod = (value: string) => {
    setPeriodId(value);
    setRoundId("");
    setSessionId("");
  };
  const pickRound = (value: string) => {
    setRoundId(value);
    setSessionId("");
  };
  const pickSession = (value: string) => {
    setSessionId(value);
    const group = relId(lookups.maps.session.get(Number(value)) ?? {}, "shiftGroup");
    const current = lookups.maps.shift.get(Number(shiftId));
    if (group && current && relId(current, "shiftGroup") !== group) setShiftId("");
  };
  const pickShift = (value: string) => {
    setShiftId(value);
    const template = lookups.maps.shift.get(Number(value));
    if (!template) return;
    setShiftName(text(template.shiftName, ""));
    setStartTime(hhmm(template.startTime));
    setEndTime(hhmm(template.endTime));
  };

  const from = dayKey(period?.effectiveStartDate ?? period?.startDate);
  const to = dayKey(period?.effectiveEndDate ?? period?.endDate);

  return (
    <>
      <Field label="Cửa hàng (theo bộ lọc TKB)" className="sm:col-span-2">
        <Input value={text(lookups.maps.store.get(storeId)?.storeName, storeId ? `Cửa hàng #${storeId}` : "Chưa chọn cửa hàng")} readOnly disabled />
      </Field>
      <Field label={required("Kỳ")}>
        <Select
          name="schedulePeriod"
          required
          value={periodId}
          onChange={(event) => pickPeriod(event.target.value)}
          options={lookups.options.periods}
          placeholder="Chọn kỳ..."
        />
      </Field>
      <Field label={required("Đợt")}>
        <Select
          name="scheduleRound"
          required
          value={roundId}
          onChange={(event) => pickRound(event.target.value)}
          options={rounds.map((round) => ({ value: roundIdOfRound(round), label: text(round.roundName, `Đợt #${roundIdOfRound(round)}`) }))}
          placeholder={!periodId ? "Chọn kỳ trước" : rounds.length ? "Chọn đợt..." : "Kỳ chưa có đợt của cửa hàng này"}
          disabled={!periodId}
        />
      </Field>
      <Field label="Phiên">
        <Select
          name="scheduleSession"
          value={sessionId}
          onChange={(event) => pickSession(event.target.value)}
          options={sessions.map((item) => {
            const id = sessionIdOfSession(item);
            const group = relId(item, "shiftGroup");
            return { value: id, label: `${text(item.sessionName, `Phiên #${id}`)}${group ? ` · ${lookups.groupNameOf(group)}` : ""}` };
          })}
          placeholder={!roundId ? "Chọn đợt trước" : sessions.length ? "Không chọn phiên" : "Đợt không có phiên"}
          disabled={!roundId}
        />
      </Field>
      <Field label={required("Ca mẫu")}>
        <Select
          name="shift"
          required
          value={shiftId}
          onChange={(event) => pickShift(event.target.value)}
          options={templates.map((shift) => {
            const id = Number(shift.id ?? shift.shiftId ?? 0);
            const group = relId(shift, "shiftGroup");
            return {
              value: id,
              label: `${text(shift.shiftName, `Ca #${id}`)} · ${hhmm(shift.startTime)}–${hhmm(shift.endTime)}${group ? ` · ${lookups.groupNameOf(group)}` : ""}`,
            };
          })}
          placeholder={!roundId ? "Chọn đợt trước" : templates.length ? "Chọn ca mẫu..." : "Không có ca mẫu phù hợp"}
          disabled={!roundId}
        />
      </Field>
      <Field label={required("Ngày làm")}>
        <Input name="workDate" type="date" required min={from || undefined} max={to || undefined} defaultValue={dayKey(initial("workDate"))} />
      </Field>
      <Field label={required("Tên ca hiển thị")}>
        <Input name="shiftName" required value={shiftName} onChange={(event) => setShiftName(event.target.value)} />
      </Field>
      <Field label={required("Bắt đầu")}>
        <Input name="startTime" type="time" required value={startTime} onChange={(event) => setStartTime(event.target.value)} />
      </Field>
      <Field label={required("Kết thúc")}>
        <Input name="endTime" type="time" required value={endTime} onChange={(event) => setEndTime(event.target.value)} />
      </Field>
      {f.input("maxCapacity", "Số người tối đa", "number")}
      {f.input("payRate", "Đơn giá", "number")}
      {f.enumSelect("status", "Trạng thái", STATUS_OPTIONS.shiftDate)}
      {f.wide(f.input("managerNote", "Ghi chú"))}
    </>
  );
}
