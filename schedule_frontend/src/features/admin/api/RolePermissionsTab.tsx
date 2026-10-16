import React, { useMemo, useState } from "react";
import { CheckCircle2, Plus } from "lucide-react";
import type { PermissionResponse, RoleResponse } from "@/lib/api";
import type { UserRoleCode } from "@/types/auth";
import { actionTypeOf, isSupportedRole, matchesText, methodBadge, ROLE_META, type ApiEndpointItem, type MethodFilter } from "./apiCatalog";
import { MethodPills, SearchInput } from "./components";
import { AssignPermissionPanel } from "./AssignPermissionPanel";

interface Props {
  roles: RoleResponse[];
  endpoints: ApiEndpointItem[];
  selectedRole: UserRoleCode;
  onSelectRole: (role: UserRoleCode) => void;
  canAssign: boolean;
  availablePermissions: PermissionResponse[];
  onAssign: (permissionIds: number[]) => Promise<void>;
}

/** Thẻ chọn vai trò và bảng API được cấp cho vai trò đó. */
export function RolePermissionsTab({ roles, endpoints, selectedRole, onSelectRole, canAssign, availablePermissions, onAssign }: Props) {
  const [search, setSearch] = useState("");
  const [method, setMethod] = useState<MethodFilter>("ALL");
  const [assignOpen, setAssignOpen] = useState(false);
  const meta = ROLE_META[selectedRole];

  const roleApis = useMemo(
    () =>
      endpoints.filter(
        (endpoint) =>
          endpoint.roles.includes(selectedRole) &&
          matchesText(search, endpoint.path, endpoint.name, endpoint.desc, endpoint.module) &&
          (method === "ALL" || endpoint.method === method)
      ),
    [endpoints, selectedRole, search, method]
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {roles
          .map((role) => role.roleCode)
          .filter(isSupportedRole)
          .map((code) => {
            const count = endpoints.filter((endpoint) => endpoint.roles.includes(code)).length;
            const percentage = endpoints.length === 0 ? 0 : Math.round((count / endpoints.length) * 100);
            const selected = selectedRole === code;
            return (
              <button
                key={code}
                onClick={() => onSelectRole(code)}
                className={`relative cursor-pointer overflow-hidden rounded-2xl border p-4 text-left transition-all ${
                  selected ? "border-brand-500 bg-brand-500/10 shadow-md ring-2 ring-brand-400/50" : "border-slate-200/80 bg-white shadow-xs hover:border-slate-300 hover:bg-slate-50/50"
                }`}
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-black ${ROLE_META[code].badge}`}>{code}</span>
                  <span className="font-mono text-xs font-black text-slate-800">{count}/{endpoints.length} API</span>
                </div>
                <h4 className="text-sm font-extrabold text-slate-800">{ROLE_META[code].name}</h4>
                <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-slate-500">{ROLE_META[code].desc}</p>
                <div className="mt-3">
                  <div className="mb-1 flex items-center justify-between text-[10px] font-semibold text-slate-400">
                    <span>Phạm vi quyền API:</span>
                    <span className="font-black text-slate-700">{percentage}%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div className={`h-full rounded-full ${ROLE_META[code].bar}`} style={{ width: `${percentage}%` }} />
                  </div>
                </div>
              </button>
            );
          })}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-surface shadow-xs">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-100 bg-slate-50/70 p-5 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-2.5">
              <span className={`rounded-full border px-3 py-1 text-xs font-black ${meta.badge}`}>VAI TRÒ: {selectedRole}</span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-sm font-bold text-slate-800">{meta.name}</span>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Đang hiển thị <strong className="text-slate-800">{roleApis.length}</strong> API được cấp phép cho vai trò{" "}
              <strong className="text-slate-800">[{selectedRole}]</strong>.
            </p>
          </div>
          <div className="flex flex-col items-center gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => setAssignOpen(true)}
              disabled={!canAssign || availablePermissions.length === 0}
              className="btn btn-primary btn-sm text-[11px] font-black"
            >
              <Plus className="h-3.5 w-3.5" />
              Gán quyền
            </button>
            <SearchInput value={search} onChange={setSearch} placeholder={`Tìm API trong vai trò ${selectedRole}...`} className="w-full sm:w-64" />
            <MethodPills value={method} onChange={setMethod} className="w-full justify-center sm:w-auto" />
          </div>
        </div>

        {assignOpen && (
          <AssignPermissionPanel roleCode={selectedRole} permissions={availablePermissions} onAssign={onAssign} onClose={() => setAssignOpen(false)} />
        )}

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="w-28 px-5 py-3">Phương thức</th>
                <th className="px-5 py-3">Tuyến đường API (Path)</th>
                <th className="px-5 py-3">Tên quyền & Chức năng</th>
                <th className="px-5 py-3">Phân hệ / Controller</th>
                <th className="px-5 py-3 text-center">Loại quyền</th>
                <th className="px-5 py-3 text-right">Trạng thái quyền</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {roleApis.map((endpoint) => {
                const action = actionTypeOf(endpoint.method);
                return (
                  <tr key={endpoint.id} className="transition-colors hover:bg-slate-50/60">
                    <td className="px-5 py-3.5">
                      <span className={`rounded-md border px-2.5 py-1 text-[10px] font-black ${methodBadge(endpoint.method)}`}>{endpoint.method}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-mono text-xs font-bold text-slate-800">{endpoint.path}</p>
                      <p className="mt-0.5 line-clamp-1 text-[11px] text-slate-400">{endpoint.desc}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-bold text-slate-800">{endpoint.name}</p>
                      <span className="font-mono text-[10px] text-slate-400">ROLE_{endpoint.id.toUpperCase()}</span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">
                      <p className="font-semibold text-slate-700">{endpoint.module}</p>
                      <p className="font-mono text-[10px] text-slate-400">{endpoint.controller}</p>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${action.color}`}>{action.label}</span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
                        <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                        <span>Đã cấp phép</span>
                      </span>
                    </td>
                  </tr>
                );
              })}
              {roleApis.length === 0 && (
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
  );
}
