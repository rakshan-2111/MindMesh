"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Building2,
  Users,
  MapPin,
  BarChart3,
  Cpu,
} from "lucide-react";

export interface SidebarProps {
  onOpenCommandPalette?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = () => {
  const pathname = usePathname();

  const navItems = [
    { label: "Overview", href: "/", icon: LayoutDashboard },
    { label: "Donations", href: "/donations", icon: Package },
    { label: "Recipients", href: "/recipients", icon: Building2 },
    { label: "Volunteers", href: "/volunteers", icon: Users },
    { label: "Routes", href: "/routes", icon: MapPin },
    { label: "Devices & Fleet", href: "/devices", icon: Cpu },
    { label: "Reports", href: "/reports", icon: BarChart3 },
  ];

  return (
    <aside className="w-60 shrink-0 bg-white border-r border-[#E3E7E4] flex flex-col justify-between h-screen sticky top-0 z-40 select-none">
      <div>
        {/* Brand Wordmark */}
        <div className="h-14 px-4 flex items-center border-b border-[#E3E7E4]">
          <Link href="/" className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1F5D46]" />
            <span className="font-semibold text-sm tracking-tight text-[#17201C]">
              MindMesh
            </span>
            <span className="text-[10px] text-[#7C867F] font-mono ml-auto">
              Ops
            </span>
          </Link>
        </div>

        {/* Navigation list */}
        <nav className="p-2 space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-[6px] text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-[#E7F1EC] text-[#1F5D46]"
                    : "text-[#55605A] hover:text-[#17201C] hover:bg-[#F6F7F5]"
                }`}
              >
                <Icon
                  size={16}
                  strokeWidth={1.5}
                  className={isActive ? "text-[#1F5D46]" : "text-[#7C867F]"}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User & Hub details footer */}
      <div className="p-3 border-t border-[#E3E7E4]">
        <div className="flex items-center gap-2.5 px-2 py-1.5">
          <div className="w-6 h-6 rounded-full bg-[#EEF1EE] border border-[#E3E7E4] flex items-center justify-center text-[10px] font-semibold text-[#1F5D46]">
            OC
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-[#17201C] truncate">
              Operations Coordinator
            </div>
            <div className="text-[11px] text-[#7C867F] truncate">
              Bengaluru Hub
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
