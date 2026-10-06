"use client";

import { useEffect, useState } from "react";
import { dataService } from "@/services/dataService";
import { PipelineDonation } from "@/lib/engine/pipeline";
import { Package, Plus, MapPin, Clock, Scale, Sparkles, CheckCircle2 } from "lucide-react";

export default function DonationsPage() {
  const [donations, setDonations] = useState<PipelineDonation[]>([]);
  const [showModal, setShowModal] = useState(false);

  // New donation form state
  const [foodName, setFoodName] = useState("Evening Dinner Buffet Trays");
  const [quantity, setQuantity] = useState(40);
  const [weightKg, setWeightKg] = useState(20);
  const [expiryMinutes, setExpiryMinutes] = useState(45);
  const [location, setLocation] = useState("Campus Central Canteen");
  const [nodeId, setNodeId] = useState("CANTEEN");

  useEffect(() => {
    const update = () => {
      setDonations([...dataService.getDonations()]);
    };
    update();
    const unsubscribe = dataService.subscribe(update);
    return () => unsubscribe();
  }, []);

  const handleCreateDonation = (e: React.FormEvent) => {
    e.preventDefault();
    const newDonation: PipelineDonation = {
      id: `donation-${Date.now()}`,
      foodName,
      quantity,
      weightKg,
      expiryTime: new Date(Date.now() + expiryMinutes * 60 * 1000).toISOString(),
      pickupLocation: location,
      nodeId,
      isHighDemand: true,
    };
    dataService.addDonation(newDonation);
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Provider Batches
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Food Donations Ledger</h1>
          <p className="text-sm text-zinc-400 max-w-xl mt-1">
            Surplus food packages registered by campus providers. Each incoming donation is immediately queued for Priority Queue scoring and Knapsack allocation.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Simulate Provider Post
        </button>
      </div>

      {/* Donations List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {donations.map((donation, idx) => (
          <div
            key={donation.id}
            className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 transition-colors space-y-4 text-xs"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] font-mono text-zinc-500">BATCH #{donation.id.slice(0, 8)}</span>
                <h3 className="text-sm font-bold text-white mt-0.5">{donation.foodName}</h3>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                ACTIVE
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-zinc-950/70 border border-zinc-800/80">
              <div>
                <span className="text-zinc-500 text-[10px] block">Quantity</span>
                <span className="font-bold text-white text-sm font-mono">{donation.quantity} portions</span>
              </div>
              <div>
                <span className="text-zinc-500 text-[10px] block">Total Weight</span>
                <span className="font-bold text-zinc-300 text-sm font-mono">{donation.weightKg} kg</span>
              </div>
            </div>

            <div className="space-y-1.5 text-zinc-400">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                <span>Pickup: <strong className="text-zinc-300">{donation.pickupLocation}</strong> ({donation.nodeId})</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-zinc-500" />
                <span>Expires: <strong className="text-amber-400">{new Date(donation.expiryTime).toLocaleTimeString()}</strong></span>
              </div>
            </div>

            {/* Stepper Timeline */}
            <div className="pt-3 border-t border-zinc-800">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-2">Realtime Lifecycle</span>
              <div className="flex items-center justify-between text-[10px] font-mono text-emerald-400">
                <span className="flex items-center gap-1 font-bold">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Posted
                </span>
                <span>&rarr;</span>
                <span className="flex items-center gap-1 font-bold">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Matched
                </span>
                <span>&rarr;</span>
                <span className="text-zinc-500">In Transit</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Post Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h2 className="text-lg font-bold text-white">Simulate Provider Donation Post</h2>
            <p className="text-xs text-zinc-400">
              Simulates the Android Provider application posting a surplus food batch over Supabase Realtime.
            </p>

            <form onSubmit={handleCreateDonation} className="space-y-3 text-xs">
              <div>
                <label className="text-zinc-400 block mb-1">Food Name</label>
                <input
                  type="text"
                  value={foodName}
                  onChange={(e) => setFoodName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-400 block mb-1">Portions</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-zinc-400 block mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    value={weightKg}
                    onChange={(e) => setWeightKg(Number(e.target.value))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-400 block mb-1">Expiry (Minutes)</label>
                  <input
                    type="number"
                    value={expiryMinutes}
                    onChange={(e) => setExpiryMinutes(Number(e.target.value))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-zinc-400 block mb-1">Graph Node</label>
                  <select
                    value={nodeId}
                    onChange={(e) => {
                      setNodeId(e.target.value);
                      if (e.target.value === "CANTEEN") setLocation("Campus Central Canteen");
                      else if (e.target.value === "NORTH_CAFE") setLocation("North Hall Cafe");
                      else setLocation("East Quad Bakery");
                    }}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white"
                  >
                    <option value="CANTEEN">CANTEEN</option>
                    <option value="NORTH_CAFE">NORTH_CAFE</option>
                    <option value="BAKERY">BAKERY</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold"
                >
                  Post & Run Pipeline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
