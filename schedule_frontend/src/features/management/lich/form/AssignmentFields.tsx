import React, { useState } from "react";
import { Field, Select } from "@/components/ui";
import { relId, text } from "@/lib/format";
import { STATUS_OPTIONS, type Entity } from "../constants";
import { useSchedule } from "../ScheduleContext";
import { defaultValueOf, type FieldFactory } from "./fieldFactory";

/**
 * Phân bổ nhân viên vào ca theo ngày: chỉ liệt kê nhân viên thuộc nhóm ca của ca đó
 * (backend kiểm tra lại) và chưa có trong ca.
 */
export function AssignmentFields({ f, item }: { f: FieldFactory; item?: Entity }) {
  const { lookups, shiftDates } = useSchedule();
  const [shiftDateId, setShiftDateId] = useState(defaultValueOf(item, "shiftByDate"));
  const currentEmployee = Number(defaultValueOf(item, "employee") || 0);

  const shiftDate = shiftDates.find((entry) => Number(entry.id ?? entry.shiftByDateId ?? 0) === Number(shiftDateId));
  const groupId = shiftDate ? lookups.groupIdOf(shiftDate) : 0;
  const group = groupId ? lookups.maps.group.get(groupId) : undefined;
  const members = new Set<number>(group?.employeeIds ?? []);
  const taken = new Set(
    shiftDate ? lookups.activeAssignmentsOf(shiftDate).map((assignment) => relId(assignment, "employee")) : []
  );
  const employees = lookups.options.employees.filter(
    (option) =>
      Number(option.value) === currentEmployee ||
      ((!groupId || members.has(Number(option.value))) && !taken.has(Number(option.value)))
  );

  return (
    <>
      <Field label="Ca theo ngày">
        <Select
          name="shiftByDate"
          required
          value={shiftDateId}
          onChange={(event) => setShiftDateId(event.target.value)}
          options={lookups.options.shiftDates}
          placeholder="Chọn..."
        />
      </Field>
      <Field label={groupId ? `Nhân viên (nhóm ${text(group?.shiftGroupName, "")})` : "Nhân viên"}>
        <Select
          key={shiftDateId}
          name="employee"
          required
          defaultValue={currentEmployee ? String(currentEmployee) : ""}
          options={employees}
          placeholder={employees.length ? "Chọn..." : "Không còn nhân viên nào của nhóm ca để phân bổ"}
        />
      </Field>
      {f.enumSelect("status", "Trạng thái", STATUS_OPTIONS.assignment)}
      {f.input("note", "Ghi chú")}
      {f.input("cancellationReason", "Lý do hủy (khi hủy)")}
    </>
  );
}
