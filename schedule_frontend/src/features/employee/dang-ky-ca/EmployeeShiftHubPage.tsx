"use client";

import React, { useState } from "react";
import {
  ArrowLeftRight,
  CalendarCheck,
  CalendarPlus,
  CalendarX,
} from "lucide-react";
import { PageHeader } from "@/components/ui";
import { cn } from "@/lib/cn";
import ShiftRequestPanel from "../doi-huy-ca/ShiftRequestPanel";
import { REQUEST_META, type ShiftRequestType } from "../doi-huy-ca/model";
import EmployeeRegisterShiftPage from "./EmployeeRegisterShiftPage";

export type ShiftHubType = "REGISTER" | ShiftRequestType;

const OPTIONS: {
  value: ShiftHubType;
  label: string;
  hint: string;
  icon: typeof CalendarCheck;
}[] = [
  {
    value: "REGISTER",
    label: "Đăng ký ca",
    hint: "Trong thời gian mở đăng ký",
    icon: CalendarCheck,
  },
  {
    value: "ADD",
    label: "Thêm ca",
    hint: "Sau khi hết hạn đăng ký",
    icon: CalendarPlus,
  },
  {
    value: "CHANGE",
    label: "Đổi ca",
    hint: "Ca đã được duyệt",
    icon: ArrowLeftRight,
  },
  {
    value: "CANCEL",
    label: "Hủy ca",
    hint: "Ca đã được duyệt",
    icon: CalendarX,
  },
];

/**
 * Đăng ký ca của nhân viên: một giao diện cho Đăng ký / Thêm / Đổi / Hủy ca,
 * chọn loại thì phần nội dung đổi tương ứng.
 */
export default function EmployeeShiftHubPage({
  initialType = "REGISTER",
}: {
  initialType?: ShiftHubType;
}) {
  const [type, setType] = useState<ShiftHubType>(initialType);

  const toolbar = (
    <div className="card p-2" role="tablist" aria-label="Loại đăng ký">
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        {OPTIONS.map(({ value, label, hint, icon: Icon }) => {
          const active = type === value;
          return (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setType(value)}
              className={cn(
                "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left transition",
                active
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-50",
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0",
                  active ? "text-brand-300" : "text-slate-400",
                )}
              />
              <span>
                <span className="block text-xs font-black">{label}</span>
                <span
                  className={cn(
                    "block text-[10px]",
                    active ? "text-slate-300" : "text-slate-400",
                  )}
                >
                  {hint}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );

  if (type === "REGISTER")
    return <EmployeeRegisterShiftPage toolbar={toolbar} />;

  return (
    <div className="page">
      <PageHeader
        title="Đăng ký ca"
        subtitle={REQUEST_META[type].description}
      />
      {toolbar}
      <ShiftRequestPanel key={type} type={type} />
    </div>
  );
}
