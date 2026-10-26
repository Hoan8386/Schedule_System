import React from "react";
import type { ScheduleRoundResponse } from "@/lib/api";
import { dayKey, minuteKey, relId, shortDate, text, timeDate } from "@/lib/format";
import { windowStatusOf } from "../../constants";
import { useSchedule } from "../../ScheduleContext";
import { roundIdOfRound } from "../../useScheduleLookups";

interface Props {
  periodId: number;
  /** Thời gian của kỳ (đăng ký & duyệt) */
  periodStart: unknown;
  periodEnd: unknown;
  /** Thời gian áp dụng lịch */
  effectiveStart: unknown;
  effectiveEnd: unknown;
  rounds: ScheduleRoundResponse[];
}

function Dot({ className }: { className: string }) {
  return <span className={`absolute left-[-1.4rem] top-1 h-3 w-3 rounded-full border-2 border-white ${className}`} />;
}

/** Một mốc: dòng đầu là thời gian (trọng tâm), dòng hai là tiêu đề giữ màu của mốc. */
function Milestone({ dot, time, title, titleClass, children }: { dot: string; time: string; title: React.ReactNode; titleClass: string; children?: React.ReactNode }) {
  return (
    <li className="relative">
      <Dot className={dot} />
      <p className="text-xs font-black text-slate-800">{time}</p>
      <p className={`text-[11px] font-bold ${titleClass}`}>{title}</p>
      {children}
    </li>
  );
}

const dateRange = (start: unknown, end: unknown) => (dayKey(start) ? `${shortDate(start)} – ${shortDate(end)}` : "Chưa thiết lập");

/** Tên chung của các đợt cùng mốc: bỏ phần " · <cửa hàng>" ở cuối tên đợt. */
const baseRoundName = (round: ScheduleRoundResponse, storeName: string) => {
  const name = text(round.roundName, "Đợt đăng ký");
  return storeName && name.endsWith(` · ${storeName}`) ? name.slice(0, -` · ${storeName}`.length) : name;
};

/**
 * Dòng thời gian của kỳ: Kỳ đăng ký & duyệt → các đợt đăng ký → Áp dụng lịch.
 * Các đợt có cùng thời gian mở / đóng được gộp vào một mốc rồi rẽ nhánh theo cửa hàng.
 */
export function PeriodTimeline({ periodId, periodStart, periodEnd, effectiveStart, effectiveEnd, rounds }: Props) {
  const { lookups, openModal } = useSchedule();

  const years = [periodStart, periodEnd, effectiveStart, effectiveEnd]
    .map((value) => dayKey(value).slice(0, 4))
    .filter(Boolean)
    .sort();
  const yearLabel = years.length ? (years[0] === years[years.length - 1] ? years[0] : `${years[0]}–${years[years.length - 1]}`) : "";

  // Gộp đợt theo (mở, đóng), sắp theo thời gian mở
  const groups = new Map<string, { start: unknown; end: unknown; rounds: ScheduleRoundResponse[] }>();
  rounds.forEach((round) => {
    const key = `${minuteKey(round.registrationStartAt)}|${minuteKey(round.registrationEndAt)}`;
    const group = groups.get(key) ?? { start: round.registrationStartAt, end: round.registrationEndAt, rounds: [] };
    group.rounds.push(round);
    groups.set(key, group);
  });
  const roundGroups = [...groups.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([, group]) => group);

  return (
    <div className="rounded-xl border border-slate-200 p-3">
      <p className="mb-3 text-[11px] font-black uppercase tracking-wider text-slate-500">
        Mốc thời gian{yearLabel && <span className="normal-case tracking-normal"> (Năm {yearLabel})</span>}
      </p>
      <ol className="relative space-y-3 border-l-2 border-slate-200 pl-4">
        <Milestone dot="bg-slate-400" time={dateRange(periodStart, periodEnd)} title="Kỳ đăng ký & duyệt" titleClass="text-slate-500" />

        {roundGroups.length === 0 ? (
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
          roundGroups.map((group) => {
            const branches = group.rounds.map((round) => {
              const storeName = text(round.storeName ?? lookups.maps.store.get(relId(round, "store"))?.storeName, "");
              return { round, storeName, baseName: baseRoundName(round, storeName) };
            });
            const titles = [...new Set(branches.map((branch) => branch.baseName))];
            return (
              <Milestone
                key={`${minuteKey(group.start)}|${minuteKey(group.end)}`}
                dot="bg-brand-500"
                time={`${timeDate(group.start, false)} - ${timeDate(group.end, false)}`}
                title={titles.join(" / ")}
                titleClass="text-brand-700"
              >
                <ul className="mt-1.5 space-y-1 border-l border-dashed border-brand-200 pl-3">
                  {branches.map(({ round, storeName, baseName }) => {
                    const roundId = roundIdOfRound(round);
                    const status = windowStatusOf(round.status, round.registrationStartAt, round.registrationEndAt);
                    const sessionCount = (lookups.sessionsByRound.get(roundId) ?? []).length;
                    return (
                      <li key={roundId} className="relative flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px]">
                        <span className="absolute -left-3 top-1/2 w-2.5 border-t border-dashed border-brand-200" />
                        <span className="font-semibold text-slate-700">{storeName || (titles.length > 1 ? baseName : "Mọi cửa hàng")}</span>
                        <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ${status.badge}`}>{status.label}</span>
                        <span className="text-slate-400">{sessionCount > 0 ? `${sessionCount} phiên` : "Không chia phiên"}</span>
                      </li>
                    );
                  })}
                </ul>
              </Milestone>
            );
          })
        )}

        <Milestone dot="bg-emerald-500" time={dayKey(effectiveStart) ? dateRange(effectiveStart, effectiveEnd) : "Chưa thiết lập"} title="Áp dụng lịch" titleClass="text-emerald-700" />
      </ol>
    </div>
  );
}
