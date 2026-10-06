// ============================================================================
// MindMesh DAA Project - Breadth-First Search (BFS) & FIFO Queue
// Time Complexity: O(V + E) for BFS graph traversal
// Space Complexity: O(V) for visited set and FIFO queue
//
// Implemented from scratch in TypeScript without external libraries.
// ============================================================================

import { DijkstraGraph } from "./dijkstra";

export class MindMeshQueue<T> {
  private items: T[] = [];

  public enqueue(item: T): void {
    this.items.push(item);
  }

  public dequeue(): T | null {
    if (this.isEmpty) return null;
    return this.items.shift() ?? null;
  }

  public peek(): T | null {
    if (this.isEmpty) return null;
    return this.items[0];
  }

  get isEmpty(): boolean {
    return this.items.length === 0;
  }

  get isNotEmpty(): boolean {
    return this.items.length > 0;
  }

  get length(): number {
    return this.items.length;
  }

  public toList(): T[] {
    return [...this.items];
  }
}

export interface BFSResult {
  startNode: string;
  reachableNodes: Set<string>;
  hopDistances: Record<string, number>;
  isTargetReachable: boolean;
  traversalOrder: string[];
}

export class BFSChecker {
  public static checkReachability(
    graph: DijkstraGraph,
    startNode: string,
    targetNode?: string
  ): BFSResult {
    const visited = new Set<string>();
    const hopDistances: Record<string, number> = {};
    const queue = new MindMeshQueue<string>();
    const traversalOrder: string[] = [];

    if (!graph.adjacencyList.has(startNode)) {
      return {
        startNode,
        reachableNodes: visited,
        hopDistances,
        isTargetReachable: false,
        traversalOrder,
      };
    }

    visited.add(startNode);
    hopDistances[startNode] = 0;
    queue.enqueue(startNode);

    while (queue.isNotEmpty) {
      const current = queue.dequeue()!;
      traversalOrder.push(current);

      if (targetNode && current === targetNode) {
        break;
      }

      const neighbors = graph.adjacencyList.get(current) || [];
      for (const edge of neighbors) {
        const neighbor = edge.target;
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          hopDistances[neighbor] = (hopDistances[current] || 0) + 1;
          queue.enqueue(neighbor);
        }
      }
    }

    return {
      startNode,
      reachableNodes: visited,
      hopDistances,
      isTargetReachable: targetNode ? visited.has(targetNode) : true,
      traversalOrder,
    };
  }
}
