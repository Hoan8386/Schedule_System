import { http, withQuery } from "./http";
import type {
  EmployeeDashboard,
  ManagerDashboard,
  StatFilters,
  StatOverview,
  StatPersonal,
  StatShift,
  StoreManagerDashboard,
} from "./types/statistics.types";

/** Thống kê: toàn chuỗi (quản lý), cửa hàng (trưởng cửa hàng), cá nhân (nhân viên). */
export const statisticsApi = {
  getManager: (filters?: StatFilters) => http.get<StatOverview>(withQuery("/api/v1/statistics/manager", { ...filters })),
  getStoreManager: (filters?: StatFilters) =>
    http.get<StatOverview>(withQuery("/api/v1/statistics/store-manager", { ...filters })),
  getEmployeeShifts: (employeeId: number, filters?: StatFilters) =>
    http.get<StatShift[]>(withQuery(`/api/v1/statistics/store-manager/employee/${employeeId}/shifts`, { ...filters })),
  getMine: (filters?: StatFilters) => http.get<StatPersonal>(withQuery("/api/v1/statistics/me", { ...filters })),

  getManagerDashboard: () => http.get<ManagerDashboard>("/api/v1/statistics/manager/dashboard"),
  getStoreManagerDashboard: () => http.get<StoreManagerDashboard>("/api/v1/statistics/store-manager/dashboard"),
  getMyDashboard: () => http.get<EmployeeDashboard>("/api/v1/statistics/me/dashboard"),
};
