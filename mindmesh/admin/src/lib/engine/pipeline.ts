// ============================================================================
// MindMesh DAA Project - End-to-End Optimization Pipeline
// Orchestrates the 5 core algorithms:
//   Step 1: Priority Queue (Rank donations by urgency score)
//   Step 2: Greedy Allocator (Match available portions to top-priority recipients)
//   Step 3: 0/1 Knapsack DP (Maximize benefit within vehicle payload capacity)
//   Step 4: Dijkstra Shortest Paths (Shortest traversal between stops)
//   Step 5: TSP Optimization (Tour order optimization vs Nearest-Neighbor)
// ============================================================================

import { MindMeshPriorityQueue } from "./priorityQueue";
import { GreedyRecipientAllocator, AllocationCandidate, AllocationPair } from "./greedy";
import { KnapsackOptimizer, KnapsackItem, KnapsackResult } from "./knapsack";
import { DijkstraGraph, DijkstraResult } from "./dijkstra";
import { TSPOptimizer, TSPResult } from "./tsp";

export interface PipelineDonation {
  id: string;
  foodName: string;
  quantity: number; // portions
  weightKg: number;
  expiryTime: Date | string;
  pickupLocation: string;
  nodeId: string;
  isHighDemand?: boolean;
}

export interface PipelineRecipient {
  id: string;
  name: string;
  type: string;
  requiredQuantity: number;
  remainingDemand: number;
  priority: number;
  nodeId: string;
  status: "available" | "unavailable";
  distanceKm?: number;
}

export interface PipelineVolunteer {
  id: string;
  name: string;
  vehicleCapacityKg: number;
  currentNodeId: string;
}

export interface PipelineStepLog {
  step: number;
  name: string;
  algorithm: string;
  complexity: string;
  runtimeMs: number;
  summary: string;
  details: any;
}

export interface PipelineExecutionResult {
  donation: PipelineDonation;
  priorityScore: number;
  matchedAllocations: AllocationPair[];
  knapsackOutcome: KnapsackResult;
  assignedVolunteer: PipelineVolunteer;
  routeSequence: string[];
  totalDistanceKm: number;
  estimatedMinutes: number;
  tspOutcome?: TSPResult;
  steps: PipelineStepLog[];
  timestamp: string;
}

