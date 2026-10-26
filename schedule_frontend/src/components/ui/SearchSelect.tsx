"use client";

import React, { useId, useMemo, useRef, useState } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import { cn } from "@/lib/cn";

export interface SearchOption {
  value: string;
  label: string;
  /** Dòng phụ (mã, cửa hàng...) – cũng được dùng khi tìm kiếm */
  hint?: string;
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  options: SearchOption[];
  placeholder?: string;
  /** Có thì thêm lựa chọn "tất cả / bỏ chọn" ứng với value = "" */
  allLabel?: string;
  disabled?: boolean;
  className?: string;
  inputClassName?: string;
  "aria-label"?: string;
}

/** So khớp không phân biệt hoa thường và dấu tiếng Việt. */
export const normalizeSearch = (input: string) =>
  input.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase().trim();

/** Ô chọn có thể gõ để tìm: hiển thị nhãn đang chọn, gõ chữ để lọc danh sách. */
export function SearchSelect({ value, onChange, options, placeholder = "Gõ để tìm...", allLabel, disabled, className, inputClassName, ...rest }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = options.find((option) => option.value === value);
  const items = useMemo(() => {
    const keyword = normalizeSearch(query);
    const matched = keyword
      ? options.filter((option) => normalizeSearch(`${option.label} ${option.hint ?? ""}`).includes(keyword))
      : options;
    return allLabel && !keyword ? [{ value: "", label: allLabel }, ...matched] : matched;
  }, [options, query, allLabel]);

  const choose = (next: SearchOption) => {
    onChange(next.value);
    setQuery("");
    setOpen(false);
    inputRef.current?.blur();
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setActive((index) => Math.min(index + 1, items.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((index) => Math.max(index - 1, 0));
    } else if (event.key === "Enter" && open && items[active]) {
      event.preventDefault();
      choose(items[active]);
    } else if (event.key === "Escape") {
      setOpen(false);
      setQuery("");
    }
  };

  return (
    <div className={cn("relative", className)}>
      <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
      <input
        ref={inputRef}
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={rest["aria-label"]}
        disabled={disabled}
        value={open ? query : selected?.label ?? (value ? value : allLabel ?? "")}
        placeholder={open ? selected?.label ?? placeholder : placeholder}
        onFocus={() => {
          setOpen(true);
          setActive(0);
        }}
        onBlur={() => {
          setOpen(false);
          setQuery("");
        }}
        onChange={(event) => {
          setQuery(event.target.value);
          setActive(0);
          setOpen(true);
        }}
        onKeyDown={onKeyDown}
        className={cn(
          "w-full rounded-xl border border-slate-200 bg-surface py-2 pl-8 pr-14 text-xs text-slate-800 outline-hidden transition focus:border-brand-400 disabled:opacity-50",
          inputClassName
        )}
      />
      <div className="pointer-events-none absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1 text-slate-400">
        {value && allLabel !== undefined && !disabled && (
          <button
            type="button"
            aria-label="Bỏ chọn"
            className="pointer-events-auto rounded p-0.5 hover:bg-slate-100 hover:text-slate-600"
            onMouseDown={(event) => {
              event.preventDefault();
              onChange("");
            }}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
        <ChevronDown className="h-3.5 w-3.5" />
      </div>
      {open && (
        <ul id={listId} role="listbox" className="absolute left-0 right-0 z-50 mt-1 max-h-64 overflow-y-auto rounded-xl border border-slate-200 bg-surface p-1 shadow-xl">
          {items.length === 0 && <li className="px-3 py-2 text-xs text-slate-400">Không tìm thấy kết quả</li>}
          {items.map((option, index) => (
            <li
              key={option.value || "__all"}
              role="option"
              aria-selected={option.value === value}
              // onMouseDown để chọn trước khi ô nhập mất focus
              onMouseDown={(event) => {
                event.preventDefault();
                choose(option);
              }}
              onMouseEnter={() => setActive(index)}
              className={cn(
                "cursor-pointer rounded-lg px-3 py-2 text-xs",
                index === active ? "bg-brand-50 text-brand-900" : "text-slate-700",
                option.value === value && "font-bold"
              )}
            >
              {option.label}
              {option.hint && <span className="block text-[10px] text-slate-400">{option.hint}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
