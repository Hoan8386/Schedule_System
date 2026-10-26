import React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

interface ModalProps {
  open: boolean;
  title: React.ReactNode;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  /** Tailwind max-width, mặc định max-w-xl */
  size?: string;
  className?: string;
}

export function Modal({ open, title, onClose, children, footer, size = "max-w-xl", className }: ModalProps) {
  if (!open) return null;
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" onClick={onClose}>
      <div className={cn("modal-panel space-y-4", size, className)} onClick={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-slate-800">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Đóng" className="rounded-full p-2 hover:bg-slate-100">
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
        {footer}
      </div>
    </div>
  );
}

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  size?: string;
}

/** Panel trượt từ cạnh phải màn hình. */
export function Drawer({ open, onClose, children, size = "max-w-xl" }: DrawerProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-slate-950/50" onClick={onClose}>
      <div className={cn("h-full w-full overflow-y-auto bg-surface p-4 shadow-2xl sm:p-5", size)} onClick={(event) => event.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}
