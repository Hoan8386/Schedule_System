import { useCallback, useMemo, useState } from "react";
import { managerApi, type StoreResponse } from "@/lib/api";
import { listData } from "@/lib/format";
import { useDebouncedValue, useInitialLoad, usePagedList } from "@/lib/hooks";

export const ALL = "ALL";
export type PositionFilter = typeof ALL | "STORE_MANAGER" | "EMPLOYEE";

export const EMPTY_FILTERS = {
  search: "",
  status: ALL,
  storeId: ALL,
  position: ALL as PositionFilter,
  assignmentStatus: ALL,
  primary: ALL,
};
export type EmployeeFilters = typeof EMPTY_FILTERS;

/** Số nhân viên mỗi trang. */
export const EMPLOYEE_PAGE_SIZE = 10;

const optional = (input: string) => (input === ALL ? undefined : input);

/**
 * Danh sách nhân sự phân trang tại backend: lọc, tìm kiếm (không dấu), sắp xếp mới nhất trước,
 * kèm cửa hàng phân bổ, cờ quản lý và số liệu tổng trong một request.
 */
export function useEmployees() {
  const [filters, setFilters] = useState<EmployeeFilters>(EMPTY_FILTERS);
  const [stores, setStores] = useState<StoreResponse[]>([]);
  const search = useDebouncedValue(filters.search.trim());
  const { status, storeId, position, assignmentStatus, primary } = filters;

  const fetchPage = useCallback(
    (page: number, signal: AbortSignal) =>
      managerApi.getEmployeesPage(
        {
          page,
          size: EMPLOYEE_PAGE_SIZE,
          q: search || undefined,
          status: optional(status),
          storeId: storeId === ALL ? undefined : Number(storeId),
          position: position === ALL ? undefined : position,
          assignmentStatus: optional(assignmentStatus),
          primary: primary === ALL ? undefined : primary === "true",
        },
        signal
      ),
    [search, status, storeId, position, assignmentStatus, primary]
  );
  const list = usePagedList(fetchPage);

  // Danh sách cửa hàng (không kèm logo) cho bộ lọc và form phân bổ
  useInitialLoad(async () => {
    try {
      const { data } = await managerApi.getStores();
      setStores(listData(data));
    } catch (cause) {
      list.setError(cause instanceof Error ? cause.message : "Không thể tải danh sách cửa hàng");
    }
  });

  const storeMap = useMemo(() => new Map(stores.map((store) => [store.id, store])), [stores]);

  return {
    filters,
    setFilters,
    employees: list.items,
    meta: list.meta,
    summary: list.summary,
    page: list.page,
    setPage: list.setPage,
    stores,
    storeMap,
    loading: list.loading,
    error: list.error,
    setError: list.setError,
    reload: list.reload,
  };
}
