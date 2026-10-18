import React from "react";
import { Clock3 } from "lucide-react";
import { relId, text, timeRange } from "@/lib/format";
import { useSchedule } from "../ScheduleContext";
import { AddButton, EntityActions } from "../components/EntityActions";
import { TabSection } from "../components/TabSection";
import { StoreFilter } from "../components/StoreFilter";

export function ShiftTab() {
  // Đã lọc theo cửa hàng ở bộ lọc chung đầu trang
  const { shifts: filtered, lookups } = useSchedule();

  return (
    <TabSection
      title={`Danh sách Shift (${filtered.length})`}
      icon={Clock3}
      iconClassName="text-blue-600"
      actions={
        <>
          <StoreFilter />
          <AddButton kind="shift" className="" />
        </>
      }
    >
      {filtered.map((item) => (
        <div key={Number(item.id ?? item.shiftId ?? 0)} className="tile">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-black text-slate-800">{text(item.shiftName, text(item.shiftCode))}</p>
              <p className="mt-1 text-[11px] text-slate-500">{timeRange(item.startTime, item.endTime)}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                <span className="badge badge-brand text-[11px] font-semibold">
                  {text(item.storeName, item.storeId ? `Cửa hàng #${item.storeId}` : "Chưa xác định cửa hàng")}
                </span>
                <span className="badge bg-violet-100 text-[11px] font-semibold text-violet-700">
                  {text(item.shiftGroupName ?? lookups.groupNameOf(relId(item, "shiftGroup")), "Chưa gán nhóm ca")}
                </span>
              </div>
            </div>
            <EntityActions kind="shift" item={item} />
          </div>
          <div className="mt-4 flex items-center justify-between text-[11px] text-slate-600">
            <span className="rounded-full bg-white px-2 py-1">{text(item.maxCapacity, "0")} người</span>
            <span className="rounded-full bg-emerald-100 px-2 py-1 text-emerald-700">{text(item.status)}</span>
          </div>
        </div>
      ))}
    </TabSection>
  );
}
