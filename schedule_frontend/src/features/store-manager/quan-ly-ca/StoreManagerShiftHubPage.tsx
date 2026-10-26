"use client";

import React, { useState } from "react";
import { Calendar, CalendarPlus, Inbox } from "lucide-react";
import { Tabs, type TabItem } from "@/components/ui";
import LichPage from "@/features/management/lich/LichPage";
import StoreManagerShiftRequestsPage from "../yeu-cau/StoreManagerShiftRequestsPage";
import StoreManagerRegisterShiftPage from "../dang-ky-ca/StoreManagerRegisterShiftPage";

export type ShiftHubTab = "lich" | "yeucau" | "dangky";

const TABS: TabItem<ShiftHubTab>[] = [
  { key: "lich", label: "Lịch làm việc", icon: Calendar },
  { key: "yeucau", label: "Xử lý yêu cầu ca", icon: Inbox },
  { key: "dangky", label: "Đăng ký ca của tôi", icon: CalendarPlus },
];

/**
 * Quản lý ca của trưởng cửa hàng: gộp Lịch làm việc, Xử lý yêu cầu ca, Đăng ký ca vào một menu.
 * Lịch làm việc dùng chung giao diện thời khóa biểu của trang Quản lý (backend giới hạn theo cửa hàng):
 * thêm ca theo ngày, phân bổ nhân viên đúng nhóm ca, danh sách yêu cầu, chế độ danh sách + xuất Excel.
 */
export default function StoreManagerShiftHubPage({ initialTab = "lich" }: { initialTab?: ShiftHubTab }) {
  const [tab, setTab] = useState<ShiftHubTab>(initialTab);
  return (
    <div>
      <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 sm:pt-6">
        <Tabs items={TABS} active={tab} onChange={setTab} />
      </div>
      {tab === "lich" && (
        <LichPage
          groups={["calendar"]}
          title="Quản lý ca – Lịch làm việc"
          subtitle="Thời khóa biểu ca làm của cửa hàng: thêm ca theo ngày, phân bổ nhân viên đúng nhóm ca, duyệt yêu cầu và xuất danh sách ca."
        />
      )}
      {tab === "yeucau" && <StoreManagerShiftRequestsPage />}
      {tab === "dangky" && <StoreManagerRegisterShiftPage />}
    </div>
  );
}
