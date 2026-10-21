import { API_BASE_URL, crud, http, uploadFile, withQuery, type Body } from "../http";
import type {
  AttachmentResponse,
  EmployeeRequest,
  EmployeeResponse,
  EmployeeStoreResponse,
  StoreManagerResponse,
  StoreRequest,
  StoreResponse,
} from "../types/hr.types";

const employees = crud<EmployeeResponse, EmployeeRequest>("/api/v1/employees");
const stores = crud<StoreResponse, StoreRequest>("/api/v1/stores");
const employeeStores = crud<EmployeeStoreResponse, Body>("/api/v1/employee_store");

/** Nhân sự, cửa hàng, phân công cửa hàng, tệp đính kèm. */
export const hrApi = {
  getEmployees: (status?: string) => http.get<EmployeeResponse[]>(withQuery("/api/v1/employees", { status })),
  getEmployee: employees.get,
  createEmployee: employees.create,
  updateEmployee: employees.update,
  deleteEmployee: employees.remove,

  getStores: (status?: string) => http.get<StoreResponse[]>(withQuery("/api/v1/stores", { status })),
  createStore: stores.create,
  updateStore: stores.update,
  getStoreManagers: () => http.get<StoreManagerResponse[]>("/api/v1/store_manager"),

  getEmployeeStores: (filters?: { storeId?: number; role?: "MANAGER" | "EMPLOYEE"; status?: string; primary?: boolean }) =>
    http.get<EmployeeStoreResponse[]>(withQuery("/api/v1/employee_store", filters)),
  createEmployeeStore: employeeStores.create,
  updateEmployeeStore: employeeStores.update,
  deleteEmployeeStore: employeeStores.remove,

  uploadAttachment: (file: File) => uploadFile<AttachmentResponse>("/api/v1/attachment/upload", file),
  /** @deprecated dùng uploadAttachment */
  uploadAttachmentLegacy: (file: File) => uploadFile<AttachmentResponse>("/api/v1/attachment/upload", file),
  getAttachment: (id: number) => http.get<AttachmentResponse>(`/api/v1/attachment/${id}`),
  getAttachmentFileUrl: (id: number | string) => `${API_BASE_URL}/api/v1/attachment/file/${id}`,
};
