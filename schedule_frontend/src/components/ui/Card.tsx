import React from "react";
import { cn } from "@/lib/cn";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return <section className={cn("card overflow-hidden", className)} {...props} />;
}

interface CardHeaderProps {
  title: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  iconClassName?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function CardHeader({ title, icon: Icon, iconClassName = "text-brand-600", actions, className }: CardHeaderProps) {
  return (
    <div className={cn("card-header", className)}>
      {Icon && <Icon className={cn("h-4 w-4", iconClassName)} />}
      <h2 className="card-title">{title}</h2>
      {actions && <div className="ml-auto flex items-center gap-2">{actions}</div>}
    </div>
  );
}
