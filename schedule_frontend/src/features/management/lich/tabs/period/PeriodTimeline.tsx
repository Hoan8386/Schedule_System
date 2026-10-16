import React from "react";
import type { ScheduleRoundResponse } from "@/lib/api";
import { dateTimeRange, relId, text } from "@/lib/format";
import { phaseOf } from "../../constants";
import { useSchedule } from "../../ScheduleContext";
import { roundIdOfRound, sessionIdOfSession } from "../../useScheduleLookups";

interface Props {
  periodId: number;
  periodRange: string;
  effectiveRange: string | null;
  rounds: ScheduleRoundResponse[];
}

function Dot({ className }: { className: string }) {
  return <span className={`absolute left-[-1.4rem] top-1 h-3 w-3 rounded-full border-2 border-white ${className}`} />;
}

/** Dòng thời gian của kỳ: Kỳ (đợt đăng ký → các phiên; duyệt) → Áp dụng. */
export function PeriodTimeline({ periodId, periodRange, effectiveRange, rounds }: Props) {
  const { lookups, openModal } = useSchedule();

  return (
    <div className="rounded-xl border border-slate-200 p-3">
      <p className="mb-3 text-[11px] font-black uppercase tracking-wider text-slate-500">Mốc thời gian</p>
      <ol className="relative space-y-3 border-l-2 border-slate-200 pl-4">
        <li className="relative">
          <Dot className="bg-slate-400" />
          <p className="text-xs font-bold text-slate-700">Kỳ đăng ký & duyệt</p>
          <p className="text-[11px] text-slate-500">{periodRange}</p>
        </li>

        {rounds.length === 0 ? (
          <li className="relative">
            <Dot className="bg-brand-300" />
            <div className="flex items-center gap-2">
              <p className="text-xs text-slate-400">Chưa có đợt đăng ký</p>
              <button
                type="button"
                onClick={() => openModal("round", { schedulePeriodId: periodId, status: "OPEN" }, true)}
                className="text-[11px] font-bold text-brand-700 hover:underline"
              >
                + Tạo đợt
              </button>
            </div>
          </li>
        ) : (
          rounds.map((round) => {
            const roundId = roundIdOfRound(round);
            const sessions = lookups.sessionsByRound.get(roundId) ?? [];
            const phase = phaseOf(round.registrationStartAt, round.registrationEndAt);
            return (
              <li key={roundId} className="relative">
                <Dot className="bg-brand-500" />
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-xs font-bold text-slate-800">{text(round.roundName, `Đợt #${roundId}`)}</p>
                  <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ${phase.badge}`}>{phase.label}</span>
                  {round.storeName && <span className="text-[10px] text-slate-400">{round.storeName}</span>}
                </div>
                <p className="text-[11px] text-slate-500">{dateTimeRange(round.registrationStartAt, round.registrationEndAt)}</p>
                {sessions.length === 0 ? (
                  <p className="mt-1 text-[10px] italic text-slate-400">Không chia phiên – mọi nhóm ca đăng ký trong cả đợt</p>
                ) : (
                  <ul className="mt-1.5 space-y-1">
                    {sessions.map((session) => {
                      const sessionId = sessionIdOfSession(session);
                      return (
                        <li key={sessionId} className="flex flex-wrap items-center gap-2 rounded-lg bg-slate-50 px-2 py-1 text-[10px]">
                          <span className="font-bold text-slate-700">{text(session.sessionName, `Phiên #${sessionId}`)}</span>
                          <span className="rounded bg-violet-100 px-1.5 py-0.5 font-semibold text-violet-700">
                            {text(session.shiftGroupName ?? lookups.groupNameOf(relId(session, "shiftGroup")), "Mọi nhóm ca")}
                          </span>
                          <span className="text-slate-500">{dateTimeRange(session.sessionOpenAt, session.sessionCloseAt)}</span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })
        )}

        <li className="relative">
          <Dot className="bg-emerald-500" />
          <p className="text-xs font-bold text-emerald-700">Áp dụng lịch</p>
          <p className="text-[11px] text-slate-500">{effectiveRange ?? "Chưa thiết lập thời gian áp dụng"}</p>
        </li>
      </ol>
    </div>
  );
}
