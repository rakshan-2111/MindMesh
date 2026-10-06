// ============================================================================
// MindMesh DAA Project - Breadth-First Search (BFS) & FIFO Queue
// Time Complexity: O(V + E) for BFS graph traversal
// Space Complexity: O(V) for visited set and FIFO queue
//
// Implements reachability verification to confirm that destinations
// can be physically reached from donation pickup nodes prior to route planning.
// ============================================================================

import 'dart:collection';
import 'dijkstra.dart';

/// Standard FIFO Queue implementation
class MindMeshQueue<T> {
  final Queue<T> _items = Queue<T>();

  void enqueue(T item) => _items.addLast(item);

  T? dequeue() => _items.isEmpty ? null : _items.removeFirst();

  T? peek() => _items.isEmpty ? null : _items.first;

  bool get isEmpty => _items.isEmpty;
  bool get isNotEmpty => _items.isNotEmpty;
  int get length => _items.length;

  List<T> toList() => _items.toList();
}

class BFSResult {
  final String startNode;
  final Set<String> reachableNodes;
  final Map<String, int> hopDistances;
  final bool isTargetReachable;
  final List<String> traversalOrder;

  BFSResult({
    required this.startNode,
    required this.reachableNodes,
    required this.hopDistances,
    required this.isTargetReachable,
    required this.traversalOrder,
  });
}

class BFSChecker {
  /// Explores graph reachability starting from [startNode] using Breadth-First Search O(V + E)
  static BFSResult checkReachability(
    DijkstraGraph graph,
    String startNode, {
    String? targetNode,
  }) {
    final visited = <String>{};
    final hopDistances = <String, int>{};
    final queue = MindMeshQueue<String>();
    final traversalOrder = <String>[];

    if (!graph.adjacencyList.containsKey(startNode)) {
      return BFSResult(
        startNode: startNode,
        reachableNodes: {},
        hopDistances: {},
        isTargetReachable: false,
        traversalOrder: [],
      );
    }

    visited.add(startNode);
    hopDistances[startNode] = 0;
    queue.enqueue(startNode);

    while (queue.isNotEmpty) {
      final current = queue.dequeue()!;
      traversalOrder.add(current);

      if (targetNode != null && current == targetNode) {
        // Target found
        break;
      }

      final neighbors = graph.adjacencyList[current] ?? [];
      for (final edge in neighbors) {
        final neighbor = edge.target;
        if (!visited.contains(neighbor)) {
          visited.add(neighbor);
          hopDistances[neighbor] = (hopDistances[current] ?? 0) + 1;
          queue.enqueue(neighbor);
        }
      }
    }

    final targetReachable = (targetNode != null)
        ? visited.contains(targetNode)
        : true;

    return BFSResult(
      startNode: startNode,
      reachableNodes: visited,
      hopDistances: hopDistances,
      isTargetReachable: targetReachable,
      traversalOrder: traversalOrder,
    );
  }
}
