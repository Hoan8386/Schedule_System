import { useCallback, useEffect, useMemo, useState } from "react";
import { adminBrandApi, adminUserApi, type RoleResponse, type StoreItemResponse, type UserResponse, type UserRoleResponse } from "@/lib/api";
import { listData } from "@/lib/format";
import type { UserRoleCode } from "@/types/auth";
import { ALL_SCOPE, PHONE_NOT_SET, type AccountItem } from "./roles";

const settled = <T>(result: PromiseSettledResult<{ data: unknown }>) => (result.status === "fulfilled" ? listData<T>(result.value.data) : []);

/** Gộp user + vai trò hiện tại thành dòng hiển thị. */
function toAccount(user: UserResponse, userRoles: UserRoleResponse[], roles: RoleResponse[]): AccountItem {
  const link = userRoles.find((item) => item.userId === user.id);
  const role = link ? roles.find((item) => item.roleId === link.roleId) : roles.find((item) => item.roleCode === "EMPLOYEE") || roles[0];
  const roleCode = (role?.roleCode as UserRoleCode) || "EMPLOYEE";
  const username = user.username || `user_${user.id}`;
  return {
    id: user.id,
    username,
    fullName: username,
    email: user.email || "",
    phone: user.phone || PHONE_NOT_SET,
    roleId: role?.roleId || 4,
    roleCode,
    roleName: role?.roleName || "Nhân viên",
    storeName: roleCode === "ADMIN" ? ALL_SCOPE : "BLOAN · Chi nhánh trung tâm",
    status: user.status === "ACTIVE" ? "ACTIVE" : "LOCKED",
    lastLogin: user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString("vi-VN") : "Chưa đăng nhập",
  };
}

export const EMPTY_ACCOUNT_FILTERS = { search: "", role: "ALL", status: "ALL" };

/** Danh sách tài khoản, vai trò, cửa hàng và các thao tác trên tài khoản. */
export function useAccounts() {
  const [accounts, setAccounts] = useState<AccountItem[]>([]);
  const [roles, setRoles] = useState<RoleResponse[]>([]);
  const [stores, setStores] = useState<StoreItemResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState(EMPTY_ACCOUNT_FILTERS);

  const fetchAll = useCallback(async () => {
    const [users, roleRes, userRoleRes, storeRes] = await Promise.allSettled([
      adminUserApi.getUsers(),
      adminUserApi.getRoles(),
      adminUserApi.getUserRoles(),
      adminBrandApi.getStores(),
    ]);
    if (users.status === "rejected") throw users.reason;
    const roleList = settled<RoleResponse>(roleRes);
    const userRoleList = settled<UserRoleResponse>(userRoleRes);
    return {
      roles: roleList,
      stores: settled<StoreItemResponse>(storeRes),
      accounts: listData<UserResponse>(users.value.data).map((user) => toAccount(user, userRoleList, roleList)),
    };
  }, []);

  const apply = useCallback((result: Awaited<ReturnType<typeof fetchAll>>) => {
    setRoles(result.roles);
    setStores(result.stores);
    setAccounts(result.accounts);
  }, []);
  const fail = useCallback((cause: unknown) => {
    setError(cause instanceof Error ? cause.message : "Không thể kết nối đến máy chủ backend.");
    setAccounts([]);
  }, []);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      apply(await fetchAll());
    } catch (cause) {
      fail(cause);
    } finally {
      setLoading(false);
    }
  }, [fetchAll, apply, fail]);

  useEffect(() => {
    let cancelled = false;
    fetchAll()
      .then((result) => !cancelled && apply(result))
      .catch((cause) => !cancelled && fail(cause))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [fetchAll, apply, fail]);

  const toggleStatus = async (account: AccountItem) => {
    const status = account.status === "ACTIVE" ? "LOCKED" : "ACTIVE";
    try {
      await adminUserApi.updateUser(account.id, { status });
      setAccounts((prev) => prev.map((item) => (item.id === account.id ? { ...item, status } : item)));
    } catch (cause) {
      alert(`Không thể thay đổi trạng thái tài khoản: ${cause instanceof Error ? cause.message : "Lỗi kết nối API"}`);
    }
  };

  const remove = async (account: AccountItem) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản @${account.username} khỏi hệ thống?`)) return;
    try {
      await adminUserApi.deleteUser(account.id);
      setAccounts((prev) => prev.filter((item) => item.id !== account.id));
      alert(`Đã xóa tài khoản @${account.username} thành công!`);
    } catch (cause) {
      alert(`Xóa tài khoản thất bại: ${cause instanceof Error ? cause.message : "Lỗi máy chủ khi xóa"}`);
    }
  };

  const filtered = useMemo(() => {
    const term = filters.search.toLowerCase().trim();
    return accounts.filter((account) => {
      const matchSearch = !term || [account.username, account.fullName, account.email, account.phone].some((field) => String(field ?? "").toLowerCase().includes(term));
      return matchSearch && (filters.role === "ALL" || account.roleCode === filters.role) && (filters.status === "ALL" || account.status === filters.status);
    });
  }, [accounts, filters]);

  return { accounts, filtered, roles, stores, loading, error, filters, setFilters, reload, toggleStatus, remove };
}
