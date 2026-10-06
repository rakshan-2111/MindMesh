import 'package:flutter_test/flutter_test.dart';
import 'package:mindmesh_mobile/algorithms/priority_queue.dart';
import 'package:mindmesh_mobile/algorithms/knapsack.dart';
import 'package:mindmesh_mobile/algorithms/dijkstra.dart';
import 'package:mindmesh_mobile/algorithms/tsp.dart';
import 'package:mindmesh_mobile/algorithms/greedy_allocator.dart';
import 'package:mindmesh_mobile/algorithms/bfs.dart';

void main() {
  group('MindMesh DAA Algorithm Suite - Dart Tests', () {
    // ------------------------------------------------------------------------
    // 1. Priority Queue Tests
    // ------------------------------------------------------------------------
    test('Priority Queue preserves max-heap property and extract order O(log n)', () {
      final pq = MindMeshPriorityQueue<String>(isMaxHeap: true);

      pq.insert('Donation C', 30.0);
      pq.insert('Donation A', 90.0);
      pq.insert('Donation D', 10.0);
      pq.insert('Donation B', 70.0);

      expect(pq.size, 4);
      expect(pq.peek()?.data, 'Donation A');

      expect(pq.extract()?.data, 'Donation A'); // 90.0
      expect(pq.extract()?.data, 'Donation B'); // 70.0
      expect(pq.extract()?.data, 'Donation C'); // 30.0
      expect(pq.extract()?.data, 'Donation D'); // 10.0
      expect(pq.isEmpty, isTrue);
    });

    test('Priority Scoring Formula applies urgency bonuses correctly', () {
      final now = DateTime(2026, 10, 6, 12, 0);

      // Expiry within 20 mins (< 30 min) -> +50, high demand -> +20, large qty -> +10 => 80
      final scoreUrgent = MindMeshPriorityQueue.calculateDonationPriority(
        expiryTime: now.add(const Duration(minutes: 20)),
        now: now,
        isHighDemand: true,
        isLargeQuantity: true,
      );
      expect(scoreUrgent, 80.0);

      // Expiry in 45 mins (< 60 min) -> +30, normal demand -> 0, standard qty -> 0 => 30
      final scoreMedium = MindMeshPriorityQueue.calculateDonationPriority(
        expiryTime: now.add(const Duration(minutes: 45)),
        now: now,
        isHighDemand: false,
        isLargeQuantity: false,
      );
      expect(scoreMedium, 30.0);
    });

    // ------------------------------------------------------------------------
    // 2. 0/1 Knapsack Dynamic Programming Tests
    // ------------------------------------------------------------------------
    test('0/1 Knapsack reproduces benchmark: Capacity 50 -> A+B+D=45kg, Benefit=210', () {
      final items = [
        const KnapsackItem(id: 'A', name: 'Item A', weight: 20, benefit: 90),
        const KnapsackItem(id: 'B', name: 'Item B', weight: 15, benefit: 70),
        const KnapsackItem(id: 'C', name: 'Item C', weight: 30, benefit: 100),
        const KnapsackItem(id: 'D', name: 'Item D', weight: 10, benefit: 50),
      ];

      final result = KnapsackOptimizer.solve(items: items, capacity: 50);

      expect(result.maxBenefit, 210);
      expect(result.totalWeight, 45);

      final selectedIds = result.selectedItems.map((e) => e.id).toSet();
      expect(selectedIds, containsAll(['A', 'B', 'D']));
      expect(selectedIds.contains('C'), isFalse);

      // DP table dimensions check: (n+1) x (W+1)
      expect(result.dpTable.length, 5); // 0..4
      expect(result.dpTable[0].length, 51); // 0..50
      expect(result.dpTable[4][50], 210);
    });

    // ------------------------------------------------------------------------
    // 3. Greedy Allocator Tests
    // ------------------------------------------------------------------------
    test('Greedy Allocator matches 50 portions: NGO Alpha 30, Shelter Beta 20', () {
      final candidates = [
        const AllocationCandidate(
          id: '1',
          name: 'NGO Alpha',
          nodeId: 'NGO_ALPHA',
          priority: 5,
          remainingDemand: 30,
          distanceKm: 2.0,
        ),
        const AllocationCandidate(
          id: '2',
          name: 'Shelter Beta',
          nodeId: 'SHELTER_BETA',
          priority: 4,
          remainingDemand: 40,
          distanceKm: 2.5,
        ),
        const AllocationCandidate(
          id: '3',
          name: 'Hostel Gamma',
          nodeId: 'HOSTEL_GAMMA',
          priority: 3,
          remainingDemand: 20,
          distanceKm: 3.0,
        ),
      ];

      final result = GreedyRecipientAllocator.allocate(
        availableSupply: 50,
        candidates: candidates,
      );

      expect(result.totalAllocatedQuantity, 50);
      expect(result.unallocatedSurplus, 0);
      expect(result.allocations.length, 2);

      expect(result.allocations[0].recipient.name, 'NGO Alpha');
      expect(result.allocations[0].allocatedQuantity, 30);

      expect(result.allocations[1].recipient.name, 'Shelter Beta');
      expect(result.allocations[1].allocatedQuantity, 20);
    });

    // ------------------------------------------------------------------------
    // 4. Dijkstra Shortest Path Tests
    // ------------------------------------------------------------------------
    test('Dijkstra finds shortest path and produces educational execution trace', () {
      final graph = DijkstraGraph();
      graph.addEdge('CANTEEN', 'JUNCTION_B', 1.1);
      graph.addEdge('JUNCTION_B', 'STUDENT_HUB', 1.0);
      graph.addEdge('STUDENT_HUB', 'SHELTER_BETA', 1.4);
      graph.addEdge('CANTEEN', 'LIBRARY_PLAZA', 1.5);
      graph.addEdge('LIBRARY_PLAZA', 'SHELTER_BETA', 3.0);

      final result = graph.findShortestPath('CANTEEN', 'SHELTER_BETA');

      expect(result.path, ['CANTEEN', 'JUNCTION_B', 'STUDENT_HUB', 'SHELTER_BETA']);
      expect(result.totalDistance, closeTo(3.5, 0.001));
      expect(result.trace.isNotEmpty, isTrue);
      expect(result.trace.first.currentNode, 'CANTEEN');
    });

    // ------------------------------------------------------------------------
    // 5. TSP Held-Karp Tests
    // ------------------------------------------------------------------------
    test('TSP Held-Karp finds optimal minimum cost tour and improves baseline', () {
      final stops = ['DEPOT', 'CANTEEN', 'NGO_ALPHA', 'SHELTER_BETA'];
      final distMatrix = [
        [0.0, 2.0, 4.0, 3.5],
        [2.0, 0.0, 2.5, 3.0],
        [4.0, 2.5, 0.0, 1.8],
        [3.5, 3.0, 1.8, 0.0],
      ];

      final result = TSPOptimizer.solve(
        nodes: stops,
        distanceMatrix: distMatrix,
        returnToStart: true,
      );

      expect(result.optimalTour.first, 'DEPOT');
      expect(result.optimalTour.last, 'DEPOT');
      expect(result.optimalDistance, lessThanOrEqualTo(result.baselineDistance));
      expect(result.stopsCount, 4);
    });

    // ------------------------------------------------------------------------
    // 6. BFS & Queue Tests
    // ------------------------------------------------------------------------
    test('FIFO Queue and BFS verify graph reachability correctly', () {
      final queue = MindMeshQueue<int>();
      queue.enqueue(10);
      queue.enqueue(20);
      queue.enqueue(30);

      expect(queue.dequeue(), 10);
      expect(queue.peek(), 20);
      expect(queue.dequeue(), 20);
      expect(queue.dequeue(), 30);
      expect(queue.isEmpty, isTrue);

      final graph = DijkstraGraph();
      graph.addEdge('A', 'B', 1.0);
      graph.addEdge('B', 'C', 1.0);
      graph.addEdge('D', 'E', 1.0); // Disconnected component

      final bfsConnected = BFSChecker.checkReachability(graph, 'A', targetNode: 'C');
      expect(bfsConnected.isTargetReachable, isTrue);

      final bfsDisconnected = BFSChecker.checkReachability(graph, 'A', targetNode: 'E');
      expect(bfsDisconnected.isTargetReachable, isFalse);
    });
  });
}