export class MindMeshOptimizationPipeline {
  /**
   * Executes the full DAA optimization pipeline
   */
  public static execute(params: {
    donation: PipelineDonation;
    recipients: PipelineRecipient[];
    volunteer: PipelineVolunteer;
    graph: DijkstraGraph;
    enableTsp?: boolean;
  }): PipelineExecutionResult {
    const { donation, recipients, volunteer, graph, enableTsp = true } = params;
    const steps: PipelineStepLog[] = [];

    // ------------------------------------------------------------------------
    // STEP 1: PRIORITY QUEUE (Donation Urgency Assessment)
    // ------------------------------------------------------------------------
    const t0 = performance.now();
    const pq = new MindMeshPriorityQueue<PipelineDonation>(true);
    const score = MindMeshPriorityQueue.calculateDonationPriority({
      expiryTime: donation.expiryTime,
      isHighDemand: donation.isHighDemand ?? false,
      isLargeQuantity: donation.weightKg >= 20 || donation.quantity >= 30,
    });
    pq.insert(donation, score);
    const extracted = pq.extract()!;
    const t1 = performance.now();

    steps.push({
      step: 1,
      name: "Donation Urgency Ranking",
      algorithm: "Binary Max-Heap Priority Queue",
      complexity: "O(log n)",
      runtimeMs: Number((t1 - t0).toFixed(3)),
      summary: `Score: ${score.toFixed(0)} pts (${donation.foodName}, ${donation.quantity} portions)`,
      details: {
        donationId: donation.id,
        score,
        expiryTime: donation.expiryTime,
      },
    });

    // ------------------------------------------------------------------------
    // STEP 2: GREEDY ALLOCATOR (Recipient Matching)
    // ------------------------------------------------------------------------
    const t2 = performance.now();
    // Calculate graph distances from donation node to each recipient
    const candidates: AllocationCandidate[] = recipients.map((r) => {
      const shortest = graph.findShortestPath(donation.nodeId, r.nodeId);
      return {
        id: r.id,
        name: r.name,
        nodeId: r.nodeId,
        priority: r.priority,
        remainingDemand: r.remainingDemand,
        distanceKm: shortest.totalDistance === Infinity ? 5.0 : shortest.totalDistance,
        isAvailable: r.status === "available",
      };
    });

    const greedyAllocResult = GreedyRecipientAllocator.allocate({
      availableSupply: donation.quantity,
      candidates,
    });
    const t3 = performance.now();

    steps.push({
      step: 2,
      name: "Greedy Recipient Matching",
      algorithm: "Greedy Allocator (Priority & Distance Sort)",
      complexity: "O(R log R)",
      runtimeMs: Number((t3 - t2).toFixed(3)),
      summary: `Matched ${greedyAllocResult.allocations.length} recipients for ${greedyAllocResult.totalAllocatedQuantity} portions`,
      details: greedyAllocResult.allocations.map((a) => ({
        recipient: a.recipient.name,
        allocated: a.allocatedQuantity,
        demandRemaining: a.recipient.remainingDemand,
      })),
    });

    // ------------------------------------------------------------------------
    // STEP 3: 0/1 KNAPSACK (Vehicle Capacity Optimization)
    // ------------------------------------------------------------------------
    const t4 = performance.now();
    // Convert allocated packages into knapsack items (weight in kg proportional to portions)
    const portionWeightRatio = donation.weightKg / Math.max(1, donation.quantity);
    const knapsackItems: KnapsackItem[] = greedyAllocResult.allocations.map((alloc) => {
      const weight = Math.max(1, Math.round(alloc.allocatedQuantity * portionWeightRatio));
      const benefit = alloc.recipient.priority * 20 + alloc.allocatedQuantity;
      return {
        id: alloc.recipient.id,
        name: alloc.recipient.name,
        weight,
        benefit,
      };
    });

    const knapsackOutcome = KnapsackOptimizer.solve(
      knapsackItems,
      Math.round(volunteer.vehicleCapacityKg)
    );
    const t5 = performance.now();

    steps.push({
      step: 3,
      name: "Vehicle Capacity Knapsack",
      algorithm: "0/1 Knapsack Dynamic Programming",
      complexity: "O(n · W)",
      runtimeMs: Number((t5 - t4).toFixed(3)),
      summary: `Packed ${knapsackOutcome.totalWeight}kg / ${volunteer.vehicleCapacityKg}kg capacity (Benefit: ${knapsackOutcome.maxBenefit})`,
      details: {
        selected: knapsackOutcome.selectedItems.map((i) => i.name),
        totalWeight: knapsackOutcome.totalWeight,
        maxBenefit: knapsackOutcome.maxBenefit,
      },
    });

    // ------------------------------------------------------------------------
    // STEP 4 & 5: DIJKSTRA & TSP (Route Optimization)
    // ------------------------------------------------------------------------
    const t6 = performance.now();
    // Nodes to visit: Volunteer Start -> Donation Pickup -> Selected Recipients
    const recipientNodes = greedyAllocResult.allocations
      .filter((a) =>
        knapsackOutcome.selectedItems.some((s) => s.id === a.recipient.id)
      )
      .map((a) => a.recipient.nodeId);

    const stopsToVisit = [volunteer.currentNodeId, donation.nodeId, ...recipientNodes];
    // Remove duplicates preserving order
    const uniqueStops = Array.from(new Set(stopsToVisit));

    let routeSequence: string[] = [];
    let totalDistanceKm = 0;
    let tspOutcome: TSPResult | undefined;

    if (enableTsp && uniqueStops.length >= 3 && uniqueStops.length <= 10) {
      // Build pairwise distance matrix using Dijkstra
      const distMatrix: number[][] = Array.from({ length: uniqueStops.length }, () =>
        new Array(uniqueStops.length).fill(0)
      );

      for (let i = 0; i < uniqueStops.length; i++) {
        for (let j = 0; j < uniqueStops.length; j++) {
          if (i === j) {
            distMatrix[i][j] = 0;
          } else {
            const pathRes = graph.findShortestPath(uniqueStops[i], uniqueStops[j]);
            distMatrix[i][j] = pathRes.totalDistance === Infinity ? 10.0 : pathRes.totalDistance;
          }
        }
      }

      tspOutcome = TSPOptimizer.solve({
        nodes: uniqueStops,
        distanceMatrix: distMatrix,
        returnToStart: false, // End at last delivery destination
      });

      routeSequence = tspOutcome.optimalTour;
      totalDistanceKm = Number(tspOutcome.optimalDistance.toFixed(2));
    } else {
      // Sequential Dijkstra chaining
      routeSequence = [uniqueStops[0]];
      for (let i = 0; i < uniqueStops.length - 1; i++) {
        const seg = graph.findShortestPath(uniqueStops[i], uniqueStops[i + 1]);
        totalDistanceKm += seg.totalDistance === Infinity ? 2.0 : seg.totalDistance;
        routeSequence.push(...seg.path.slice(1));
      }
      totalDistanceKm = Number(totalDistanceKm.toFixed(2));
    }
    const t7 = performance.now();

    steps.push({
      step: 4,
      name: "Shortest Path Routing",
      algorithm: "Dijkstra's Algorithm (Min-Heap)",
      complexity: "O((V + E) log V)",
      runtimeMs: Number((t7 - t6).toFixed(3)),
      summary: `Path: ${uniqueStops.join(" ➔ ")} (${totalDistanceKm} km)`,
      details: {
        stops: uniqueStops,
        totalDistanceKm,
      },
    });

    if (tspOutcome) {
      steps.push({
        step: 5,
        name: "Tour Optimization (TSP)",
        algorithm: "Held-Karp Dynamic Programming",
        complexity: "O(n² · 2ⁿ)",
        runtimeMs: Number((t7 - t6).toFixed(3)),
        summary: `Optimized: ${tspOutcome.optimalDistance.toFixed(2)} km vs Baseline: ${tspOutcome.baselineDistance.toFixed(2)} km (${tspOutcome.improvementPercentage.toFixed(1)}% saved)`,
        details: tspOutcome,
      });
    }

    const estimatedMinutes = Math.max(5, Math.round((totalDistanceKm / 25) * 60) + uniqueStops.length * 4);

    return {
      donation,
      priorityScore: score,
      matchedAllocations: greedyAllocResult.allocations,
      knapsackOutcome,
      assignedVolunteer: volunteer,
      routeSequence,
      totalDistanceKm,
      estimatedMinutes,
      tspOutcome,
      steps,
      timestamp: new Date().toISOString(),
    };
  }
}
