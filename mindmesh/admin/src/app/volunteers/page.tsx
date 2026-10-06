"use client";

import { useEffect, useState } from "react";
import { dataService } from "@/services/dataService";
import { PipelineVolunteer, PipelineExecutionResult } from "@/lib/engine/pipeline";
import { Bike, ShieldCheck, MapPin, Gauge, PackageCheck } from "lucide-react";

export default function VolunteersPage() {
  const [volunteers, setVolunteers] = useState<PipelineVolunteer[]>([]);
  const [lastResult, setLastResult] = useState<PipelineExecutionResult | null>(null);

  useEffect(() => {
    const update = () => {
      setVolunteers([...dataService.getVolunteers()]);
      setLastResult(dataService.getLastPipelineResult());
    };
    update();
    const unsubscribe = dataService.subscribe(update);
    return () => unsubscribe();
  }, []);

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            Volunteer Fleet
          </span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Active Courier Network</h1>
        <p className="text-sm text-zinc-400 max-w-xl mt-1">
          Volunteers operating mobile client apps (iPhone). Assignments are calculated based on payload capacity and shortest routes.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {volunteers.map((v) => {
          const isAssigned = lastResult?.assignedVolunteer.id === v.id;

          return (
            <div
              key={v.id}
              className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4 text-xs"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <Bike className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">{v.name}</h2>
                    <span className="text-[11px] text-zinc-500 font-mono">ID: {v.id.slice(0, 8)}</span>
                  </div>
                </div>

                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                  isAssigned
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                    : "bg-zinc-800 text-zinc-400 border-zinc-700"
                }`}>
                  {isAssigned ? "ON ACTIVE DISPATCH" : "STANDBY"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800">
                <div>
                  <span className="text-zinc-500 text-[10px] block">Vehicle Payload Capacity</span>
                  <div className="flex items-center gap-1.5 font-bold text-white text-sm font-mono mt-0.5">
                    <Gauge className="w-4 h-4 text-indigo-400" />
                    <span>{v.vehicleCapacityKg} kg</span>
                  </div>
                </div>
                <div>
                  <span className="text-zinc-500 text-[10px] block">Current Node Location</span>
                  <div className="flex items-center gap-1.5 font-bold text-emerald-400 text-sm font-mono mt-0.5">
                    <MapPin className="w-4 h-4" />
                    <span>{v.currentNodeId}</span>
                  </div>
                </div>
              </div>

              {isAssigned && lastResult && (
                <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-800/40 space-y-2">
                  <div className="flex items-center justify-between font-bold text-emerald-300">
                    <span>Active Route Tour:</span>
                    <span className="font-mono">{lastResult.totalDistanceKm} km ({lastResult.estimatedMinutes} min ETA)</span>
                  </div>
                  <div className="text-[11px] text-zinc-300 font-mono">
                    {lastResult.routeSequence.join(" ➔ ")}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
