// ============================================================================
// MindMesh DAA Project - Dijkstra's Shortest Path Algorithm
// Time Complexity: O((V + E) log V) with min-heap
// Space Complexity: O(V + E) for adjacency list, min-heap, and trace snapshots
//
// Implemented with custom Min-Heap without external libraries.
// Exposes step-by-step exploration trace for graph algorithm visualization.
// ============================================================================

import 'priority_queue.dart';

class GraphEdge {
  final String target;
  final double weight; // Distance in kilometers

  const GraphEdge({required this.target, required this.weight});

  @override
  String toString() => '-> $target ($weight km)';
}

class DijkstraStep {
  final int stepNumber;
  final String currentNode;
  final double currentDistance;
  final Set<String> visitedNodes;
  final Map<String, double> distances;
  final String description;

  DijkstraStep({
    required this.stepNumber,
    required this.currentNode,
    required this.currentDistance,
    required this.visitedNodes,
    required this.distances,
    required this.description,
  });
}

class DijkstraResult {
  final String startNode;
  final String targetNode;
  final List<String> path;
  final double totalDistance;
  final List<DijkstraStep> trace;
  final Map<String, double> allDistances;

  DijkstraResult({
    required this.startNode,
    required this.targetNode,
    required this.path,
    required this.totalDistance,
    required this.trace,
    required this.allDistances,
  });
}

class DijkstraGraph {
  final Map<String, List<GraphEdge>> adjacencyList = {};

  void addEdge(String from, String to, double weight, {bool bidirectional = true}) {
    adjacencyList.putIfAbsent(from, () => []).add(GraphEdge(target: to, weight: weight));
    if (bidirectional) {
      adjacencyList.putIfAbsent(to, () => []).add(GraphEdge(target: from, weight: weight));
    } else {
      adjacencyList.putIfAbsent(to, () => []);
    }
  }

  /// Run Dijkstra's algorithm from `start` to `target`.
  /// If target is null or empty, computes single-source shortest paths to all reachable vertices.
  DijkstraResult findShortestPath(String start, String target) {
    if (!adjacencyList.containsKey(start)) {
      return DijkstraResult(
        startNode: start,
        targetNode: target,
        path: [],
        totalDistance: double.infinity,
        trace: [],
        allDistances: {},
      );
    }

    // Min-heap storing (nodeId, cumulativeDistance)
    final minHeap = MindMeshPriorityQueue<String>(isMaxHeap: false);

    final distances = <String, double>{};
    final previous = <String, String?>{};
    final visited = <String>{};
    final trace = <DijkstraStep>[];

    // Initialize all known nodes to infinity
    for (final node in adjacencyList.keys) {
      distances[node] = double.infinity;
      previous[node] = null;
    }

    distances[start] = 0.0;
    minHeap.insert(start, 0.0);

    int stepCounter = 0;

    trace.add(DijkstraStep(
      stepNumber: ++stepCounter,
      currentNode: start,
      currentDistance: 0.0,
      visitedNodes: Set.from(visited),
      distances: Map.from(distances),
      description: 'Initialized source node $start with distance 0.0',
    ));

    while (minHeap.isNotEmpty) {
      final currentItem = minHeap.extract()!;
      final u = currentItem.data;
      final distU = currentItem.priority;

      // Skip outdated heap entries
      if (visited.contains(u)) continue;
      visited.add(u);

      trace.add(DijkstraStep(
        stepNumber: ++stepCounter,
        currentNode: u,
        currentDistance: distU,
        visitedNodes: Set.from(visited),
        distances: Map.from(distances),
        description: 'Visited vertex $u (Distance: ${distU.toStringAsFixed(2)} km)',
      ));

      // Early stop if destination target is settled
      if (target.isNotEmpty && u == target) {
        break;
      }

      // Relax incident edges
      final neighbors = adjacencyList[u] ?? [];
      for (final edge in neighbors) {
        final v = edge.target;
        final weight = edge.weight;

        if (visited.contains(v)) continue;

        final newDist = distU + weight;
        if (newDist < (distances[v] ?? double.infinity)) {
          distances[v] = newDist;
          previous[v] = u;
          minHeap.insert(v, newDist);

          trace.add(DijkstraStep(
            stepNumber: ++stepCounter,
            currentNode: v,
            currentDistance: newDist,
            visitedNodes: Set.from(visited),
            distances: Map.from(distances),
            description: 'Relaxed edge ($u -> $v): New shortest distance ${newDist.toStringAsFixed(2)} km',
          ));
        }
      }
    }

    // Reconstruct path
    final path = <String>[];
    if (distances[target] != null && distances[target] != double.infinity) {
      var curr = target;
      while (curr.isNotEmpty) {
        path.add(curr);
        final prevNode = previous[curr];
        if (prevNode == null) break;
        curr = prevNode;
      }
      path.reversed.toList();
    }

    return DijkstraResult(
      startNode: start,
      targetNode: target,
      path: path.reversed.toList(),
      totalDistance: distances[target] ?? double.infinity,
      trace: trace,
      allDistances: distances,
    );
  }
}
