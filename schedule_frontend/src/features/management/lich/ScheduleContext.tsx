"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { managerApi, type ScheduleRoundResponse } from "@/lib/api";
import type { SchedulePeriodDeletePreview } from "@/lib/api/types/schedule.types";
import { relId } from "@/lib/format";
import type { Entity, Kind } from "./constants";
import { useScheduleData, type ScheduleData } from "./useScheduleData";
import { useScheduleLookups, type ScheduleLookups } from "./useScheduleLookups";

export interface ModalState {
  kind: Kind;
  item?: Entity;
  /** true khi item chỉ là dữ liệu điền sẵn cho bản ghi mới */
  isNew?: boolean;
}

export interface ShiftDetailState {
  dateKey: string;
  ids: number[];
}

/** Bản ghi đang chờ người dùng xác nhận xóa. */
export interface PendingDeleteState {
  kind: Kind;
  id: number;
  /** Chỉ có với kỳ: số dữ liệu liên quan sẽ bị xóa theo */
  preview?: SchedulePeriodDeletePreview;
  loadingPreview?: boolean;
  deleting?: boolean;
  error?: string;
}

interface ScheduleContextValue extends ScheduleData {
  /** Cửa hàng đang lọc ("" = tất cả). Ca, ca theo ngày, đợt, phiên, nhóm ca, phân bổ, yêu cầu khẩn đã được lọc sẵn. */
  storeFilter: string;
  setStoreFilter: (storeId: string) => void;
  /** Đợt của một kỳ (đã lọc theo cửa hàng) */
  roundsOfPeriod: (periodId: number) => ScheduleRoundResponse[];
  loading: boolean;
  error: string;
  setError: (message: string) => void;
  reload: () => Promise<void>;
  lookups: ScheduleLookups;
  modal: ModalState | null;
  openModal: (kind: Kind, item?: Entity, isNew?: boolean) => void;
  closeModal: () => void;
  shiftDetail: ShiftDetailState | null;
  openShiftDetail: (dateKey: string, ids: number[]) => void;
  closeShiftDetail: () => void;
  /** Mở popup xác nhận xóa */
  remove: (kind: Kind, id: number) => Promise<void>;
  pendingDelete: PendingDeleteState | null;
  confirmDelete: () => Promise<void>;
  cancelDelete: () => void;
}

const ScheduleContext = createContext<ScheduleContextValue | null>(null);

const DELETE_ACTION: Record<Kind, (id: number) => Promise<unknown>> = {
  period: managerApi.deleteSchedulePeriod,
  shift: managerApi.deleteShift,
  shiftDate: managerApi.deleteShiftByDate,
  assignment: managerApi.deleteShiftAssignment,
  round: managerApi.deleteScheduleRound,
  session: managerApi.deleteScheduleSession,
  group: managerApi.deleteShiftGroup,
  event: managerApi.deleteSpecialEvent,
  emergency: managerApi.deleteEmergencyRequest,
};

