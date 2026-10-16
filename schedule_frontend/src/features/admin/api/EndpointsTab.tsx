import React, { useMemo, useState } from "react";
import { matchesText, methodBadge, ROLE_META, type ApiEndpointItem, type MethodFilter } from "./apiCatalog";
import { MethodPills, SearchInput } from "./components";

/** Danh mục toàn bộ API, lọc theo từ khóa / phương thức / module. */
export function EndpointsTab({ endpoints, modules }: { endpoints: ApiEndpointItem[]; modules: string[] }) {
  const [search, setSearch] = useState("");
  const [method, setMethod] = useState<MethodFilter>("ALL");
  const [module, setModule] = useState("ALL");

  const filtered = useMemo(
    () =>
      endpoints.filter(
        (endpoint) =>
          matchesText(search, endpoint.path, endpoint.name, endpoint.desc, endpoint.controller) &&
          (method === "ALL" || endpoint.method === method) &&
          (module === "ALL" || endpoint.module === module)
      ),
    [endpoints, search, method, module]
  );

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-surface shadow-xs">
      <div className="space-y-3 border-b border-slate-100 bg-slate-50/60 p-4">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-sm font-bold text-slate-800">
              Toàn bộ API hệ thống ({filtered.length}/{endpoints.length})
            </h3>
            <p className="text-[11px] text-slate-400">Danh sách đầy đủ các endpoint API của hệ thống</p>
          </div>
          <MethodPills value={method} onChange={setMethod} />
        </div>
        <div className="flex flex-col items-center gap-2 sm:flex-row">
          <SearchInput value={search} onChange={setSearch} placeholder="Tìm theo URL, tên chức năng, controller..." className="w-full flex-1" />
          <select
            value={module}
            onChange={(event) => setModule(event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 outline-hidden focus:border-brand-400 sm:w-48"
          >
            <option value="ALL">Tất cả Modules ({endpoints.length})</option>
            {modules.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="max-h-[680px] divide-y divide-slate-100 overflow-y-auto text-xs">
        {filtered.map((endpoint) => (
          <div key={endpoint.id} className="flex flex-col justify-between gap-3 p-4 transition-colors hover:bg-slate-50/80 sm:flex-row sm:items-center">
            <div className="min-w-0 flex-1 space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-md border px-2 py-0.5 text-[10px] font-black ${methodBadge(endpoint.method)}`}>{endpoint.method}</span>
                <span className="truncate font-mono text-xs font-bold text-slate-800">{endpoint.path}</span>
                <span className="rounded bg-slate-100 px-2 text-[10px] font-semibold text-slate-400">{endpoint.module}</span>
              </div>
              <p className="text-xs font-bold text-slate-800">{endpoint.name}</p>
              <p className="line-clamp-1 text-[11px] text-slate-500">{endpoint.desc}</p>
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] font-semibold text-slate-400">Quyền gọi:</span>
                {endpoint.roles.map((role) => (
                  <span key={role} className={`rounded border px-1.5 text-[9px] font-black ${ROLE_META[role].badge}`}>{role}</span>
                ))}
              </div>
            </div>
            <span className="shrink-0 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
              {endpoint.status || "Đã cấu hình"}
            </span>
          </div>
        ))}
        {filtered.length === 0 && <div className="p-8 text-center text-xs text-slate-400">Không tìm thấy endpoint nào phù hợp với bộ lọc.</div>}
      </div>
    </div>
  );
}
