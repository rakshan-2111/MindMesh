import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { MindMeshPriorityQueue } from "../src/lib/engine/priorityQueue";
import { KnapsackOptimizer } from "../src/lib/engine/knapsack";
import { DijkstraGraph } from "../src/lib/engine/dijkstra";
import { TSPOptimizer } from "../src/lib/engine/tsp";
import { GreedyRecipientAllocator } from "../src/lib/engine/greedy";
import { BFSChecker, MindMeshQueue } from "../src/lib/engine/bfs";

describe("MindMesh DAA Algorithm Suite - TypeScript Engine Tests", () => {
  // --------------------------------------------------------------------------
  // 1. Priority Queue Tests
  // --------------------------------------------------------------------------
  it("Priority Queue preserves max-heap property and extract order O(log n)", () => {
    const pq = new MindMeshPriorityQueue<string>(true);

    pq.insert("Donation C", 30);
    pq.insert("Donation A", 90);
    pq.insert("Donation D", 10);
    pq.insert("Donation B", 70);

    assert.equal(pq.size, 4);
    assert.equal(pq.peek()?.data, "Donation A");

    assert.equal(pq.extract()?.data, "Donation A"); // 90
    assert.equal(pq.extract()?.data, "Donation B"); // 70
    assert.equal(pq.extract()?.data, "Donation C"); // 30
    assert.equal(pq.extract()?.data, "Donation D"); // 10
    assert.equal(pq.isEmpty, true);
  });

  it("Priority Scoring Formula applies urgency bonuses accurately", () => {
    const now = new Date("2026-10-06T12:00:00Z");

    // Expiry within 20 mins (< 30 min) -> +50, high demand -> +20, large qty -> +10 => 80
    const expiryUrgent = new Date(now.getTime() + 20 * 60 * 1000);
    const scoreUrgent = MindMeshPriorityQueue.calculateDonationPriority({
      expiryTime: expiryUrgent,
      now,
      isHighDemand: true,
      isLargeQuantity: true,
    });
    assert.equal(scoreUrgent, 80);

    // Expiry in 45 mins (< 60 min) -> +30, normal demand -> 0, standard qty -> 0 => 30
    const expiryMedium = new Date(now.getTime() + 45 * 60 * 1000);
    const scoreMedium = MindMeshPriorityQueue.calculateDonationPriority({
      expiryTime: expiryMedium,
      now,
      isHighDemand: false,
      isLargeQuantity: false,
    });
    assert.equal(scoreMedium, 30);
  });

  // --------------------------------------------------------------------------
  // 2. 0/1 Knapsack Dynamic Programming Tests
  // --------------------------------------------------------------------------
  it("0/1 Knapsack reproduces benchmark: Capacity 50 -> A+B+D=45kg, Benefit=210", () => {
    const items = [
      { id: "A", name: "Item A", weight: 20, benefit: 90 },
      { id: "B", name: "Item B", weight: 15, benefit: 70 },
      { id: "C", name: "Item C", weight: 30, benefit: 100 },
      { id: "D", name: "Item D", weight: 10, benefit: 50 },
    ];

    const result = KnapsackOptimizer.solve(items, 50);

    assert.equal(result.maxBenefit, 210);
    assert.equal(result.totalWeight, 45);

    const selectedIds = new Set(result.selectedItems.map((i) => i.id));
    assert.equal(selectedIds.has("A"), true);
    assert.equal(selectedIds.has("B"), true);
    assert.equal(selectedIds.has("D"), true);
    assert.equal(selectedIds.has("C"), false);

    // Verify DP table dimensions: (n+1) x (W+1)
    assert.equal(result.dpTable.length, 5);
    assert.equal(result.dpTable[0].length, 51);
    assert.equal(result.dpTable[4][50], 210);
  });

  // --------------------------------------------------------------------------
  // 3. Greedy Allocator Tests
  // --------------------------------------------------------------------------
  it("Greedy Allocator matches 50 portions: NGO Alpha 30, Shelter Beta 20", () => {
    const candidates = [
      {
        id: "1",
        name: "NGO Alpha",
        nodeId: "NGO_ALPHA",
        priority: 5,
        remainingDemand: 30,
        distanceKm: 2.0,
      },
      {
        id: "2",
        name: "Shelter Beta",
        nodeId: "SHELTER_BETA",
        priority: 4,
        remainingDemand: 40,
        distanceKm: 2.5,
      },
      {
        id: "3",
        name: "Hostel Gamma",
        nodeId: "HOSTEL_GAMMA",
        priority: 3,
        remainingDemand: 20,
        distanceKm: 3.0,
      },
    ];

    const result = GreedyRecipientAllocator.allocate({
      availableSupply: 50,
      candidates,
    });

    assert.equal(result.totalAllocatedQuantity, 50);
    assert.equal(result.unallocatedSurplus, 0);
    assert.equal(result.allocations.length, 2);

    assert.equal(result.allocations[0].recipient.name, "NGO Alpha");
    assert.equal(result.allocations[0].allocatedQuantity, 30);

    assert.equal(result.allocations[1].recipient.name, "Shelter Beta");
    assert.equal(result.allocations[1].allocatedQuantity, 20);
  });

  // --------------------------------------------------------------------------
  // 4. Dijkstra Shortest Path Tests
  // --------------------------------------------------------------------------
  it("Dijkstra finds shortest path and produces trace for visualization", () => {
    const graph = new DijkstraGraph();
    graph.addEdge("CANTEEN", "JUNCTION_B", 1.1);
    graph.addEdge("JUNCTION_B", "STUDENT_HUB", 1.0);
    graph.addEdge("STUDENT_HUB", "SHELTER_BETA", 1.4);
    graph.addEdge("CANTEEN", "LIBRARY_PLAZA", 1.5);
    graph.addEdge("LIBRARY_PLAZA", "SHELTER_BETA", 3.0);

    const result = graph.findShortestPath("CANTEEN", "SHELTER_BETA");

    assert.deepEqual(result.path, ["CANTEEN", "JUNCTION_B", "STUDENT_HUB", "SHELTER_BETA"]);
    assert.ok(Math.abs(result.totalDistance - 3.5) < 0.001);
    assert.ok(result.trace.length > 0);
    assert.equal(result.trace[0].currentNode, "CANTEEN");
  });

  // --------------------------------------------------------------------------
  // 5. TSP Held-Karp Tests
  // --------------------------------------------------------------------------
  it("TSP Held-Karp finds optimal tour and compares to nearest neighbor baseline", () => {
    const stops = ["DEPOT", "CANTEEN", "NGO_ALPHA", "SHELTER_BETA"];
    const distMatrix = [
      [0.0, 2.0, 4.0, 3.5],
      [2.0, 0.0, 2.5, 3.0],
      [4.0, 2.5, 0.0, 1.8],
      [3.5, 3.0, 1.8, 0.0],
    ];

    const result = TSPOptimizer.solve({
      nodes: stops,
      distanceMatrix: distMatrix,
      returnToStart: true,
    });

    assert.equal(result.optimalTour[0], "DEPOT");
    assert.equal(result.optimalTour[result.optimalTour.length - 1], "DEPOT");
    assert.ok(result.optimalDistance <= result.baselineDistance);
    assert.equal(result.stopsCount, 4);
  });

  // --------------------------------------------------------------------------
  // 6. BFS & Queue Tests
  // --------------------------------------------------------------------------
  it("FIFO Queue and BFS verify graph reachability correctly", () => {
    const queue = new MindMeshQueue<number>();
    queue.enqueue(10);
    queue.enqueue(20);
    queue.enqueue(30);

    assert.equal(queue.dequeue(), 10);
    assert.equal(queue.peek(), 20);
    assert.equal(queue.dequeue(), 20);
    assert.equal(queue.dequeue(), 30);
    assert.equal(queue.isEmpty, true);

    const graph = new DijkstraGraph();
    graph.addEdge("A", "B", 1.0);
    graph.addEdge("B", "C", 1.0);
    graph.addEdge("D", "E", 1.0); // Disconnected component

    const bfsConnected = BFSChecker.checkReachability(graph, "A", "C");
    assert.equal(bfsConnected.isTargetReachable, true);

    const bfsDisconnected = BFSChecker.checkReachability(graph, "A", "E");
    assert.equal(bfsDisconnected.isTargetReachable, false);
  });
});
