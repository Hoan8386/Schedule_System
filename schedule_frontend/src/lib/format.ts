/**
 * Hàm định dạng / chuẩn hóa dữ liệu dùng chung.
 * Backend có thể trả ngày giờ dạng chuỗi ISO hoặc mảng [y, m, d, h, mi].
 */

/** Giá trị rỗng -> fallback, còn lại -> chuỗi. */
export const text = (value: unknown, fallback = "—") =>
  value === null || value === undefined || value === "" ? fallback : String(value);

export const pad = (value: number) => String(value).padStart(2, "0");

/** Khóa ngày theo giờ địa phương (YYYY-MM-DD) – không dùng toISOString để tránh lệch múi giờ. */
export const localKey = (day: Date) => `${day.getFullYear()}-${pad(day.getMonth() + 1)}-${pad(day.getDate())}`;

/** "YYYY-MM-DDTHH:mm" theo giờ địa phương. */
export const localMinuteKey = (moment: Date) => `${localKey(moment)}T${pad(moment.getHours())}:${pad(moment.getMinutes())}`;

/** Chuẩn hóa ngày ("2026-10-05", "2026-10-05T08:00:00" hoặc [2026,10,5]) về YYYY-MM-DD. */
export const dayKey = (value: unknown) => {
  if (value === null || value === undefined || value === "") return "";
  if (Array.isArray(value)) {
    const [y, m, d] = value.map(Number);
    return y && m && d ? `${y}-${pad(m)}-${pad(d)}` : "";
  }
  const raw = String(value);
  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) return `${match[1]}-${match[2]}-${match[3]}`;
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? "" : localKey(parsed);
};

/** YYYY-MM-DD -> Date (giờ địa phương). */
export const fromDayKey = (key: string) => {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
};

/** -> "05/10/2026" */
export const formatDate = (value: unknown) => {
  const key = dayKey(value);
  if (!key) return "—";
  const [y, m, d] = key.split("-");
  return `${d}/${m}/${y}`;
};

/** "08:00:00" | [8,0] -> "08:00" */
export const hhmm = (value: unknown) => {
  if (Array.isArray(value)) return `${pad(Number(value[0] ?? 0))}:${pad(Number(value[1] ?? 0))}`;
  const match = String(value ?? "").match(/^(\d{1,2}):(\d{2})/);
  return match ? `${match[1].padStart(2, "0")}:${match[2]}` : "--:--";
};

export const timeRange = (start: unknown, end: unknown) => `${hhmm(start)} – ${hhmm(end)}`;

/** "2026-10-05T08:00:00" | [2026,10,5,8,0] -> "05/10/2026 08:00" */
export const formatDateTime = (value: unknown) => {
  if (value === null || value === undefined || value === "") return "—";
  if (Array.isArray(value)) return `${formatDate(value.slice(0, 3))} ${hhmm(value.slice(3, 5))}`;
  const match = String(value).match(/T(\d{2}:\d{2})/);
  return match ? `${formatDate(value)} ${match[1]}` : formatDate(value);
};

export const dateTimeRange = (start: unknown, end: unknown) => `${formatDateTime(start)} → ${formatDateTime(end)}`;

/** Ngày giờ -> "YYYY-MM-DDTHH:mm" để so sánh / gán cho input datetime-local. */
export const minuteKey = (value: unknown) => {
  if (Array.isArray(value)) return `${dayKey(value.slice(0, 3))}T${hhmm(value.slice(3, 5))}`;
  return String(value ?? "").slice(0, 16);
};

export const formatMoney = (value: unknown) => `${Number(value ?? 0).toLocaleString("vi-VN")} đ`;

/** Dữ liệu API dạng mảng hoặc rỗng. */
export const listData = <T>(value: unknown): T[] => (Array.isArray(value) ? (value as T[]) : []);

/** Id của quan hệ: trường "xxxId" hoặc object "xxx": { id }. */
export const relId = (item: object, key: string) => {
  const record = item as Record<string, unknown>;
  const direct = record[`${key}Id`];
  if (direct !== null && direct !== undefined && direct !== "") return Number(direct);
  const nested = record[key];
  if (nested && typeof nested === "object" && "id" in nested) return Number((nested as { id: unknown }).id);
  return 0;
};

export const upper = (value: unknown) => String(value ?? "").toUpperCase();
