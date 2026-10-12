"use client";

import React, { useState } from "react";
import { TopBar } from "@/components/TopBar";
import { MetricCard } from "@/components/ui/MetricCard";
import { DataTable, Column } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/Button";
import { Download, Calendar } from "lucide-react";

interface DailyReportRow {
  date: string;
  portionsRescued: number;
  weightKg: number;
  onTimeRate: string;
  avgPickupMin: string;
  distanceKm: string;
}

export default function ReportsPage() {
  const [selectedRange, setSelectedRange] = useState("Last 14 days");

  const reportData: DailyReportRow[] = [
    { date: "06 Oct 2026", portionsRescued: 230, weightKg: 115.0, onTimeRate: "98.4%", avgPickupMin: "12 min", distanceKm: "18.4 km" },
    { date: "05 Oct 2026", portionsRescued: 185, weightKg: 92.5, onTimeRate: "96.2%", avgPickupMin: "14 min", distanceKm: "16.1 km" },
    { date: "04 Oct 2026", portionsRescued: 210, weightKg: 105.0, onTimeRate: "97.8%", avgPickupMin: "11 min", distanceKm: "19.2 km" },
    { date: "03 Oct 2026", portionsRescued: 160, weightKg: 80.0, onTimeRate: "95.0%", avgPickupMin: "15 min", distanceKm: "14.0 km" },
    { date: "02 Oct 2026", portionsRescued: 190, weightKg: 95.0, onTimeRate: "98.0%", avgPickupMin: "13 min", distanceKm: "17.5 km" },
    { date: "01 Oct 2026", portionsRescued: 175, weightKg: 87.5, onTimeRate: "97.1%", avgPickupMin: "12 min", distanceKm: "15.8 km" },
    { date: "30 Sep 2026", portionsRescued: 155, weightKg: 77.5, onTimeRate: "94.5%", avgPickupMin: "16 min", distanceKm: "13.9 km" },
  ];

  const handleExportCSV = () => {
    const headers = ["Date", "Portions Rescued", "Weight (kg)", "On-Time Rate", "Avg Pickup Time", "Distance Covered"];
    const rows = reportData.map((r) => [r.date, r.portionsRescued, r.weightKg, r.onTimeRate, r.avgPickupMin, r.distanceKm]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `mindmesh_operations_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns: Column<DailyReportRow>[] = [
    {
      header: "Date",
      cell: (r) => <span className="font-medium text-[#17201C]">{r.date}</span>,
    },
    {
      header: "Portions Rescued",
      align: "right",
      cell: (r) => (
        <span className="font-mono text-xs tabular-nums text-[#17201C]">
          {r.portionsRescued.toLocaleString()} portions
        </span>
      ),
    },
    {
      header: "Weight Delivered",
      align: "right",
      cell: (r) => (
        <span className="font-mono text-xs tabular-nums text-[#55605A]">
          {r.weightKg.toFixed(1)} kg
        </span>
      ),
    },
    {
      header: "On-Time Rate",
      align: "right",
      cell: (r) => (
        <span className="font-mono text-xs tabular-nums text-[#1F7A4D] font-medium">
          {r.onTimeRate}
        </span>
      ),
    },
    {
      header: "Avg Pickup Time",
      align: "right",
      cell: (r) => (
        <span className="font-mono text-xs tabular-nums text-[#55605A]">
          {r.avgPickupMin}
        </span>
      ),
    },
    {
      header: "Distance Covered",
      align: "right",
      cell: (r) => (
        <span className="font-mono text-xs tabular-nums text-[#17201C]">
          {r.distanceKm}
        </span>
      ),
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar title="Operations Reports & Metrics" />

      <main className="flex-1 p-6 space-y-6 max-w-7xl w-full mx-auto">
        {/* Header & Export button */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-[#17201C]">
              Logistics Performance & Efficiency
            </h2>
            <p className="text-xs text-[#55605A] mt-0.5">
              Historical delivery summaries, response times, and fuel savings across Bengaluru.
            </p>
          </div>
          <Button
            variant="secondary"
            size="default"
            icon={<Download size={14} />}
            onClick={handleExportCSV}
          >
            Export CSV
          </Button>
        </div>

        {/* 4 Summary Metric Figures */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MetricCard
            label="Portions rescued"
            value="2,345"
            delta="+18% vs prev period"
            deltaType="positive"
          />
          <MetricCard
            label="On-time delivery rate"
            value="97.4%"
            delta="Target > 95%"
            deltaType="positive"
          />
          <MetricCard
            label="Average pickup time"
            value="13 min"
            delta="-2 min response"
            deltaType="positive"
          />
          <MetricCard
            label="Distance per delivery"
            value="3.8 km"
            delta="Optimal route"
            deltaType="neutral"
          />
        </div>

        {/* Performance table */}
        <div className="bg-white border border-[#E3E7E4] rounded-[10px] overflow-hidden">
          <div className="p-3.5 border-b border-[#E3E7E4] bg-[#F6F7F5]/50 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#17201C]">
              Daily distribution ledger
            </span>
            <span className="text-xs text-[#7C867F] font-mono">
              7 daily records
            </span>
          </div>
          <DataTable
            columns={columns}
            data={reportData}
            keyExtractor={(r) => r.date}
            emptyMessage="No historical records available."
          />
        </div>
      </main>
    </div>
  );
}
