import React from "react";

interface Props {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  iconClassName?: string;
  /** Bộ lọc / nút thêm ở bên phải tiêu đề */
  actions?: React.ReactNode;
  /** Bố cục danh sách, mặc định lưới thẻ 3 cột */
  layout?: "grid" | "list";
  children: React.ReactNode;
}

/** Khung chung cho các tab dạng danh sách thẻ. */
export function TabSection({ title, icon: Icon, iconClassName = "text-brand-600", actions, layout = "grid", children }: Props) {
  return (
    <section className="card p-4">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div className="flex items-center gap-2">
          <Icon className={`h-4 w-4 ${iconClassName}`} />
          <h2 className="card-title">{title}</h2>
        </div>
        {actions && <div className="ml-auto flex flex-wrap items-end gap-3">{actions}</div>}
      </div>
      <div className={layout === "grid" ? "grid gap-3 md:grid-cols-2 xl:grid-cols-3" : "space-y-3"}>{children}</div>
    </section>
  );
}
