import { hhmm } from "@/lib/format";

/**
 * Màu thời khóa biểu theo nhóm ca + vùng màu theo khung giờ trong nhóm:
 * mỗi nhóm một họ màu, ca Sáng nhạt → Trưa vừa → Tối đậm.
 * Nhóm "Linh hoạt" luôn xanh lam, nhóm "Cố định" luôn vàng; các nhóm khác lấy lần lượt bảng màu còn lại.
 */
export type DayPart = "morning" | "noon" | "evening";

type Family = Record<DayPart, string>;

const BLUE: Family = {
  morning: "bg-sky-100 border-sky-200 text-sky-900",
  noon: "bg-sky-300 border-sky-400 text-sky-950",
  evening: "bg-blue-600 border-blue-700 text-white",
};
const YELLOW: Family = {
  morning: "bg-yellow-100 border-yellow-200 text-yellow-900",
  noon: "bg-yellow-300 border-yellow-400 text-yellow-950",
  evening: "bg-amber-500 border-amber-600 text-white",
};
const OTHERS: Family[] = [
  {
    morning: "bg-emerald-100 border-emerald-200 text-emerald-900",
    noon: "bg-emerald-300 border-emerald-400 text-emerald-950",
    evening: "bg-emerald-600 border-emerald-700 text-white",
  },
  {
    morning: "bg-violet-100 border-violet-200 text-violet-900",
    noon: "bg-violet-300 border-violet-400 text-violet-950",
    evening: "bg-violet-600 border-violet-700 text-white",
  },
  {
    morning: "bg-rose-100 border-rose-200 text-rose-900",
    noon: "bg-rose-300 border-rose-400 text-rose-950",
    evening: "bg-rose-600 border-rose-700 text-white",
  },
  {
    morning: "bg-teal-100 border-teal-200 text-teal-900",
    noon: "bg-teal-300 border-teal-400 text-teal-950",
    evening: "bg-teal-600 border-teal-700 text-white",
  },
  {
    morning: "bg-orange-100 border-orange-200 text-orange-900",
    noon: "bg-orange-300 border-orange-400 text-orange-950",
    evening: "bg-orange-600 border-orange-700 text-white",
  },
];
const NO_GROUP: Family = {
  morning: "bg-slate-100 border-slate-200 text-slate-800",
  noon: "bg-slate-200 border-slate-300 text-slate-800",
  evening: "bg-slate-500 border-slate-600 text-white",
};

export const DAY_PART_LABEL: Record<DayPart, string> = { morning: "Sáng", noon: "Trưa", evening: "Tối" };

/** Sáng: bắt đầu trước 11h · Trưa: 11h – 16h59 · Tối: từ 17h. */
export function dayPartOf(startTime: unknown): DayPart {
  const hour = Number.parseInt(hhmm(startTime).split(":")[0] ?? "", 10);
  if (!Number.isFinite(hour) || hour < 11) return "morning";
  return hour < 17 ? "noon" : "evening";
}

const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .toLowerCase();

/** Bảng màu cho danh sách nhóm ca (theo id); thứ tự ổn định theo id. */
export function buildGroupPalette(groups: { id: number; name: string }[]) {
  const palette = new Map<number, Family>();
  let next = 0;
  [...groups]
    .sort((a, b) => a.id - b.id)
    .forEach((group) => {
      const name = normalize(group.name);
      if (name.includes("linh hoat")) palette.set(group.id, BLUE);
      else if (name.includes("co dinh")) palette.set(group.id, YELLOW);
      else palette.set(group.id, OTHERS[next++ % OTHERS.length]);
    });
  return (groupId: number, startTime: unknown) => (palette.get(groupId) ?? NO_GROUP)[dayPartOf(startTime)];
}
