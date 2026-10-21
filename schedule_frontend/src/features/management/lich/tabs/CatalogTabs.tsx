import React, { useState } from "react";
import { AlertTriangle, Award, Users } from "lucide-react";
import { formatDate, relId, text, timeRange } from "@/lib/format";
import { useSchedule } from "../ScheduleContext";
import { AddButton, EntityActions } from "../components/EntityActions";
import { GroupMembersModal } from "../components/GroupMembersModal";
import { TabSection } from "../components/TabSection";
import { StoreFilter } from "../components/StoreFilter";

/** Tab nhóm ca */
export function GroupTab() {
  const { shiftGroups, shifts, reload, openModal } = useSchedule();
  const [membersOf, setMembersOf] = useState<number | null>(null);
  const selectedGroup = shiftGroups.find((group) => Number(group.id ?? group.shiftGroupId ?? 0) === membersOf);
  return (
    <TabSection title={`Nhóm ca (${shiftGroups.length})`} icon={Award} actions={
        <>
          <StoreFilter />
          <AddButton kind="group" className="" />
        </>
      }
    >
      {membersOf && selectedGroup && (
        <GroupMembersModal
          groupId={membersOf}
          groupName={text(selectedGroup.shiftGroupName, `Nhóm ca #${membersOf}`)}
          storeId={Number(selectedGroup.storeId ?? 0)}
          storeName={selectedGroup.storeName}
          memberIds={selectedGroup.employeeIds ?? []}
          onClose={() => setMembersOf(null)}
          onSaved={() => void reload()}
        />
      )}
      {shiftGroups.map((item) => {
        const id = Number(item.id ?? item.shiftGroupId ?? 0);
        const groupShifts = shifts
          .filter((shift) => relId(shift, "shiftGroup") === id)
          .sort((a, b) => String(a.startTime ?? "").localeCompare(String(b.startTime ?? "")));
        const memberCount = item.employeeIds?.length ?? 0;
        return (
          <div key={id} className="tile flex flex-col">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-black text-slate-800">{text(item.shiftGroupName, `Nhóm ca #${id}`)}</p>
                <p className="mt-1 text-[11px] text-slate-500">{text(item.shiftGroupCode)}</p>
              </div>
              <EntityActions kind="group" item={item} />
            </div>
            <div className="mt-2 flex flex-wrap gap-1 text-[10px]">
              <span className="rounded bg-brand-100 px-1.5 py-0.5 text-brand-800">{text(item.storeName, "Chưa gán cửa hàng")}</span>
              <span className="rounded bg-violet-100 px-1.5 py-0.5 text-violet-700">{groupShifts.length} ca</span>
              <span className="rounded bg-blue-50 px-1.5 py-0.5 text-blue-700">{memberCount} nhân viên</span>
            </div>
            {item.description && <p className="mt-2 text-[11px] text-slate-600">{item.description}</p>}
            <div className="mt-3 space-y-1">
              {groupShifts.length === 0 ? (
                <p className="text-[10px] italic text-slate-400">Nhóm chưa có ca</p>
              ) : (
                groupShifts.map((shift) => {
                  const shiftId = Number(shift.id ?? shift.shiftId ?? 0);
                  return (
                    <div key={shiftId} className="flex items-center justify-between gap-2 rounded-lg bg-white px-2 py-1 text-[10px]">
                      <span className="truncate font-bold text-slate-700">{text(shift.shiftName, `Ca #${shiftId}`)}</span>
                      <span className="shrink-0 text-slate-500">
                        {timeRange(shift.startTime, shift.endTime)} · {text(shift.maxCapacity, "0")} người
                      </span>
                    </div>
                  );
                })
              )}
            </div>
            <div className="mt-auto flex items-center justify-between gap-2 pt-3 text-[11px]">
              <div className="flex gap-1">
                <span className="badge badge-info text-[11px]">{text(item.status)}</span>
                {item.payRate != null && <span className="badge badge-neutral text-[11px]">{Number(item.payRate).toLocaleString("vi-VN")}đ/giờ</span>}
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => openModal("shift", { storeId: item.storeId, shiftGroupId: id, status: "ACTIVE" }, true)}
                  className="font-bold text-violet-700 hover:underline"
                >
                  + Ca
                </button>
                <button type="button" onClick={() => setMembersOf(id)} className="inline-flex items-center gap-1 font-bold text-violet-700 hover:underline">
                  <Users className="h-3 w-3" />
                  Gán nhân viên
                </button>
              </div>
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
    <TabSection title={`Sự kiện đặc biệt (${specialEvents.length})`} icon={AlertTriangle} iconClassName="text-orange-600" actions={
        <>
          <span className="self-end pb-2 text-[11px] text-slate-400">Sự kiện áp dụng toàn chuỗi</span>
          <AddButton kind="event" className="" />
        </>
      }
    >
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
