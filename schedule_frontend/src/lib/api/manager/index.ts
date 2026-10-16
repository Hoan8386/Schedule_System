import { http } from "../http";
import type { RoleResponse } from "../types/admin.types";
import { hrApi } from "./hr";
import { operationsApi } from "./operations";
import { scheduleApi } from "./schedule";
import { testApi } from "./test";

/** API cho không gian quản lý chuỗi (gộp theo domain). */
export const managerApi = {
  ...hrApi,
  ...scheduleApi,
  ...operationsApi,
  ...testApi,
  getRoles: () => http.get<RoleResponse[]>("/api/v1/role"),
};

export { hrApi, operationsApi, scheduleApi, testApi };
