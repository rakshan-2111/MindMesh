"use client";

import { useEffect, useState } from "react";
import { dataService } from "@/services/dataService";
import { PipelineRecipient, PipelineExecutionResult } from "@/lib/engine/pipeline";
import { Users, AlertCircle, CheckCircle, RefreshCw, MapPin, Award, Layers } from "lucide-react";

export default function RecipientsPage() {
  const [recipients, setRecipients] = useState<PipelineRecipient[]>([]);
  const [lastResult, setLastResult] = useState<PipelineExecutionResult | null>(null);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  useEffect(() => {
    const update = () => {
      setRecipients([...dataService.getRecipients()]);
      setLastResult(dataService.getLastPipelineResult());
    };
    update();
    const unsubscribe = dataService.subscribe(update);
    return () => unsubscribe();
  }, []);

  const handleToggle = async (recipient: PipelineRecipient) => {
    setIsUpdating(recipient.id);
    await dataService.toggleRecipientAvailability(recipient.id);
    setIsUpdating(null);
  };

  return (
    <div className="space-y-6">
      {/* Header banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Dynamic Re-optimization Engine
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Recipient Demands & Availability
          </h1>
          <p className="text-sm text-zinc-400 max-w-2xl mt-1">
            Toggle recipient availability below to test dynamic re-optimization. When marked <strong>UNAVAILABLE</strong>, MindMesh recalculates greedy matches, knapsack packing, and route tour in real-time, dispatching an <em>Assignment Updated</em> alert to the volunteer iPhone!
          </p>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono text-zinc-400">
          <RefreshCw className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
          <span>Realtime Subscriptions Active</span>
        </div>
      </div>

      {/* Recipients grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {recipients.map((recipient) => {
          const isAvailable = recipient.status === "available";
          const currentAllocation = lastResult?.matchedAllocations.find(
            (a) => a.recipient.id === recipient.id
          );

          return (
            <div
              key={recipient.id}
              className={`p-6 rounded-2xl border transition-all ${
                isAvailable
                  ? "bg-zinc-900/60 border-zinc-800 hover:border-zinc-700"
                  : "bg-zinc-950/80 border-rose-950/60 opacity-80"
              }`}
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-white">{recipient.name}</h2>
                    <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-zinc-800 text-zinc-300 border border-zinc-700">
                      {recipient.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-zinc-400 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Graph Node: <strong className="text-zinc-300 font-mono">{recipient.nodeId}</strong></span>
                  </div>
                </div>

                {/* Availability Toggle Button */}
                <button
                  onClick={() => handleToggle(recipient)}
                  disabled={isUpdating === recipient.id}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 ${
                    isAvailable
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-rose-500/20 hover:text-rose-400 hover:border-rose-500/40"
                      : "bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-emerald-500/20 hover:text-emerald-300 hover:border-emerald-500/40"
                  }`}
                >
                  {isUpdating === recipient.id ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : isAvailable ? (
                    <CheckCircle className="w-3.5 h-3.5" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5" />
                  )}
                  {isAvailable ? "MARK UNAVAILABLE" : "MARK AVAILABLE"}
                </button>
              </div>

              {/* Specs & Demand */}
              <div className="grid grid-cols-3 gap-2 p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800/80 text-xs mb-4">
                <div>
                  <span className="text-zinc-500 block text-[11px]">Required Demand</span>
                  <span className="text-base font-bold text-white font-mono">
                    {recipient.requiredQuantity} <span className="text-[11px] text-zinc-500 font-normal">portions</span>
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[11px]">Remaining</span>
                  <span className="text-base font-bold text-amber-400 font-mono">
                    {recipient.remainingDemand} <span className="text-[11px] text-zinc-500 font-normal">portions</span>
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[11px]">Priority Rating</span>
                  <div className="flex items-center gap-1 text-base font-bold text-emerald-400">
                    <Award className="w-3.5 h-3.5" />
                    <span>{recipient.priority} / 5</span>
                  </div>
                </div>
              </div>

              {/* Current Allocation State */}
              <div className="flex items-center justify-between text-xs px-3 py-2 rounded-lg bg-zinc-900/90 border border-zinc-800">
                <span className="text-zinc-400">Current Pipeline Allocation:</span>
                {currentAllocation ? (
                  <span className="font-bold text-emerald-400 font-mono">
                    Allocated +{currentAllocation.allocatedQuantity} portions
                  </span>
                ) : (
                  <span className="text-zinc-500 font-mono">
                    {isAvailable ? "Pending surplus supply" : "Excluded (Unavailable)"}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
