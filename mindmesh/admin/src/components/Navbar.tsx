"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Workflow, 
  Cpu, 
  Users, 
  Package, 
  Bike,
  Sparkles,
  Radio
} from "lucide-react";
import { isSupabaseConfigured } from "../lib/supabase";

export default function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { label: "Dashboard", href: "/", icon: LayoutDashboard },
    { label: "DAA Engine", href: "/algorithms", icon: Cpu },
    { label: "Pipeline Stepper", href: "/optimization", icon: Workflow },
    { label: "Recipients", href: "/recipients", icon: Users },
    { label: "Donations", href: "/donations", icon: Package },
    { label: "Volunteers", href: "/volunteers", icon: Bike },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-[#07090e]/80 backdrop-blur-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-400 flex items-center justify-center shadow-lg shadow-emerald-500/25 group-hover:scale-105 transition-all duration-300">
                  <Sparkles className="w-5 h-5 text-slate-950 font-bold" />
                </div>
                <div className="absolute -inset-1 bg-emerald-500/20 rounded-2xl blur-sm -z-10 group-hover:bg-emerald-500/30 transition-all" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black tracking-tight text-white">
                    Mind<span className="text-emerald-400">Mesh</span>
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-semibold tracking-wide">
                    DAA CORE
                  </span>
                </div>
                <span className="block text-[11px] text-slate-400 font-mono tracking-tight">
                  Distributed Optimization Center
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5 bg-slate-900/60 p-1.5 rounded-2xl border border-white/[0.06] backdrop-blur-md">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 relative ${
                    isActive
                      ? "text-emerald-300 bg-emerald-500/15 shadow-sm border border-emerald-500/30"
                      : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-emerald-400" : "text-slate-400"}`} />
                  {item.label}
                  {isActive && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-emerald-400 rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Realtime Status Indicator */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-white/[0.08] text-xs shadow-inner">
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isSupabaseConfigured ? "bg-emerald-400" : "bg-cyan-400"}`} />
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isSupabaseConfigured ? "bg-emerald-500" : "bg-cyan-500"}`} />
              </span>
              <span className="font-mono text-[11px] text-slate-300 font-medium">
                {isSupabaseConfigured ? "Supabase Live Sync" : "In-Memory Engine"}
              </span>
            </div>

            <div className="hidden lg:flex items-center gap-1.5 text-[11px] font-mono text-slate-400 bg-slate-900/60 px-3 py-1.5 rounded-xl border border-white/[0.06]">
              <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
              <span>MacBook Hub</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
