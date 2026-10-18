import React from "react";
import { Field, Input, Select, Textarea, type SelectOption } from "@/components/ui";
import { dayKey, hhmm } from "@/lib/format";
import type { Entity } from "../constants";

/** Giá trị mặc định của một trường từ bản ghi đang sửa (quan hệ { id } hoặc xxxId, ngày giờ dạng mảng). */
export function defaultValueOf(item: Entity | undefined, key: string) {
  if (!item) return "";
  let current: unknown = item[key];
  if (current && typeof current === "object" && !Array.isArray(current)) current = (current as { id?: unknown }).id;
  if (current === null || current === undefined || current === "") current = item[`${key}Id`];
  if (current === null || current === undefined) return "";
  if (Array.isArray(current)) {
    if (current.length === 3) return dayKey(current);
    if (current.length >= 5) return `${dayKey(current.slice(0, 3))}T${hhmm(current.slice(3, 5))}`;
    return hhmm(current);
  }
  return String(current);
}

/** Trạng thái mặc định khi tạo mới: OPEN hoặc ACTIVE nếu có, không thì lựa chọn đầu tiên. */
const defaultStatus = (options: readonly string[]) => options.find((option) => option === "OPEN" || option === "ACTIVE") ?? options[0] ?? "";

/** Bộ tạo field uncontrolled cho form lưu bằng FormData. isNew: đang tạo mới (item chỉ là dữ liệu điền sẵn). */
export function fieldFactory(item: Entity | undefined, isNew = !item) {
  const value = (name: string) => defaultValueOf(item, name);
  /** Ô date chỉ nhận yyyy-MM-dd (giá trị đang lưu có thể kèm giờ) */
  const inputValue = (name: string, type: string) => {
    const current = value(name);
    return type === "date" && current.includes("T") ? current.slice(0, 10) : current;
  };

  return {
    input: (name: string, label: string, type = "text", required = false) => (
      <Field label={label}>
        <Input name={name} type={type} required={required} defaultValue={inputValue(name, type)} />
      </Field>
    ),
    textarea: (name: string, label: string) => (
      <Field label={label} className="sm:col-span-2">
        <Textarea name={name} defaultValue={value(name)} />
      </Field>
    ),
    select: (name: string, label: string, options: SelectOption[], required = true) => (
      <Field label={label}>
        <Select name={name} required={required} defaultValue={value(name)} options={options} placeholder="Chọn..." />
      </Field>
    ),
    enumSelect: (name: string, label: string, options: readonly string[], required = true) =>
      // Tạo mới: trạng thái luôn là mặc định (OPEN / ACTIVE), chỉ chọn được khi chỉnh sửa
      name === "status" && isNew ? (
        <input type="hidden" name={name} value={defaultStatus(options)} />
      ) : (
        <Field label={label}>
          <Select
            name={name}
            required={required}
            defaultValue={value(name) || (name === "status" ? defaultStatus(options) : "")}
            options={options.map((option) => ({ value: option, label: option }))}
            placeholder="Chọn..."
          />
        </Field>
      ),
    wide: (node: React.ReactNode) => <div className="sm:col-span-2">{node}</div>,
  };
}

export type FieldFactory = ReturnType<typeof fieldFactory>;
