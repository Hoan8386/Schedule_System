"use client";

import React, { useState } from "react";
import { AlertCircle, AlertTriangle, Award, Calendar, CalendarRange, Clock3, RefreshCw, Users } from "lucide-react";
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
import { EmergencyTab, EventTab, GroupTab } from "./tabs/CatalogTabs";

type GroupKey = "period" | "calendar" | "group" | "event" | "emergency";

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
  { key: "calendar", label: "Thời khóa biểu", icon: Calendar, tabs: [{ key: "calendar", label: "Thời khóa biểu" }] },
  {
    key: "group",
    label: "Nhóm ca",
    icon: Award,
    tabs: [
      { key: "group", label: "Nhóm ca", icon: Award },
      { key: "shift", label: "Ca", icon: Clock3 },
    ],
  },
  { key: "event", label: "Sự kiện", icon: AlertTriangle, tabs: [{ key: "event", label: "Sự kiện" }] },
  { key: "emergency", label: "Khẩn cấp", icon: AlertCircle, tabs: [{ key: "emergency", label: "Khẩn cấp" }] },
];

const TAB_CONTENT: Record<TabKey, React.ComponentType> = {
  period: PeriodTab,
  shift: ShiftTab,
  calendar: CalendarTab,
  round: RoundTab,
  session: SessionTab,
  group: GroupTab,
  event: EventTab,
  emergency: EmergencyTab,
};

/** Quản lý lịch & ca làm việc: kỳ → đợt → phiên, ca mẫu, thời khóa biểu và phân bổ. */
export default function LichPage() {
  return (
    <ScheduleProvider>
      <LichPageContent />
    </ScheduleProvider>
  );
}

function LichPageContent() {
  const { loading, error, reload } = useSchedule();
  const [activeGroup, setActiveGroup] = useState<GroupKey>("calendar");
  // Tab con đang chọn của từng nhóm (giữ nguyên khi chuyển qua lại giữa các nhóm)
  const [subTab, setSubTab] = useState<Partial<Record<GroupKey, TabKey>>>({});
  const group = GROUPS.find((item) => item.key === activeGroup) ?? GROUPS[0];
  const activeTab = subTab[group.key] ?? group.tabs[0].key;
  const Content = TAB_CONTENT[activeTab];

  return (
    <div className="page">
      <ScheduleFormModal />
      <ShiftDetailDrawer />
      <DeleteConfirmModal />

      <PageHeader
        title="Quản lý lịch & ca làm việc"
        subtitle="Phân quyền theo role, xem theo cửa hàng và ca làm"
        actions={
          <Button variant="secondary" onClick={() => void reload()} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Làm mới
          </Button>
        }
      />

      {error && <Alert>{error}</Alert>}

      <Tabs items={GROUPS} active={activeGroup} onChange={setActiveGroup} />

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
