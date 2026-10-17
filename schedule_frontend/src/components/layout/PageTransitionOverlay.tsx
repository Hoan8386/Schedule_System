import React from "react";
import Image from "next/image";
import { cn } from "@/lib/cn";

/** Lớp phủ vùng nội dung khi chuyển trang, dùng linh vật logo2. */
export function PageTransitionOverlay({ visible }: { visible: boolean }) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-hidden={!visible}
      className={cn(
        "absolute inset-0 z-30 flex flex-col items-center justify-center gap-4 bg-app/80 backdrop-blur-sm transition-opacity duration-200",
        visible ? "opacity-100" : "pointer-events-none opacity-0"
      )}
    >
      <div className="relative h-24 w-24">
        <span className="absolute inset-0 animate-spin rounded-full border-4 border-brand-200 border-t-brand-500" />
        <div className="absolute inset-2 animate-bounce overflow-hidden rounded-full bg-white shadow-md [animation-duration:1.2s]">
          {/* Ảnh gốc nhiều khoảng trắng: phóng to để linh vật lấp đầy khung tròn */}
          <Image src="/logo/logo2.jpg" alt="" fill sizes="80px" priority className="scale-[2.3] object-cover" />
        </div>
      </div>
      {visible && <p className="text-xs font-bold text-slate-500">Đang tải trang...</p>}
    </div>
  );
}
