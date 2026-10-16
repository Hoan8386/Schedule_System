import { useCallback, useEffect, useMemo, useState } from "react";
import { managerApi, type EmployeeResponse, type EmployeeStoreResponse, type StoreManagerResponse, type StoreResponse } from "@/lib/api";
import { listData } from "@/lib/format";
import { value } from "./utils";

export const ALL = "ALL";
export type RoleFilter = typeof ALL | "MANAGER" | "EMPLOYEE";

export const EMPTY_FILTERS = {
  search: "",
  status: ALL,
  storeId: ALL,
  role: ALL as RoleFilter,
  assignmentStatus: ALL,
  primary: ALL,
};
export type EmployeeFilters = typeof EMPTY_FILTERS;

const optional = (input: string) => (input === ALL ? undefined : input);

/** Tải nhân sự, cửa hàng, phân bổ và quản lý theo bộ lọc; trả về dữ liệu đã lọc và các map tra cứu. */
export function useEmployees() {
  const [filters, setFilters] = useState<EmployeeFilters>(EMPTY_FILTERS);
  const [employees, setEmployees] = useState<EmployeeResponse[]>([]);
  const [stores, setStores] = useState<StoreResponse[]>([]);
  const [assignments, setAssignments] = useState<EmployeeStoreResponse[]>([]);
  const [managers, setManagers] = useState<StoreManagerResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { status, storeId, role, assignmentStatus, primary } = filters;

  const reload = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [employeeRes, storeRes, assignmentRes, managerRes] = await Promise.all([
        managerApi.getEmployees(optional(status)),
        managerApi.getStores(),
        managerApi.getEmployeeStores({
          storeId: storeId === ALL ? undefined : Number(storeId),
          role: role === ALL ? undefined : role,
          status: optional(assignmentStatus),
          primary: primary === ALL ? undefined : primary === "true",
        }),
        managerApi.getStoreManagers(),
      ]);
      setEmployees(listData(employeeRes.data));
      setStores(listData(storeRes.data));
      setAssignments(listData(assignmentRes.data));
      setManagers(listData(managerRes.data));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể tải dữ liệu nhân sự");
      setEmployees([]);
      setStores([]);
      setAssignments([]);
      setManagers([]);
    } finally {
      setLoading(false);
    }
  }, [status, storeId, role, assignmentStatus, primary]);

  useEffect(() => {
    // Trì hoãn một nhịp để không gọi setState đồng bộ trong effect.
    const timer = window.setTimeout(() => void reload(), 0);
    return () => window.clearTimeout(timer);
  }, [reload]);

  const storeMap = useMemo(() => new Map(stores.map((store) => [store.id, store])), [stores]);
  const managerIds = useMemo(() => new Set(managers.map((manager) => manager.employeeId)), [managers]);

  const assignmentsByEmployee = useMemo(() => {
    const map = new Map<number, EmployeeStoreResponse[]>();
    assignments.forEach((assignment) => map.set(assignment.employeeId, [...(map.get(assignment.employeeId) ?? []), assignment]));
    return map;
  }, [assignments]);

  const filtered = useMemo(() => {
    const keyword = filters.search.trim().toLowerCase();
    const hasAssignmentFilter = storeId !== ALL || role !== ALL || assignmentStatus !== ALL || primary !== ALL;
    return employees.filter((employee) => {
      const matchesSearch =
        !keyword ||
        [employee.employeeCode, employee.fullName, employee.phone, employee.email].some((field) => value(field, "").toLowerCase().includes(keyword));
      const matchesAssignment = !hasAssignmentFilter || assignments.some((assignment) => assignment.employeeId === employee.id);
      return matchesSearch && matchesAssignment;
    });
  }, [employees, assignments, filters.search, storeId, role, assignmentStatus, primary]);

  return {
    filters,
    setFilters,
    employees,
    filtered,
    stores,
    storeMap,
    managerIds,
    assignmentsByEmployee,
    loading,
    error,
    setError,
    reload,
  };
}
