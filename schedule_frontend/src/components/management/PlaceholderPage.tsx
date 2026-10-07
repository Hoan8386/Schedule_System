"use client";

import React from "react";
import { Construction } from "lucide-react";

interface PlaceholderPageProps {
  title: string;
  description?: string;
}

export default function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
      <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center mb-4">
        <Construction size={28} className="text-amber-500" />
      </div>
      <h2 className="text-xl font-extrabold text-slate-800">{title}</h2>
      <p className="text-sm text-slate-500 mt-2 max-w-sm">{description || "Trang này đang được phát triển. Vui lòng quay lại sau."}</p>
    </div>
  );
}
