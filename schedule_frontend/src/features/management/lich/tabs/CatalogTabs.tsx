import React from "react";
import { AlertCircle, AlertTriangle, Award } from "lucide-react";
import { formatDate, text } from "@/lib/format";
import { useSchedule } from "../ScheduleContext";
import { AddButton, EntityActions } from "../components/EntityActions";
import { TabSection } from "../components/TabSection";

/** Tab nhóm ca */
export function GroupTab() {
  const { shiftGroups } = useSchedule();
  return (
    <TabSection title={`Nhóm ca (${shiftGroups.length})`} icon={Award} actions={<AddButton kind="group" className="" />}>
      {shiftGroups.map((item) => {
        const id = Number(item.id ?? item.shiftGroupId ?? 0);
        return (
          <div key={id} className="tile">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-black text-slate-800">{text(item.shiftGroupName, `Nhóm ca #${id}`)}</p>
                <p className="mt-1 text-[11px] text-slate-500">
                  {text(item.shiftGroupCode)}
                  {item.storeName ? ` · ${item.storeName}` : ""}
                </p>
              </div>
              <EntityActions kind="group" item={item} />
            </div>
            <p className="mt-3 text-[11px] text-slate-600">{text(item.description, "Không có mô tả")}</p>
            <div className="mt-3 flex items-center justify-between text-[11px] text-slate-600">
              <span className="badge badge-success text-[11px]">{text(item.status)}</span>
              <span>{text(item.payRate, "0đ")}</span>
            </div>
          </div>
        );
      })}
    </TabSection>
  );
}

/** Tab sự kiện đặc biệt */
export function EventTab() {
  const { specialEvents } = useSchedule();
  return (
    <TabSection title={`Sự kiện đặc biệt (${specialEvents.length})`} icon={AlertTriangle} iconClassName="text-orange-600" actions={<AddButton kind="event" className="" />}>
      {specialEvents.map((item) => {
        const id = Number(item.id ?? item.eventId ?? 0);
        return (
          <div key={id} className="tile">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-black text-slate-800">{text(item.eventName, `Sự kiện #${id}`)}</p>
                <p className="mt-1 text-[11px] text-slate-500">{text(item.eventType)}</p>
              </div>
              <EntityActions kind="event" item={item} />
            </div>
            <p className="mt-3 text-[11px] text-slate-600">{text(item.description, "Không có mô tả")}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-slate-500">
              <span className="rounded-full bg-slate-100 px-2 py-1">{formatDate(item.startDate)}</span>
              <span className="rounded-full bg-slate-100 px-2 py-1">{formatDate(item.endDate)}</span>
            </div>
          </div>
        );
      })}
    </TabSection>
  );
}

/** Tab yêu cầu khẩn cấp */
export function EmergencyTab() {
  const { emergencyRequests, lookups } = useSchedule();
  return (
    <TabSection
      title={`Yêu cầu khẩn cấp (${emergencyRequests.length})`}
      icon={AlertCircle}
      iconClassName="text-rose-600"
      layout="list"
      actions={<AddButton kind="emergency" className="" />}
    >
      {emergencyRequests.map((item) => {
        const id = Number(item.id ?? item.emergencyRequestId ?? 0);
        return (
          <div key={id} className="tile">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-black text-slate-800">{text(item.requestType, `Yêu cầu #${id}`)}</p>
                <p className="mt-1 text-[11px] text-slate-500">{item.employeeId ? lookups.employeeName(item.employeeId) : "Nhân viên —"}</p>
              </div>
              <EntityActions kind="emergency" item={item} />
            </div>
            <p className="mt-3 text-[11px] text-slate-600">{text(item.reason, "Không có lý do")}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px]">
              <span className="badge badge-danger text-[11px]">{text(item.status)}</span>
              <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-600">Từ #{text(item.fromShiftAssignmentId, "—")}</span>
              <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-600">Đến #{text(item.toAssignmentId, "—")}</span>
            </div>
          </div>
        );
      })}
    </TabSection>
  );
}
