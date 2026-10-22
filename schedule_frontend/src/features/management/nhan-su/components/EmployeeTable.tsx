import React from "react";
import { Edit, Eye, Trash2 } from "lucide-react";
import type { EmployeeListItem, StoreResponse } from "@/lib/api";
import { date, isActive, statusName, value } from "../utils";
import { EmployeeAvatar } from "./EmployeeAvatar";

interface Props {
  /** Một trang nhân viên, đã kèm cửa hàng phân bổ (có tên) và cờ quản lý từ backend */
  employees: EmployeeListItem[];
  /** Dự phòng tên cửa hàng khi bản ghi phân bổ chưa có storeName */
  storeMap: Map<number, StoreResponse>;
  onView: (employee: EmployeeListItem) => void;
  /** Bỏ trống = chế độ chỉ xem (trưởng cửa hàng) */
  onEdit?: (employee: EmployeeListItem) => void;
  onDelete?: (employee: EmployeeListItem) => void;
}

const HEADERS = ["Nhân viên", "Email / điện thoại", "Cửa hàng phụ trách", "Ngày bắt đầu", "Trạng thái"];

export function EmployeeTable({ employees, storeMap, onView, onEdit, onDelete }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left">
        <thead className="bg-slate-50/60 text-[11px] font-bold uppercase text-slate-400">
          <tr>
            {HEADERS.map((header) => (
              <th key={header} className="px-5 py-3">{header}</th>
            ))}
            <th className="px-5 py-3 text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-xs">
          {employees.map((employee) => {
            const employeeAssignments = employee.assignments ?? [];
            return (
              <tr key={employee.id} className="transition-colors hover:bg-slate-50/50">
                <td className="px-5 py-4">
                  <div onClick={() => onView(employee)} className="group flex cursor-pointer items-center gap-3" title="Nhấp để xem hồ sơ chi tiết">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-brand-50 shadow-xs transition-all group-hover:ring-2 group-hover:ring-brand-400">
                      <EmployeeAvatar src={employee.avatar as string | null | undefined} gender={employee.gender} alt={employee.fullName ?? undefined} />
                    </div>
                    <div>
                      <b className="text-sm text-slate-800 transition-colors group-hover:text-brand-600">{value(employee.fullName)}</b>
                      <span className="block font-mono text-[11px] text-slate-400">
                        Mã: {value(employee.employeeCode)}
                        {employee.manager ? " · QUẢN LÝ" : ""}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 text-slate-600">
                  {value(employee.email)}
                  <span className="block text-slate-400">{value(employee.phone)}</span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex flex-wrap gap-1.5">
                    {employeeAssignments.length ? (
                      employeeAssignments.map((assignment) => (
                        <span key={assignment.employeeStoreId} className="rounded-lg border border-slate-200/60 bg-slate-100 px-2 py-0.5 text-slate-700">
                          {value(assignment.storeName ?? storeMap.get(assignment.storeId)?.storeName, `Store #${assignment.storeId}`)}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-400">Chưa phân bổ</span>
                    )}
                  </div>
                </td>
                <td className="px-5 py-4 text-slate-500">{date(employee.hireDate)}</td>
                <td className="px-5 py-4">
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                      isActive(employee.status) ? "border border-emerald-200 bg-emerald-50 text-emerald-700" : "border border-slate-200 bg-slate-100 text-slate-600"
                    }`}
                  >
                    {statusName(employee.status)}
                  </span>
                </td>
                <td className="px-5 py-4 text-right">
                  <div className="flex justify-end gap-1.5">
                    <button
                      onClick={() => onView(employee)}
                      className="rounded-lg border border-slate-200 p-2 text-slate-600 transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
                      title="Xem hồ sơ nhân viên"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                    {onEdit && (
                      <button onClick={() => onEdit(employee)} className="rounded-lg border border-slate-200 p-2 text-slate-600 transition-colors hover:bg-slate-100" title="Sửa">
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                    )}
                    {onDelete && (
                      <button onClick={() => onDelete(employee)} className="rounded-lg border border-rose-200 p-2 text-rose-700 transition-colors hover:bg-rose-50" title="Xóa">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
