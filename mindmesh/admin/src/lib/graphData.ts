// ============================================================================
// MindMesh DAA Project - Campus & City Graph Data
// 15 Nodes, 28 Weighted Edges (Distances in Kilometers)
// Includes 2D Coordinates for SVG Canvas Visualization
// ============================================================================

import { DijkstraGraph } from "./engine/dijkstra";

export interface NodeCoordinate {
  id: string;
  name: string;
  type: "depot" | "provider" | "recipient" | "junction" | "landmark";
  x: number; // SVG canvas X (0 - 800)
  y: number; // SVG canvas Y (0 - 550)
  description: string;
}

export interface EdgeDefinition {
  source: string;
  target: string;
  distance: number;
}

export const GRAPH_NODES: NodeCoordinate[] = [
  { id: "DEPOT", name: "Central Depot", type: "depot", x: 400, y: 275, description: "Fleet Logistics & Dispatch Hub" },
  { id: "CANTEEN", name: "Campus Central Canteen", type: "provider", x: 260, y: 210, description: "Provider 1 (50 portions lunch)" },
  { id: "NORTH_CAFE", name: "North Hall Cafe", type: "provider", x: 180, y: 100, description: "Provider 2 (Bakery snacks)" },
  { id: "BAKERY", name: "East Quad Bakery", type: "provider", x: 620, y: 190, description: "Provider 3 (Fresh bread batches)" },
  { id: "NGO_ALPHA", name: "NGO Alpha", type: "recipient", x: 480, y: 440, description: "Recipient 1 (Demand: 30, Priority: 5)" },
  { id: "SHELTER_BETA", name: "Shelter Beta", type: "recipient", x: 670, y: 340, description: "Recipient 2 (Demand: 40, Priority: 4)" },
  { id: "HOSTEL_GAMMA", name: "Hostel Gamma", type: "recipient", x: 300, y: 70, description: "Recipient 3 (Demand: 20, Priority: 3)" },
  { id: "COMMUNITY_DELTA", name: "Community Center Delta", type: "recipient", x: 170, y: 460, description: "Recipient 4 (Demand: 25, Priority: 2)" },
  { id: "JUNCTION_A", name: "Junction A (West)", type: "junction", x: 250, y: 350, description: "West Transit Cross" },
  { id: "JUNCTION_B", name: "Junction B (Central)", type: "junction", x: 390, y: 180, description: "Central Ring Interchange" },
  { id: "JUNCTION_C", name: "Junction C (East)", type: "junction", x: 570, y: 260, description: "East Quad Boulevard" },
  { id: "JUNCTION_D", name: "Junction D (South)", type: "junction", x: 320, y: 470, description: "South Crossing" },
  { id: "STUDENT_HUB", name: "Student Transit Hub", type: "landmark", x: 500, y: 130, description: "Student Center Plaza" },
  { id: "LIBRARY_PLAZA", name: "Library Plaza", type: "landmark", x: 210, y: 160, description: "North Library Walkway" },
  { id: "SPORTS_COMPLEX", name: "Sports Complex", type: "landmark", x: 380, y: 390, description: "Athletic Fields Entrance" },
];

export const GRAPH_EDGES: EdgeDefinition[] = [
  // 1-4: Connections from DEPOT
  { source: "DEPOT", target: "JUNCTION_B", distance: 1.2 },
  { source: "DEPOT", target: "JUNCTION_A", distance: 1.8 },
  { source: "DEPOT", target: "CANTEEN", distance: 2.0 },
  { source: "DEPOT", target: "SPORTS_COMPLEX", distance: 2.5 },

  // 5-9: Canteen & North Area Connections
  { source: "CANTEEN", target: "JUNCTION_B", distance: 1.1 },
  { source: "CANTEEN", target: "LIBRARY_PLAZA", distance: 1.5 },
  { source: "NORTH_CAFE", target: "LIBRARY_PLAZA", distance: 0.9 },
  { source: "NORTH_CAFE", target: "HOSTEL_GAMMA", distance: 1.4 },
  { source: "LIBRARY_PLAZA", target: "HOSTEL_GAMMA", distance: 1.6 },

  // 10-13: Bakery & East Area
  { source: "BAKERY", target: "JUNCTION_C", distance: 1.0 },
  { source: "BAKERY", target: "STUDENT_HUB", distance: 1.3 },
  { source: "JUNCTION_C", target: "SHELTER_BETA", distance: 1.5 },
  { source: "JUNCTION_C", target: "JUNCTION_B", distance: 1.7 },

  // 14-16: Junction B (Central Hub)
  { source: "JUNCTION_B", target: "STUDENT_HUB", distance: 1.0 },
  { source: "JUNCTION_B", target: "NGO_ALPHA", distance: 1.8 },
  { source: "JUNCTION_B", target: "JUNCTION_A", distance: 1.4 },

  // 17-19: Junction A (West Sector)
  { source: "JUNCTION_A", target: "COMMUNITY_DELTA", distance: 1.3 },
  { source: "JUNCTION_A", target: "SPORTS_COMPLEX", distance: 2.1 },
  { source: "COMMUNITY_DELTA", target: "JUNCTION_D", distance: 1.2 },

  // 20-23: Junction D (South Sector) & NGO Alpha
  { source: "JUNCTION_D", target: "NGO_ALPHA", distance: 1.5 },
  { source: "JUNCTION_D", target: "SPORTS_COMPLEX", distance: 1.9 },
  { source: "NGO_ALPHA", target: "SHELTER_BETA", distance: 2.2 },
  { source: "NGO_ALPHA", target: "STUDENT_HUB", distance: 1.6 },

  // 24-25: Shelter Beta & Student Hub
  { source: "SHELTER_BETA", target: "STUDENT_HUB", distance: 1.4 },
  { source: "STUDENT_HUB", target: "HOSTEL_GAMMA", distance: 2.0 },

  // 26-28: Additional cross connections (Total 28 edges)
  { source: "HOSTEL_GAMMA", target: "JUNCTION_A", distance: 2.8 },
  { source: "NORTH_CAFE", target: "JUNCTION_B", distance: 2.4 },
  { source: "BAKERY", target: "SHELTER_BETA", distance: 2.1 },
];

/**
 * Builds an initialized DijkstraGraph instance with all 28 edges
 */
export function buildMindMeshGraph(): DijkstraGraph {
  const graph = new DijkstraGraph();
  for (const edge of GRAPH_EDGES) {
    graph.addEdge(edge.source, edge.target, edge.distance, true);
  }
  return graph;
}
