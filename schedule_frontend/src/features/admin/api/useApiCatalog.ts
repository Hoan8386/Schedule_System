import { useEffect, useMemo, useState } from "react";
import { adminUserApi, type PermissionResponse, type RolePermissionResponse, type RoleResponse } from "@/lib/api";
import type { UserRoleCode } from "@/types/auth";
import { endpointsFromPermissions, isSupportedRole } from "./apiCatalog";

/** Tải permission, role, liên kết role_permission và cung cấp thao tác gán quyền. */
export function useApiCatalog() {
  const [roles, setRoles] = useState<RoleResponse[]>([]);
  const [permissions, setPermissions] = useState<PermissionResponse[]>([]);
  const [links, setLinks] = useState<RolePermissionResponse[]>([]);
  const [selectedRole, setSelectedRole] = useState<UserRoleCode>("ADMIN");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([adminUserApi.getPermissions(), adminUserApi.getRoles(), adminUserApi.getRolePermissions()])
      .then(([permissionRes, roleRes, linkRes]) => {
        if (cancelled) return;
        setPermissions(permissionRes.data);
        setRoles(roleRes.data);
        setLinks(linkRes.data);
        const firstSupported = roleRes.data.find((role) => isSupportedRole(role.roleCode));
        if (firstSupported) setSelectedRole(firstSupported.roleCode as UserRoleCode);
      })
      .catch((cause) => !cancelled && setError(cause instanceof Error ? cause.message : "Không thể tải danh mục API từ backend."))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const endpoints = useMemo(() => endpointsFromPermissions(permissions, roles, links), [permissions, roles, links]);
  const selectedRoleRecord = roles.find((role) => role.roleCode === selectedRole);

  const availablePermissions = useMemo(() => {
    const assigned = new Set(links.filter((link) => link.roleId === selectedRoleRecord?.roleId).map((link) => link.permissionId));
    return permissions.filter((permission) => !assigned.has(permission.permissionId));
  }, [links, permissions, selectedRoleRecord]);

  /** Gán nhiều permission cho role đang chọn. */
  const assignPermissions = async (permissionIds: number[]) => {
    if (!selectedRoleRecord || permissionIds.length === 0) return;
    const roleId = selectedRoleRecord.roleId;
    await Promise.all(permissionIds.map((permissionId) => adminUserApi.assignPermission({ roleId, permissionId })));
    setLinks((current) => [...current, ...permissionIds.map((permissionId) => ({ roleId, permissionId }))]);
  };

  return { roles, endpoints, selectedRole, setSelectedRole, selectedRoleRecord, availablePermissions, assignPermissions, loading, error };
}
