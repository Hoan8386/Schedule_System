"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui";
import { managerApi } from "@/lib/api";
import { idOf, KIND_LABEL, type Kind } from "../constants";
import { useSchedule } from "../ScheduleContext";
import { fieldFactory } from "./fieldFactory";
import { ScheduleFormFields } from "./ScheduleFormFields";

/** Trường gửi lên backend dưới dạng số. */
const NUMERIC_FIELDS = [
  "store", "storeId", "shift", "schedulePeriod", "schedulePeriodId", "scheduleRound", "scheduleRoundId", "scheduleSession",
  "shiftByDate", "employee", "shiftGroup", "shiftGroupId", "capacity", "maxCapacity", "payRate", "employeeId",
  "assignmentId", "fromShiftAssignmentId", "toAssignmentId",
];

type Body = Record<string, unknown>;

const SAVE_ACTION: Record<Kind, { create: (body: Body) => Promise<unknown>; update: (id: number, body: Body) => Promise<unknown> }> = {
  period: { create: managerApi.createSchedulePeriod, update: managerApi.updateSchedulePeriod },
  shift: { create: managerApi.createShift, update: managerApi.updateShift },
  shiftDate: { create: managerApi.createShiftByDate, update: managerApi.updateShiftByDate },
  assignment: { create: managerApi.createShiftAssignment, update: managerApi.updateShiftAssignment },
  round: { create: managerApi.createScheduleRound, update: managerApi.updateScheduleRound },
  session: { create: managerApi.createScheduleSession, update: managerApi.updateScheduleSession },
  group: { create: managerApi.createShiftGroup, update: managerApi.updateShiftGroup },
  event: { create: managerApi.createSpecialEvent, update: managerApi.updateSpecialEvent },
  emergency: { create: managerApi.createEmergencyRequest, update: managerApi.updateEmergencyRequest },
};

/** FormData -> body: bỏ trường rỗng, ép kiểu số. */
function toBody(form: HTMLFormElement): Body {
  const body: Body = Object.fromEntries(new FormData(form).entries());
  Object.keys(body).forEach((key) => {
    if (body[key] === "") delete body[key];
    else if (NUMERIC_FIELDS.includes(key)) body[key] = Number(body[key]);
  });
  return body;
}

export function ScheduleFormModal() {
  const { modal, closeModal, reload, setError, lookups } = useSchedule();
  const [saving, setSaving] = useState(false);

  if (!modal) return null;
  const id = modal.item && !modal.isNew ? idOf(modal.item) : 0;

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const body = toBody(event.currentTarget);
      const action = SAVE_ACTION[modal.kind];
      await (id ? action.update(id, body) : action.create(body));
      closeModal();
      await reload();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể lưu dữ liệu");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open title={`${id ? "Chỉnh sửa" : "Thêm"} ${KIND_LABEL[modal.kind]}`} onClose={closeModal}>
      {/* key: mỗi lần mở là một form mới để defaultValue được áp dụng lại */}
      <form key={`${modal.kind}-${id}`} onSubmit={submit} className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <ScheduleFormFields kind={modal.kind} f={fieldFactory(modal.item)} options={lookups.options} />
        </div>
        <button type="submit" disabled={saving} className="btn btn-primary w-full py-3 text-sm font-black">
          {saving ? "Đang lưu..." : "Lưu"}
        </button>
      </form>
    </Modal>
  );
}
