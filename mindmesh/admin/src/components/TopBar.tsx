"use client";

import React from "react";
import { Search, Calendar } from "lucide-react";

export interface TopBarProps {
  title: string;
  onOpenCommandPalette?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ title, onOpenCommandPalette }) => {
  return (
    <header className="h-14 bg-white border-b border-[#E3E7E4] px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Title */}
      <h1 className="text-sm font-semibold text-[#17201C] tracking-tight">{title}</h1>

      {/* Right controls */}
      <div className="flex items-center gap-3">
        {/* Search trigger */}
        <button
          onClick={onOpenCommandPalette}
          className="flex items-center gap-2 h-8 px-3 rounded-[6px] border border-[#E3E7E4] bg-[#F6F7F5] text-xs text-[#7C867F] hover:border-[#D5DAD6] hover:text-[#55605A] transition-colors"
        >
          <Search size={14} strokeWidth={1.5} />
          <span>Search or jump...</span>
          <kbd className="ml-2 font-mono text-[10px] bg-white border border-[#E3E7E4] px-1.5 py-0.5 rounded text-[#55605A]">
            ⌘K
          </kbd>
        </button>

        {/* Date Filter */}
        <div className="flex items-center gap-1.5 h-8 px-2.5 rounded-[6px] border border-[#E3E7E4] bg-white text-xs text-[#55605A]">
          <Calendar size={13} strokeWidth={1.5} className="text-[#7C867F]" />
          <span>Today, Oct 6</span>
        </div>

        {/* Live Status indicator */}
        <div className="flex items-center gap-2 pl-2 border-l border-[#E3E7E4] text-xs text-[#55605A]">
          <span className="w-2 h-2 rounded-full bg-[#1F7A4D]" />
          <span>Live · Updated 1m ago</span>
        </div>
      </div>
    </header>
  );
};
