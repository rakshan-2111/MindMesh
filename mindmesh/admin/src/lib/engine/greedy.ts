// ============================================================================
// MindMesh DAA Project - Greedy Recipient Allocator
// Time Complexity: O(R log R) where R is count of eligible recipients
// Space Complexity: O(R)
//
// Fast baseline matching engine prioritizing urgent demand & spatial proximity.
// ============================================================================

export interface AllocationCandidate {
  id: string;
  name: string;
  nodeId: string;
  priority: number; // 1 to 5
  remainingDemand: number;
  distanceKm: number;
  isAvailable?: boolean;
}

export interface AllocationPair {
  recipient: AllocationCandidate;
  allocatedQuantity: number;
}

export interface GreedyAllocationResult {
  totalDonatedQuantity: number;
  totalAllocatedQuantity: number;
  unallocatedSurplus: number;
  allocations: AllocationPair[];
  rankedCandidates: AllocationCandidate[];
}

export class GreedyRecipientAllocator {
  public static allocate(params: {
    availableSupply: number;
    candidates: AllocationCandidate[];
  }): GreedyAllocationResult {
    const { availableSupply, candidates } = params;

    // Filter available candidates with pending demand
    const eligible = candidates.filter(
      (c) => (c.isAvailable ?? true) && c.remainingDemand > 0
    );

    // Sort greedily: priority DESC, distance ASC, demand DESC
    eligible.sort((a, b) => {
      if (b.priority !== a.priority) {
        return b.priority - a.priority;
      }
      if (a.distanceKm !== b.distanceKm) {
        return a.distanceKm - b.distanceKm;
      }
      return b.remainingDemand - a.remainingDemand;
    });

    const allocations: AllocationPair[] = [];
    let remainingSupply = availableSupply;

    for (const candidate of eligible) {
      if (remainingSupply <= 0) break;

      const allocateQty = Math.min(remainingSupply, candidate.remainingDemand);
      if (allocateQty > 0) {
        allocations.push({
          recipient: candidate,
          allocatedQuantity: allocateQty,
        });
        remainingSupply -= allocateQty;
      }
    }

    return {
      totalDonatedQuantity: availableSupply,
      totalAllocatedQuantity: availableSupply - remainingSupply,
      unallocatedSurplus: remainingSupply,
      allocations,
      rankedCandidates: eligible,
    };
  }
}
