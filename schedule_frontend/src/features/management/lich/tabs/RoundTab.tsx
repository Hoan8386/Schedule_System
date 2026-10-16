import React, { useState } from "react";
import { CalendarRange, Plus } from "lucide-react";
import { Button } from "@/components/ui";
import { dateTimeRange, formatDateTime, relId, text } from "@/lib/format";
import { phaseOf } from "../constants";
import { useSchedule } from "../ScheduleContext";
import { EntityActions } from "../components/EntityActions";
import { FilterSelect } from "../components/FilterSelect";
import { TabSection } from "../components/TabSection";
import { roundIdOfRound, sessionIdOfSession } from "../useScheduleLookups";

export function RoundTab() {
  const { rounds, shiftDates, lookups, openModal } = useSchedule();
  const [periodId, setPeriodId] = useState("");
  const filtered = rounds.filter((round) => !periodId || relId(round, "schedulePeriod") === Number(periodId));

  return (
    <TabSection
      title={`Đợt đăng ký lịch (${rounds.length})`}
      icon={CalendarRange}
      actions={
        <>
          <FilterSelect label="Kỳ lập lịch" allLabel="Tất cả kỳ" className="min-w-52" value={periodId} onChange={setPeriodId} options={lookups.options.periods} />
          <Button size="sm" icon={Plus} onClick={() => openModal("round", periodId ? { schedulePeriodId: Number(periodId) } : undefined, true)}>
            Thêm
          </Button>
        </>
      }
    >
      {filtered.map((item) => {
        const id = roundIdOfRound(item);
        const periodName = item.periodName ?? lookups.maps.period.get(relId(item, "schedulePeriod"))?.periodName;
        const storeName = item.storeName ?? lookups.maps.store.get(relId(item, "store"))?.storeName;
        const sessions = lookups.sessionsByRound.get(id) ?? [];
        const phase = phaseOf(item.registrationStartAt, item.registrationEndAt);
        const shiftCount = shiftDates.filter((shiftDate) => lookups.roundIdOf(shiftDate) === id).length;

        return (
          <div key={id} className="tile flex flex-col">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-black text-slate-800">{text(item.roundName, `Đợt #${id}`)}</p>
                <p className="mt-1 text-[11px] text-slate-500">{dateTimeRange(item.registrationStartAt, item.registrationEndAt)}</p>
              </div>
              <EntityActions kind="round" item={item} />
            </div>
            <div className="mt-2 flex flex-wrap gap-1 text-[10px]">
              <span className="rounded bg-slate-200/70 px-1.5 py-0.5 text-slate-600">Kỳ: {text(periodName, "chưa gán")}</span>
              <span className="rounded bg-brand-100 px-1.5 py-0.5 text-brand-800">{text(storeName, "Chưa gán cửa hàng")}</span>
              <span className="rounded bg-blue-50 px-1.5 py-0.5 text-blue-700">{shiftCount} ca</span>
            </div>
            {item.description && <p className="mt-2 text-[11px] text-slate-600">{item.description}</p>}
            <div className="mt-3 space-y-1">
              {sessions.length === 0 ? (
                <p className="text-[10px] italic text-slate-400">Không chia phiên – mọi nhóm ca đăng ký trong cả đợt</p>
              ) : (
                sessions.map((session) => {
                  const sessionId = sessionIdOfSession(session);
                  return (
                    <div key={sessionId} className="flex items-center justify-between gap-2 rounded-lg bg-white px-2 py-1 text-[10px]">
                      <span className="truncate font-bold text-slate-700">{text(session.sessionName, `Phiên #${sessionId}`)}</span>
                      <span className="shrink-0 text-slate-500">{formatDateTime(session.sessionOpenAt)}</span>
                    </div>
                  );
                })
              )}
            </div>
            <div className="mt-auto flex items-center justify-between gap-2 pt-3 text-[11px]">
              <div className="flex gap-1">
                <span className="badge badge-brand text-[11px]">{text(item.status)}</span>
                <span className={`badge text-[11px] ${phase.badge}`}>{phase.label}</span>
              </div>
              <button type="button" onClick={() => openModal("session", { scheduleRoundId: id, status: "PENDING" }, true)} className="font-bold text-violet-700 hover:underline">
                + Phiên
              </button>
            </div>
          </div>
        );
      })}
    </TabSection>
  );
}
