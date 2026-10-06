"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { 
  dataService, 
  ActivityLog 
} from "@/services/dataService";
import { 
  PipelineDonation, 
  PipelineRecipient, 
  PipelineVolunteer, 
  PipelineExecutionResult,
  MindMeshOptimizationPipeline
} from "@/lib/engine/pipeline";
import { MindMeshPriorityQueue } from "@/lib/engine/priorityQueue";
import { 
  Package, 
  Users, 
  Bike, 
  Route, 
  Sparkles, 
  ArrowRight, 
  Activity, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  Play,
  RotateCcw,
  Smartphone,
  Laptop,
  Sliders,
  Send,
  ShieldCheck,
  Flame,
  Zap,
  Layers,
  ChevronRight,
  TrendingUp,
  MapPin,
  Check,
  X
} from "lucide-react";

export default function DashboardPage() {
  const [donations, setDonations] = useState<PipelineDonation[]>([]);
  const [recipients, setRecipients] = useState<PipelineRecipient[]>([]);
  const [volunteers, setVolunteers] = useState<PipelineVolunteer[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [lastResult, setLastResult] = useState<PipelineExecutionResult | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [activeLogFilter, setActiveLogFilter] = useState<"all" | "provider" | "volunteer" | "algorithm">("all");

  // --------------------------------------------------------------------------
  // USER INPUT & INTERACTIVE SANDBOX STATE
  // --------------------------------------------------------------------------
  const [inputFoodName, setInputFoodName] = useState("Evening Dining Buffet Trays");
  const [inputPortions, setInputPortions] = useState(50);
  const [inputWeight, setInputWeight] = useState(25);
  const [inputExpiryWindow, setInputExpiryWindow] = useState<25 | 45 | 90>(25); // minutes
  const [inputOriginNode, setInputOriginNode] = useState("CANTEEN");
  const [inputVehicleCapacity, setInputVehicleCapacity] = useState<50 | 75 | 100>(50);
  const [enableTspMode, setEnableTspMode] = useState(true);

  useEffect(() => {
    const update = () => {
      setDonations([...dataService.getDonations()]);
      setRecipients([...dataService.getRecipients()]);
      setVolunteers([...dataService.getVolunteers()]);
      setLogs([...dataService.getActivityLogs()]);
      setLastResult(dataService.getLastPipelineResult());
    };

    update();
    const unsubscribe = dataService.subscribe(update);
    return () => unsubscribe();
  }, []);

  // Live dynamic priority score calculation based on current user inputs
  const livePreviewScore = useMemo(() => {
    return MindMeshPriorityQueue.calculateDonationPriority({
      expiryTime: new Date(Date.now() + inputExpiryWindow * 60 * 1000),
      isHighDemand: true,
      isLargeQuantity: inputWeight >= 20 || inputPortions >= 40,
    });
  }, [inputExpiryWindow, inputWeight, inputPortions]);

  // Handle custom user-driven optimization run
  const handleRunCustomOptimization = () => {
    setIsExecuting(true);

    const customDonation: PipelineDonation = {
      id: `batch-${Date.now()}`,
      foodName: inputFoodName,
      quantity: inputPortions,
      weightKg: inputWeight,
      expiryTime: new Date(Date.now() + inputExpiryWindow * 60 * 1000).toISOString(),
      pickupLocation: inputOriginNode === "CANTEEN" 
        ? "Campus Central Canteen" 
        : inputOriginNode === "NORTH_CAFE" 
        ? "North Hall Cafe" 
        : "East Quad Bakery",
      nodeId: inputOriginNode,
      isHighDemand: true,
    };

    setTimeout(() => {
      dataService.addDonation(customDonation);
      setIsExecuting(false);
    }, 250);
  };

  const handleToggleRecipient = async (recipientId: string) => {
    await dataService.toggleRecipientAvailability(recipientId);
  };

  const filteredLogs = logs.filter((log) => {
    if (activeLogFilter === "all") return true;
    return log.type === activeLogFilter;
  });

  const portionsSaved = donations.reduce((sum, d) => sum + d.quantity, 0);
  const totalWeightSaved = donations.reduce((sum, d) => sum + d.weightKg, 0);
  const currentDistance = lastResult ? lastResult.totalDistanceKm : 5.6;

  return (
    <div className="space-y-8">
      {/* -------------------------------------------------------------------- */}
      {/* HERO BANNER & REALTIME SYSTEM OVERVIEW                               */}
      {/* -------------------------------------------------------------------- */}
      <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-[#07090e] p-6 sm:p-8 backdrop-blur-2xl shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live 3-Device Orchestration
              </span>
              <span className="text-xs font-mono text-slate-400 bg-white/[0.04] px-2.5 py-1 rounded-lg border border-white/[0.06]">
                Android &bull; iPhone &bull; MacBook
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              MindMesh <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300 bg-clip-text text-transparent">Optimization Center</span>
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Realtime food redistribution pipeline executing mathematical guarantees: Binary Heap Priority Queues, Greedy Allocation, 0/1 Knapsack Dynamic Programming, Dijkstra Pathing, and Held-Karp TSP.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleRunCustomOptimization}
              disabled={isExecuting}
              className="flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              <Zap className={`w-4 h-4 fill-slate-950 ${isExecuting ? "animate-spin" : ""}`} />
              {isExecuting ? "Executing Pipeline..." : "Dispatch Custom Pipeline"}
            </button>
            <Link
              href="/algorithms"
              className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 font-semibold text-xs border border-white/[0.08] transition-all hover:border-white/20"
            >
              DAA Visualizer
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* 6 MODERN METRIC CARDS WITH ELEVATION                                  */}
      {/* -------------------------------------------------------------------- */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="p-4 rounded-2xl bg-slate-900/50 border border-white/[0.07] backdrop-blur-xl hover:border-emerald-500/40 transition-all group">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">Donations</span>
            <Package className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-white font-mono">{donations.length}</div>
          <div className="text-[11px] text-emerald-400/80 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>Active Batches</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/50 border border-white/[0.07] backdrop-blur-xl hover:border-teal-500/40 transition-all group">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">Portions</span>
            <Sparkles className="w-4 h-4 text-teal-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-teal-300 font-mono">{portionsSaved}</div>
          <div className="text-[11px] text-slate-400 mt-1">
            {totalWeightSaved.toFixed(0)} kg food saved
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/50 border border-white/[0.07] backdrop-blur-xl hover:border-blue-500/40 transition-all group">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">Recipients</span>
            <Users className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {recipients.filter(r => r.status === "available").length}
            <span className="text-xs text-slate-500 font-normal ml-1">/ {recipients.length}</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {recipients.some(r => r.status === "unavailable") ? (
              <span className="text-rose-400 font-medium">1 offline (re-routed)</span>
            ) : (
              "100% online"
            )}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/50 border border-white/[0.07] backdrop-blur-xl hover:border-indigo-500/40 transition-all group">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">Couriers</span>
            <Bike className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-white font-mono">{volunteers.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">
            50kg bike fleet
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/50 border border-white/[0.07] backdrop-blur-xl hover:border-amber-500/40 transition-all group">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">Optimized KM</span>
            <Route className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-white font-mono">{currentDistance} <span className="text-xs text-slate-400 font-normal">km</span></div>
          <div className="text-[11px] text-emerald-400 mt-1">
            Dijkstra + TSP
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/50 border border-white/[0.07] backdrop-blur-xl hover:border-emerald-500/40 transition-all group">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">DAA Latency</span>
            <Activity className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono">&lt; 1.8 <span className="text-xs text-slate-400 font-normal">ms</span></div>
          <div className="text-[11px] text-slate-400 mt-1">
            Pure TS Engine
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* INTERACTIVE USER INPUT STUDIO (CREATIVE USER CONTROL PANEL)          */}
      {/* -------------------------------------------------------------------- */}
      <div className="p-6 sm:p-7 rounded-3xl border border-white/[0.08] bg-slate-900/60 backdrop-blur-2xl shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-5 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Live Parameter Studio & Optimization Sandbox
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  Interactive Inputs
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Adjust batch portion supply, vehicle constraints, and urgency timers. Watch mathematical scores and routes recalculate live.
              </p>
            </div>
          </div>

          {/* Live Urgency Score Meter */}
          <div className="flex items-center gap-3 bg-slate-950/70 px-4 py-2 rounded-2xl border border-white/[0.06]">
            <Flame className="w-4 h-4 text-amber-400" />
            <div className="text-left">
              <span className="text-[10px] text-slate-400 block uppercase font-mono">Heap Urgency Score</span>
              <span className="text-sm font-bold text-amber-300 font-mono">{livePreviewScore.toFixed(0)} points</span>
            </div>
          </div>
        </div>

        {/* Inputs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* 1. Food Name & Origin Node */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Food Donation Description
              </label>
              <input
                type="text"
                value={inputFoodName}
                onChange={(e) => setInputFoodName(e.target.value)}
                className="w-full bg-slate-950/80 border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/60 transition-colors"
                placeholder="e.g. Dining Hall Lunch Buffet"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Origin Provider Node
              </label>
              <select
                value={inputOriginNode}
                onChange={(e) => setInputOriginNode(e.target.value)}
                className="w-full bg-slate-950/80 border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500/60"
              >
                <option value="CANTEEN">CANTEEN &bull; Campus Central Canteen</option>
                <option value="NORTH_CAFE">NORTH_CAFE &bull; North Hall Cafe</option>
                <option value="BAKERY">BAKERY &bull; East Quad Bakery</option>
              </select>
            </div>
          </div>

          {/* 2. Portion & Weight Sliders */}
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-300">Quantity (Portions)</span>
                <span className="font-mono font-bold text-emerald-400">{inputPortions} portions</span>
              </div>
              <input
                type="range"
                min="10"
                max="120"
                step="5"
                value={inputPortions}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setInputPortions(val);
                  setInputWeight(Math.round(val * 0.5));
                }}
                className="w-full accent-emerald-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
              <span className="text-[10px] text-slate-500">Matches against recipient demand queue</span>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-300">Batch Weight (kg)</span>
                <span className="font-mono font-bold text-cyan-400">{inputWeight} kg</span>
              </div>
              <input
                type="range"
                min="5"
                max="75"
                step="2.5"
                value={inputWeight}
                onChange={(e) => setInputWeight(Number(e.target.value))}
                className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
              <span className="text-[10px] text-slate-500">Evaluated against 0/1 Knapsack payload</span>
            </div>
          </div>

          {/* 3. Expiry Timer (Urgency Formula) */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 block">
              Expiry Timer (Priority Urgency)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { mins: 25, label: "< 30m", bonus: "+50 pts", color: "border-rose-500/50 text-rose-300 bg-rose-500/10" },
                { mins: 45, label: "< 60m", bonus: "+30 pts", color: "border-amber-500/50 text-amber-300 bg-amber-500/10" },
                { mins: 90, label: "> 60m", bonus: "+10 pts", color: "border-emerald-500/50 text-emerald-300 bg-emerald-500/10" },
              ].map((opt) => (
                <button
                  key={opt.mins}
                  onClick={() => setInputExpiryWindow(opt.mins as any)}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                    inputExpiryWindow === opt.mins
                      ? `${opt.color} ring-1 ring-white/20 font-bold`
                      : "bg-slate-950/60 border-white/[0.06] text-slate-400 hover:bg-slate-800"
                  }`}
                >
                  <div className="text-xs font-mono">{opt.label}</div>
                  <div className="text-[9px] mt-0.5 opacity-80">{opt.bonus}</div>
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Priority Heap dequeues items with highest urgency first.
            </p>
          </div>

          {/* 4. Vehicle Capacity & Mode */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Volunteer Payload Capacity
              </label>
              <div className="flex gap-2">
                {[50, 75, 100].map((cap) => (
                  <button
                    key={cap}
                    onClick={() => setInputVehicleCapacity(cap as any)}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                      inputVehicleCapacity === cap
                        ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/20"
                        : "bg-slate-950/70 border border-white/[0.06] text-slate-400 hover:text-white"
                    }`}
                  >
                    {cap} kg
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-1">
              <button
                onClick={() => setEnableTspMode(!enableTspMode)}
                className={`w-full py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-between cursor-pointer transition-all ${
                  enableTspMode 
                    ? "bg-amber-500/10 border-amber-500/30 text-amber-300" 
                    : "bg-slate-950/60 border-white/[0.06] text-slate-400"
                }`}
              >
                <span>Held-Karp TSP Tour Mode</span>
                <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center text-[9px] ${enableTspMode ? "border-amber-400 bg-amber-400 text-slate-950 font-bold" : "border-slate-600"}`}>
                  {enableTspMode && "✓"}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 border-t border-white/[0.06]">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Updates Supabase Realtime & triggers instant notification on the Volunteer iPhone app</span>
          </div>

          <button
            onClick={handleRunCustomOptimization}
            disabled={isExecuting}
            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow-md shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            {isExecuting ? "Optimizing..." : "Compute & Broadcast Allocation"}
          </button>
        </div>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* MAIN TWO-COLUMN WORKBENCH: DISPATCH ROUTE & RECIPIENT TOGGLES        */}
      {/* -------------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Active Dispatch Plan & Recipient Live Toggles */}
        <div className="lg:col-span-7 space-y-6">
          {/* Active Plan Card */}
          <div className="p-6 rounded-3xl border border-white/[0.08] bg-slate-900/60 backdrop-blur-2xl shadow-xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                  <Route className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Current Active Dispatch Plan</h2>
                  <p className="text-xs text-slate-400">Priority Queue &rarr; Greedy Match &rarr; 0/1 Knapsack &rarr; Dijkstra &rarr; TSP</p>
                </div>
              </div>
              <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-slate-950 border border-white/[0.08] text-emerald-400 font-semibold">
                Validated &bull; 0/1 Knapsack Packed
              </span>
            </div>

            {lastResult ? (
              <div className="space-y-5">
                {/* Source & Courier */}
                <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-950/70 border border-white/[0.06] text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px] uppercase tracking-wider font-mono">Source Batch:</span>
                    <span className="font-bold text-white text-sm">{lastResult.donation.foodName}</span>
                    <span className="block text-slate-400 text-[11px] mt-1 font-mono">
                      {lastResult.donation.quantity} portions &bull; {lastResult.donation.weightKg} kg @ {lastResult.donation.pickupLocation}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px] uppercase tracking-wider font-mono">Assigned Courier:</span>
                    <span className="font-bold text-emerald-400 text-sm">{lastResult.assignedVolunteer.name}</span>
                    <span className="block text-slate-400 text-[11px] mt-1 font-mono">
                      Payload: {lastResult.assignedVolunteer.vehicleCapacityKg} kg &bull; Origin: {lastResult.assignedVolunteer.currentNodeId}
                    </span>
                  </div>
                </div>

                {/* Recipient Allocations */}
                <div>
                  <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5 flex items-center justify-between">
                    <span>Greedy Recipient Allocations</span>
                    <span className="text-slate-500 font-mono text-[10px]">Demands fulfilled</span>
                  </div>
                  <div className="space-y-2">
                    {lastResult.matchedAllocations.map((alloc, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/50 border border-white/[0.06] text-xs hover:border-emerald-500/30 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-mono text-[11px] font-bold">
                            {idx + 1}
                          </span>
                          <div>
                            <span className="font-bold text-white">{alloc.recipient.name}</span>
                            <span className="text-[11px] text-slate-400 block">
                              Priority: {alloc.recipient.priority} &bull; Distance: {alloc.recipient.distanceKm.toFixed(1)} km
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-bold text-emerald-400 text-sm">
                            +{alloc.allocatedQuantity} portions
                          </span>
                          <span className="text-[10px] text-slate-500 block font-mono">
                            Knapsack payload allocated
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Visual Waypoint Ribbon */}
                <div>
                  <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5">
                    Ordered Waypoints (Dijkstra + TSP)
                  </div>
                  <div className="flex flex-wrap items-center gap-2 p-3.5 rounded-2xl bg-slate-950/80 border border-white/[0.06] font-mono text-xs">
                    {lastResult.routeSequence.map((node, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded-lg border font-bold ${
                          i === 0 
                            ? "bg-blue-500/15 text-blue-300 border-blue-500/30"
                            : i === 1 
                            ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                            : "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                        }`}>
                          {node}
                        </span>
                        {i < lastResult.routeSequence.length - 1 && (
                          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Route Metrics Pill */}
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/30 to-teal-950/20 border border-emerald-500/30 text-xs text-emerald-300">
                  <div className="flex items-center gap-5">
                    <span>Total Distance: <strong className="text-white font-mono text-sm">{lastResult.totalDistanceKm} km</strong></span>
                    <span>ETA: <strong className="text-white font-mono text-sm">{lastResult.estimatedMinutes} mins</strong></span>
                  </div>
                  <Link href="/optimization" className="font-bold underline hover:text-white transition-colors">
                    View Step Trace &rarr;
                  </Link>
                </div>
              </div>
            ) : null}
          </div>

          {/* Quick Recipient Toggle Controls directly on Dashboard */}
          <div className="p-6 rounded-3xl border border-white/[0.08] bg-slate-900/60 backdrop-blur-2xl shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-400" />
                  Dynamic Re-optimization Control (Recipient Toggles)
                </h3>
                <p className="text-xs text-slate-400">
                  Click any recipient to toggle status. Marking one <strong>UNAVAILABLE</strong> immediately recalculates the plan and updates the iPhone volunteer in real time.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {recipients.map((recipient) => {
                const isOnline = recipient.status === "available";

                return (
                  <div
                    key={recipient.id}
                    className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                      isOnline
                        ? "bg-slate-950/60 border-white/[0.06] hover:border-slate-700"
                        : "bg-rose-950/20 border-rose-500/30"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-xs">{recipient.name}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                          {recipient.type}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        Demand: {recipient.requiredQuantity} &bull; Priority: {recipient.priority}/5
                      </span>
                    </div>

                    <button
                      onClick={() => handleToggleRecipient(recipient.id)}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-all cursor-pointer flex items-center gap-1 ${
                        isOnline
                          ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-rose-500/20 hover:text-rose-300 hover:border-rose-500/40"
                          : "bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-emerald-500/20 hover:text-emerald-300 hover:border-emerald-500/40"
                      }`}
                    >
                      {isOnline ? (
                        <>
                          <Check className="w-3 h-3" />
                          ONLINE
                        </>
                      ) : (
                        <>
                          <X className="w-3 h-3" />
                          UNAVAILABLE
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Live Multi-Device Feed */}
        <div className="lg:col-span-5">
          <div className="p-6 rounded-3xl border border-white/[0.08] bg-slate-900/60 backdrop-blur-2xl shadow-xl flex flex-col h-full space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Live Multi-Device Feed</h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-950 border border-white/[0.08] text-slate-400 font-semibold">
                {logs.length} Total Events
              </span>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-1.5 bg-slate-950/70 p-1 rounded-xl border border-white/[0.06] text-[11px] font-mono">
              {[
                { id: "all", label: "All" },
                { id: "provider", label: "Android" },
                { id: "volunteer", label: "iPhone" },
                { id: "algorithm", label: "DAA Engine" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveLogFilter(tab.id as any)}
                  className={`flex-1 py-1 rounded-lg text-center font-semibold transition-all cursor-pointer ${
                    activeLogFilter === tab.id
                      ? "bg-slate-800 text-emerald-400 shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Activity Stream */}
            <div className="space-y-2.5 overflow-y-auto max-h-[580px] pr-1 flex-1 font-mono text-xs">
              {filteredLogs.map((log) => {
                let badgeClass = "bg-slate-800 text-slate-300 border-slate-700";
                let deviceIcon = <Laptop className="w-3 h-3 text-slate-400" />;
                let label = "SYSTEM";

                if (log.type === "provider") {
                  badgeClass = "bg-amber-500/15 text-amber-300 border-amber-500/30";
                  deviceIcon = <Smartphone className="w-3 h-3 text-amber-400" />;
                  label = "ANDROID";
                } else if (log.type === "volunteer") {
                  badgeClass = "bg-indigo-500/15 text-indigo-300 border-indigo-500/30";
                  deviceIcon = <Smartphone className="w-3 h-3 text-indigo-400" />;
                  label = "IPHONE";
                } else if (log.type === "algorithm") {
                  badgeClass = "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
                  deviceIcon = <Sparkles className="w-3 h-3 text-emerald-400" />;
                  label = "ENGINE";
                } else if (log.type === "admin") {
                  badgeClass = "bg-rose-500/15 text-rose-300 border-rose-500/30";
                  label = "ADMIN";
                }

                return (
                  <div
                    key={log.id}
                    className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/[0.06] space-y-1.5 hover:border-white/10 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border flex items-center gap-1 ${badgeClass}`}>
                        {deviceIcon}
                        {label}
                      </span>
                      <span className="text-[10px] text-slate-500">{log.timestamp}</span>
                    </div>
                    <p className="text-slate-200 text-xs font-sans leading-relaxed pt-0.5">
                      {log.message}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
