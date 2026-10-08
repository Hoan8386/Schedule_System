"use client";

import React, { useEffect, useState } from "react";
import {
  Code,
  Activity,
  RefreshCw,
  Plus,
  X,
  ShieldCheck,
  ExternalLink,
  Search,
  CheckCircle2,
  Layers,
} from "lucide-react";
import { UserRoleCode } from "@/types/auth";
import {
  adminApiIntegration,
  adminUserApi,
  AuditLogResponse,
  PermissionResponse,
  RolePermissionResponse,
  RoleResponse,
} from "@/lib/adminApi";

export interface ApiEndpointItem {
  id: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  name: string;
  desc: string;
  module: string;
  controller: string;
  roles: UserRoleCode[];
  status?: string;
}

function moduleFromPath(path: string): string {
  const resource = path.replace(/^\/api\/v1\//, "").split("/")[0];
  const labels: Record<string, string> = {
    auth: "Xác thực & Phiên",
    user: "Tài khoản & Phân quyền",
    role: "Tài khoản & Phân quyền",
    permission: "Tài khoản & Phân quyền",
    user_role: "Tài khoản & Phân quyền",
    role_permission: "Tài khoản & Phân quyền",
    audit_log: "Cấu hình & Quản trị",
    organization_setting: "Cấu hình & Quản trị",
    system_config: "Cấu hình & Quản trị",
    stores: "Cửa hàng & Nhân sự",
    employees: "Cửa hàng & Nhân sự",
    schedule: "Lịch & Ca làm",
    shift: "Lịch & Ca làm",
    attendance: "Chấm công",
    payroll: "Lương & Thưởng",
    feedback: "Feedback & Đánh giá",
    notification: "Thông báo",
    test: "Kiểm tra & Đào tạo",
  };
  return labels[resource] || "API khác";
}

function endpointsFromPermissions(
  permissions: PermissionResponse[],
  roles: RoleResponse[],
  rolePermissions: RolePermissionResponse[]
): ApiEndpointItem[] {
  const roleById = new Map(roles.map((role) => [role.roleId, role.roleCode]));
  const rolesByPermission = new Map<number, UserRoleCode[]>();

  rolePermissions.forEach(({ permissionId, roleId }) => {
    const roleCode = roleById.get(roleId);
    if (roleCode && ["ADMIN", "MANAGER", "STORE_MANAGER", "EMPLOYEE"].includes(roleCode)) {
      const existing = rolesByPermission.get(permissionId) || [];
      if (!existing.includes(roleCode as UserRoleCode)) {
        existing.push(roleCode as UserRoleCode);
      }
      rolesByPermission.set(permissionId, existing);
    }
  });

  return permissions
    .filter((permission) => permission.apiPath && permission.method)
    .map((permission) => ({
      id: `permission_${permission.permissionId}`,
      method: permission.method!.toUpperCase() as ApiEndpointItem["method"],
      path: permission.apiPath!,
      name: permission.permissionName,
      desc: permission.description || permission.permissionCode,
      module: moduleFromPath(permission.apiPath!),
      controller: "Backend permission",
      roles: rolesByPermission.get(permission.permissionId) || [],
    }));
}

interface RoleMeta {
  code: UserRoleCode;
  name: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  desc: string;
  scope: string;
}

const roleMetas: Record<UserRoleCode, RoleMeta> = {
  ADMIN: {
    code: "ADMIN",
    name: "Quản trị viên (Root Admin)",
    badgeBg: "bg-red-50",
    badgeText: "text-red-700",
    badgeBorder: "border-red-200",
    desc: "Toàn quyền quản trị hệ thống, tài khoản, cấu hình tham số, bảo mật và toàn bộ API",
    scope: "Toàn bộ hệ thống BLOAN (Toàn quyền 100%)",
  },
  MANAGER: {
    code: "MANAGER",
    name: "Quản lý chuỗi (Operation Manager)",
    badgeBg: "bg-blue-50",
    badgeText: "text-blue-700",
    badgeBorder: "border-blue-200",
    desc: "Quản lý vận hành toàn chuỗi chi nhánh, nhân sự, chốt bảng lương, duyệt ca và giải trình",
    scope: "Toàn bộ chi nhánh & Cụm cửa hàng",
  },
  STORE_MANAGER: {
    code: "STORE_MANAGER",
    name: "Trưởng cửa hàng (Store Manager)",
    badgeBg: "bg-amber-50",
    badgeText: "text-amber-800",
    badgeBorder: "border-amber-200",
    desc: "Xếp ca, đối soát chấm công, duyệt đổi ca nhân viên, lập biên bản và đề xuất khen thưởng tại cửa hàng",
    scope: "Cửa hàng phụ trách",
  },
  EMPLOYEE: {
    code: "EMPLOYEE",
    name: "Nhân viên (Staff / Member)",
    badgeBg: "bg-emerald-50",
    badgeText: "text-emerald-700",
    badgeBorder: "border-emerald-200",
    desc: "Xem lịch làm việc cá nhân, đăng ký ca mở, điểm danh FaceID, xem phiếu lương và nộp bài kiểm tra",
    scope: "Dữ liệu cá nhân & Ca làm việc của mình",
  },
};

export default function QuanLyApiPage() {
  const [activeTab, setActiveTab] = useState<"endpoints" | "roles_permissions">("endpoints");
  const [endpoints, setEndpoints] = useState<ApiEndpointItem[]>([]);
  const [roles, setRoles] = useState<RoleResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogResponse[]>([]);
  const [permissions, setPermissions] = useState<PermissionResponse[]>([]);
  const [rolePermissions, setRolePermissions] = useState<RolePermissionResponse[]>([]);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<number[]>([]);
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);

  // Filters cho danh sách All Endpoints
  const [searchEndpoint, setSearchEndpoint] = useState("");
  const [filterMethod, setFilterMethod] = useState<"ALL" | "GET" | "POST" | "PUT" | "DELETE">("ALL");
  const [filterModule, setFilterModule] = useState<string>("ALL");

  // Tab Role & APIs
  const [selectedRole, setSelectedRole] = useState<UserRoleCode>("ADMIN");
  const [roleApiSearch, setRoleApiSearch] = useState("");
  const [roleMethodFilter, setRoleMethodFilter] = useState<"ALL" | "GET" | "POST" | "PUT" | "DELETE">("ALL");



  useEffect(() => {
    let cancelled = false;

    const loadApiData = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const [permissionResponse, roleResponse, rolePermissionResponse, auditResponse] =
          await Promise.all([
            adminUserApi.getPermissions(),
            adminUserApi.getRoles(),
            adminUserApi.getRolePermissions(),
            adminApiIntegration.getAuditLogs(),
          ]);

        if (cancelled) return;
        setRoles(roleResponse.data);
        setPermissions(permissionResponse.data);
        setRolePermissions(rolePermissionResponse.data);
        setAuditLogs(auditResponse.data);
        setEndpoints(
          endpointsFromPermissions(
            permissionResponse.data,
            roleResponse.data,
            rolePermissionResponse.data
          )
        );
        if (roleResponse.data.length > 0) {
          const firstSupportedRole = roleResponse.data.find((role) =>
            ["ADMIN", "MANAGER", "STORE_MANAGER", "EMPLOYEE"].includes(role.roleCode)
          );
          if (firstSupportedRole) {
            setSelectedRole(firstSupportedRole.roleCode as UserRoleCode);
          }
        }
      } catch (error) {
        if (!cancelled) {
          setLoadError(
            error instanceof Error
              ? error.message
              : "Không thể tải danh mục API từ backend."
          );
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void loadApiData();
    return () => {
      cancelled = true;
    };
  }, []);



  const apiEndpoints = endpoints;
  const selectedRoleRecord = roles.find((role) => role.roleCode === selectedRole);
  const assignedPermissionIds = new Set(
    rolePermissions
      .filter((item) => item.roleId === selectedRoleRecord?.roleId)
      .map((item) => item.permissionId)
  );
  const availablePermissions = permissions.filter(
    (permission) => !assignedPermissionIds.has(permission.permissionId)
  );
  const uniqueModules = Array.from(new Set(apiEndpoints.map((ep) => ep.module)));

  // Lọc toàn bộ API
  const filteredEndpoints = apiEndpoints.filter((ep) => {
    const matchSearch =
      ep.path.toLowerCase().includes(searchEndpoint.toLowerCase()) ||
      ep.name.toLowerCase().includes(searchEndpoint.toLowerCase()) ||
      ep.desc.toLowerCase().includes(searchEndpoint.toLowerCase()) ||
      ep.controller.toLowerCase().includes(searchEndpoint.toLowerCase());
    const matchMethod = filterMethod === "ALL" || ep.method === filterMethod;
    const matchMod = filterModule === "ALL" || ep.module === filterModule;
    return matchSearch && matchMethod && matchMod;
  });

  // Lọc API thuộc Role được chọn
  const apisOfSelectedRole = apiEndpoints.filter((ep) => {
    const hasRole = ep.roles.includes(selectedRole);
    const matchSearch =
      ep.path.toLowerCase().includes(roleApiSearch.toLowerCase()) ||
      ep.name.toLowerCase().includes(roleApiSearch.toLowerCase()) ||
      ep.desc.toLowerCase().includes(roleApiSearch.toLowerCase()) ||
      ep.module.toLowerCase().includes(roleApiSearch.toLowerCase());
    const matchMethod = roleMethodFilter === "ALL" || ep.method === roleMethodFilter;
    return hasRole && matchSearch && matchMethod;
  });

  const getMethodBadge = (method: string) => {
    switch (method) {
      case "GET":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "POST":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "PUT":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "DELETE":
        return "bg-rose-100 text-rose-800 border-rose-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  const handleAssignPermissions = async () => {
    if (!selectedRoleRecord || selectedPermissionIds.length === 0) return;

    setIsAssigning(true);
    setAssignError(null);
    try {
      await Promise.all(
        selectedPermissionIds.map((permissionId) =>
          adminUserApi.assignPermission({
            roleId: selectedRoleRecord.roleId,
            permissionId,
          })
        )
      );
      const newLinks = selectedPermissionIds.map((permissionId) => ({
        roleId: selectedRoleRecord.roleId,
        permissionId,
      }));
      setRolePermissions((current) => [...current, ...newLinks]);
      setEndpoints((current) =>
        current.map((endpoint) =>
          selectedPermissionIds.includes(Number(endpoint.id.replace("permission_", "")))
            ? { ...endpoint, roles: [...endpoint.roles, selectedRole] }
            : endpoint
        )
      );
      setSelectedPermissionIds([]);
      setIsAssignModalOpen(false);
    } catch (error) {
      setAssignError(
        error instanceof Error ? error.message : "Không thể gán permission cho role."
      );
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-lg">
              ADMIN CENTER
            </span>
            <span className="text-slate-400 text-xs">/</span>
            <span className="text-slate-500 text-xs font-semibold">Tích hợp & Lập trình</span>
          </div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight mt-1">
            Quản lý API & Phân quyền Endpoints
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Danh mục quyền API và phân quyền theo từng vai trò được đọc trực tiếp từ backend.
          </p>
        </div>

        {loadError && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700">
            Không thể tải dữ liệu quản lý API: {loadError}
          </div>
        )}
        {isLoading && (
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-500">
            Đang tải quyền API, vai trò và liên kết phân quyền từ backend...
          </div>
        )}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => alert("Mở Swagger UI Backend: http://localhost:8080/swagger-ui.html")}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-xs"
          >
            <ExternalLink className="w-4 h-4 text-slate-500" />
            <span>Tài liệu Swagger UI</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Tổng Endpoints API</span>
            <div className="text-2xl sm:text-3xl font-black text-slate-800 mt-1 tracking-tight">
              {apiEndpoints.length}
            </div>
            <p className="text-[11px] text-emerald-600 mt-1 font-semibold">Đầy đủ 12 phân hệ nghiệp vụ</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Code className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Vai trò phân quyền (RBAC)</span>
            <div className="text-2xl sm:text-3xl font-black text-slate-800 mt-1 tracking-tight">
              {roles.length} Roles
            </div>
            <p className="text-[11px] text-amber-700 mt-1 font-semibold">Admin, Manager, SM, Staff</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Phân hệ chức năng</span>
            <div className="text-2xl sm:text-3xl font-black text-slate-800 mt-1 tracking-tight">
              {uniqueModules.length} Modules
            </div>
            <p className="text-[11px] text-emerald-600 mt-1 font-semibold">Bao quát toàn chuỗi BLOAN</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Tình trạng Backend</span>
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1 tracking-tight">
              {isLoading ? "..." : loadError ? "OFFLINE" : "ONLINE"}
            </div>
            <p className="text-[11px] text-slate-400 mt-1 font-medium">Spring Boot v3.x · 200 OK</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Activity className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Tabs Bar - Chỉ 2 tab: Toàn bộ API và Role & APIs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200/80 pb-3">
        <button
          onClick={() => setActiveTab("endpoints")}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "endpoints"
              ? "bg-amber-500 text-slate-900 shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Code className="w-4 h-4" />
          <span>Danh mục toàn bộ API ({apiEndpoints.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("roles_permissions")}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "roles_permissions"
              ? "bg-amber-500 text-slate-900 shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Role & API thuộc Role ({roles.length} Vai trò)</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: DANH MỤC TOÀN BỘ API                                   */}
      {/* ============================================================== */}
      {activeTab === "endpoints" ? (
        <div>
          {/* Danh sách toàn bộ API */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col">
            {/* Filter Bar */}
            <div className="p-4 bg-slate-50/60 border-b border-slate-100 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">
                    Toàn bộ API hệ thống ({filteredEndpoints.length}/{apiEndpoints.length})
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Danh sách đầy đủ các endpoint API của hệ thống
                  </p>
                </div>

                {/* Method pills */}
                <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200">
                  {(["ALL", "GET", "POST", "PUT", "DELETE"] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setFilterMethod(m)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all ${
                        filterMethod === m
                          ? "bg-amber-500 text-slate-900 shadow-xs"
                          : "text-slate-500 hover:bg-slate-100"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search & Module filter */}
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <div className="relative flex-1 w-full">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchEndpoint}
                    onChange={(e) => setSearchEndpoint(e.target.value)}
                    placeholder="Tìm theo URL, tên chức năng, controller..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl outline-hidden focus:border-amber-400 font-medium text-slate-700"
                  />
                </div>
                <select
                  value={filterModule}
                  onChange={(e) => setFilterModule(e.target.value)}
                  className="w-full sm:w-48 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl outline-hidden focus:border-amber-400 font-medium text-slate-700"
                >
                  <option value="ALL">Tất cả Modules ({apiEndpoints.length})</option>
                  {uniqueModules.map((mod) => (
                    <option key={mod} value={mod}>
                      {mod}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* List Endpoints */}
            <div className="divide-y divide-slate-100 text-xs overflow-y-auto max-h-[680px]">
              {filteredEndpoints.map((ep) => (
                <div
                  key={ep.id}
                  className="p-4 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${getMethodBadge(
                          ep.method
                        )}`}
                      >
                        {ep.method}
                      </span>
                      <span className="font-mono font-bold text-slate-800 text-xs truncate">
                        {ep.path}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold bg-slate-100 px-2 py-0.2 rounded">
                        {ep.module}
                      </span>
                    </div>

                    <p className="text-slate-800 font-bold text-xs">{ep.name}</p>
                    <p className="text-slate-500 text-[11px] line-clamp-1">{ep.desc}</p>

                    {/* Roles có quyền gọi API này */}
                    <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                      <span className="text-[10px] text-slate-400 font-semibold">Quyền gọi:</span>
                      {ep.roles.map((r) => {
                        const rMeta = roleMetas[r];
                        return (
                          <span
                            key={r}
                            className={`text-[9px] font-black px-1.5 py-0.2 rounded border ${rMeta.badgeBg} ${rMeta.badgeText} ${rMeta.badgeBorder}`}
                          >
                            {r}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  <div className="text-right shrink-0 flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1">
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      {ep.status || "Đã cấu hình"}
                    </span>
                  </div>
                </div>
              ))}

              {filteredEndpoints.length === 0 && (
                <div className="p-8 text-center text-slate-400 text-xs">
                  Không tìm thấy endpoint nào phù hợp với bộ lọc.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : activeTab === "roles_permissions" ? (
        /* ============================================================== */
        /* TAB 2: ROLE VÀ CÁC API THUỘC ROLE ĐÓ (THEO YÊU CẦU CỦA BẠN)    */
        /* ============================================================== */
        <div className="space-y-6">
          {/* 4 Thẻ chọn Role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {roles
              .map((role) => role.roleCode)
              .filter((rCode): rCode is UserRoleCode =>
                ["ADMIN", "MANAGER", "STORE_MANAGER", "EMPLOYEE"].includes(rCode)
              )
              .map((rCode) => {
              const rMeta = roleMetas[rCode];
              const isSelected = selectedRole === rCode;
              const countApis = apiEndpoints.filter((ep) => ep.roles.includes(rCode)).length;
              const percentage = apiEndpoints.length === 0 ? 0 : Math.round((countApis / apiEndpoints.length) * 100);

              return (
                <button
                  key={rCode}
                  onClick={() => setSelectedRole(rCode)}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                    isSelected
                      ? "bg-amber-500/10 border-amber-500 shadow-md ring-2 ring-amber-400/50"
                      : "bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/50 shadow-xs"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${rMeta.badgeBg} ${rMeta.badgeText} ${rMeta.badgeBorder}`}
                    >
                      {rCode}
                    </span>
                    <span className="text-xs font-black text-slate-800 font-mono">
                      {countApis}/{apiEndpoints.length} API
                    </span>
                  </div>

                  <h4 className="font-extrabold text-slate-800 text-sm">{rMeta.name}</h4>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {rMeta.desc}
                  </p>

                  {/* Progress bar mức độ truy cập */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold mb-1">
                      <span>Phạm vi quyền API:</span>
                      <span className="font-black text-slate-700">{percentage}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          rCode === "ADMIN"
                            ? "bg-red-500"
                            : rCode === "MANAGER"
                            ? "bg-blue-500"
                            : rCode === "STORE_MANAGER"
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Khung chi tiết danh sách API của Role được chọn */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            {/* Header của Role đang xem */}
            <div className="p-5 bg-slate-50/70 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <span
                    className={`text-xs font-black px-3 py-1 rounded-full border ${
                      roleMetas[selectedRole].badgeBg
                    } ${roleMetas[selectedRole].badgeText} ${roleMetas[selectedRole].badgeBorder}`}
                  >
                    VAI TRÒ: {selectedRole}
                  </span>
                  <span className="text-slate-400 text-xs">·</span>
                  <span className="font-bold text-slate-800 text-sm">
                    {roleMetas[selectedRole].name}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Đang hiển thị <strong className="text-slate-800">{apisOfSelectedRole.length}</strong> API được cấp phép cho vai trò <strong className="text-slate-800">[{selectedRole}]</strong>.
                </p>
              </div>

              {/* Bộ lọc Method & Tìm kiếm trong Role */}
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setAssignError(null);
                    setSelectedPermissionIds([]);
                    setIsAssignModalOpen(true);
                  }}
                  disabled={!selectedRoleRecord || availablePermissions.length === 0}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-amber-500 px-3 py-2 text-[11px] font-black text-slate-900 shadow-sm transition-colors hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Gán quyền
                </button>
                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={roleApiSearch}
                    onChange={(e) => setRoleApiSearch(e.target.value)}
                    placeholder={`Tìm API trong vai trò ${selectedRole}...`}
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl outline-hidden focus:border-amber-400 font-medium text-slate-700"
                  />
                </div>

                <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 w-full sm:w-auto justify-center">
                  {(["ALL", "GET", "POST", "PUT", "DELETE"] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setRoleMethodFilter(m)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all ${
                        roleMethodFilter === m
                          ? "bg-amber-500 text-slate-900 shadow-xs"
                          : "text-slate-500 hover:bg-slate-100"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {isAssignModalOpen && (
              <div className="border-b border-slate-100 bg-white p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-black text-slate-800">
                      Gán permission cho role {selectedRole}
                    </h3>
                    <p className="mt-1 text-[11px] text-slate-500">
                      Chọn một hoặc nhiều permission chưa được cấp cho role này.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAssignModalOpen(false)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                    aria-label="Đóng cửa sổ gán quyền"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-4 grid max-h-72 grid-cols-1 gap-2 overflow-y-auto sm:grid-cols-2">
                  {availablePermissions.map((permission) => {
                    const checked = selectedPermissionIds.includes(permission.permissionId);
                    return (
                      <label
                        key={permission.permissionId}
                        className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors ${
                          checked
                            ? "border-amber-400 bg-amber-50"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() =>
                            setSelectedPermissionIds((current) =>
                              checked
                                ? current.filter((id) => id !== permission.permissionId)
                                : [...current, permission.permissionId]
                            )
                          }
                          className="mt-0.5 accent-amber-500"
                        />
                        <span className="min-w-0">
                          <span className="block truncate text-xs font-bold text-slate-800">
                            {permission.permissionName}
                          </span>
                          <span className="mt-1 block truncate font-mono text-[10px] text-slate-500">
                            {permission.method || "—"} {permission.apiPath || "—"}
                          </span>
                        </span>
                      </label>
                    );
                  })}
                </div>

                {availablePermissions.length === 0 && (
                  <p className="mt-4 text-xs text-emerald-700">
                    Role này đã được cấp toàn bộ permission hiện có.
                  </p>
                )}
                {assignError && (
                  <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">
                    {assignError}
                  </p>
                )}
                <div className="mt-4 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAssignModalOpen(false)}
                    className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={handleAssignPermissions}
                    disabled={isAssigning || selectedPermissionIds.length === 0}
                    className="rounded-xl bg-amber-500 px-4 py-2 text-xs font-black text-slate-900 hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isAssigning ? "Đang gán..." : `Gán ${selectedPermissionIds.length} quyền`}
                  </button>
                </div>
              </div>
            )}

            {/* Bảng API của Role */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="px-5 py-3 w-28">Phương thức</th>
                    <th className="px-5 py-3">Tuyến đường API (Path)</th>
                    <th className="px-5 py-3">Tên quyền & Chức năng</th>
                    <th className="px-5 py-3">Phân hệ / Controller</th>
                    <th className="px-5 py-3 text-center">Loại quyền</th>
                    <th className="px-5 py-3 text-right">Trạng thái quyền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {apisOfSelectedRole.map((ep) => {
                    const actionType =
                      ep.method === "GET"
                        ? { label: "Đọc dữ liệu (Read)", color: "text-emerald-700 bg-emerald-50 border-emerald-200" }
                        : ep.method === "POST"
                        ? { label: "Thêm mới (Create)", color: "text-blue-700 bg-blue-50 border-blue-200" }
                        : ep.method === "PUT"
                        ? { label: "Cập nhật (Update)", color: "text-amber-700 bg-amber-50 border-amber-200" }
                        : { label: "Xóa bỏ (Delete)", color: "text-rose-700 bg-rose-50 border-rose-200" };

                    return (
                      <tr key={ep.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-5 py-3.5">
                          <span
                            className={`text-[10px] font-black px-2.5 py-1 rounded-md border ${getMethodBadge(
                              ep.method
                            )}`}
                          >
                            {ep.method}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <p className="font-mono font-bold text-slate-800 text-xs">{ep.path}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{ep.desc}</p>
                        </td>
                        <td className="px-5 py-3.5">
                          <p className="font-bold text-slate-800">{ep.name}</p>
                          <span className="text-[10px] font-mono text-slate-400">
                            ROLE_{ep.id.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-slate-600">
                          <p className="font-semibold text-slate-700">{ep.module}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{ep.controller}</p>
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${actionType.color}`}
                          >
                            {actionType.label}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Đã cấp phép</span>
                          </span>
                        </td>
                      </tr>
                    );
                  })}

                  {apisOfSelectedRole.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                        Không tìm thấy API nào phù hợp với bộ lọc trong vai trò {selectedRole}.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* ============================================================== */
        /* TAB 4: NHẬT KÝ GỌI API (AUDIT LOGS)                             */
        /* ============================================================== */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between text-xs">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Nhật ký truy vấn thời gian thực (API Logs)</h3>
              <p className="text-[11px] text-slate-400">50 lượt gọi gần nhất qua API Gateway</p>
            </div>
            <button
              onClick={() => alert("Đang làm mới log...")}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/60 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="px-5 py-3">Thời gian</th>
                  <th className="px-5 py-3">Phương thức & Tuyến đường</th>
                  <th className="px-5 py-3">Client IP</th>
                  <th className="px-5 py-3">HTTP Status</th>
                  <th className="px-5 py-3 text-right">Độ trễ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-mono">
                {auditLogs.map((log, i) => (
                  <tr key={log.id ?? i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3.5 text-slate-500">{log.createdAt || "—"}</td>
                    <td className="px-5 py-3.5">
                      <span className="font-bold text-slate-800">{log.action || "—"}</span>
                      <p className="text-[10px] text-slate-400 mt-1">{log.details || "—"}</p>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">{log.ipAddress || "—"}</td>
                    <td className="px-5 py-3.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-50 text-slate-700 border border-slate-200">
                        User ID: {log.userId ?? "—"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right font-bold text-slate-700">—</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
