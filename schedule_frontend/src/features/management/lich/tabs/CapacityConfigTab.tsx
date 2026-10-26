import React, { useMemo, useState } from "react";
import { Info, Save, SlidersHorizontal } from "lucide-react";
import { Button, EmptyState } from "@/components/ui";
import { managerApi, type ShiftResponse } from "@/lib/api";
import { hhmm, relId, text, timeRange } from "@/lib/format";
import { cn } from "@/lib/cn";
import { useSchedule } from "../ScheduleContext";
import { TabSection } from "../components/TabSection";
import { StoreFilter } from "../components/StoreFilter";

type Draft = Record<number, { min: string; max: string }>;

const shiftIdOf = (shift: ShiftResponse) => Number(shift.id ?? shift.shiftId ?? 0);
const numberOrNull = (value: string) => (value.trim() === "" ? null : Number(value));
const controlClass = "w-20 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold outline-hidden focus:border-brand-400";

/** Tab con "Số lượng theo khung giờ" của Nhóm ca: mọi nhóm ca của cửa hàng đang lọc. */
export function CapacityConfigTab() {
  const { shifts } = useSchedule();
  return (
    <TabSection
      title={`Số lượng nhân viên theo khung giờ (${shifts.length})`}
      icon={SlidersHorizontal}
      iconClassName="text-violet-600"
      layout="list"
      actions={<StoreFilter />}
    >
      <CapacityConfigPanel />
    </TabSection>
  );
}

/**
 * Cấu hình số lượng (min / max) cho các khung giờ (ca mẫu) của nhóm ca – groupId bỏ trống = mọi nhóm.
 * - Bắt buộc chọn max; min không bắt buộc, có min thì phải có max và min ≤ max.
 * - Nhân viên tự đăng ký: ngưỡng ban đầu là min (không có min thì là max); khi mọi ca của nhóm trong tuần
 *   đã đạt min và kỳ còn đang mở thì nâng lên max.
 * - Quản lý / trưởng cửa hàng phân bổ: được vượt min bất kể điều kiện trên, chỉ giới hạn bởi max.
 */
