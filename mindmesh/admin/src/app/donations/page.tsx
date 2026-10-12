"use client";

import React, { useEffect, useState, useMemo } from "react";
import { TopBar } from "@/components/TopBar";
import { DataTable, Column } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { dataService } from "@/services/dataService";
import { PipelineDonation, PipelineVolunteer } from "@/lib/engine/pipeline";
import { calculateUrgency } from "@/lib/tokens";
import { Plus, Search, CheckCircle2, Clock, MapPin, Truck, AlertCircle } from "lucide-react";

export default function DonationsPage() {
  const [donations, setDonations] = useState<PipelineDonation[]>([]);
  const [volunteers, setVolunteers] = useState<PipelineVolunteer[]>([]);
  const [selectedDonation, setSelectedDonation] = useState<PipelineDonation | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "urgent" | "available">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // New donation modal form fields
  const [formFoodName, setFormFoodName] = useState("Vegetable Pulao & Raita");
  const [formQuantity, setFormQuantity] = useState(35);
  const [formWeight, setFormWeight] = useState(18);
  const [formExpiryMinutes, setFormExpiryMinutes] = useState(45);
  const [formLocation, setFormLocation] = useState("CHRIST Canteen A, Hosur Road");

  useEffect(() => {
    const update = () => {
      const currentDonations = dataService.getDonations();
      setDonations([...currentDonations]);
      setVolunteers([...dataService.getVolunteers()]);

      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        if (params.get("drawer") && currentDonations.length > 0) {
          setSelectedDonation(currentDonations[0]);
          setIsDrawerOpen(true);
        }
      }
    };
    update();
    const unsubscribe = dataService.subscribe(update);
    return () => unsubscribe();
  }, []);

  const handleRowClick = (donation: PipelineDonation) => {
    setSelectedDonation(donation);
    setIsDrawerOpen(true);
  };

  const handleCreateDonation = (e: React.FormEvent) => {
    e.preventDefault();
    const newDonation: PipelineDonation = {
      id: `batch-${Date.now()}`,
      foodName: formFoodName,
      quantity: formQuantity,
      weightKg: formWeight,
      expiryTime: new Date(Date.now() + formExpiryMinutes * 60 * 1000).toISOString(),
      pickupLocation: formLocation,
      nodeId: "CANTEEN",
      isHighDemand: true,
    };
    dataService.addDonation(newDonation);
    setShowAddModal(false);
    dataService.addLog(
      `${formLocation.split(",")[0]} posted ${formQuantity} portions of ${formFoodName}`,
      "provider"
    );
  };

  // Filtered donations
  const filteredDonations = useMemo(() => {
    return donations.filter((d) => {
      const urgency = calculateUrgency(d.expiryTime);
      const matchesSearch =
        d.foodName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.pickupLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.id.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;
      if (activeTab === "urgent") return urgency.tier === "High";
      if (activeTab === "available") return true;
      return true;
    });
  }, [donations, activeTab, searchQuery]);

  // Data table column definitions
  const columns: Column<PipelineDonation>[] = [
    {
      header: "Batch ID",
      width: "120px",
      cell: (d) => (
        <span className="font-mono text-[11px] text-[#55605A]">
          #{d.id.slice(0, 8)}
        </span>
      ),
    },
    {
      header: "Food Item",
      cell: (d) => (
        <div>
          <div className="font-medium text-[#17201C]">{d.foodName}</div>
          <div className="text-[11px] text-[#7C867F]">{d.pickupLocation}</div>
        </div>
      ),
    },
    {
      header: "Quantity & Weight",
      align: "right",
      width: "140px",
      cell: (d) => (
        <div className="tabular-nums font-mono text-right">
          <span className="font-medium text-[#17201C]">{d.quantity} portions</span>
          <span className="block text-[11px] text-[#7C867F]">{d.weightKg} kg</span>
        </div>
      ),
    },
    {
      header: "Urgency",
      width: "110px",
      cell: (d) => {
        const u = calculateUrgency(d.expiryTime);
        return <StatusBadge label={u.tier} variant={u.badgeVariant} />;
      },
    },
    {
      header: "Expiry Window",
      width: "140px",
      cell: (d) => {
        const u = calculateUrgency(d.expiryTime);
        return (
          <span className="text-xs text-[#55605A] tabular-nums font-mono">
            {u.countdown}
          </span>
        );
      },
    },
    {
      header: "Status",
      width: "110px",
      cell: () => <StatusBadge label="Assigned" variant="info" />,
    },
    {
      header: "Assigned Volunteer",
      cell: () => {
        const vol = volunteers[0];
        return (
          <span className="text-xs text-[#17201C]">
            {vol ? vol.name : "Unassigned"}
          </span>
        );
      },
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar title="Donations Ledger" />

      <main className="flex-1 p-6 space-y-4 max-w-7xl w-full mx-auto">
        {/* Top Control Bar: Filters, Search & Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Tabs */}
          <div className="flex items-center gap-1 bg-[#EEF1EE]/60 p-1 rounded-[6px] border border-[#E3E7E4]">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-3 py-1 rounded-[4px] text-xs font-medium transition-colors ${
                activeTab === "all"
                  ? "bg-white text-[#17201C] shadow-xs"
                  : "text-[#55605A] hover:text-[#17201C]"
              }`}
            >
              All batches ({donations.length})
            </button>
            <button
              onClick={() => setActiveTab("urgent")}
              className={`px-3 py-1 rounded-[4px] text-xs font-medium transition-colors ${
                activeTab === "urgent"
                  ? "bg-white text-[#17201C] shadow-xs"
                  : "text-[#55605A] hover:text-[#17201C]"
              }`}
            >
              Urgent
            </button>
            <button
              onClick={() => setActiveTab("available")}
              className={`px-3 py-1 rounded-[4px] text-xs font-medium transition-colors ${
                activeTab === "available"
                  ? "bg-white text-[#17201C] shadow-xs"
                  : "text-[#55605A] hover:text-[#17201C]"
              }`}
            >
              Assigned
            </button>
          </div>

          {/* Search & New batch button */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search
                size={14}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#7C867F]"
              />
              <input
                type="text"
                placeholder="Filter donations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 pl-8 pr-3 text-xs bg-white border border-[#E3E7E4] rounded-[6px] text-[#17201C] placeholder:text-[#7C867F] focus:outline-2 focus:outline-[#1F5D46]"
              />
            </div>

            <Button
              variant="primary"
              size="default"
              icon={<Plus size={14} />}
              onClick={() => setShowAddModal(true)}
            >
              Record donation
            </Button>
          </div>
        </div>

        {/* Data Table Panel */}
        <div className="bg-white border border-[#E3E7E4] rounded-[10px] overflow-hidden">
          <DataTable
            columns={columns}
            data={filteredDonations}
            keyExtractor={(d) => d.id}
            onRowClick={handleRowClick}
            emptyMessage="No donation records found."
          />
        </div>
      </main>

      {/* Right Slide-over Detail Drawer */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={selectedDonation ? selectedDonation.foodName : "Donation Details"}
        subtitle={
          selectedDonation
            ? `Batch #${selectedDonation.id.slice(0, 8)} · ${selectedDonation.pickupLocation}`
            : ""
        }
      >
        {selectedDonation && (
          <div className="space-y-6 text-xs text-[#17201C]">
            {/* Spec figures strip */}
            <div className="grid grid-cols-3 gap-2 p-3 bg-[#F6F7F5] rounded-[8px] border border-[#E3E7E4]">
              <div>
                <span className="text-[10px] uppercase font-medium text-[#7C867F]">
                  Quantity
                </span>
                <span className="block text-sm font-semibold text-[#17201C] tabular-nums">
                  {selectedDonation.quantity} portions
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-medium text-[#7C867F]">
                  Weight
                </span>
                <span className="block text-sm font-semibold text-[#17201C] tabular-nums">
                  {selectedDonation.weightKg} kg
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-medium text-[#7C867F]">
                  Urgency
                </span>
                <div className="mt-0.5">
                  <StatusBadge
                    label={calculateUrgency(selectedDonation.expiryTime).tier}
                    variant={
                      calculateUrgency(selectedDonation.expiryTime).badgeVariant
                    }
                  />
                </div>
              </div>
            </div>

            {/* Lifecycle Progression Timeline */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#55605A] mb-3">
                Lifecycle timeline
              </h3>

              <div className="space-y-4 relative pl-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[1px] before:bg-[#E3E7E4]">
                {/* Step 1: Posted */}
                <div className="relative">
                  <span className="absolute -left-5 top-0.5 w-2.5 h-2.5 rounded-full bg-[#1F7A4D] border-2 border-white ring-1 ring-[#1F7A4D]" />
                  <div className="font-medium text-[#17201C]">
                    Donation posted by provider
                  </div>
                  <div className="text-[#55605A] text-[11px] mt-0.5">
                    {selectedDonation.pickupLocation} · Today, 13:42
                  </div>
                </div>

                {/* Step 2: Matched */}
                <div className="relative">
                  <span className="absolute -left-5 top-0.5 w-2.5 h-2.5 rounded-full bg-[#1F7A4D] border-2 border-white ring-1 ring-[#1F7A4D]" />
                  <div className="font-medium text-[#17201C]">
                    Best match calculated
                  </div>
                  <div className="text-[#55605A] text-[11px] mt-0.5">
                    30 portions for Asha Foundation · 20 portions for Sneha Shelter
                  </div>
                </div>

                {/* Step 3: Assigned */}
                <div className="relative">
                  <span className="absolute -left-5 top-0.5 w-2.5 h-2.5 rounded-full bg-[#1F7A4D] border-2 border-white ring-1 ring-[#1F7A4D]" />
                  <div className="font-medium text-[#17201C]">
                    Volunteer courier assigned
                  </div>
                  <div className="text-[#55605A] text-[11px] mt-0.5">
                    Ravi Kumar (Delivery Scooter, max capacity 50 kg)
                  </div>
                </div>

                {/* Step 4: Collection */}
                <div className="relative">
                  <span className="absolute -left-5 top-0.5 w-2.5 h-2.5 rounded-full bg-[#EEF1EE] border-2 border-[#7C867F]" />
                  <div className="font-medium text-[#55605A]">
                    Collection from provider
                  </div>
                  <div className="text-[#7C867F] text-[11px] mt-0.5">
                    Scheduled pickup window by 14:15
                  </div>
                </div>

                {/* Step 5: Delivery */}
                <div className="relative">
                  <span className="absolute -left-5 top-0.5 w-2.5 h-2.5 rounded-full bg-[#EEF1EE] border-2 border-[#7C867F]" />
                  <div className="font-medium text-[#55605A]">
                    Final delivery confirmation
                  </div>
                  <div className="text-[#7C867F] text-[11px] mt-0.5">
                    Pending arrival at recipient stops
                  </div>
                </div>
              </div>
            </div>

            {/* Load Plan & Route Summary Card */}
            <div className="border border-[#E3E7E4] rounded-[8px] p-3.5 space-y-2 bg-white">
              <div className="flex items-center justify-between text-[#17201C] font-medium">
                <span>Load plan</span>
                <span className="tabular-nums font-mono text-[#1F5D46]">
                  {selectedDonation.weightKg} kg / 50.0 kg (50%)
                </span>
              </div>
              <div className="w-full bg-[#EEF1EE] h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#1F5D46] h-full"
                  style={{ width: `${(selectedDonation.weightKg / 50) * 100}%` }}
                />
              </div>

              <div className="pt-2 border-t border-[#E3E7E4] flex items-center justify-between text-[#55605A] text-[11px]">
                <span>Fastest route: 4.2 km · 3 stops</span>
                <span className="text-[#1F5D46] font-medium">Stop order verified</span>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center gap-2">
              <Button
                variant="secondary"
                size="default"
                className="flex-1"
                onClick={() => setIsDrawerOpen(false)}
              >
                Close
              </Button>
              <Button
                variant="primary"
                size="default"
                className="flex-1"
                onClick={() => {
                  dataService.runOptimization(selectedDonation.id);
                  setIsDrawerOpen(false);
                }}
              >
                Refresh plan
              </Button>
            </div>
          </div>
        )}
      </Drawer>

      {/* Record Donation Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/25"
            onClick={() => setShowAddModal(false)}
          />

          <div className="relative w-full max-w-md bg-white rounded-[10px] border border-[#E3E7E4] shadow-xl p-5 z-10 space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-[#17201C]">
                Record Surplus Donation
              </h2>
              <p className="text-xs text-[#55605A] mt-0.5">
                Simulate an incoming donation from a registered Bengaluru provider.
              </p>
            </div>

            <form onSubmit={handleCreateDonation} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-[#17201C] mb-1">
                  Food description
                </label>
                <input
                  type="text"
                  required
                  value={formFoodName}
                  onChange={(e) => setFormFoodName(e.target.value)}
                  className="w-full h-8 px-2.5 bg-white border border-[#E3E7E4] rounded-[6px] text-xs text-[#17201C] outline-none focus:border-[#1F5D46]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-[#17201C] mb-1">
                    Portions
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="200"
                    required
                    value={formQuantity}
                    onChange={(e) => setFormQuantity(Number(e.target.value))}
                    className="w-full h-8 px-2.5 bg-white border border-[#E3E7E4] rounded-[6px] text-xs text-[#17201C] outline-none focus:border-[#1F5D46]"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#17201C] mb-1">
                    Total weight (kg)
                  </label>
                  <input
                    type="number"
                    min="2"
                    max="50"
                    required
                    value={formWeight}
                    onChange={(e) => setFormWeight(Number(e.target.value))}
                    className="w-full h-8 px-2.5 bg-white border border-[#E3E7E4] rounded-[6px] text-xs text-[#17201C] outline-none focus:border-[#1F5D46]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-[#17201C] mb-1">
                  Pickup location
                </label>
                <select
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  className="w-full h-8 px-2 bg-white border border-[#E3E7E4] rounded-[6px] text-xs text-[#17201C] outline-none focus:border-[#1F5D46]"
                >
                  <option value="CHRIST Canteen A, Hosur Road">
                    CHRIST Canteen A, Hosur Road
                  </option>
                  <option value="North Hall Cafe, Indiranagar">
                    North Hall Cafe, Indiranagar
                  </option>
                  <option value="Koramangala Bakery, 80ft Road">
                    Koramangala Bakery, 80ft Road
                  </option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-[#17201C] mb-1">
                  Expiry window (minutes)
                </label>
                <div className="flex gap-2">
                  {[30, 45, 90, 120].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setFormExpiryMinutes(mins)}
                      className={`flex-1 h-7 rounded-[4px] border text-xs font-medium transition-colors ${
                        formExpiryMinutes === mins
                          ? "bg-[#1F5D46] text-white border-[#1F5D46]"
                          : "bg-white text-[#55605A] border-[#E3E7E4] hover:bg-[#F6F7F5]"
                      }`}
                    >
                      {mins}m
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="default"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="default">
                  Post donation
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
