import { formatDate, localKey } from "@/lib/format";
import type { WorkStatus } from "@/lib/api";

export type RangePreset = "thisMonth" | "lastMonth" | "last7" | "last30" | "custom";

export const RANGE_PRESETS: { value: RangePreset; label: string }[] = [
  { value: "thisMonth", label: "Tháng này" },
  { value: "lastMonth", label: "Tháng trước" },
  { value: "last7", label: "7 ngày qua" },
  { value: "last30", label: "30 ngày qua" },
  { value: "custom", label: "Tùy chọn" },
];

/** Khoảng ngày (yyyy-MM-dd) của một preset, tính theo giờ máy người dùng. */
export function presetRange(preset: Exclude<RangePreset, "custom">): { from: string; to: string } {
  const today = new Date();
  switch (preset) {
    case "lastMonth":
      return {
        from: localKey(new Date(today.getFullYear(), today.getMonth() - 1, 1)),
        to: localKey(new Date(today.getFullYear(), today.getMonth(), 0)),
      };
    case "last7":
      return { from: localKey(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6)), to: localKey(today) };
    case "last30":
      return { from: localKey(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 29)), to: localKey(today) };
    default:
      return {
        from: localKey(new Date(today.getFullYear(), today.getMonth(), 1)),
        to: localKey(new Date(today.getFullYear(), today.getMonth() + 1, 0)),
      };
  }
}

export const formatHours = (value: number | null | undefined) =>
  `${Number(value ?? 0).toLocaleString("vi-VN", { maximumFractionDigits: 2 })} giờ`;

export const formatVnd = (value: number | null | undefined) => `${Number(value ?? 0).toLocaleString("vi-VN")} đ`;

export const formatPercent = (value: number | null | undefined) =>
  `${Number(value ?? 0).toLocaleString("vi-VN", { maximumFractionDigits: 1 })}%`;

/** "2026-10-05" → "05/10" cho trục biểu đồ. */
export const shortDay = (value: string) => {
  const [, month, day] = value.split("-");
  return day && month ? `${day}/${month}` : value;
};

export const rangeLabel = (from?: string, to?: string) => (from && to ? `${formatDate(from)} – ${formatDate(to)}` : "");

export const WORK_STATUS: Record<WorkStatus, { label: string; tone: "success" | "info" | "danger" | "neutral" | "warning" }> = {
  COMPLETED: { label: "Hoàn thành", tone: "success" },
  IN_PROGRESS: { label: "Đang làm", tone: "info" },
  ABSENT: { label: "Vắng mặt", tone: "danger" },
  UPCOMING: { label: "Sắp tới", tone: "neutral" },
  PENDING: { label: "Chờ duyệt", tone: "warning" },
  CANCELLED: { label: "Đã hủy", tone: "neutral" },
};

/** Tải xuống CSV (UTF-8 có BOM để Excel đọc đúng tiếng Việt). */
export function downloadCsv(fileName: string, header: string[], rows: (string | number | null | undefined)[][]) {
  const escape = (value: string | number | null | undefined) => {
    const text = value === null || value === undefined ? "" : String(value);
    return /[",\n;]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  const csv = [header, ...rows].map((row) => row.map(escape).join(",")).join("\r\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}
