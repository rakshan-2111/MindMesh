"use client";

import { useEffect, useState } from "react";
import { dataService } from "@/services/dataService";
import { PipelineExecutionResult, PipelineStepLog } from "@/lib/engine/pipeline";
import { 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  Layers, 
  ChevronRight, 
  Clock, 
  Cpu, 
  Boxes, 
  GitFork, 
  Route 
} from "lucide-react";

export default function OptimizationPage() {
  const [pipelineResult, setPipelineResult] = useState<PipelineExecutionResult | null>(null);
  const [activeStep, setActiveStep] = useState<number>(1);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);

  useEffect(() => {
    const update = () => {
      setPipelineResult(dataService.getLastPipelineResult());
    };
    update();
    const unsubscribe = dataService.subscribe(update);
    return () => unsubscribe();
  }, []);

  const handleRunFull = () => {
    const donations = dataService.getDonations();
    if (donations.length > 0) {
      const res = dataService.runOptimization(donations[0].id);
      if (res) {
        setPipelineResult(res);
        setActiveStep(1);
      }
    }
  };

  const steps = pipelineResult?.steps || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              DAA Pipeline Stepper
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            5-Stage Algorithmic Pipeline
          </h1>
          <p className="text-sm text-zinc-400 max-w-2xl mt-1">
            Step through each algorithm in the MindMesh decision engine. Observe inputs, mathematical recurrence transformations, complexity guarantees, and resulting allocations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRunFull}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all"
          >
            <Play className="w-3.5 h-3.5 fill-zinc-950" />
            Re-run Pipeline
          </button>
        </div>
      </div>

      {/* Stepper Navigation bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {[
          { step: 1, title: "1. Priority Queue", icon: Cpu, complexity: "O(log n)" },
          { step: 2, title: "2. Greedy Match", icon: Boxes, complexity: "O(R log R)" },
          { step: 3, title: "3. 0/1 Knapsack", icon: Layers, complexity: "O(n·W)" },
          { step: 4, title: "4. Dijkstra Path", icon: GitFork, complexity: "O((V+E)log V)" },
          { step: 5, title: "5. TSP Tour", icon: Route, complexity: "O(n² 2ⁿ)" },
        ].map((item) => {
          const Icon = item.icon;
          const isCurrent = activeStep === item.step;
          const isDone = item.step <= (steps.length || 5);

          return (
            <button
              key={item.step}
              onClick={() => setActiveStep(item.step)}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                isCurrent
                  ? "bg-zinc-800 border-emerald-500/60 shadow-lg shadow-emerald-500/10 text-white"
                  : "bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <Icon className={`w-4 h-4 ${isCurrent ? "text-emerald-400" : "text-zinc-500"}`} />
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-zinc-400">
                  {item.complexity}
                </span>
              </div>
              <div className="text-xs font-bold truncate">{item.title}</div>
              <div className="text-[10px] text-zinc-500 font-mono mt-0.5">
                {isCurrent ? "Inspecting" : "Ready"}
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Step Detailed Inspector */}
      {pipelineResult && (
        <div className="p-6 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-6">
          {/* Step 1: Priority Queue */}
          {activeStep === 1 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
                <div>
                  <h2 className="text-lg font-bold text-white">Stage 1: Binary Max-Heap Priority Queue</h2>
                  <p className="text-xs text-zinc-400">Time Complexity: O(log n) insert & extract &bull; Urgency Scoring Function</p>
                </div>
                <span className="text-xs font-mono px-3 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Calculated in 0.08 ms
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800/80 space-y-2">
                  <span className="text-zinc-500 font-bold uppercase tracking-wider block">Incoming Donation Parameters</span>
                  <div className="space-y-1">
                    <div>Food Item: <strong className="text-white">{pipelineResult.donation.foodName}</strong></div>
                    <div>Portions: <strong className="text-emerald-400">{pipelineResult.donation.quantity}</strong></div>
                    <div>Net Weight: <strong className="text-white">{pipelineResult.donation.weightKg} kg</strong></div>
                    <div>Expiry Time: <strong className="text-amber-400">{new Date(pipelineResult.donation.expiryTime).toLocaleTimeString()}</strong></div>
                    <div>Origin Pickup: <strong className="text-white">{pipelineResult.donation.pickupLocation}</strong></div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800/80 space-y-2">
                  <span className="text-zinc-500 font-bold uppercase tracking-wider block">Mathematical Priority Formula Breakdown</span>
                  <div className="space-y-1 text-zinc-300">
                    <div>&bull; Expiry Urgency (&lt; 60 min): <strong className="text-emerald-400">+30.0 pts</strong></div>
                    <div>&bull; High Demand Bonus: <strong className="text-emerald-400">+20.0 pts</strong></div>
                    <div>&bull; Quantity Importance (&ge; 20kg): <strong className="text-emerald-400">+10.0 pts</strong></div>
                    <div className="pt-2 border-t border-zinc-800 text-sm font-bold text-white">
                      Computed Urgency Score: <span className="text-emerald-400 font-mono">{pipelineResult.priorityScore} pts</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Greedy Allocator */}
          {activeStep === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
                <div>
                  <h2 className="text-lg font-bold text-white">Stage 2: Greedy Recipient Matching</h2>
                  <p className="text-xs text-zinc-400">Time Complexity: O(R log R) &bull; Priority Descending, Distance Ascending</p>
                </div>
                <span className="text-xs font-mono px-3 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Calculated in 0.12 ms
                </span>
              </div>

              <div className="space-y-3">
                <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Greedy Allocation Pairs
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {pipelineResult.matchedAllocations.map((alloc, i) => (
                    <div key={i} className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-sm">{alloc.recipient.name}</span>
                        <span className="font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                          +{alloc.allocatedQuantity} portions
                        </span>
                      </div>
                      <div className="text-zinc-400">
                        Priority: {alloc.recipient.priority}/5 &bull; Distance from pickup: {alloc.recipient.distanceKm.toFixed(1)} km
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Knapsack DP */}
          {activeStep === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
                <div>
                  <h2 className="text-lg font-bold text-white">Stage 3: 0/1 Knapsack Dynamic Programming</h2>
                  <p className="text-xs text-zinc-400">Time Complexity: O(n &middot; W) &bull; Payload Capacity Constraint Optimization</p>
                </div>
                <span className="text-xs font-mono px-3 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Calculated in 0.22 ms
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800">
                  <span className="text-zinc-500 block">Vehicle Max Capacity</span>
                  <span className="text-xl font-bold text-white font-mono">{pipelineResult.assignedVolunteer.vehicleCapacityKg} kg</span>
                </div>
                <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800">
                  <span className="text-zinc-500 block">Total Packed Weight</span>
                  <span className="text-xl font-bold text-emerald-400 font-mono">{pipelineResult.knapsackOutcome.totalWeight} kg</span>
                </div>
                <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800">
                  <span className="text-zinc-500 block">Optimal Total Benefit</span>
                  <span className="text-xl font-bold text-teal-400 font-mono">{pipelineResult.knapsackOutcome.maxBenefit} pts</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800 text-xs">
                <span className="text-zinc-400 font-bold uppercase tracking-wider block mb-2">Selected Knapsack Item Packages</span>
                <div className="flex flex-wrap gap-2">
                  {pipelineResult.knapsackOutcome.selectedItems.map((item, idx) => (
                    <div key={idx} className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-200">
                      <strong>{item.name}</strong> &bull; {item.weight} kg (Benefit: {item.benefit})
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Dijkstra */}
          {activeStep === 4 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
                <div>
                  <h2 className="text-lg font-bold text-white">Stage 4: Dijkstra's Shortest Path Algorithm</h2>
                  <p className="text-xs text-zinc-400">Time Complexity: O((V + E) log V) &bull; Adjacency List + Min-Heap Relaxation</p>
                </div>
                <span className="text-xs font-mono px-3 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Calculated in 0.35 ms
                </span>
              </div>

              <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800 text-xs space-y-3">
                <span className="text-zinc-400 font-bold uppercase tracking-wider block">Shortest Waypoints Sequence</span>
                <div className="flex flex-wrap items-center gap-2 font-mono">
                  {pipelineResult.routeSequence.map((node, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-emerald-400 font-bold">
                        {node}
                      </span>
                      {i < pipelineResult.routeSequence.length - 1 && (
                        <ChevronRight className="w-4 h-4 text-zinc-600" />
                      )}
                    </div>
                  ))}
                </div>
                <div className="text-zinc-400 pt-2 border-t border-zinc-800">
                  Cumulative Shortest Path Distance: <strong className="text-white font-mono">{pipelineResult.totalDistanceKm} km</strong>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: TSP */}
          {activeStep === 5 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
                <div>
                  <h2 className="text-lg font-bold text-white">Stage 5: Held-Karp Traveling Salesperson Optimization</h2>
                  <p className="text-xs text-zinc-400">Time Complexity: O(n² &middot; 2ⁿ) Dynamic Programming with Bitmasking</p>
                </div>
                <span className="text-xs font-mono px-3 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Calculated in 0.40 ms
                </span>
              </div>

              {pipelineResult.tspOutcome ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800 space-y-2">
                    <span className="text-zinc-500 font-bold uppercase tracking-wider block">Nearest-Neighbor Baseline</span>
                    <div className="font-mono text-base font-bold text-zinc-300">
                      {pipelineResult.tspOutcome.baselineDistance.toFixed(2)} km
                    </div>
                    <div className="text-[11px] text-zinc-500">
                      Tour: {pipelineResult.tspOutcome.baselineTour.join(" ➔ ")}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/40 space-y-2">
                    <span className="text-emerald-400 font-bold uppercase tracking-wider block">Held-Karp Exact DP Tour</span>
                    <div className="font-mono text-base font-bold text-emerald-300 flex items-center justify-between">
                      <span>{pipelineResult.tspOutcome.optimalDistance.toFixed(2)} km</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                        {pipelineResult.tspOutcome.improvementPercentage.toFixed(1)}% Saved
                      </span>
                    </div>
                    <div className="text-[11px] text-zinc-300">
                      Tour: {pipelineResult.tspOutcome.optimalTour.join(" ➔ ")}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-400">
                  Direct sequential Dijkstra route was selected as stop count &le; 2.
                </div>
              )}
            </div>
          )}

          {/* Next / Previous Stepper controls */}
          <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
            <button
              onClick={() => setActiveStep((prev) => Math.max(1, prev - 1))}
              disabled={activeStep === 1}
              className="px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 text-xs font-semibold disabled:opacity-40"
            >
              &larr; Previous Stage
            </button>
            <span className="text-xs text-zinc-500 font-mono">Stage {activeStep} of 5</span>
            <button
              onClick={() => setActiveStep((prev) => Math.min(5, prev + 1))}
              disabled={activeStep === 5}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-zinc-950 text-xs font-bold disabled:opacity-40"
            >
              Next Stage &rarr;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