export function CapacityConfigPanel({ groupId, onSaved }: { groupId?: number; onSaved?: () => void }) {
  const { shifts: allShifts, lookups, reload, setError } = useSchedule();
  const shifts = useMemo(
    () => (groupId === undefined ? allShifts : allShifts.filter((shift) => relId(shift, "shiftGroup") === groupId)),
    [allShifts, groupId]
  );
  const [draft, setDraft] = useState<Draft>({});
  const [bulk, setBulk] = useState({ min: "", max: "" });
  const [saving, setSaving] = useState(false);

  // Khung giờ theo nhóm ca, sắp theo giờ bắt đầu
  const groups = useMemo(() => {
    const map = new Map<number, ShiftResponse[]>();
    shifts.forEach((shift) => {
      const groupId = relId(shift, "shiftGroup");
      map.set(groupId, [...(map.get(groupId) ?? []), shift]);
    });
    return [...map.entries()]
      .map(([groupId, items]) => ({
        groupId,
        name: groupId ? lookups.groupNameOf(groupId) : "Chưa gán nhóm ca",
        items: items.sort((a, b) => hhmm(a.startTime).localeCompare(hhmm(b.startTime))),
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [shifts, lookups]);

  const valueOf = (shift: ShiftResponse) =>
    draft[shiftIdOf(shift)] ?? { min: text(shift.minCapacity, ""), max: text(shift.maxCapacity, "") };
  const setValue = (shift: ShiftResponse, key: "min" | "max", value: string) =>
    setDraft((current) => ({ ...current, [shiftIdOf(shift)]: { ...valueOf(shift), [key]: value } }));

  const changed = shifts.filter((shift) => {
    const current = draft[shiftIdOf(shift)];
    return current && (current.min !== text(shift.minCapacity, "") || current.max !== text(shift.maxCapacity, ""));
  });
  /** Lỗi của một dòng (rỗng = hợp lệ): bắt buộc max > 0, min (nếu có) không âm và không vượt max. */
  const problemOf = (value: { min: string; max: string }) => {
    const min = numberOrNull(value.min);
    const max = numberOrNull(value.max);
    if (max === null || max <= 0) return "Bắt buộc nhập max > 0";
    if (min !== null && min < 0) return "Min không được âm";
    if (min !== null && min > max) return "Min phải ≤ max";
    return "";
  };
  const invalid = (value: { min: string; max: string }) => problemOf(value) !== "";
  const hasInvalid = shifts.some((shift) => invalid(valueOf(shift)));

  const applyAll = () =>
    setDraft(
      Object.fromEntries(
        shifts.map((shift) => {
          const current = valueOf(shift);
          return [shiftIdOf(shift), { min: bulk.min !== "" ? bulk.min : current.min, max: bulk.max !== "" ? bulk.max : current.max }];
        })
      )
    );

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      // Lưu mọi khung giờ đã sửa trong một giao dịch: lỗi một khung giờ thì không khung giờ nào bị đổi
      await managerApi.updateShiftCapacities(
        changed.map((shift) => {
          const value = valueOf(shift);
          return { id: shiftIdOf(shift), minCapacity: numberOrNull(value.min), maxCapacity: numberOrNull(value.max) };
        })
      );
      setDraft({});
      await reload();
      onSaved?.();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể lưu cấu hình");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-2.5 rounded-xl border border-brand-200/80 bg-brand-50/70 p-3 text-[11px] leading-relaxed text-brand-900">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
        <div>
          <p>
            <b>Bắt buộc chọn max</b> cho mỗi khung giờ. <b>Min</b> không bắt buộc; nếu chọn min thì phải có max và min ≤ max.
          </p>
          <p className="mt-1">
            <b>Nhân viên đăng ký ca:</b> ngưỡng ban đầu là <b>min</b> (không có min thì dùng max). Chỉ khi <b>tất cả các ca của nhóm trong tuần</b> đã
            đạt min và kỳ vẫn đang mở, ngưỡng mới được nâng lên <b>max</b>.
          </p>
          <p className="mt-1">
            <b>Quản lý / trưởng cửa hàng phân bổ:</b> được thêm nhân viên vượt min dù chưa thỏa điều kiện trên, chỉ không vượt max.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-2 rounded-xl border border-slate-200 p-3 text-xs">
        <span className="pb-1.5 font-bold text-slate-700">Áp dụng cho tất cả khung giờ:</span>
        <label className="flex flex-col gap-1 text-[10px] font-semibold text-slate-500">
          Min
          <input type="number" min={0} value={bulk.min} onChange={(event) => setBulk((current) => ({ ...current, min: event.target.value }))} className={controlClass} />
        </label>
        <label className="flex flex-col gap-1 text-[10px] font-semibold text-slate-500">
          Max
          <input type="number" min={0} value={bulk.max} onChange={(event) => setBulk((current) => ({ ...current, max: event.target.value }))} className={controlClass} />
        </label>
        <Button variant="secondary" size="sm" onClick={applyAll} disabled={!bulk.min && !bulk.max}>
          Điền cho tất cả
        </Button>
        <div className="ml-auto flex items-center gap-2">
          {changed.length > 0 && <span className="text-[11px] font-semibold text-brand-700">{changed.length} khung giờ đã sửa</span>}
          <Button icon={Save} onClick={() => void save()} disabled={saving || changed.length === 0 || hasInvalid}>
            {saving ? "Đang lưu..." : "Lưu cấu hình"}
          </Button>
        </div>
      </div>

      {shifts.length === 0 && <EmptyState>{groupId === undefined ? "Cửa hàng chưa có ca mẫu (khung giờ) nào." : "Nhóm ca chưa có khung giờ nào."}</EmptyState>}

      {groups.map((group) => (
        <div key={group.groupId} className="overflow-x-auto rounded-xl border border-slate-200">
          {groupId === undefined && <p className="border-b border-slate-200 bg-slate-50 px-3 py-2 text-xs font-black text-slate-700">{group.name}</p>}
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400">
                <th className="px-3 py-2">Khung giờ</th>
                <th className="px-3 py-2">Giờ</th>
                <th className="px-3 py-2">Min (tùy chọn)</th>
                <th className="px-3 py-2">
                  Max <span className="text-rose-500">*</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {group.items.map((shift) => {
                const value = valueOf(shift);
                const problem = problemOf(value);
                const bad = problem !== "";
                return (
                  <tr key={shiftIdOf(shift)}>
                    <td className="px-3 py-2 font-semibold text-slate-800">
                      {text(shift.shiftName, text(shift.shiftCode))}
                      <span className="ml-1 text-[10px] font-normal text-slate-400">{text(shift.shiftCode, "")}</span>
                    </td>
                    <td className="px-3 py-2 text-slate-500">{timeRange(shift.startTime, shift.endTime)}</td>
                    <td className="px-3 py-2">
                      <input type="number" min={0} value={value.min} onChange={(event) => setValue(shift, "min", event.target.value)} className={cn(controlClass, bad && "border-rose-400")} />
                    </td>
                    <td className="px-3 py-2">
                      <input type="number" min={0} value={value.max} onChange={(event) => setValue(shift, "max", event.target.value)} className={cn(controlClass, bad && "border-rose-400")} />
                      {bad && <span className="ml-2 text-[10px] font-semibold text-rose-600">{problem}</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
