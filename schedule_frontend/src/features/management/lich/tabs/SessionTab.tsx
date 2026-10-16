import React from "react";
import { Users } from "lucide-react";
import { dateTimeRange, relId, text } from "@/lib/format";
import { phaseOf } from "../constants";
import { useSchedule } from "../ScheduleContext";
import { AddButton, EntityActions } from "../components/EntityActions";
import { TabSection } from "../components/TabSection";
import { sessionIdOfSession } from "../useScheduleLookups";

export function SessionTab() {
  const { sessions, lookups } = useSchedule();

  return (
    <TabSection title={`Phiên đăng ký (${sessions.length})`} icon={Users} iconClassName="text-blue-600" actions={<AddButton kind="session" className="" />}>
      {sessions.map((item) => {
        const id = sessionIdOfSession(item);
        const phase = phaseOf(item.sessionOpenAt, item.sessionCloseAt);
        return (
          <div key={id} className="tile">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-black text-slate-800">{text(item.sessionName, `Phiên #${id}`)}</p>
                <p className="mt-1 text-[11px] text-slate-500">{dateTimeRange(item.sessionOpenAt, item.sessionCloseAt)}</p>
              </div>
              <EntityActions kind="session" item={item} />
            </div>
            <div className="mt-2 flex flex-wrap gap-1 text-[10px]">
              <span className="rounded bg-brand-100 px-1.5 py-0.5 text-brand-800">
                {text(item.roundName ?? lookups.roundNameOf(relId(item, "scheduleRound")), "Chưa gán đợt")}
              </span>
              <span className="rounded bg-violet-100 px-1.5 py-0.5 text-violet-700">
                {text(item.shiftGroupName ?? lookups.groupNameOf(relId(item, "shiftGroup")), "Chưa gán nhóm ca")}
              </span>
            </div>
            {item.description && <p className="mt-2 text-[11px] text-slate-600">{item.description}</p>}
            <div className="mt-3 flex items-center gap-1 text-[11px]">
              <span className="badge badge-info text-[11px]">{text(item.status)}</span>
              <span className={`badge text-[11px] ${phase.badge}`}>{phase.label}</span>
            </div>
          </div>
        );
      })}
    </TabSection>
  );
}
