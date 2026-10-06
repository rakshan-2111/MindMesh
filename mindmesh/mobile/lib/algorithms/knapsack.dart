// ============================================================================
// MindMesh DAA Project - 0/1 Knapsack Algorithm (Dynamic Programming)
// Time Complexity: O(n * W) where n is number of items, W is vehicle capacity
// Space Complexity: O(n * W) for the 2D DP matrix
//
// Solves vehicle capacity allocation to select the highest-benefit subset of
// food donations without exceeding the vehicle's maximum payload limit.
// Exposes the DP matrix for step-by-step educational visualization.
// ============================================================================

class KnapsackItem {
  final String id;
  final String name;
  final int weight; // In kg (integer for DP table column indexing)
  final int benefit; // Calculated benefit/urgency score

  const KnapsackItem({
    required this.id,
    required this.name,
    required this.weight,
    required this.benefit,
  });

  @override
  String toString() => '$name (Weight: ${weight}kg, Benefit: $benefit)';
}

class KnapsackResult {
  final int maxBenefit;
  final int totalWeight;
  final List<KnapsackItem> selectedItems;
  final List<List<int>> dpTable; // [n + 1][capacity + 1]
  final List<KnapsackItem> items;
  final int capacity;

  KnapsackResult({
    required this.maxBenefit,
    required this.totalWeight,
    required this.selectedItems,
    required this.dpTable,
    required this.items,
    required this.capacity,
  });
}

class KnapsackOptimizer {
  /// Solves the 0/1 Knapsack problem using Bottom-Up Dynamic Programming.
  ///
  /// Recurrence Relation:
  ///   dp[i][w] = dp[i-1][w]                                    if weight[i-1] > w
  ///   dp[i][w] = max(dp[i-1][w], dp[i-1][w - weight[i-1]] + benefit[i-1]) otherwise
  static KnapsackResult solve({
    required List<KnapsackItem> items,
    required int capacity,
  }) {
    final n = items.length;
    // Initialize DP matrix: (n + 1) rows x (capacity + 1) columns with 0
    final dpTable = List.generate(
      n + 1,
      (_) => List<int>.filled(capacity + 1, 0),
    );

    // Build table bottom-up
    for (int i = 1; i <= n; i++) {
      final currentItem = items[i - 1];
      final itemWeight = currentItem.weight;
      final itemBenefit = currentItem.benefit;

      for (int w = 0; w <= capacity; w++) {
        if (itemWeight <= w) {
          final includeVal = dpTable[i - 1][w - itemWeight] + itemBenefit;
          final excludeVal = dpTable[i - 1][w];
          dpTable[i][w] = includeVal > excludeVal ? includeVal : excludeVal;
        } else {
          dpTable[i][w] = dpTable[i - 1][w];
        }
      }
    }

    // Backtrack to find optimal subset of chosen items
    final selectedItems = <KnapsackItem>[];
    var currentCapacity = capacity;
    var accumulatedWeight = 0;

    for (int i = n; i > 0; i--) {
      // If value differs from the row above, item i-1 was included
      if (dpTable[i][currentCapacity] != dpTable[i - 1][currentCapacity]) {
        final includedItem = items[i - 1];
        selectedItems.add(includedItem);
        currentCapacity -= includedItem.weight;
        accumulatedWeight += includedItem.weight;
      }
    }

    // Reverse to retain natural original order
    final orderedSelected = selectedItems.reversed.toList();

    return KnapsackResult(
      maxBenefit: dpTable[n][capacity],
      totalWeight: accumulatedWeight,
      selectedItems: orderedSelected,
      dpTable: dpTable,
      items: items,
      capacity: capacity,
    );
  }
}
