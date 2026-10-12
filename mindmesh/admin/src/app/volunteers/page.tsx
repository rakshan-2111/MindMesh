"use client";

import React, { useEffect, useState } from "react";
import { TopBar } from "@/components/TopBar";
import { DataTable, Column } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { dataService } from "@/services/dataService";
import { PipelineVolunteer, PipelineExecutionResult } from "@/lib/engine/pipeline";

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

  const columns: Column<PipelineVolunteer>[] = [
    {
      header: "Courier Name",
      cell: (v) => (
        <div>
          <div className="font-medium text-[#17201C]">{v.name}</div>
          <div className="text-[11px] text-[#7C867F] font-mono">
            ID: #{v.id.slice(0, 8)}
          </div>
        </div>
      ),
    },
    {
      header: "Vehicle Type",
      width: "160px",
      cell: (v) => {
        const type = v.name.includes("Ravi") ? "Delivery Scooter" : "Compact EV";
        return <span className="text-xs text-[#55605A]">{type}</span>;
      },
    },
    {
      header: "Vehicle Capacity",
      align: "right",
      width: "140px",
      cell: (v) => (
        <span className="font-mono text-xs tabular-nums text-[#17201C]">
          {v.vehicleCapacityKg.toFixed(1)} kg max
        </span>
      ),
    },
    {
      header: "Status",
      width: "130px",
      cell: (v) => {
        const isAssigned = lastResult?.assignedVolunteer.id === v.id;
        return (
          <StatusBadge
            label={isAssigned ? "On dispatch" : "Standby"}
            variant={isAssigned ? "info" : "neutral"}
          />
        );
      },
    },
    {
      header: "Current Task & Route",
      cell: (v) => {
        const isAssigned = lastResult?.assignedVolunteer.id === v.id;
        if (isAssigned && lastResult) {
          return (
            <div>
              <span className="font-medium text-[#1F5D46]">
                {lastResult.totalDistanceKm} km · {lastResult.routeSequence.length} stops
              </span>
              <span className="block text-[11px] text-[#7C867F]">
                Load: {lastResult.knapsackOutcome.totalWeight} kg
              </span>
            </div>
          );
        }
        return <span className="text-xs text-[#7C867F]">Available for assignment</span>;
      },
    },
    {
      header: "Base Location",
      width: "160px",
      cell: (v) => {
        const loc = v.name.includes("Ravi") ? "Koramangala Hub" : "Indiranagar Hub";
        return <span className="text-xs text-[#55605A]">{loc}</span>;
      },
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar title="Volunteer Courier Network" />

      <main className="flex-1 p-6 space-y-6 max-w-7xl w-full mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-[#17201C]">
              Active Couriers & Delivery Capacity
            </h2>
            <p className="text-xs text-[#55605A] mt-0.5">
              Volunteer delivery partners on mobile apps collecting surplus food in Bengaluru.
            </p>
          </div>
          <div className="text-xs text-[#7C867F] font-mono tabular-nums">
            {volunteers.length} registered couriers
          </div>
        </div>

        <div className="bg-white border border-[#E3E7E4] rounded-[10px] overflow-hidden">
          <DataTable
            columns={columns}
            data={volunteers}
            keyExtractor={(v) => v.id}
            emptyMessage="No couriers registered."
          />
        </div>
      </main>
    </div>
  );
}
