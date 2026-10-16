import { useCallback, useEffect, useState } from "react";
import {
  managerApi,
  type EmergencyRequestResponse,
  type EmployeeResponse,
  type SchedulePeriodResponse,
  type ScheduleRoundResponse,
  type ScheduleSessionResponse,
  type ShiftAssignmentResponse,
  type ShiftByDateResponse,
  type ShiftGroupResponse,
  type ShiftResponse,
  type SpecialEventResponse,
  type StoreResponse,
} from "@/lib/api";
import { listData } from "@/lib/format";

export interface ScheduleData {
  periods: SchedulePeriodResponse[];
  shifts: ShiftResponse[];
  shiftDates: ShiftByDateResponse[];
  assignments: ShiftAssignmentResponse[];
  rounds: ScheduleRoundResponse[];
  sessions: ScheduleSessionResponse[];
  shiftGroups: ShiftGroupResponse[];
  specialEvents: SpecialEventResponse[];
  emergencyRequests: EmergencyRequestResponse[];
  stores: StoreResponse[];
  employees: EmployeeResponse[];
}

const EMPTY: ScheduleData = {
  periods: [],
  shifts: [],
  shiftDates: [],
  assignments: [],
  rounds: [],
  sessions: [],
  shiftGroups: [],
  specialEvents: [],
  emergencyRequests: [],
  stores: [],
  employees: [],
};

/** Gọi toàn bộ API của module lịch song song. */
async function fetchScheduleData(): Promise<ScheduleData> {
  const [stores, periods, shifts, shiftDates, assignments, employees, rounds, sessions, shiftGroups, specialEvents, emergencyRequests] =
    await Promise.all([
      managerApi.getStores(),
      managerApi.getSchedulePeriods(),
      managerApi.getShifts(),
      managerApi.getShiftsByDate(),
      managerApi.getShiftAssignments(),
      managerApi.getEmployees("ACTIVE"),
      managerApi.getScheduleRounds(),
      managerApi.getScheduleSessions(),
      managerApi.getShiftGroups(),
      managerApi.getSpecialEvents(),
      managerApi.getEmergencyRequests(),
    ]);

  return {
    stores: listData(stores.data),
    periods: listData(periods.data),
    shifts: listData(shifts.data),
    shiftDates: listData(shiftDates.data),
    assignments: listData(assignments.data),
    employees: listData(employees.data),
    rounds: listData(rounds.data),
    sessions: listData(sessions.data),
    shiftGroups: listData(shiftGroups.data),
    specialEvents: listData(specialEvents.data),
    emergencyRequests: listData(emergencyRequests.data),
  };
}

const errorMessage = (cause: unknown) => (cause instanceof Error ? cause.message : "Không thể tải dữ liệu lịch");

/**
 * Tải toàn bộ dữ liệu module lịch một lần.
 * Việc lọc được thực hiện phía client để các tab không ảnh hưởng lẫn nhau.
 */
export function useScheduleData() {
  const [data, setData] = useState<ScheduleData>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setData(await fetchScheduleData());
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setLoading(false);
    }
  }, []);

  // Lần tải đầu: state khởi tạo đã là loading, chỉ cập nhật khi có kết quả.
  useEffect(() => {
    let cancelled = false;
    fetchScheduleData()
      .then((result) => !cancelled && setData(result))
      .catch((cause) => !cancelled && setError(errorMessage(cause)))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  return { data, loading, error, setError, reload };
}
