import React from "react";
import { AlertCircle, CheckCircle2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/cn";

type BadgeTone = "neutral" | "brand" | "success" | "warning" | "danger" | "info";

export function Badge({ tone = "neutral", className, children }: { tone?: BadgeTone; className?: string; children: React.ReactNode }) {
  return <span className={cn("badge", `badge-${tone}`, className)}>{children}</span>;
}

export function Alert({ tone = "danger", children, className }: { tone?: "danger" | "success"; children: React.ReactNode; className?: string }) {
  const Icon = tone === "danger" ? AlertCircle : CheckCircle2;
  return (
    <div role={tone === "danger" ? "alert" : "status"} className={cn("alert", `alert-${tone}`, className)}>
      <Icon className="h-4 w-4 shrink-0" />
      <span>{children}</span>
    </div>
  );
}

export function EmptyState({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("empty-state", className)}>{children}</div>;
}

export function Spinner({ label, className }: { label?: string; className?: string }) {
  return (
    <div className={cn("flex items-center justify-center gap-2 text-xs text-slate-400", className)}>
      <RefreshCw className="h-4 w-4 animate-spin" />
      {label}
    </div>
  );
}

/** Vòng tròn tải toàn trang. */
export function FullPageLoader({ label }: { label: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface">
      <div className="h-8 w-8 animate-spin rounded-full border-3 border-brand-400 border-t-transparent" />
      <p className="mt-3 text-xs font-medium text-slate-400">{label}</p>
    </div>
  );
}
