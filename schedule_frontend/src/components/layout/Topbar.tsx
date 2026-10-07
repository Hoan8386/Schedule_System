"use client";

import React from "react";
import { Bell, Settings, MapPin, ChevronDown, Search, HelpCircle } from "lucide-react";

interface TopbarProps {
  searchPlaceholder?: string;
  showStorePicker?: boolean;
  showHelp?: boolean;
  showSettings?: boolean;
}

export default function Topbar({
  searchPlaceholder = "Tìm kiếm nhanh...",
  showStorePicker = true,
  showHelp = false,
  showSettings = false,
}: TopbarProps) {
  return (
    <header className="h-14 bg-white border-b border-slate-100 flex items-center px-6 gap-4 sticky top-0 z-20">
      {showStorePicker && (
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors text-sm font-medium text-slate-700">
          <MapPin size={14} className="text-amber-500" />
          <span>Tất cả cửa hàng (24)</span>
          <ChevronDown size={14} className="text-slate-400" />
        </button>
      )}
      <div className="flex-1 relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder={searchPlaceholder}
          className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-300 placeholder:text-slate-400 transition-all"
        />
      </div>
      <div className="flex items-center gap-2 ml-auto">
        {showHelp && (
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors border border-slate-200">
            <HelpCircle size={15} />
            <span>Trợ giúp</span>
          </button>
        )}
        <button className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-50 transition-colors border border-slate-200">
          <Bell size={18} />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500"></span>
        </button>
        {showSettings && (
          <button className="p-2 rounded-lg text-slate-500 hover:bg-slate-50 transition-colors border border-slate-200">
            <Settings size={18} />
          </button>
        )}
      </div>
    </header>
  );
}
