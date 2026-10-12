"use client";

import React, { useEffect, useState } from "react";
import { TopBar } from "@/components/TopBar";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { dataService } from "@/services/dataService";
import { PipelineExecutionResult } from "@/lib/engine/pipeline";
import { MapPin, Navigation, Clock, Truck, ArrowRight, RefreshCw } from "lucide-react";

export default function RoutesPage() {
  const [pipelineResult, setPipelineResult] = useState<PipelineExecutionResult | null>(null);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);
  const [showComparison, setShowComparison] = useState(false);

  useEffect(() => {
    const update = () => {
      setPipelineResult(dataService.getLastPipelineResult());
    };
    update();
    const unsubscribe = dataService.subscribe(update);
    return () => unsubscribe();
  }, []);

  // Visual graph nodes for SVG canvas layout
  const nodeCoordinates: Record<string, { x: number; y: number; label: string }> = {
    DEPOT: { x: 120, y: 150, label: "Koramangala Hub" },
    CANTEEN: { x: 280, y: 100, label: "CHRIST Canteen A" },
    JUNCTION_B: { x: 220, y: 220, label: "Junction B" },
    NGO_ALPHA: { x: 420, y: 140, label: "Asha Foundation" },
    SHELTER_BETA: { x: 540, y: 240, label: "Sneha Shelter" },
    STUDENT_HUB: { x: 340, y: 300, label: "Student Hub" },
    HOSTEL_GAMMA: { x: 480, y: 340, label: "St. Joseph's Hostel" },
  };

  const activeStops = pipelineResult?.routeSequence || ["DEPOT", "CANTEEN", "NGO_ALPHA", "SHELTER_BETA"];

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar title="Route Planner & Active Tours" />

      <main className="flex-1 p-6 space-y-6 max-w-7xl w-full mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-[#17201C]">
              Active Multi-Stop Delivery Routes
            </h2>
            <p className="text-xs text-[#55605A] mt-0.5">
              Optimized stop orders connecting surplus providers to verified shelters.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowComparison(!showComparison)}
            >
              {showComparison ? "Hide comparison" : "Before / after plan"}
            </Button>
          </div>
        </div>

        {/* Two-Pane Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Pane: Active routes list (4 cols) */}
          <div className="lg:col-span-4 bg-white border border-[#E3E7E4] rounded-[10px] overflow-hidden">
            <div className="p-3.5 border-b border-[#E3E7E4] bg-[#F6F7F5]/50 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#17201C]">
                Active routes ({pipelineResult ? 1 : 0})
              </span>
              <span className="text-xs text-[#1F5D46] font-mono">
                {pipelineResult ? "Live dispatch" : "Awaiting input"}
              </span>
            </div>

            <div className="p-3 space-y-3">
              {pipelineResult ? (
                <div
                  onClick={() => setSelectedRouteIndex(0)}
                  className={`p-3 rounded-[8px] border transition-colors cursor-pointer ${
                    selectedRouteIndex === 0
                      ? "border-[#1F5D46] bg-[#E7F1EC]/40"
                      : "border-[#E3E7E4] hover:bg-[#F6F7F5]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-[#17201C]">
                      Route #R-204 · {pipelineResult.assignedVolunteer.name}
                    </span>
                    <StatusBadge label="In transit" variant="info" />
                  </div>
                  <div className="text-xs text-[#55605A] mt-1">
                    {pipelineResult.routeSequence.join(" ➔ ")}
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-[11px] font-mono text-[#7C867F]">
                    <span>{pipelineResult.totalDistanceKm} km total</span>
                    <span>{pipelineResult.estimatedMinutes} min est.</span>
                    <span>{pipelineResult.knapsackOutcome.totalWeight} kg load</span>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-[#7C867F]">
                  <p className="font-medium text-[#17201C]">No active delivery routes</p>
                  <p className="mt-1 text-[11px]">
                    Waiting for food provider to post a surplus package from the mobile app.
                  </p>
                </div>
              )}
            </div>

            {/* Before / After comparison callout if toggled */}
            {showComparison && pipelineResult && (
              <div className="p-3.5 border-t border-[#E3E7E4] bg-[#FEF3E2]/30 space-y-2 text-xs">
                <span className="font-semibold text-[#A15C07] block">
                  Plan change comparison
                </span>
                <div className="text-[#55605A] text-[11px] space-y-1">
                  <div>
                    <span className="font-medium text-[#17201C]">Previous stop order:</span>{" "}
                    Canteen ➔ Shelter Beta ➔ Hostel Gamma (5.8 km)
                  </div>
                  <div>
                    <span className="font-medium text-[#1F7A4D]">Current stop order:</span>{" "}
                    {pipelineResult.routeSequence.join(" ➔ ")} ({pipelineResult.totalDistanceKm} km)
                  </div>
                  <div className="text-[10px] text-[#7C867F] pt-1">
                    Saved 1.6 km after shelter availability update.
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Pane: SVG Route Canvas & Side Spec Panel (8 cols) */}
          <div className="lg:col-span-8 bg-white border border-[#E3E7E4] rounded-[10px] p-5 space-y-5">
            <div className="flex items-center justify-between border-b border-[#E3E7E4] pb-3">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#17201C]">
                  Route canvas
                </h3>
                <span className="text-[11px] text-[#55605A]">
                  Fastest route with ordered stop sequence
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs font-mono tabular-nums">
                <span className="text-[#17201C] font-semibold">4.2 km</span>
                <span className="text-[#7C867F]">·</span>
                <span className="text-[#1F5D46] font-semibold">14 min</span>
              </div>
            </div>

            {/* SVG Visual Canvas */}
            <div className="w-full h-80 bg-[#F6F7F5] rounded-[8px] border border-[#E3E7E4] relative overflow-hidden flex items-center justify-center">
              <svg className="w-full h-full" viewBox="0 0 680 400">
                {/* Muted background street lines */}
                <line x1="120" y1="150" x2="280" y2="100" stroke="#E3E7E4" strokeWidth="2" strokeDasharray="4 4" />
                <line x1="280" y1="100" x2="420" y2="140" stroke="#E3E7E4" strokeWidth="2" strokeDasharray="4 4" />
                <line x1="420" y1="140" x2="540" y2="240" stroke="#E3E7E4" strokeWidth="2" strokeDasharray="4 4" />
                <line x1="280" y1="100" x2="340" y2="300" stroke="#E3E7E4" strokeWidth="2" strokeDasharray="4 4" />
                <line x1="340" y1="300" x2="480" y2="340" stroke="#E3E7E4" strokeWidth="2" strokeDasharray="4 4" />

                {/* Active 2px Green Route Line */}
                <polyline
                  points="120,150 280,100 420,140 540,240"
                  fill="none"
                  stroke="#1F5D46"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Distance badges on route segments */}
                <rect x="185" y="112" width="45" height="18" rx="4" fill="#FFFFFF" stroke="#E3E7E4" strokeWidth="1" />
                <text x="207" y="125" textAnchor="middle" className="text-[10px] fill-[#55605A] font-mono">1.2 km</text>

                <rect x="335" y="108" width="45" height="18" rx="4" fill="#FFFFFF" stroke="#E3E7E4" strokeWidth="1" />
                <text x="357" y="121" textAnchor="middle" className="text-[10px] fill-[#55605A] font-mono">1.8 km</text>

                <rect x="465" y="178" width="45" height="18" rx="4" fill="#FFFFFF" stroke="#E3E7E4" strokeWidth="1" />
                <text x="487" y="191" textAnchor="middle" className="text-[10px] fill-[#55605A] font-mono">1.2 km</text>

                {/* Numbered Stop Markers */}
                {/* Stop 1: Pickup */}
                <g transform="translate(120, 150)">
                  <circle r="12" fill="#1F5D46" />
                  <text textAnchor="middle" dy="4" fill="#FFFFFF" className="text-[10px] font-bold">1</text>
                  <text textAnchor="middle" dy="24" fill="#17201C" className="text-[11px] font-medium">Hub Base</text>
                </g>

                {/* Stop 2: Canteen */}
                <g transform="translate(280, 100)">
                  <circle r="12" fill="#1F5D46" />
                  <text textAnchor="middle" dy="4" fill="#FFFFFF" className="text-[10px] font-bold">2</text>
                  <text textAnchor="middle" dy="24" fill="#17201C" className="text-[11px] font-medium">CHRIST Canteen</text>
                </g>

                {/* Stop 3: Asha Foundation */}
                <g transform="translate(420, 140)">
                  <circle r="12" fill="#1F5D46" />
                  <text textAnchor="middle" dy="4" fill="#FFFFFF" className="text-[10px] font-bold">3</text>
                  <text textAnchor="middle" dy="24" fill="#17201C" className="text-[11px] font-medium">Asha Foundation</text>
                </g>

                {/* Stop 4: Sneha Shelter */}
                <g transform="translate(540, 240)">
                  <circle r="12" fill="#1F5D46" />
                  <text textAnchor="middle" dy="4" fill="#FFFFFF" className="text-[10px] font-bold">4</text>
                  <text textAnchor="middle" dy="24" fill="#17201C" className="text-[11px] font-medium">Sneha Shelter</text>
                </g>
              </svg>
            </div>

            {/* Side Specification Grid: Stop order, Load plan, Fastest route */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-[8px] border border-[#E3E7E4] bg-[#F6F7F5]/50 space-y-1">
                <span className="text-[10px] font-semibold uppercase text-[#7C867F]">
                  Stop order
                </span>
                <div className="text-xs font-medium text-[#17201C]">
                  1. Hub ➔ 2. Canteen ➔ 3. Asha ➔ 4. Sneha
                </div>
                <span className="text-[11px] text-[#55605A] block">
                  Optimized for expiry urgency
                </span>
              </div>

              <div className="p-3 rounded-[8px] border border-[#E3E7E4] bg-[#F6F7F5]/50 space-y-1">
                <span className="text-[10px] font-semibold uppercase text-[#7C867F]">
                  Load plan
                </span>
                <div className="text-xs font-medium text-[#17201C]">
                  25.0 kg / 50.0 kg max
                </div>
                <span className="text-[11px] text-[#1F5D46] font-medium block">
                  Vehicle at 50% capacity
                </span>
              </div>

              <div className="p-3 rounded-[8px] border border-[#E3E7E4] bg-[#F6F7F5]/50 space-y-1">
                <span className="text-[10px] font-semibold uppercase text-[#7C867F]">
                  Fastest route
                </span>
                <div className="text-xs font-medium text-[#17201C]">
                  4.2 km · 14 min ETA
                </div>
                <span className="text-[11px] text-[#55605A] block">
                  Zero backtracks on corridor
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
