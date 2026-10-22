import { useCallback, useMemo, useRef, useState } from "react";
import { adminBrandApi, adminUserApi, type AccountListItem, type RoleResponse, type StoreItemResponse } from "@/lib/api";
import { listData } from "@/lib/format";
import { useDebouncedValue, usePagedList } from "@/lib/hooks";
import type { UserRoleCode } from "@/types/auth";
import { ALL_SCOPE, PHONE_NOT_SET, type AccountItem } from "./roles";

/** Số tài khoản mỗi trang. */
export const ACCOUNT_PAGE_SIZE = 10;

/** Dòng hiển thị từ tài khoản + vai trò hiện tại do backend ghép sẵn (chưa gán vai trò = Nhân viên). */
function toAccount(item: AccountListItem): AccountItem {
  const roleCode = (item.roleCode as UserRoleCode) || "EMPLOYEE";
  const username = item.username || `user_${item.id}`;
  return {
    id: item.id,
    username,
    fullName: username,
    email: item.email || "",
    phone: item.phone || PHONE_NOT_SET,
    roleId: item.roleId || 4,
    roleCode,
    roleName: item.roleName || "Nhân viên",
    storeName: roleCode === "ADMIN" ? ALL_SCOPE : "BLOAN · Chi nhánh trung tâm",
    status: item.status === "ACTIVE" ? "ACTIVE" : "LOCKED",
    lastLogin: item.lastLoginAt ? new Date(item.lastLoginAt).toLocaleString("vi-VN") : "Chưa đăng nhập",
  };
}

export const EMPTY_ACCOUNT_FILTERS = { search: "", role: "ALL", status: "ALL" };

/** Danh sách tài khoản phân trang tại backend; vai trò / cửa hàng cho form sửa chỉ tải khi mở form lần đầu. */
export function useAccounts() {
  const [filters, setFilters] = useState(EMPTY_ACCOUNT_FILTERS);
  const [roles, setRoles] = useState<RoleResponse[]>([]);
  const [stores, setStores] = useState<StoreItemResponse[]>([]);
  const editOptionsLoaded = useRef(false);
  const search = useDebouncedValue(filters.search.trim());

  const fetchPage = useCallback(
    (page: number, signal: AbortSignal) =>
      adminUserApi.getAccounts(
        {
          page,
          size: ACCOUNT_PAGE_SIZE,
          q: search || undefined,
          role: filters.role === "ALL" ? undefined : filters.role,
          status: filters.status === "ALL" ? undefined : filters.status,
        },
        signal
      ),
    [search, filters.role, filters.status]
  );
  const list = usePagedList(fetchPage);
  const accounts = useMemo(() => list.items.map(toAccount), [list.items]);

  /** Vai trò + cửa hàng cho form sửa: tải một lần khi người dùng mở form. */
  const loadEditOptions = useCallback(async () => {
    if (editOptionsLoaded.current) return;
    editOptionsLoaded.current = true;
    const [roleRes, storeRes] = await Promise.allSettled([adminUserApi.getRoles(), adminBrandApi.getStores()]);
    if (roleRes.status === "fulfilled") setRoles(listData<RoleResponse>(roleRes.value.data));
    if (storeRes.status === "fulfilled") setStores(listData<StoreItemResponse>(storeRes.value.data));
    if (roleRes.status === "rejected" && storeRes.status === "rejected") editOptionsLoaded.current = false;
  }, []);

  const toggleStatus = async (account: AccountItem) => {
    // Admin luôn hoạt động, không khóa được (backend kiểm tra lại, kể cả quản lý hoạt động cuối cùng)
    if (account.roleCode === "ADMIN") return;
    const status = account.status === "ACTIVE" ? "LOCKED" : "ACTIVE";
    if (status === "LOCKED" && account.roleCode === "MANAGER") {
      // Số quản lý đang hoạt động do backend đếm trên toàn bộ tài khoản (không chỉ trang hiện tại)
      const otherActiveManagers = (list.summary?.activeManagers ?? 0) - 1;
      if (otherActiveManagers <= 0) {
        alert("Phải luôn có ít nhất 1 tài khoản quản lý đang hoạt động – không thể khóa quản lý cuối cùng.");
        return;
      }
    }
    try {
      await adminUserApi.updateUser(account.id, { status });
      list.reload();
    } catch (cause) {
      alert(`Không thể thay đổi trạng thái tài khoản: ${cause instanceof Error ? cause.message : "Lỗi kết nối API"}`);
    }
  };

  return {
    accounts,
    summary: list.summary,
    meta: list.meta,
    setPage: list.setPage,
    roles,
    stores,
    loadEditOptions,
    loading: list.loading,
    error: list.error || null,
    filters,
    setFilters,
    reload: list.reload,
    toggleStatus,
  };
}
