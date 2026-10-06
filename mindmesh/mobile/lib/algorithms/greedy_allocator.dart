// ============================================================================
// MindMesh DAA Project - Greedy Recipient Allocator
// Time Complexity: O(R log R) where R is number of eligible recipients
// Space Complexity: O(R)
//
// Implements greedy recipient matching by ranking recipients according to:
//   1. Priority score (descending)
//   2. Proximity / Shortest distance from donation pickup (ascending)
//   3. Remaining unfilled demand (descending)
//
// Fast baseline matching engine matching multi-recipient demands to batch supply.
// ============================================================================

class AllocationCandidate {
  final String id;
  final String name;
  final String nodeId;
  final int priority; // e.g. 1 to 5
  final int remainingDemand;
  final double distanceKm;
  final bool isAvailable;

  const AllocationCandidate({
    required this.id,
    required this.name,
    required this.nodeId,
    required this.priority,
    required this.remainingDemand,
    required this.distanceKm,
    this.isAvailable = true,
  });

  /// Composite greedy heuristic score:
  /// Higher priority + shorter distance = higher score
  double get greedyScore {
    final distWeight = (distanceKm > 0) ? (10.0 / distanceKm) : 10.0;
    return (priority * 20.0) + distWeight + (remainingDemand * 0.5);
  }
}

class AllocationPair {
  final AllocationCandidate recipient;
  final int allocatedQuantity;

  AllocationPair({
    required this.recipient,
    required this.allocatedQuantity,
  });

  @override
  String toString() => '${recipient.name}: $allocatedQuantity units';
}

class GreedyAllocationResult {
  final int totalDonatedQuantity;
  final int totalAllocatedQuantity;
  final int unallocatedSurplus;
  final List<AllocationPair> allocations;
  final List<AllocationCandidate> rankedCandidates;

  GreedyAllocationResult({
    required this.totalDonatedQuantity,
    required this.totalAllocatedQuantity,
    required this.unallocatedSurplus,
    required this.allocations,
    required this.rankedCandidates,
  });
}

class GreedyRecipientAllocator {
  /// Allocates a donation batch across available recipients greedily.
  static GreedyAllocationResult allocate({
    required int availableSupply,
    required List<AllocationCandidate> candidates,
  }) {
    // Filter available candidates with positive remaining demand
    final eligible = candidates
        .where((c) => c.isAvailable && c.remainingDemand > 0)
        .toList();

    // Sort greedily: priority DESC, distance ASC, demand DESC
    eligible.sort((a, b) {
      if (b.priority != a.priority) {
        return b.priority.compareTo(a.priority);
      }
      if (a.distanceKm != b.distanceKm) {
        return a.distanceKm.compareTo(b.distanceKm);
      }
      return b.remainingDemand.compareTo(a.remainingDemand);
    });

    final allocations = <AllocationPair>[];
    var remainingSupply = availableSupply;

    for (final candidate in eligible) {
      if (remainingSupply <= 0) break;

      // Allocate minimum of remaining supply and recipient demand
      final allocateQty = (remainingSupply >= candidate.remainingDemand)
          ? candidate.remainingDemand
          : remainingSupply;

      if (allocateQty > 0) {
        allocations.add(AllocationPair(
          recipient: candidate,
          allocatedQuantity: allocateQty,
        ));
        remainingSupply -= allocateQty;
      }
    }

    final totalAllocated = availableSupply - remainingSupply;

    return GreedyAllocationResult(
      totalDonatedQuantity: availableSupply,
      totalAllocatedQuantity: totalAllocated,
      unallocatedSurplus: remainingSupply,
      allocations: allocations,
      rankedCandidates: eligible,
    );
  }
}
