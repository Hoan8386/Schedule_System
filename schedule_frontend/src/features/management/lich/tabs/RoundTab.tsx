import React, { useState } from "react";
import { CalendarRange, ChevronDown, Clock, Eye, Pencil, Plus, Trash2 } from "lucide-react";
import { Button, IconButton, Modal } from "@/components/ui";
import type { ScheduleRoundResponse } from "@/lib/api";
import { relId, text, timeDate, timeDateRange } from "@/lib/format";
import { windowStatusOf, type Entity } from "../constants";
import { useSchedule } from "../ScheduleContext";
import { FilterSelect } from "../components/FilterSelect";
import { TabSection } from "../components/TabSection";
import { StoreFilter } from "../components/StoreFilter";
import { roundIdOfRound, sessionIdOfSession } from "../useScheduleLookups";

export function RoundTab() {
  const { rounds, lookups, openModal } = useSchedule();
  const [periodId, setPeriodId] = useState("");
  const [detailId, setDetailId] = useState<number | null>(null);
  const filtered = rounds.filter((round) => !periodId || relId(round, "schedulePeriod") === Number(periodId));
  const detail = rounds.find((round) => roundIdOfRound(round) === detailId);

  return (
    <TabSection
      title={`Đợt đăng ký lịch (${rounds.length})`}
      icon={CalendarRange}
      actions={
        <>
          <StoreFilter />
          <FilterSelect label="Kỳ lập lịch" allLabel="Tất cả kỳ" className="min-w-52" value={periodId} onChange={setPeriodId} options={lookups.options.periods} />
          <Button size="sm" icon={Plus} onClick={() => openModal("round", periodId ? { schedulePeriodId: Number(periodId) } : undefined, true)}>
            Thêm
          </Button>
        </>
      }
    >
      {filtered.map((item) => (
        <RoundCard key={roundIdOfRound(item)} round={item} onDetail={() => setDetailId(roundIdOfRound(item))} />
      ))}
      {detail && <RoundDetailModal round={detail} onClose={() => setDetailId(null)} />}
    </TabSection>
  );
}

/** Dữ liệu hiển thị chung của một đợt (thẻ và popup chi tiết). */
function useRoundInfo(round: ScheduleRoundResponse) {
  const { shiftDates, lookups } = useSchedule();
  const id = roundIdOfRound(round);
  return {
    id,
    periodName: round.periodName ?? lookups.maps.period.get(relId(round, "schedulePeriod"))?.periodName,
    storeName: round.storeName ?? lookups.maps.store.get(relId(round, "store"))?.storeName,
    sessions: lookups.sessionsByRound.get(id) ?? [],
    status: windowStatusOf(round.status, round.registrationStartAt, round.registrationEndAt),
    shiftCount: shiftDates.filter((shiftDate) => lookups.roundIdOf(shiftDate) === id).length,
  };
}

