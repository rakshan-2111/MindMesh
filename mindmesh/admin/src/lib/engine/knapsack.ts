// ============================================================================
// MindMesh DAA Project - 0/1 Knapsack Algorithm (Dynamic Programming)
// Time Complexity: O(n * W)
// Space Complexity: O(n * W) for the 2D DP matrix
//
// Computes vehicle capacity allocation to select the highest-benefit subset of
// food donations without exceeding the vehicle's maximum payload limit.
// Exposes the DP matrix for step-by-step educational visualization.
// ============================================================================

export interface KnapsackItem {
  id: string;
  name: string;
  weight: number; // In kg (integer for DP table column indexing)
  benefit: number; // Urgency/utility score
}

export interface KnapsackResult {
  maxBenefit: number;
  totalWeight: number;
  selectedItems: KnapsackItem[];
  dpTable: number[][]; // [n + 1][capacity + 1]
  items: KnapsackItem[];
  capacity: number;
}

export class KnapsackOptimizer {
  /**
   * Solves 0/1 Knapsack using Bottom-Up Dynamic Programming.
   * Recurrence Relation:
   *   dp[i][w] = dp[i-1][w]                                    if weight[i-1] > w
   *   dp[i][w] = max(dp[i-1][w], dp[i-1][w - weight[i-1]] + benefit[i-1]) otherwise
   */
  public static solve(items: KnapsackItem[], capacity: number): KnapsackResult {
    const n = items.length;
    // Initialize DP matrix: (n + 1) rows x (capacity + 1) columns with 0
    const dpTable: number[][] = Array.from({ length: n + 1 }, () =>
      new Array(capacity + 1).fill(0)
    );

    // Build DP table bottom-up
    for (let i = 1; i <= n; i++) {
      const currentItem = items[i - 1];
      const itemWeight = Math.round(currentItem.weight);
      const itemBenefit = currentItem.benefit;

      for (let w = 0; w <= capacity; w++) {
        if (itemWeight <= w) {
          const includeVal = dpTable[i - 1][w - itemWeight] + itemBenefit;
          const excludeVal = dpTable[i - 1][w];
          dpTable[i][w] = includeVal > excludeVal ? includeVal : excludeVal;
        } else {
          dpTable[i][w] = dpTable[i - 1][w];
        }
      }
    }

    // Backtrack to find optimal subset of chosen items
    const selectedItems: KnapsackItem[] = [];
    let currentCapacity = capacity;
    let accumulatedWeight = 0;

    for (let i = n; i > 0; i--) {
      // If value differs from the row above, item i-1 was included
      if (dpTable[i][currentCapacity] !== dpTable[i - 1][currentCapacity]) {
        const includedItem = items[i - 1];
        selectedItems.push(includedItem);
        currentCapacity -= Math.round(includedItem.weight);
        accumulatedWeight += includedItem.weight;
      }
    }

    // Reverse to retain natural original order
    selectedItems.reverse();

    return {
      maxBenefit: dpTable[n][capacity],
      totalWeight: accumulatedWeight,
      selectedItems,
      dpTable,
      items,
      capacity,
    };
  }
}
