"use client";

import React, { useState } from "react";
import { AlertTriangle, Award, Calendar, CalendarRange, Clock3, RefreshCw, SlidersHorizontal, Users } from "lucide-react";
import { Alert, Button, PageHeader, Tabs, type TabItem } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { TabKey } from "./constants";
import { ScheduleProvider, useSchedule } from "./ScheduleContext";
import { ScheduleFormModal } from "./form/ScheduleFormModal";
import { ShiftDetailDrawer } from "./shift-detail/ShiftDetailDrawer";
import { DeleteConfirmModal } from "./components/DeleteConfirmModal";
import { PeriodTab } from "./tabs/period/PeriodTab";
import { CalendarTab }  from "./tabs/calendar/CalendarTab";
import { ShiftTab } from "./tabs/ShiftTab";
import { RoundTab } from "./tabs/RoundTab";
import { SessionTab } from "./tabs/SessionTab";
import { EventTab, GroupTab } from "./tabs/CatalogTabs";
import { CapacityConfigTab } from "./tabs/CapacityConfigTab";

/**
 * Thứ tự tab: Kỳ → Nhóm ca (gồm cấu hình số lượng theo khung giờ) → Thời khóa biểu → Sự kiện
 * (yêu cầu khẩn của nhân viên xử lý trong Danh sách yêu cầu của TKB).
 */
export type GroupKey = "period" | "group" | "calendar" | "event";

/** Tab chính; nhóm có nhiều tab con thì hiện thêm thanh chọn tab con bên dưới. */
const GROUPS: (TabItem<GroupKey> & { tabs: TabItem<TabKey>[] })[] = [
  {
    key: "period",
    label: "Kỳ",
    icon: CalendarRange,
    tabs: [
      { key: "period", label: "Kỳ", icon: CalendarRange },
      { key: "round", label: "Đợt đăng ký", icon: CalendarRange },
      { key: "session", label: "Phiên", icon: Users },
    ],
  },
  {
    key: "group",
    label: "Nhóm ca",
    icon: Award,
    tabs: [
      { key: "group", label: "Nhóm ca", icon: Award },
      { key: "shift", label: "Ca", icon: Clock3 },
      { key: "config", label: "Số lượng theo khung giờ", icon: SlidersHorizontal },
    ],
  },
  { key: "calendar", label: "Thời khóa biểu", icon: Calendar, tabs: [{ key: "calendar", label: "Thời khóa biểu" }] },
  { key: "event", label: "Sự kiện", icon: AlertTriangle, tabs: [{ key: "event", label: "Sự kiện" }] },
];

const TAB_CONTENT: Record<TabKey, React.ComponentType> = {
  period: PeriodTab,
  shift: ShiftTab,
  calendar: CalendarTab,
  round: RoundTab,
  session: SessionTab,
  group: GroupTab,
  event: EventTab,
  config: CapacityConfigTab,
};

interface LichPageProps {
  /** Các tab chính được hiện (trưởng cửa hàng chỉ dùng Thời khóa biểu); mặc định tất cả */
  groups?: GroupKey[];
  title?: string;
  subtitle?: string;
}

/** Quản lý lịch & ca làm việc: kỳ → đợt → phiên, ca mẫu, thời khóa biểu và phân bổ. */
export default function LichPage(props: LichPageProps) {
  return (
    <ScheduleProvider>
      <LichPageContent {...props} />
    </ScheduleProvider>
  );
}

function LichPageContent({
  groups: visible,
  title = "Quản lý lịch & ca làm việc",
  subtitle = "Phân quyền theo role, xem theo cửa hàng và ca làm",
}: LichPageProps) {
  const { loading, error, reload } = useSchedule();
  const groups = visible ? GROUPS.filter((item) => visible.includes(item.key)) : GROUPS;
  const [activeGroup, setActiveGroup] = useState<GroupKey>("calendar");
  // Tab con đang chọn của từng nhóm (giữ nguyên khi chuyển qua lại giữa các nhóm)
  const [subTab, setSubTab] = useState<Partial<Record<GroupKey, TabKey>>>({});
  const group = groups.find((item) => item.key === activeGroup) ?? groups[0];
  const activeTab = subTab[group.key] ?? group.tabs[0].key;
  const Content = TAB_CONTENT[activeTab];

  return (
    <div className="page">
      <ScheduleFormModal />
      <ShiftDetailDrawer />
      <DeleteConfirmModal />

      <PageHeader
        title={title}
        subtitle={subtitle}
        actions={
          <Button variant="secondary" onClick={() => void reload()} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Làm mới
          </Button>
        }
      />

      {error && <Alert>{error}</Alert>}

      {groups.length > 1 && <Tabs items={groups} active={group.key} onChange={setActiveGroup} />}

      {group.tabs.length > 1 && (
        <div className="flex flex-wrap gap-1 rounded-xl border border-slate-200 bg-surface p-1 sm:w-fit" role="tablist">
          {group.tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={activeTab === key}
              onClick={() => setSubTab((current) => ({ ...current, [group.key]: key }))}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-xs font-bold transition",
                activeTab === key ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-100"
              )}
            >
              {Icon && <Icon className="h-3.5 w-3.5" />}
              {label}
            </button>
          ))}
        </div>
      )}

      <Content />
    </div>
  );
}
