// ============================================================================
// MindMesh DAA Project - Dijkstra's Shortest Path Algorithm
// Time Complexity: O((V + E) log V) with min-heap
// Space Complexity: O(V + E)
//
// Implemented with custom Min-Heap without external libraries.
// Exposes step-by-step exploration trace for graph algorithm visualization.
// ============================================================================

import { MindMeshPriorityQueue } from "./priorityQueue";

export interface GraphEdge {
  target: string;
  weight: number; // in km
}

export interface DijkstraStep {
  stepNumber: number;
  currentNode: string;
  currentDistance: number;
  visitedNodes: string[];
  distances: Record<string, number>;
  description: string;
}

export interface DijkstraResult {
  startNode: string;
  targetNode: string;
  path: string[];
  totalDistance: number;
  trace: DijkstraStep[];
  allDistances: Record<string, number>;
}

export class DijkstraGraph {
  public adjacencyList: Map<string, GraphEdge[]> = new Map();

  public addEdge(from: string, to: string, weight: number, bidirectional: boolean = true): void {
    if (!this.adjacencyList.has(from)) {
      this.adjacencyList.set(from, []);
    }
    this.adjacencyList.get(from)!.push({ target: to, weight });

    if (bidirectional) {
      if (!this.adjacencyList.has(to)) {
        this.adjacencyList.set(to, []);
      }
      this.adjacencyList.get(to)!.push({ target: from, weight });
    } else if (!this.adjacencyList.has(to)) {
      this.adjacencyList.set(to, []);
    }
  }

  /**
   * Computes shortest path from start to target, recording full execution steps
   */
  public findShortestPath(start: string, target: string): DijkstraResult {
    if (!this.adjacencyList.has(start)) {
      return {
        startNode: start,
        targetNode: target,
        path: [],
        totalDistance: Infinity,
        trace: [],
        allDistances: {},
      };
    }

    const minHeap = new MindMeshPriorityQueue<string>(false); // MinHeap
    const distances: Record<string, number> = {};
    const previous: Record<string, string | null> = {};
    const visited = new Set<string>();
    const trace: DijkstraStep[] = [];

    // Initialize vertices
    for (const node of this.adjacencyList.keys()) {
      distances[node] = Infinity;
      previous[node] = null;
    }

    distances[start] = 0;
    minHeap.insert(start, 0);

    let stepCounter = 0;

    trace.push({
      stepNumber: ++stepCounter,
      currentNode: start,
      currentDistance: 0,
      visitedNodes: Array.from(visited),
      distances: { ...distances },
      description: `Initialized source vertex ${start} with distance 0.0 km`,
    });

    while (minHeap.isNotEmpty) {
      const currentItem = minHeap.extract()!;
      const u = currentItem.data;
      const distU = currentItem.priority;

      if (visited.has(u)) continue;
      visited.add(u);

      trace.push({
        stepNumber: ++stepCounter,
        currentNode: u,
        currentDistance: distU,
        visitedNodes: Array.from(visited),
        distances: { ...distances },
        description: `Settled vertex ${u} (Shortest known: ${distU.toFixed(2)} km)`,
      });

      if (target && u === target) {
        break;
      }

      const neighbors = this.adjacencyList.get(u) || [];
      for (const edge of neighbors) {
        const v = edge.target;
        const weight = edge.weight;

        if (visited.has(v)) continue;

        const newDist = distU + weight;
        if (newDist < (distances[v] ?? Infinity)) {
          distances[v] = newDist;
          previous[v] = u;
          minHeap.insert(v, newDist);

          trace.push({
            stepNumber: ++stepCounter,
            currentNode: v,
            currentDistance: newDist,
            visitedNodes: Array.from(visited),
            distances: { ...distances },
            description: `Relaxed edge (${u} -> ${v}): Updated distance to ${newDist.toFixed(2)} km`,
          });
        }
      }
    }

    // Path reconstruction
    const path: string[] = [];
    if (distances[target] !== undefined && distances[target] !== Infinity) {
      let curr: string | null = target;
      while (curr !== null) {
        path.push(curr);
        curr = previous[curr] ?? null;
      }
      path.reverse();
    }

    return {
      startNode: start,
      targetNode: target,
      path,
      totalDistance: distances[target] ?? Infinity,
      trace,
      allDistances: distances,
    };
  }
}
