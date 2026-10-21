import { useMemo } from "react";
import type {
  ScheduleRoundResponse,
  ScheduleSessionResponse,
  ShiftAssignmentResponse,
  ShiftByDateResponse,
} from "@/lib/api";
import { formatDate, relId, text } from "@/lib/format";
import { isActiveAssignment } from "./constants";
import { buildGroupPalette } from "./groupColors";
import type { ScheduleData } from "./useScheduleData";

/** Lập map theo id: key được lấy bằng hàm getId. */
function indexBy<T>(items: T[], getId: (item: T) => number) {
  const map = new Map<number, T>();
  items.forEach((item) => map.set(getId(item), item));
  return map;
}

/** Gom nhóm theo khóa, có sắp xếp tùy chọn. */
function groupBy<T>(items: T[], getKey: (item: T) => number, sortKey?: (item: T) => string) {
  const map = new Map<number, T[]>();
  items.forEach((item) => {
    const key = getKey(item);
    map.set(key, [...(map.get(key) ?? []), item]);
  });
  if (sortKey) map.forEach((list) => list.sort((a, b) => sortKey(a).localeCompare(sortKey(b))));
  return map;
}

export const roundIdOfRound = (round: ScheduleRoundResponse) => Number(round.id ?? round.scheduleRoundId ?? 0);
export const sessionIdOfSession = (session: ScheduleSessionResponse) => Number(session.id ?? session.scheduleSessionId ?? 0);
export const shiftDateId = (item: ShiftByDateResponse) => Number(item.id ?? item.shiftByDateId ?? 0);
export const assignmentId = (item: ShiftAssignmentResponse) => Number(item.id ?? item.shiftAssignmentId ?? 0);

