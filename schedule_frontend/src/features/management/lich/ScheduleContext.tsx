"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { managerApi } from "@/lib/api";
import type { SchedulePeriodDeletePreview } from "@/lib/api/types/schedule.types";
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

  const value = useMemo<ScheduleContextValue>(
    () => ({
      ...data,
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
    [data, loading, error, setError, reload, lookups, modal, shiftDetail, remove, pendingDelete, confirmDelete, cancelDelete]
  );

  return <ScheduleContext.Provider value={value}>{children}</ScheduleContext.Provider>;
}

export function useSchedule() {
  const context = useContext(ScheduleContext);
  if (!context) throw new Error("useSchedule phải được dùng bên trong ScheduleProvider");
  return context;
}
