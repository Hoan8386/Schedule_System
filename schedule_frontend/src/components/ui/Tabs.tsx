import React from "react";
import { cn } from "@/lib/cn";

export interface TabItem<K extends string> {
  key: K;
  label: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
}

interface TabsProps<K extends string> {
  items: TabItem<K>[];
  active: K;
  onChange: (key: K) => void;
  className?: string;
}

export function Tabs<K extends string>({ items, active, onChange, className }: TabsProps<K>) {
  return (
    <div className={cn("card p-2", className)} role="tablist">
      <div className="flex flex-wrap gap-2">
        {items.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={active === key}
            onClick={() => onChange(key)}
            className={cn("tab", active === key ? "tab-active" : "tab-inactive")}
          >
            {Icon && <Icon className="h-4 w-4" />}
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
