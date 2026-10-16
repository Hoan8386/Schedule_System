import React from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "danger" | "ghost";

const VARIANT_CLASS: Record<Variant, string> = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  danger: "btn-danger",
  ghost: "btn-ghost",
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: "md" | "sm";
  icon?: React.ComponentType<{ className?: string }>;
}

export function Button({ variant = "primary", size = "md", icon: Icon, className, children, type = "button", ...props }: ButtonProps) {
  return (
    <button type={type} className={cn("btn", VARIANT_CLASS[variant], size === "sm" && "btn-sm", className)} {...props}>
      {Icon && <Icon className="h-4 w-4" />}
      {children}
    </button>
  );
}

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  tone?: "neutral" | "info" | "danger";
}

const TONE_CLASS = {
  neutral: "text-slate-500 hover:bg-slate-100",
  info: "text-blue-600 hover:bg-blue-50",
  danger: "text-rose-600 hover:bg-rose-50",
};

export function IconButton({ icon: Icon, label, tone = "neutral", className, type = "button", ...props }: IconButtonProps) {
  return (
    <button type={type} aria-label={label} title={label} className={cn("btn-icon", TONE_CLASS[tone], className)} {...props}>
      <Icon className="h-4 w-4" />
    </button>
  );
}