export function ScheduleProvider({ children }: { children: React.ReactNode }) {
  const { data, loading, error, setError, reload } = useScheduleData();
  const lookups = useScheduleLookups(data);
  const [modal, setModal] = useState<ModalState | null>(null);
  const [shiftDetail, setShiftDetail] = useState<ShiftDetailState | null>(null);

  const [pendingDelete, setPendingDelete] = useState<PendingDeleteState | null>(null);

  const remove = useCallback(async (kind: Kind, id: number) => {
    if (!id) return;
    if (kind !== "period") {
      setPendingDelete({ kind, id });
      return;
    }
    setPendingDelete({ kind, id, loadingPreview: true });
    try {
      const { data: preview } = await managerApi.getSchedulePeriodDeletePreview(id);
      setPendingDelete((current) => (current?.id === id ? { ...current, preview, loadingPreview: false } : current));
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Không thể tải dữ liệu liên quan";
      setPendingDelete((current) => (current?.id === id ? { ...current, error: message, loadingPreview: false } : current));
    }
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!pendingDelete) return;
    setPendingDelete({ ...pendingDelete, deleting: true, error: undefined });
    try {
      await DELETE_ACTION[pendingDelete.kind](pendingDelete.id);
      setPendingDelete(null);
      await reload();
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Không thể xóa dữ liệu";
      setPendingDelete((current) => (current ? { ...current, deleting: false, error: message } : current));
    }
  }, [pendingDelete, reload]);

  const cancelDelete = useCallback(() => {
    setPendingDelete((current) => (current?.deleting ? current : null));
  }, []);

  const [storeFilter, setStoreFilter] = useState("");

  // Dữ liệu theo cửa hàng đang lọc; lookups vẫn dùng dữ liệu đầy đủ để tra tên
  const scoped = useMemo<ScheduleData>(() => {
    if (!storeFilter) return data;
    const storeId = Number(storeFilter);
    const shiftDateById = new Map(data.shiftDates.map((item) => [Number(item.id ?? item.shiftByDateId ?? 0), item]));
    const assignmentById = new Map(data.assignments.map((item) => [Number(item.id ?? item.shiftAssignmentId ?? 0), item]));
    const inStore = (id: number | null | undefined) => Number(id ?? 0) === storeId;
    const shiftDateInStore = (id: unknown) => {
      const item = shiftDateById.get(Number(id ?? 0));
      return item ? inStore(lookups.storeIdOf(item)) : false;
    };
    const rounds = data.rounds.filter((round) => inStore(relId(round, "store")));
    const roundIds = new Set(rounds.map((round) => Number(round.id ?? round.scheduleRoundId ?? 0)));
    return {
      ...data,
      shifts: data.shifts.filter((item) => inStore(item.storeId)),
      shiftDates: data.shiftDates.filter((item) => inStore(lookups.storeIdOf(item))),
      assignments: data.assignments.filter((item) => shiftDateInStore(item.shiftByDateId)),
      rounds,
      sessions: data.sessions.filter((item) => roundIds.has(relId(item, "scheduleRound"))),
      shiftGroups: data.shiftGroups.filter((item) => inStore(item.storeId)),
      emergencyRequests: data.emergencyRequests.filter((item) => {
        const assignment = assignmentById.get(Number(item.assignmentId ?? 0));
        return shiftDateInStore(assignment?.shiftByDateId ?? item.fromShiftAssignmentId ?? item.toAssignmentId);
      }),
    };
  }, [data, storeFilter, lookups]);

  const roundsOfPeriod = useCallback(
    (periodId: number) => {
      const all = lookups.roundsByPeriod.get(periodId) ?? [];
      return storeFilter ? all.filter((round) => relId(round, "store") === Number(storeFilter)) : all;
    },
    [lookups, storeFilter]
  );

  const value = useMemo<ScheduleContextValue>(
    () => ({
      ...scoped,
      storeFilter,
      setStoreFilter,
      roundsOfPeriod,
      loading,
      error,
      setError,
      reload,
      lookups,
      modal,
      openModal: (kind, item, isNew) => setModal({ kind, item, isNew }),
      closeModal: () => setModal(null),
      shiftDetail,
      openShiftDetail: (dateKey, ids) => setShiftDetail({ dateKey, ids }),
      closeShiftDetail: () => setShiftDetail(null),
      remove,
      pendingDelete,
      confirmDelete,
      cancelDelete,
    }),
    [scoped, storeFilter, roundsOfPeriod, loading, error, setError, reload, lookups, modal, shiftDetail, remove, pendingDelete, confirmDelete, cancelDelete]
  );

  return <ScheduleContext.Provider value={value}>{children}</ScheduleContext.Provider>;
}

export function useSchedule() {
  const context = useContext(ScheduleContext);
  if (!context) throw new Error("useSchedule phải được dùng bên trong ScheduleProvider");
  return context;
}
