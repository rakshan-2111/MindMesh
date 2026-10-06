// ============================================================================
// MindMesh DAA Project - Priority Queue (Binary Max/Min Heap)
// Time Complexity:
//   - Insert: O(log n)
//   - Extract: O(log n)
//   - Peek: O(1)
// Space Complexity: O(n)
//
// Implemented from scratch without third-party heap libraries.
// ============================================================================

class PriorityItem<T> {
  final T data;
  final double priority;

  PriorityItem({required this.data, required this.priority});

  @override
  String toString() => 'PriorityItem(data: $data, priority: $priority)';
}

/// Binary Heap Implementation supporting Max-Heap (default) or Min-Heap.
/// For MindMesh food urgency, MaxHeap is utilized so items with highest
/// urgency score are dequeued first.
class MindMeshPriorityQueue<T> {
  final List<PriorityItem<T>> _heap = [];
  final bool isMaxHeap;

  MindMeshPriorityQueue({this.isMaxHeap = true});

  int get size => _heap.length;
  bool get isEmpty => _heap.isEmpty;
  bool get isNotEmpty => _heap.isNotEmpty;

  /// Insert a new item into the heap. O(log n)
  void insert(T data, double priority) {
    final item = PriorityItem<T>(data: data, priority: priority);
    _heap.add(item);
    _siftUp(_heap.length - 1);
  }

  /// Peek at the top element without removing it. O(1)
  PriorityItem<T>? peek() {
    if (isEmpty) return null;
    return _heap.first;
  }

  /// Extract and return the root element (highest priority in MaxHeap). O(log n)
  PriorityItem<T>? extract() {
    if (isEmpty) return null;
    if (_heap.length == 1) {
      return _heap.removeLast();
    }

    final root = _heap.first;
    // Move last element to root and sift down
    _heap[0] = _heap.removeLast();
    _siftDown(0);
    return root;
  }

  /// Returns a shallow list copy of current heap items
  List<PriorityItem<T>> toList() {
    return List.unmodifiable(_heap);
  }

  /// Sift up element at index to restore heap property. O(log n)
  void _siftUp(int index) {
    var current = index;
    while (current > 0) {
      final parent = (current - 1) ~/ 2;
      if (_comparesFavorable(current, parent)) {
        _swap(current, parent);
        current = parent;
      } else {
        break;
      }
    }
  }

  /// Sift down element at index to restore heap property. O(log n)
  void _siftDown(int index) {
    var current = index;
    final length = _heap.length;

    while (true) {
      final leftChild = 2 * current + 1;
      final rightChild = 2 * current + 2;
      var best = current;

      if (leftChild < length && _comparesFavorable(leftChild, best)) {
        best = leftChild;
      }
      if (rightChild < length && _comparesFavorable(rightChild, best)) {
        best = rightChild;
      }

      if (best != current) {
        _swap(current, best);
        current = best;
      } else {
        break;
      }
    }
  }

  /// Comparison helper based on heap type
  bool _comparesFavorable(int aIndex, int bIndex) {
    if (isMaxHeap) {
      return _heap[aIndex].priority > _heap[bIndex].priority;
    } else {
      return _heap[aIndex].priority < _heap[bIndex].priority;
    }
  }

  void _swap(int i, int j) {
    final temp = _heap[i];
    _heap[i] = _heap[j];
    _heap[j] = temp;
  }

  /// Priority scoring formula specified by DAA project spec:
  /// - Expiry urgency: < 30 min (+50), < 60 min (+30)
  /// - Demand urgency: High demand (+20)
  /// - Quantity importance: Large quantity/weight (+10)
  static double calculateDonationPriority({
    required DateTime expiryTime,
    DateTime? now,
    bool isHighDemand = false,
    bool isLargeQuantity = false,
  }) {
    final currentTime = now ?? DateTime.now();
    final remainingMinutes = expiryTime.difference(currentTime).inMinutes;

    double score = 0.0;

    // 1. Expiry Urgency
    if (remainingMinutes <= 30 && remainingMinutes >= 0) {
      score += 50.0;
    } else if (remainingMinutes <= 60 && remainingMinutes > 30) {
      score += 30.0;
    } else if (remainingMinutes < 0) {
      // Already expired penalty
      score = 0.0;
      return score;
    } else {
      score += 10.0; // Standard shelf life
    }

    // 2. Demand Urgency
    if (isHighDemand) {
      score += 20.0;
    }

    // 3. Quantity Importance
    if (isLargeQuantity) {
      score += 10.0;
    }

    return score;
  }
}
