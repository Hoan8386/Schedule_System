import { API_BASE_URL, crud, http, uploadFile, withQuery, type Body } from "../http";
import type {
  AttachmentResponse,
  EmployeeRequest,
  EmployeeResponse,
  EmployeeStoreResponse,
  StoreManagerResponse,
  StoreRequest,
  StoreResponse,
  StoreStaffRequest,
} from "../types/hr.types";
import type { EmployeeListItem, EmployeePageParams, EmployeePageSummary, PageResult } from "../types/page.types";

const employees = crud<EmployeeResponse, EmployeeRequest>("/api/v1/employees");
const stores = crud<StoreResponse, StoreRequest>("/api/v1/stores");
const employeeStores = crud<EmployeeStoreResponse, Body>("/api/v1/employee_store");

/** Nhân sự, cửa hàng, phân công cửa hàng, tệp đính kèm. */
export const hrApi = {
  getEmployees: (status?: string) => http.get<EmployeeResponse[]>(withQuery("/api/v1/employees", { status })),
  /** Trang nhân sự: phân trang + lọc + tìm kiếm tại backend, kèm cửa hàng phân bổ và số liệu tổng */
  getEmployeesPage: (params: EmployeePageParams, signal?: AbortSignal) =>
    http.get<PageResult<EmployeeListItem, EmployeePageSummary>>(withQuery("/api/v1/employees/page", { ...params }), { signal }),
  getEmployee: employees.get,
  createEmployee: employees.create,
  updateEmployee: employees.update,
  deleteEmployee: employees.remove,

  /** includeLogo: chỉ bật khi cần ảnh cửa hàng (backend tải ảnh và nhúng base64 – nặng) */
  getStores: (status?: string, includeLogo = false) =>
    http.get<StoreResponse[]>(withQuery("/api/v1/stores", { status, includeLogo })),
  createStore: stores.create,
  updateStore: stores.update,
  /** Đổi trưởng cửa hàng, thêm / bỏ / chuyển nhân viên, đổi vị trí – một giao dịch */
  updateStoreStaff: (storeId: number, body: StoreStaffRequest) => http.put<void>(`/api/v1/stores/${storeId}/staff`, body),
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
