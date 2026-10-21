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

/**
 * Cấu hình phạm vi số lượng (min / max) cho tất cả khung giờ (ca mẫu) của cửa hàng.
 * - Nhân viên tự đăng ký: mỗi ca nhận tới min; khi mọi khung giờ của nhóm trong ngày đạt min thì nâng lên max.
 * - Quản lý / trưởng cửa hàng phân bổ: được vượt min bất kể điều kiện trên, chỉ giới hạn bởi max.
 */
export function CapacityConfigTab() {
  const { shifts, lookups, reload, setError } = useSchedule();
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
  const invalid = (value: { min: string; max: string }) => {
    const min = numberOrNull(value.min);
    const max = numberOrNull(value.max);
    return (min !== null && min < 0) || (max !== null && max < 0) || (min !== null && max !== null && min > max);
  };
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
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể lưu cấu hình");
    } finally {
      setSaving(false);
    }
  };

  return (
    <TabSection
      title={`Cấu hình số lượng theo khung giờ (${shifts.length})`}
      icon={SlidersHorizontal}
      iconClassName="text-violet-600"
      layout="list"
      actions={<StoreFilter />}
    >
      <div className="flex items-start gap-2.5 rounded-xl border border-brand-200/80 bg-brand-50/70 p-3 text-[11px] leading-relaxed text-brand-900">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
        <div>
          <p>
            <b>Nhân viên đăng ký ca:</b> ngưỡng ban đầu của mỗi khung giờ là <b>min</b>. Khi tất cả khung giờ của nhóm ca trong ngày đã
            đạt min, ngưỡng được nâng lên <b>max</b>.
          </p>
          <p className="mt-1">
            <b>Quản lý / trưởng cửa hàng phân bổ:</b> được thêm nhân viên vượt min dù chưa thỏa điều kiện trên, chỉ không vượt max.
            Bỏ trống min = không áp ngưỡng tối thiểu.
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

      {shifts.length === 0 && <EmptyState>Cửa hàng chưa có ca mẫu (khung giờ) nào.</EmptyState>}

      {groups.map((group) => (
        <div key={group.groupId} className="overflow-hidden rounded-xl border border-slate-200">
          <p className="border-b border-slate-200 bg-slate-50 px-3 py-2 text-xs font-black text-slate-700">{group.name}</p>
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400">
                <th className="px-3 py-2">Khung giờ</th>
                <th className="px-3 py-2">Giờ</th>
                <th className="px-3 py-2">Min</th>
                <th className="px-3 py-2">Max</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {group.items.map((shift) => {
                const value = valueOf(shift);
                const bad = invalid(value);
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
                      {bad && <span className="ml-2 text-[10px] font-semibold text-rose-600">min phải ≤ max, không âm</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ))}
    </TabSection>
  );
}