/** Các map tra cứu và hàm suy luận quan hệ giữa kỳ, đợt, phiên, ca và phân bổ. */
export function useScheduleLookups(data: ScheduleData) {
  const { employees, shifts, stores, periods, rounds, sessions, shiftGroups, assignments } = data;

  const maps = useMemo(
    () => ({
      employee: indexBy(employees, (item) => Number(item.id ?? 0)),
      shift: indexBy(shifts, (item) => Number(item.id ?? item.shiftId ?? 0)),
      store: indexBy(stores, (item) => Number(item.id)),
      period: indexBy(periods, (item) => Number(item.id ?? item.schedulePeriodId ?? 0)),
      round: indexBy(rounds, roundIdOfRound),
      session: indexBy(sessions, sessionIdOfSession),
      group: indexBy(shiftGroups, (item) => Number(item.id ?? item.shiftGroupId ?? 0)),
    }),
    [employees, shifts, stores, periods, rounds, sessions, shiftGroups]
  );

  const roundsByPeriod = useMemo(
    () => groupBy(rounds, (round) => relId(round, "schedulePeriod"), (round) => String(round.registrationStartAt ?? "")),
    [rounds]
  );
  const sessionsByRound = useMemo(
    () => groupBy(sessions, (session) => relId(session, "scheduleRound"), (session) => String(session.sessionOpenAt ?? "")),
    [sessions]
  );
  const assignmentsByShiftDate = useMemo(
    () => groupBy(assignments.filter((item) => relId(item, "shiftByDate")), (item) => relId(item, "shiftByDate")),
    [assignments]
  );

  return useMemo(() => {
    const templateOf = (item: ShiftByDateResponse) => maps.shift.get(relId(item, "shift"));
    const roundIdOf = (item: ShiftByDateResponse) => relId(item, "scheduleRound");
    const sessionIdOf = (item: ShiftByDateResponse) => relId(item, "scheduleSession");
    /** Kỳ của ca: lấy trực tiếp, nếu không có thì suy ra từ đợt. */
    const periodIdOf = (item: ShiftByDateResponse) => {
      const direct = relId(item, "schedulePeriod");
      if (direct) return direct;
      const round = maps.round.get(roundIdOf(item));
      return round ? relId(round, "schedulePeriod") : 0;
    };
    const storeIdOf = (item: ShiftByDateResponse) => Number(item.storeId ?? templateOf(item)?.storeId ?? 0);
    const storeNameOf = (item: ShiftByDateResponse) => {
      const storeId = storeIdOf(item);
      return text(
        item.storeName ?? templateOf(item)?.storeName ?? maps.store.get(storeId)?.storeName,
        storeId ? `Cửa hàng #${storeId}` : "Chưa rõ cửa hàng"
      );
    };
    const capacityOf = (item: ShiftByDateResponse) => Number(item.maxCapacity ?? item.capacity ?? templateOf(item)?.maxCapacity ?? 0);
    const allAssignmentsOf = (item: ShiftByDateResponse) => assignmentsByShiftDate.get(shiftDateId(item)) ?? [];
    /** Nhân viên còn hiệu lực trong ca (không tính đã hủy / bị từ chối). */
    const activeAssignmentsOf = (item: ShiftByDateResponse) => allAssignmentsOf(item).filter(isActiveAssignment);

    const employeeName = (employeeId: unknown) => maps.employee.get(Number(employeeId ?? 0))?.fullName || `NV #${text(employeeId, "?")}`;
    const roundNameOf = (id: number) => (id ? text(maps.round.get(id)?.roundName, `Đợt #${id}`) : "");
    const sessionNameOf = (id: number) => (id ? text(maps.session.get(id)?.sessionName, `Phiên #${id}`) : "");
    const groupNameOf = (id: number) => (id ? text(maps.group.get(id)?.shiftGroupName, `Nhóm ca #${id}`) : "");
    /** Nhóm ca của ca theo ngày (qua ca mẫu) */
    const groupIdOf = (item: ShiftByDateResponse) => {
      const template = templateOf(item);
      return template ? relId(template, "shiftGroup") : 0;
    };
    // Màu TKB: họ màu theo nhóm ca, đậm nhạt theo khung giờ (Sáng / Trưa / Tối)
    const groupColor = buildGroupPalette(
      shiftGroups.map((item) => {
        const id = Number(item.id ?? item.shiftGroupId ?? 0);
        return { id, name: text(item.shiftGroupName, "") };
      })
    );
    const colorOf = (item: ShiftByDateResponse) =>
      groupColor(groupIdOf(item), item.startTime ?? templateOf(item)?.startTime);

    const options = {
      stores: stores.map((item) => ({ value: Number(item.id), label: text(item.storeName, `Cửa hàng #${item.id}`) })),
      shifts: shifts.map((item) => ({ value: Number(item.id), label: text(item.shiftName, `Ca #${item.id}`) })),
      periods: periods.map((item) => {
        const id = Number(item.id ?? item.schedulePeriodId ?? 0);
        return { value: id, label: text(item.periodName, `Kỳ #${id}`) };
      }),
      shiftDates: data.shiftDates.map((item) => ({
        value: shiftDateId(item),
        label: `${text(item.shiftName, `Ca #${item.shiftId}`)} - ${formatDate(item.workDate)}`,
      })),
      employees: employees.map((item) => ({ value: Number(item.id), label: text(item.fullName, `NV #${item.id}`) })),
      groups: shiftGroups.map((item) => {
        const id = Number(item.id ?? item.shiftGroupId ?? 0);
        return { value: id, label: `${text(item.shiftGroupName, `Nhóm ca #${id}`)}${item.storeName ? ` · ${item.storeName}` : ""}` };
      }),
      rounds: rounds.map((item) => {
        const id = roundIdOfRound(item);
        const periodName = item.periodName ?? maps.period.get(relId(item, "schedulePeriod"))?.periodName;
        return { value: id, label: `${text(item.roundName, `Đợt #${id}`)}${periodName ? ` · ${periodName}` : ""}` };
      }),
      sessions: sessions.map((item) => {
        const id = sessionIdOfSession(item);
        const roundName = item.roundName ?? maps.round.get(relId(item, "scheduleRound"))?.roundName;
        return { value: id, label: `${text(item.sessionName, `Phiên #${id}`)}${roundName ? ` · ${roundName}` : ""}` };
      }),
    };

    return {
      maps,
      roundsByPeriod,
      sessionsByRound,
      assignmentsByShiftDate,
      templateOf,
      roundIdOf,
      sessionIdOf,
      periodIdOf,
      storeIdOf,
      storeNameOf,
      capacityOf,
      allAssignmentsOf,
      activeAssignmentsOf,
      employeeName,
      roundNameOf,
      sessionNameOf,
      groupNameOf,
      groupIdOf,
      groupColor,
      colorOf,
      options,
    };
  }, [maps, roundsByPeriod, sessionsByRound, assignmentsByShiftDate, stores, shifts, periods, data.shiftDates, employees, shiftGroups, rounds, sessions]);
}

export type ScheduleLookups = ReturnType<typeof useScheduleLookups>;
