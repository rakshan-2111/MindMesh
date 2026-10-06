// ============================================================================
// MindMesh DAA Project - Priority Queue (Binary Max/Min Heap)
// Time Complexity:
//   - Insert: O(log n)
//   - Extract: O(log n)
//   - Peek: O(1)
// Space Complexity: O(n)
//
// Implemented from scratch in TypeScript without external libraries.
// ============================================================================

export interface PriorityItem<T> {
  data: T;
  priority: number;
}

export class MindMeshPriorityQueue<T> {
  private heap: PriorityItem<T>[] = [];
  public readonly isMaxHeap: boolean;

  constructor(isMaxHeap: boolean = true) {
    this.isMaxHeap = isMaxHeap;
  }

  get size(): number {
    return this.heap.length;
  }

  get isEmpty(): boolean {
    return this.heap.length === 0;
  }

  get isNotEmpty(): boolean {
    return this.heap.length > 0;
  }

  /**
   * Inserts a new element with a priority score into the heap. O(log n)
   */
  public insert(data: T, priority: number): void {
    const item: PriorityItem<T> = { data, priority };
    this.heap.push(item);
    this.siftUp(this.heap.length - 1);
  }

  /**
   * Peeks at the top element without removing it. O(1)
   */
  public peek(): PriorityItem<T> | null {
    if (this.isEmpty) return null;
    return this.heap[0];
  }

  /**
   * Extracts and returns root element (highest priority in MaxHeap). O(log n)
   */
  public extract(): PriorityItem<T> | null {
    if (this.isEmpty) return null;
    if (this.heap.length === 1) {
      return this.heap.pop()!;
    }

    const root = this.heap[0];
    this.heap[0] = this.heap.pop()!;
    this.siftDown(0);
    return root;
  }

  /**
   * Returns copy of internal heap items for visualization
   */
  public toList(): PriorityItem<T>[] {
    return [...this.heap];
  }

  private siftUp(index: number): void {
    let current = index;
    while (current > 0) {
      const parent = Math.floor((current - 1) / 2);
      if (this.comparesFavorable(current, parent)) {
        this.swap(current, parent);
        current = parent;
      } else {
        break;
      }
    }
  }

  private siftDown(index: number): void {
    let current = index;
    const length = this.heap.length;

    while (true) {
      const leftChild = 2 * current + 1;
      const rightChild = 2 * current + 2;
      let best = current;

      if (leftChild < length && this.comparesFavorable(leftChild, best)) {
        best = leftChild;
      }
      if (rightChild < length && this.comparesFavorable(rightChild, best)) {
        best = rightChild;
      }

      if (best !== current) {
        this.swap(current, best);
        current = best;
      } else {
        break;
      }
    }
  }

  private comparesFavorable(aIndex: number, bIndex: number): boolean {
    if (this.isMaxHeap) {
      return this.heap[aIndex].priority > this.heap[bIndex].priority;
    } else {
      return this.heap[aIndex].priority < this.heap[bIndex].priority;
    }
  }

  private swap(i: number, j: number): void {
    const temp = this.heap[i];
    this.heap[i] = this.heap[j];
    this.heap[j] = temp;
  }

  /**
   * Priority scoring formula specified by DAA project spec:
   * - Expiry urgency: < 30 min (+50), < 60 min (+30)
   * - Demand urgency: High demand (+20)
   * - Quantity importance: Large quantity/weight (+10)
   */
  public static calculateDonationPriority(params: {
    expiryTime: Date | string;
    now?: Date;
    isHighDemand?: boolean;
    isLargeQuantity?: boolean;
  }): number {
    const currentTime = params.now ?? new Date();
    const expiry = typeof params.expiryTime === 'string' ? new Date(params.expiryTime) : params.expiryTime;
    const remainingMinutes = (expiry.getTime() - currentTime.getTime()) / (1000 * 60);

    let score = 0;

    // 1. Expiry Urgency
    if (remainingMinutes <= 30 && remainingMinutes >= 0) {
      score += 50;
    } else if (remainingMinutes <= 60 && remainingMinutes > 30) {
      score += 30;
    } else if (remainingMinutes < 0) {
      return 0; // Already expired
    } else {
      score += 10;
    }

    // 2. Demand Urgency
    if (params.isHighDemand) {
      score += 20;
    }

    // 3. Quantity Importance
    if (params.isLargeQuantity) {
      score += 10;
    }

    return score;
  }
}
