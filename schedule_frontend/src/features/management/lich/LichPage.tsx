"use client";

import React, { useState } from "react";
import { AlertCircle, AlertTriangle, Award, Calendar, CalendarRange, Clock3, RefreshCw, Users } from "lucide-react";
import { Alert, Button, PageHeader, Tabs, type TabItem } from "@/components/ui";
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

const TABS: TabItem<TabKey>[] = [
  { key: "period", label: "Kỳ", icon: CalendarRange },
  { key: "shift", label: "Shift", icon: Clock3 },
  { key: "calendar", label: "Thời khóa biểu", icon: Calendar },
  { key: "round", label: "Đợt đăng ký", icon: CalendarRange },
  { key: "session", label: "Phiên", icon: Users },
  { key: "group", label: "Nhóm ca", icon: Award },
  { key: "event", label: "Sự kiện", icon: AlertTriangle },
  { key: "emergency", label: "Khẩn cấp", icon: AlertCircle },
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
  const [activeTab, setActiveTab] = useState<TabKey>("calendar");
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

      <Tabs items={TABS} active={activeTab} onChange={setActiveTab} />

      <Content />
    </div>
  );
}
