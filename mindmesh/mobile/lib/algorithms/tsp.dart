// ============================================================================
// MindMesh DAA Project - Traveling Salesperson Problem (TSP)
// 1. Held-Karp Dynamic Programming:
//    - Time Complexity: O(n^2 * 2^n)
//    - Space Complexity: O(n * 2^n)
//    Exact optimal tour for n <= 10 stops.
// 2. Nearest Neighbor Heuristic:
//    - Time Complexity: O(n^2)
//    - Fast polynomial-time baseline for performance comparison.
// ============================================================================

class TSPResult {
  final List<String> optimalTour;
  final double optimalDistance;
  final List<String> baselineTour;
  final double baselineDistance;
  final double improvementPercentage;
  final int stopsCount;
  final String algorithmUsed;

  TSPResult({
    required this.optimalTour,
    required this.optimalDistance,
    required this.baselineTour,
    required this.baselineDistance,
    required this.improvementPercentage,
    required this.stopsCount,
    required this.algorithmUsed,
  });

  @override
  String toString() =>
      'Optimal: ${optimalTour.join(' -> ')} (${optimalDistance.toStringAsFixed(2)} km) | '
      'Baseline: ${baselineDistance.toStringAsFixed(2)} km (${improvementPercentage.toStringAsFixed(1)}% improvement)';
}

class TSPOptimizer {
  /// Solves TSP using Held-Karp DP with bitmasking, and compares with Nearest Neighbor baseline.
  /// [nodes]: List of node names (e.g. ["DEPOT", "CANTEEN", "NGO_ALPHA", "SHELTER_BETA"])
  /// [distanceMatrix]: n x n 2D array of pairwise shortest distances (computed via Dijkstra)
  static TSPResult solve({
    required List<String> nodes,
    required List<List<double>> distanceMatrix,
    bool returnToStart = true,
  }) {
    final n = nodes.length;
    if (n <= 1) {
      return TSPResult(
        optimalTour: List.from(nodes),
        optimalDistance: 0.0,
        baselineTour: List.from(nodes),
        baselineDistance: 0.0,
        improvementPercentage: 0.0,
        stopsCount: n,
        algorithmUsed: 'Held-Karp Dynamic Programming',
      );
    }

    // 1. Baseline: Nearest Neighbor Heuristic O(n^2)
    final baseline = _solveNearestNeighbor(nodes, distanceMatrix, returnToStart);

    // If n > 12, fall back to Nearest Neighbor for safety
    if (n > 12) {
      return TSPResult(
        optimalTour: baseline.tour,
        optimalDistance: baseline.distance,
        baselineTour: baseline.tour,
        baselineDistance: baseline.distance,
        improvementPercentage: 0.0,
        stopsCount: n,
        algorithmUsed: 'Nearest Neighbor Heuristic (Fallback for large N)',
      );
    }

    // 2. Held-Karp Dynamic Programming O(n^2 * 2^n)
    final numStates = 1 << n; // 2^n
    final dp = List.generate(
      numStates,
      (_) => List<double>.filled(n, double.infinity),
    );
    final parent = List.generate(
      numStates,
      (_) => List<int>.filled(n, -1),
    );

    // Base state: starting at node 0 with mask (1 << 0)
    dp[1][0] = 0.0;

    // Iterate through all bitmasks
    for (int mask = 1; mask < numStates; mask++) {
      for (int u = 0; u < n; u++) {
        if ((mask & (1 << u)) == 0) continue; // u is not in mask
        if (dp[mask][u] == double.infinity) continue;

        // Try transitioning to unvisited neighbor v
        for (int v = 0; v < n; v++) {
          if ((mask & (1 << v)) != 0) continue; // v already visited

          final nextMask = mask | (1 << v);
          final cost = dp[mask][u] + distanceMatrix[u][v];

          if (cost < dp[nextMask][v]) {
            dp[nextMask][v] = cost;
            parent[nextMask][v] = u;
          }
        }
      }
    }

    // Find optimal completion of tour
    final finalMask = numStates - 1;
    var bestTourCost = double.infinity;
    var lastNode = -1;

    for (int u = 1; u < n; u++) {
      if (dp[finalMask][u] == double.infinity) continue;
      final totalCost = dp[finalMask][u] + (returnToStart ? distanceMatrix[u][0] : 0.0);
      if (totalCost < bestTourCost) {
        bestTourCost = totalCost;
        lastNode = u;
      }
    }

    // Path Reconstruction
    final tourIndices = <int>[];
    if (lastNode != -1) {
      var currNode = lastNode;
      var currMask = finalMask;

      while (currNode != -1) {
        tourIndices.add(currNode);
        final p = parent[currMask][currNode];
        currMask ^= (1 << currNode);
        currNode = p;
      }
      tourIndices.reversed.toList();
    } else {
      tourIndices.addAll(List.generate(n, (i) => i));
    }

    final optimalTourOrder = tourIndices.reversed.map((idx) => nodes[idx]).toList();
    if (returnToStart && optimalTourOrder.isNotEmpty) {
      optimalTourOrder.add(nodes[0]);
    }

    final improvement = baseline.distance > 0
        ? ((baseline.distance - bestTourCost) / baseline.distance) * 100
        : 0.0;

    return TSPResult(
      optimalTour: optimalTourOrder,
      optimalDistance: bestTourCost,
      baselineTour: baseline.tour,
      baselineDistance: baseline.distance,
      improvementPercentage: improvement < 0 ? 0.0 : improvement,
      stopsCount: n,
      algorithmUsed: 'Held-Karp Dynamic Programming O(n² 2ⁿ)',
    );
  }

  static ({List<String> tour, double distance}) _solveNearestNeighbor(
    List<String> nodes,
    List<List<double>> distanceMatrix,
    bool returnToStart,
  ) {
    final n = nodes.length;
    final visited = List<bool>.filled(n, false);
    final tour = <String>[nodes[0]];
    visited[0] = true;

    var current = 0;
    var totalDistance = 0.0;

    for (int step = 1; step < n; step++) {
      var nearest = -1;
      var minDistance = double.infinity;

      for (int next = 0; next < n; next++) {
        if (!visited[next] && distanceMatrix[current][next] < minDistance) {
          minDistance = distanceMatrix[current][next];
          nearest = next;
        }
      }

      if (nearest != -1) {
        visited[nearest] = true;
        totalDistance += minDistance;
        tour.add(nodes[nearest]);
        current = nearest;
      }
    }

    if (returnToStart) {
      totalDistance += distanceMatrix[current][0];
      tour.add(nodes[0]);
    }

    return (tour: tour, distance: totalDistance);
  }
}
