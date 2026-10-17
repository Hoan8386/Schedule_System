"use client";

import { useCallback, useEffect, useState } from "react";
import type { ApiResponse, StatFilters } from "@/lib/api";
import { presetRange, type RangePreset } from "./utils";

/** Trạng thái bộ lọc thống kê: preset khoảng ngày, ngày tùy chọn và cửa hàng. */
export function useStatFilters() {
  const [preset, setPresetState] = useState<RangePreset>("thisMonth");
  const [range, setRange] = useState(() => presetRange("thisMonth"));
  const [storeId, setStoreId] = useState<number | undefined>(undefined);

  const setPreset = useCallback((next: RangePreset) => {
    setPresetState(next);
    if (next !== "custom") setRange(presetRange(next));
  }, []);

  const setCustomRange = useCallback((next: { from: string; to: string }) => {
    setPresetState("custom");
    setRange(next);
  }, []);

  const filters: StatFilters = { from: range.from, to: range.to, storeId };
  return { preset, setPreset, range, setCustomRange, storeId, setStoreId, filters };
}

interface LoadState<T> {
  /** Khóa của request đã trả kết quả; khác khóa hiện tại nghĩa là đang tải. */
  key: string;
  data: T | null;
  error: string;
}

/**
 * Tải dữ liệu mỗi khi `key` đổi; bỏ qua kết quả của request cũ.
 * Dữ liệu cũ vẫn được giữ trong lúc tải lại để giao diện không bị nháy.
 */
export function useKeyedLoad<T>(key: string | null, load: () => Promise<ApiResponse<T>>, errorMessage: string) {
  const [state, setState] = useState<LoadState<T>>({ key: "", data: null, error: "" });

  useEffect(() => {
    if (key === null) return;
    let active = true;
    load()
      .then((response) => active && setState({ key, data: response.data, error: "" }))
      .catch((cause: unknown) => {
        const error = cause instanceof Error ? cause.message : errorMessage;
        if (active) setState((current) => ({ key, data: current.data, error }));
      });
    return () => {
      active = false;
    };
    // load được tạo lại mỗi lần render; key đã đại diện cho mọi tham số của nó
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const loading = key !== null && state.key !== key;
  return { data: key === null ? null : state.data, loading, error: loading ? "" : state.error };
}

/** Tải dữ liệu thống kê theo bộ lọc; `version` tăng khi bấm làm mới. */
export function useStatData<T>(fetcher: (filters: StatFilters) => Promise<ApiResponse<T>>, filters: StatFilters) {
  const [version, setVersion] = useState(0);
  const { from, to, storeId } = filters;
  const key = `${from}|${to}|${storeId ?? ""}|${version}`;
  const result = useKeyedLoad(key, () => fetcher({ from, to, storeId }), "Không thể tải dữ liệu thống kê");

  const reload = useCallback(() => setVersion((value) => value + 1), []);
  return { ...result, version, reload };
}
