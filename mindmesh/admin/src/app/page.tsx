"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { TopBar } from "@/components/TopBar";
import { MetricCard } from "@/components/ui/MetricCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { dataService, ActivityLog } from "@/services/dataService";
import {
  PipelineDonation,
  PipelineRecipient,
  PipelineVolunteer,
} from "@/lib/engine/pipeline";
import { calculateUrgency, formatPortions } from "@/lib/tokens";

export default function OverviewPage() {
  const [donations, setDonations] = useState<PipelineDonation[]>([]);
  const [recipients, setRecipients] = useState<PipelineRecipient[]>([]);
  const [volunteers, setVolunteers] = useState<PipelineVolunteer[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);

  useEffect(() => {
    const update = () => {
      setDonations([...dataService.getDonations()]);
      setRecipients([...dataService.getRecipients()]);
      setVolunteers([...dataService.getVolunteers()]);
      setLogs([...dataService.getActivityLogs()]);
    };

    update();
    const unsubscribe = dataService.subscribe(update);
    return () => unsubscribe();
  }, []);

  // 14-day history data for chart
  const historicalData = [
    { date: "23 Sep", portions: 85 },
    { date: "24 Sep", portions: 110 },
    { date: "25 Sep", portions: 95 },
    { date: "26 Sep", portions: 140 },
    { date: "27 Sep", portions: 130 },
    { date: "28 Sep", portions: 165 },
    { date: "29 Sep", portions: 120 },
    { date: "30 Sep", portions: 155 },
    { date: "01 Oct", portions: 175 },
    { date: "02 Oct", portions: 190 },
    { date: "03 Oct", portions: 160 },
    { date: "04 Oct", portions: 210 },
    { date: "05 Oct", portions: 185 },
    { date: "06 Oct", portions: 230 },
  ];

  // Derived metrics
  const openDonationsCount = donations.length;
  const portionsAvailable = donations.reduce((sum, d) => sum + d.quantity, 0);
  const activeVolunteersCount = volunteers.length;
  const deliveredTodayCount = 230; // realistic Bengaluru daily volume
  const distanceSavedKm = "18.4 km";

  // Needs Attention items
  const expiringDonations = donations.filter((d) => {
    const info = calculateUrgency(d.expiryTime);
    return info.minutesLeft > 0 && info.minutesLeft <= 60;
  });

  const unavailableRecipients = recipients.filter((r) => r.status === "unavailable");

  const handleToggleRecipient = async (recipientId: string) => {
    await dataService.toggleRecipientAvailability(recipientId);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar title="Operations Overview" />

      <main className="flex-1 p-6 space-y-6 max-w-7xl w-full mx-auto">
        {/* Top Strip: 5 Plain Figures with Small Labels and Delta */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <MetricCard
            label="Open donations"
            value={openDonationsCount}
            delta="+2 today"
            deltaType="positive"
          />
          <MetricCard
            label="Portions available"
            value={portionsAvailable}
            delta="Urgent distribution"
            deltaType="neutral"
          />
          <MetricCard
            label="Active volunteers"
            value={activeVolunteersCount}
            delta="Ready for pickup"
            deltaType="positive"
          />
          <MetricCard
            label="Delivered today"
            value={deliveredTodayCount}
            delta="+14% vs yesterday"
            deltaType="positive"
          />
          <MetricCard
            label="Distance saved"
            value={distanceSavedKm}
            delta="Via route planning"
            deltaType="positive"
          />
        </div>

        {/* Two-Column Midsection: Needs Attention & Live Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Needs Attention (7 cols) */}
          <section className="lg:col-span-7 bg-white border border-[#E3E7E4] rounded-[10px] flex flex-col">
            <div className="p-4 border-b border-[#E3E7E4] flex items-center justify-between">
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-[#17201C]">
                  Needs attention
                </h2>
                <p className="text-xs text-[#55605A] mt-0.5">
                  Pickups expiring soon and capacity adjustments
                </p>
              </div>
              <span className="text-xs text-[#7C867F] tabular-nums font-mono">
                {expiringDonations.length + unavailableRecipients.length} items
              </span>
            </div>

            <div className="divide-y divide-[#E3E7E4] flex-1">
              {expiringDonations.length === 0 && unavailableRecipients.length === 0 ? (
                <div className="py-12 text-center text-xs text-[#7C867F]">
                  All current donations assigned. No operational blocks.
                </div>
              ) : (
                <>
                  {/* Expiring donations rows */}
                  {expiringDonations.map((d) => {
                    const urgency = calculateUrgency(d.expiryTime);
                    return (
                      <div
                        key={d.id}
                        className="p-3.5 flex items-center justify-between gap-4 hover:bg-[#F6F7F5] transition-colors"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-[#17201C] truncate">
                              {d.foodName}
                            </span>
                            <StatusBadge
                              label={urgency.countdown}
                              variant={urgency.badgeVariant}
                            />
                          </div>
                          <div className="text-xs text-[#55605A] mt-0.5">
                            {d.quantity} portions ({d.weightKg} kg) · {d.pickupLocation}
                          </div>
                        </div>

                        <div className="shrink-0 flex items-center gap-2">
                          <Link href="/donations">
                            <Button variant="secondary" size="sm">
                              Assign
                            </Button>
                          </Link>
                        </div>
                      </div>
                    );
                  })}

                  {/* Unavailable recipients rows */}
                  {unavailableRecipients.map((r) => (
                    <div
                      key={r.id}
                      className="p-3.5 flex items-center justify-between gap-4 hover:bg-[#F6F7F5] transition-colors bg-[#FEF3E2]/30"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-[#17201C]">
                            {r.name}
                          </span>
                          <StatusBadge label="Unavailable" variant="warning" />
                        </div>
                        <div className="text-xs text-[#55605A] mt-0.5">
                          Capacity paused · Re-route plan active for other shelters
                        </div>
                      </div>

                      <div className="shrink-0">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleToggleRecipient(r.id)}
                        >
                          Mark available
                        </Button>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </section>

          {/* Right Column: Live Activity Feed (5 cols) */}
          <section className="lg:col-span-5 bg-white border border-[#E3E7E4] rounded-[10px] flex flex-col">
            <div className="p-4 border-b border-[#E3E7E4] flex items-center justify-between">
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-[#17201C]">
                  Live activity
                </h2>
                <p className="text-xs text-[#55605A] mt-0.5">
                  Chronological event stream
                </p>
              </div>
              <span className="w-2 h-2 rounded-full bg-[#1F7A4D]" />
            </div>

            <div className="p-3 space-y-3 max-h-[380px] overflow-y-auto divide-y divide-[#E3E7E4]/60">
              {logs.slice(0, 12).map((log) => (
                <div key={log.id} className="pt-2.5 first:pt-0 flex items-start gap-3">
                  <span className="text-[11px] font-mono text-[#7C867F] shrink-0 pt-0.5 tabular-nums">
                    {log.timestamp}
                  </span>
                  <p className="text-xs text-[#17201C] leading-relaxed">
                    {log.message}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Bottom Section: 14-Day Rescued Portions Chart */}
        <section className="bg-white border border-[#E3E7E4] rounded-[10px] p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-[#17201C]">
                Portions rescued over last 14 days
              </h2>
              <p className="text-xs text-[#55605A] mt-0.5">
                Total daily meals saved across Bengaluru distribution network
              </p>
            </div>
            <div className="text-xs font-medium text-[#1F5D46] tabular-nums font-mono">
              2,345 total portions
            </div>
          </div>

          {/* Clean SVG Line Chart: 14 Days, Single Series, Forest Green Line, Light Grid */}
          <div className="w-full h-52 relative">
            <svg
              className="w-full h-full overflow-visible"
              viewBox="0 0 900 180"
              preserveAspectRatio="none"
            >
              {/* Light horizontal grid lines */}
              <line x1="40" y1="20" x2="880" y2="20" stroke="#E3E7E4" strokeWidth="1" />
              <line x1="40" y1="60" x2="880" y2="60" stroke="#E3E7E4" strokeWidth="1" />
              <line x1="40" y1="100" x2="880" y2="100" stroke="#E3E7E4" strokeWidth="1" />
              <line x1="40" y1="140" x2="880" y2="140" stroke="#E3E7E4" strokeWidth="1" />

              {/* Y-axis labels */}
              <text x="10" y="24" className="text-[10px] fill-[#7C867F] font-mono">250</text>
              <text x="10" y="64" className="text-[10px] fill-[#7C867F] font-mono">180</text>
              <text x="10" y="104" className="text-[10px] fill-[#7C867F] font-mono">120</text>
              <text x="10" y="144" className="text-[10px] fill-[#7C867F] font-mono">60</text>

              {/* Single series line: forest green #1F5D46 */}
              <polyline
                fill="none"
                stroke="#1F5D46"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={historicalData
                  .map((d, i) => {
                    const x = 50 + i * (820 / (historicalData.length - 1));
                    // map portions 50..250 to y 150..20
                    const y = 160 - ((d.portions - 50) / 200) * 140;
                    return `${x},${y}`;
                  })
                  .join(" ")}
              />

              {/* Data points */}
              {historicalData.map((d, i) => {
                const x = 50 + i * (820 / (historicalData.length - 1));
                const y = 160 - ((d.portions - 50) / 200) * 140;
                return (
                  <circle
                    key={i}
                    cx={x}
                    cy={y}
                    r="3.5"
                    fill="#FFFFFF"
                    stroke="#1F5D46"
                    strokeWidth="2"
                  />
                );
              })}

              {/* X-axis date labels */}
              {historicalData.map((d, i) => {
                const x = 50 + i * (820 / (historicalData.length - 1));
                return (
                  <text
                    key={i}
                    x={x}
                    y="172"
                    textAnchor="middle"
                    className="text-[10px] fill-[#7C867F] font-mono"
                  >
                    {d.date}
                  </text>
                );
              })}
            </svg>
          </div>
        </section>
      </main>
    </div>
  );
}
