/**
 * Truy cập design token (định nghĩa trong src/styles/theme.css) từ TypeScript.
 * Dùng cho các thư viện cần chuỗi màu thay vì class Tailwind (vd. Recharts).
 */

const token = (name: string) => `var(--${name})`;

/** Màu cho biểu đồ – tự đổi theo theme vì trỏ tới biến CSS. */
export const chartColors = {
  brand: token("brand-500"),
  success: token("success"),
  warning: token("warning"),
  danger: token("danger"),
  info: token("info"),
  grid: token("chart-grid"),
  axis: token("chart-axis"),
  border: token("chart-border"),
} as const;

/** Style tooltip Recharts dùng chung. */
export const chartTooltipStyle = {
  borderRadius: 12,
  border: `1px solid ${chartColors.border}`,
  fontSize: 12,
} as const;

/** Trục biểu đồ dùng chung. */
export const chartAxisTick = { fontSize: 11, fill: chartColors.axis } as const;

export type ThemeName = "default" | "ocean";

/** Chọn một bộ theme định nghĩa sẵn trong theme.css. */
export function setThemeName(name: ThemeName) {
  if (typeof document === "undefined") return;
  if (name === "default") document.documentElement.removeAttribute("data-theme");
  else document.documentElement.setAttribute("data-theme", name);
}

/**
 * Ghi đè từng token lúc chạy, vd. applyTheme({ "brand-500": "#2563eb", accent: "#ec4899" }).
 * Khóa là tên biến CSS không có tiền tố "--".
 */
export function applyTheme(tokens: Record<string, string>) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  Object.entries(tokens).forEach(([name, value]) => root.style.setProperty(`--${name}`, value));
}
