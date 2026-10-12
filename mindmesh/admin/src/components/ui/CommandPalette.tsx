"use client";

import React, { useState, useEffect } from "react";
import { Search, MapPin, Package, Users, Truck, ArrowRight, X } from "lucide-react";
import { useRouter } from "next/navigation";

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const quickNav = [
    { label: "Overview", href: "/", icon: <ArrowRight size={14} /> },
    { label: "Donations", href: "/donations", icon: <Package size={14} /> },
    { label: "Recipients", href: "/recipients", icon: <MapPin size={14} /> },
    { label: "Volunteers", href: "/volunteers", icon: <Users size={14} /> },
    { label: "Routes", href: "/routes", icon: <Truck size={14} /> },
    { label: "Reports", href: "/reports", icon: <ArrowRight size={14} /> },
  ];

  const filtered = quickNav.filter((item) =>
    item.label.toLowerCase().includes(query.toLowerCase())
  );

  const navigate = (href: string) => {
    router.push(href);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24">
      <div className="fixed inset-0 bg-black/20" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-white rounded-[10px] border border-[#E3E7E4] shadow-xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center px-3 border-b border-[#E3E7E4]">
          <Search size={16} className="text-[#7C867F] shrink-0 mr-2" />
          <input
            autoFocus
            type="text"
            placeholder="Type a page or action..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full h-11 text-xs text-[#17201C] outline-none placeholder:text-[#7C867F]"
          />
          <button
            onClick={onClose}
            className="p-1 text-[#7C867F] hover:text-[#17201C]"
          >
            <X size={14} />
          </button>
        </div>

        <div className="p-2 max-h-64 overflow-y-auto">
          <div className="px-2 py-1 text-[11px] font-medium uppercase tracking-wider text-[#7C867F]">
            Navigation
          </div>
          {filtered.length === 0 ? (
            <div className="p-4 text-center text-xs text-[#7C867F]">
              No matches found.
            </div>
          ) : (
            filtered.map((item) => (
              <button
                key={item.href}
                onClick={() => navigate(item.href)}
                className="w-full flex items-center justify-between px-2.5 py-2 text-xs rounded-[6px] text-[#17201C] hover:bg-[#F6F7F5] transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-[#55605A]">{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                <span className="text-[10px] text-[#7C867F]">Jump</span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
