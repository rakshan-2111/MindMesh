// ============================================================================
// MindMesh DAA Project - Traveling Salesperson Problem (TSP)
// 1. Held-Karp Dynamic Programming:
//    - Time Complexity: O(n^2 * 2^n)
//    - Space Complexity: O(n * 2^n)
//    Exact optimal tour for n <= 10 stops.
// 2. Nearest Neighbor Heuristic:
//    - Time Complexity: O(n^2)
//    - Fast polynomial baseline for performance comparison.
// ============================================================================

export interface TSPResult {
  optimalTour: string[];
  optimalDistance: number;
  baselineTour: string[];
  baselineDistance: number;
  improvementPercentage: number;
  stopsCount: number;
  algorithmUsed: string;
}

export class TSPOptimizer {
  /**
   * Solves TSP using Held-Karp dynamic programming with bitmasking
   */
  public static solve(params: {
    nodes: string[];
    distanceMatrix: number[][];
    returnToStart?: boolean;
  }): TSPResult {
    const { nodes, distanceMatrix, returnToStart = true } = params;
    const n = nodes.length;

    if (n <= 1) {
      return {
        optimalTour: [...nodes],
        optimalDistance: 0,
        baselineTour: [...nodes],
        baselineDistance: 0,
        improvementPercentage: 0,
        stopsCount: n,
        algorithmUsed: "Held-Karp Dynamic Programming",
      };
    }

    // Baseline calculation: Nearest Neighbor Heuristic O(n^2)
    const baseline = this.solveNearestNeighbor(nodes, distanceMatrix, returnToStart);

    // If n > 12, fallback to Nearest Neighbor for safety
    if (n > 12) {
      return {
        optimalTour: baseline.tour,
        optimalDistance: baseline.distance,
        baselineTour: baseline.tour,
        baselineDistance: baseline.distance,
        improvementPercentage: 0,
        stopsCount: n,
        algorithmUsed: "Nearest Neighbor Heuristic (Large N Fallback)",
      };
    }

    // Held-Karp DP: dp[mask][u] = min cost to visit subset `mask` ending at `u`
    const numStates = 1 << n; // 2^n
    const dp: number[][] = Array.from({ length: numStates }, () =>
      new Array(n).fill(Infinity)
    );
    const parent: number[][] = Array.from({ length: numStates }, () =>
      new Array(n).fill(-1)
    );

    // Base state: Starting at vertex 0
    dp[1][0] = 0;

    for (let mask = 1; mask < numStates; mask++) {
      for (let u = 0; u < n; u++) {
        if ((mask & (1 << u)) === 0) continue;
        if (dp[mask][u] === Infinity) continue;

        for (let v = 0; v < n; v++) {
          if ((mask & (1 << v)) !== 0) continue; // v already visited

          const nextMask = mask | (1 << v);
          const cost = dp[mask][u] + distanceMatrix[u][v];

          if (cost < dp[nextMask][v]) {
            dp[nextMask][v] = cost;
            parent[nextMask][v] = u;
          }
        }
      }
    }

    // Tour completion
    const finalMask = numStates - 1;
    let bestTourCost = Infinity;
    let lastNode = -1;

    for (let u = 1; u < n; u++) {
      if (dp[finalMask][u] === Infinity) continue;
      const totalCost = dp[finalMask][u] + (returnToStart ? distanceMatrix[u][0] : 0);
      if (totalCost < bestTourCost) {
        bestTourCost = totalCost;
        lastNode = u;
      }
    }

    // Tour Reconstruction
    const tourIndices: number[] = [];
    if (lastNode !== -1) {
      let currNode = lastNode;
      let currMask = finalMask;

      while (currNode !== -1) {
        tourIndices.push(currNode);
        const p = parent[currMask][currNode];
        currMask ^= 1 << currNode;
        currNode = p;
      }
    } else {
      for (let i = 0; i < n; i++) tourIndices.push(i);
    }

    const optimalTourOrder = tourIndices.reverse().map((idx) => nodes[idx]);
    if (returnToStart && optimalTourOrder.length > 0) {
      optimalTourOrder.push(nodes[0]);
    }

    const improvement =
      baseline.distance > 0
        ? ((baseline.distance - bestTourCost) / baseline.distance) * 100
        : 0;

    return {
      optimalTour: optimalTourOrder,
      optimalDistance: bestTourCost,
      baselineTour: baseline.tour,
      baselineDistance: baseline.distance,
      improvementPercentage: Math.max(0, improvement),
      stopsCount: n,
      algorithmUsed: "Held-Karp Dynamic Programming O(n² 2ⁿ)",
    };
  }

  private static solveNearestNeighbor(
    nodes: string[],
    distanceMatrix: number[][],
    returnToStart: boolean
  ): { tour: string[]; distance: number } {
    const n = nodes.length;
    const visited = new Array(n).fill(false);
    const tour = [nodes[0]];
    visited[0] = true;

    let current = 0;
    let totalDistance = 0;

    for (let step = 1; step < n; step++) {
      let nearest = -1;
      let minDistance = Infinity;

      for (let next = 0; next < n; next++) {
        if (!visited[next] && distanceMatrix[current][next] < minDistance) {
          minDistance = distanceMatrix[current][next];
          nearest = next;
        }
      }

      if (nearest !== -1) {
        visited[nearest] = true;
        totalDistance += minDistance;
        tour.push(nodes[nearest]);
        current = nearest;
      }
    }

    if (returnToStart) {
      totalDistance += distanceMatrix[current][0];
      tour.push(nodes[0]);
    }

    return { tour, distance: totalDistance };
  }
}
