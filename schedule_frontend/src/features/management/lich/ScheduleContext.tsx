"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { managerApi } from "@/lib/api";
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
  remove: (kind: Kind, id: number) => Promise<void>;
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

  const remove = useCallback(
    async (kind: Kind, id: number) => {
      if (!id || !window.confirm("Bạn có chắc muốn xóa dữ liệu này?")) return;
      try {
        await DELETE_ACTION[kind](id);
        await reload();
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Không thể xóa dữ liệu");
      }
    },
    [reload, setError]
  );

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
    }),
    [data, loading, error, setError, reload, lookups, modal, shiftDetail, remove]
  );

  return <ScheduleContext.Provider value={value}>{children}</ScheduleContext.Provider>;
}

export function useSchedule() {
  const context = useContext(ScheduleContext);
  if (!context) throw new Error("useSchedule phải được dùng bên trong ScheduleProvider");
  return context;
}