function RoundCard({ round, onDetail }: { round: ScheduleRoundResponse; onDetail: () => void }) {
  const { openModal } = useSchedule();
  const { id, periodName, storeName, sessions, status, shiftCount } = useRoundInfo(round);
  const [sessionsOpen, setSessionsOpen] = useState(true);

  const addSession = () =>
    openModal(
      "session",
      {
        scheduleRoundId: id,
        sessionName: `Phiên ${sessions.length + 1}`,
        status: "OPEN",
        // Ô ngày tự lấy phần ngày từ giá trị ngày giờ của đợt
        sessionOpenAt: round.registrationStartAt,
        sessionCloseAt: round.registrationEndAt,
      },
      true
    );

  return (
    <div className="tile flex flex-col gap-2">
      {/* Tiêu đề: tên đợt bên trái, một trạng thái bên phải */}
      <div className="flex items-start justify-between gap-3">
        <p className="min-w-0 text-sm font-black leading-snug text-slate-800">{text(round.roundName, `Đợt #${id}`)}</p>
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${status.badge}`}>{status.label}</span>
      </div>

      <div className="flex flex-wrap gap-1 text-[10px]">
        <span className="rounded bg-slate-200/70 px-1.5 py-0.5 text-slate-600">Kỳ: {text(periodName, "chưa gán")}</span>
        <span className="rounded bg-brand-100 px-1.5 py-0.5 text-brand-800">{text(storeName, "Mọi cửa hàng")}</span>
        <span className="rounded bg-blue-50 px-1.5 py-0.5 text-blue-700">{shiftCount} ca</span>
      </div>

      <p className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600">
        <Clock className="h-3.5 w-3.5 shrink-0 text-slate-400" />
        {timeDateRange(round.registrationStartAt, round.registrationEndAt)}
      </p>

      <div className="rounded-lg border border-slate-200/80 bg-white">
        <button
          type="button"
          onClick={() => setSessionsOpen((open) => !open)}
          aria-expanded={sessionsOpen}
          className="flex w-full items-center justify-between px-2 py-1.5 text-[11px] font-bold text-slate-600"
        >
          <span>Phiên ({sessions.length})</span>
          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${sessionsOpen ? "rotate-180" : ""}`} />
        </button>
        {sessionsOpen && (
          <div className="space-y-1 border-t border-slate-100 p-1.5">
            {sessions.length === 0 ? (
              <p className="px-1 text-[10px] italic text-slate-400">Không chia phiên – mọi nhóm ca đăng ký trong cả đợt</p>
            ) : (
              sessions.map((session) => {
                const sessionId = sessionIdOfSession(session);
                const sessionStatus = windowStatusOf(session.status, session.sessionOpenAt, session.sessionCloseAt);
                return (
                  <div key={sessionId} className="flex items-center justify-between gap-2 rounded-md bg-slate-50 px-2 py-1 text-[10px]">
                    <span className="flex min-w-0 items-center gap-1.5">
                      <span className="truncate font-bold text-slate-700">{text(session.sessionName, `Phiên #${sessionId}`)}</span>
                      <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold ${sessionStatus.badge}`}>{sessionStatus.label}</span>
                    </span>
                    <span className="shrink-0 text-slate-500">{timeDate(session.sessionOpenAt)}</span>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Chức năng: thêm phiên bên trái; sửa và xem chi tiết bên phải */}
      <div className="mt-auto flex items-center justify-between gap-2 pt-1 text-[11px]">
        <button type="button" onClick={addSession} className="font-bold text-violet-700 hover:underline">
          + Phiên
        </button>
        <div className="flex gap-2">
          <IconButton icon={Pencil} label="Chỉnh sửa" tone="info" onClick={() => openModal("round", round as Entity)} />
          <IconButton icon={Eye} label="Xem chi tiết" onClick={onDetail} />
        </div>
      </div>
    </div>
  );
}

/** Popup chi tiết đợt: đầy đủ thông tin, các phiên (nhóm ca, thời gian) và thao tác sửa / xóa. */
function RoundDetailModal({ round, onClose }: { round: ScheduleRoundResponse; onClose: () => void }) {
  const { openModal, remove, lookups } = useSchedule();
  const { id, periodName, storeName, sessions, status, shiftCount } = useRoundInfo(round);
  const fields: [string, React.ReactNode][] = [
    ["Kỳ lập lịch", text(periodName, "Chưa gán")],
    ["Cửa hàng", text(storeName, "Mọi cửa hàng")],
    ["Thời gian đăng ký", timeDateRange(round.registrationStartAt, round.registrationEndAt)],
    ["Số ca", `${shiftCount} ca`],
    ["Mô tả", text(round.description, "Không có")],
  ];

  return (
    <Modal
      open
      size="max-w-2xl"
      onClose={onClose}
      title={
        <span className="flex flex-wrap items-center gap-2">
          {text(round.roundName, `Đợt #${id}`)}
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${status.badge}`}>{status.label}</span>
        </span>
      }
      footer={
        <div className="flex flex-wrap justify-between gap-2 border-t border-slate-100 pt-3">
          <Button
            variant="danger"
            size="sm"
            icon={Trash2}
            onClick={() => {
              onClose();
              void remove("round", id);
            }}
          >
            Xóa đợt
          </Button>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={onClose}>
              Đóng
            </Button>
            <Button
              size="sm"
              icon={Pencil}
              onClick={() => {
                onClose();
                openModal("round", round as Entity);
              }}
            >
              Chỉnh sửa
            </Button>
          </div>
        </div>
      }
    >
      <dl className="grid grid-cols-1 gap-x-6 gap-y-3 rounded-xl border border-slate-100 bg-slate-50 p-4 text-xs sm:grid-cols-2">
        {fields.map(([label, value]) => (
          <div key={label}>
            <dt className="text-[10px] font-bold uppercase text-slate-400">{label}</dt>
            <dd className="mt-0.5 font-semibold text-slate-800">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="space-y-2">
        <p className="text-xs font-black text-slate-700">Phiên đăng ký ({sessions.length})</p>
        {sessions.length === 0 ? (
          <p className="text-[11px] italic text-slate-400">Không chia phiên – mọi nhóm ca đăng ký trong cả đợt</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full min-w-[32rem] text-left text-xs">
              <thead className="bg-slate-50 text-[10px] font-bold uppercase text-slate-400">
                <tr>
                  <th className="px-3 py-2">Phiên</th>
                  <th className="px-3 py-2">Nhóm ca</th>
                  <th className="px-3 py-2">Thời gian</th>
                  <th className="px-3 py-2">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sessions.map((session) => {
                  const sessionId = sessionIdOfSession(session);
                  const sessionStatus = windowStatusOf(session.status, session.sessionOpenAt, session.sessionCloseAt);
                  return (
                    <tr key={sessionId}>
                      <td className="px-3 py-2 font-bold text-slate-700">{text(session.sessionName, `Phiên #${sessionId}`)}</td>
                      <td className="px-3 py-2 text-slate-600">{text(session.shiftGroupName ?? lookups.groupNameOf(relId(session, "shiftGroup")), "Mọi nhóm ca")}</td>
                      <td className="px-3 py-2 text-slate-600">{timeDateRange(session.sessionOpenAt, session.sessionCloseAt)}</td>
                      <td className="px-3 py-2">
                        <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${sessionStatus.badge}`}>{sessionStatus.label}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Modal>
  );
}
