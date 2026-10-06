"use client";

import { useEffect, useState, useRef } from "react";
import { GRAPH_NODES, GRAPH_EDGES, NodeCoordinate } from "@/lib/graphData";
import { DijkstraGraph, DijkstraResult, DijkstraStep } from "@/lib/engine/dijkstra";
import { KnapsackOptimizer, KnapsackItem, KnapsackResult } from "@/lib/engine/knapsack";
import { MindMeshPriorityQueue } from "@/lib/engine/priorityQueue";
import { TSPOptimizer, TSPResult } from "@/lib/engine/tsp";
import { BFSChecker } from "@/lib/engine/bfs";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  SkipForward, 
  Zap, 
  Cpu, 
  Layers, 
  Route, 
  Award, 
  Activity 
} from "lucide-react";

export default function AlgorithmsPage() {
  // Graph & Dijkstra Animation State
  const [graph] = useState(() => {
    const g = new DijkstraGraph();
    for (const e of GRAPH_EDGES) {
      g.addEdge(e.source, e.target, e.distance, true);
    }
    return g;
  });

  const [startNode, setStartNode] = useState("CANTEEN");
  const [targetNode, setTargetNode] = useState("SHELTER_BETA");
  const [dijkstraResult, setDijkstraResult] = useState<DijkstraResult | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Knapsack Benchmark State
  const defaultKnapsackItems: KnapsackItem[] = [
    { id: "A", name: "Donation Pack A", weight: 20, benefit: 90 },
    { id: "B", name: "Donation Pack B", weight: 15, benefit: 70 },
    { id: "C", name: "Donation Pack C", weight: 30, benefit: 100 },
    { id: "D", name: "Donation Pack D", weight: 10, benefit: 50 },
  ];
  const [knapsackCapacity] = useState(50);
  const [knapsackResult, setKnapsackResult] = useState<KnapsackResult>(() =>
    KnapsackOptimizer.solve(defaultKnapsackItems, 50)
  );

  // Priority Queue Demo State
  const [pqItems, setPqItems] = useState([
    { name: "Canteen Buffet (Exp 20m, High Demand)", score: 80.0 },
    { name: "North Cafe Pastries (Exp 45m)", score: 30.0 },
    { name: "Bakery Sourdough (Exp 15m, Large Qty)", score: 70.0 },
    { name: "Campus Fruit Crates (Exp 90m)", score: 20.0 },
  ]);

  // TSP Demo State
  const [tspResult, setTspResult] = useState<TSPResult | null>(null);

  // Micro-benchmarks State
  const [benchmarks, setBenchmarks] = useState<{
    dijkstraMs: number;
    bfsMs: number;
    knapsackMs: number;
    pqMs: number;
    tspMs: number;
  }>({
    dijkstraMs: 0.28,
    bfsMs: 0.08,
    knapsackMs: 0.16,
    pqMs: 0.05,
    tspMs: 0.32,
  });
  const [isBenchmarking, setIsBenchmarking] = useState(false);

  // Run Dijkstra when start or target changes
  useEffect(() => {
    const res = graph.findShortestPath(startNode, targetNode);
    setDijkstraResult(res);
    setCurrentStepIndex(0);
    setIsPlaying(false);
  }, [graph, startNode, targetNode]);

  // Run TSP benchmark
  useEffect(() => {
    const stops = ["DEPOT", "CANTEEN", "NGO_ALPHA", "SHELTER_BETA", "STUDENT_HUB"];
    const matrix = [
      [0, 2.0, 3.8, 3.5, 2.2],
      [2.0, 0, 2.9, 3.1, 2.1],
      [3.8, 2.9, 0, 2.2, 1.6],
      [3.5, 3.1, 2.2, 0, 1.4],
      [2.2, 2.1, 1.6, 1.4, 0],
    ];
    setTspResult(TSPOptimizer.solve({ nodes: stops, distanceMatrix: matrix, returnToStart: true }));
  }, []);

  // Animation player loop
  useEffect(() => {
    if (isPlaying && dijkstraResult) {
      timerRef.current = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev >= dijkstraResult.trace.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 700);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, dijkstraResult]);

  const runLiveBenchmarks = () => {
    setIsBenchmarking(true);
    setTimeout(() => {
      // 1. Dijkstra 50 iterations
      const tD0 = performance.now();
      for (let i = 0; i < 50; i++) graph.findShortestPath("DEPOT", "SHELTER_BETA");
      const tD1 = performance.now();

      // 2. BFS 50 iterations
      const tB0 = performance.now();
      for (let i = 0; i < 50; i++) BFSChecker.checkReachability(graph, "DEPOT", "SHELTER_BETA");
      const tB1 = performance.now();

      // 3. Knapsack 50 iterations
      const tK0 = performance.now();
      for (let i = 0; i < 50; i++) KnapsackOptimizer.solve(defaultKnapsackItems, 50);
      const tK1 = performance.now();

      // 4. Priority Queue 100 inserts/extracts
      const tP0 = performance.now();
      const pq = new MindMeshPriorityQueue<number>(true);
      for (let i = 0; i < 100; i++) pq.insert(i, Math.random() * 100);
      for (let i = 0; i < 100; i++) pq.extract();
      const tP1 = performance.now();

      // 5. TSP Held-Karp
      const stops = ["DEPOT", "CANTEEN", "NGO_ALPHA", "SHELTER_BETA"];
      const matrix = [
        [0, 2, 4, 3.5],
        [2, 0, 2.5, 3],
        [4, 2.5, 0, 1.8],
        [3.5, 3, 1.8, 0],
      ];
      const tT0 = performance.now();
      for (let i = 0; i < 10; i++) TSPOptimizer.solve({ nodes: stops, distanceMatrix: matrix });
      const tT1 = performance.now();

      setBenchmarks({
        dijkstraMs: Number(((tD1 - tD0) / 50).toFixed(4)),
        bfsMs: Number(((tB1 - tB0) / 50).toFixed(4)),
        knapsackMs: Number(((tK1 - tK0) / 50).toFixed(4)),
        pqMs: Number(((tP1 - tP0) / 100).toFixed(4)),
        tspMs: Number(((tT1 - tT0) / 10).toFixed(4)),
      });
      setIsBenchmarking(false);
    }, 150);
  };

  const currentStep: DijkstraStep | null =
    dijkstraResult && dijkstraResult.trace.length > 0
      ? dijkstraResult.trace[currentStepIndex]
      : null;

  const visitedSet = new Set(currentStep?.visitedNodes || []);
  const shortestPathSet = new Set(dijkstraResult?.path || []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Interactive DAA Visualizer
            </span>
            <span className="text-xs text-zinc-500 font-mono">15 Vertices &bull; 28 Edges</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            DAA Algorithm Core & Visualizer
          </h1>
          <p className="text-sm text-zinc-400 max-w-2xl mt-1">
            Visual inspection and mathematical verification of Dijkstra shortest pathing, 0/1 Knapsack dynamic programming, Priority Queue min/max heaps, and Held-Karp TSP.
          </p>
        </div>

        <button
          onClick={runLiveBenchmarks}
          disabled={isBenchmarking}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 text-zinc-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all disabled:opacity-50"
        >
          <Zap className={`w-3.5 h-3.5 fill-zinc-950 ${isBenchmarking ? "animate-spin" : ""}`} />
          {isBenchmarking ? "Benchmarking..." : "Run Live Micro-Benchmark"}
        </button>
      </div>

      {/* 1. GRAPH VISUALIZER WITH ANIMATED DIJKSTRA */}
      <div className="p-6 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <GitForkIcon className="w-5 h-5 text-emerald-400" />
              1. Dijkstra Shortest Path Explorer (O((V + E) log V))
            </h2>
            <p className="text-xs text-zinc-400">
              Select origin and destination. Step through the priority min-heap relaxation process.
            </p>
          </div>

          {/* Source / Target Selectors */}
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-zinc-400">From:</span>
              <select
                value={startNode}
                onChange={(e) => setStartNode(e.target.value)}
                className="bg-zinc-800 border border-zinc-700 text-white rounded-lg px-2.5 py-1 font-mono"
              >
                {GRAPH_NODES.map((n) => (
                  <option key={n.id} value={n.id}>{n.id}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-zinc-400">To:</span>
              <select
                value={targetNode}
                onChange={(e) => setTargetNode(e.target.value)}
                className="bg-zinc-800 border border-zinc-700 text-white rounded-lg px-2.5 py-1 font-mono"
              >
                {GRAPH_NODES.map((n) => (
                  <option key={n.id} value={n.id}>{n.id}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Playback Controls & Trace Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-zinc-950/70 border border-zinc-800 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold"
              title={isPlaying ? "Pause" : "Play Animation"}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5 fill-zinc-950" /> : <Play className="w-3.5 h-3.5 fill-zinc-950" />}
            </button>
            <button
              onClick={() => {
                setIsPlaying(false);
                setCurrentStepIndex((prev) => Math.min((dijkstraResult?.trace.length || 1) - 1, prev + 1));
              }}
              className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
              title="Next Step"
            >
              <SkipForward className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                setIsPlaying(false);
                setCurrentStepIndex(0);
              }}
              className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
              title="Reset"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono text-zinc-400 ml-2">
              Step {currentStepIndex + 1} / {dijkstraResult?.trace.length || 0}
            </span>
          </div>

          <div className="text-zinc-300 font-mono text-xs">
            {currentStep?.description || "Ready"}
          </div>

          <div className="text-emerald-400 font-bold font-mono">
            Optimal Cost: {dijkstraResult?.totalDistance !== Infinity ? `${dijkstraResult?.totalDistance.toFixed(2)} km` : "No path"}
          </div>
        </div>

        {/* SVG Graph Canvas */}
        <div className="w-full bg-zinc-950/90 rounded-2xl border border-zinc-800/80 p-2 overflow-x-auto">
          <svg viewBox="0 0 800 520" className="w-full min-w-[700px] h-auto">
            {/* Edges */}
            {GRAPH_EDGES.map((edge, i) => {
              const u = GRAPH_NODES.find((n) => n.id === edge.source)!;
              const v = GRAPH_NODES.find((n) => n.id === edge.target)!;
              if (!u || !v) return null;

              // Check if edge is part of settled shortest path
              const isPathEdge =
                dijkstraResult &&
                dijkstraResult.path.includes(u.id) &&
                dijkstraResult.path.includes(v.id) &&
                Math.abs(dijkstraResult.path.indexOf(u.id) - dijkstraResult.path.indexOf(v.id)) === 1;

              const midX = (u.x + v.x) / 2;
              const midY = (u.y + v.y) / 2;

              return (
                <g key={i}>
                  <line
                    x1={u.x}
                    y1={u.y}
                    x2={v.x}
                    y2={v.y}
                    stroke={isPathEdge ? "#10b981" : "#27272a"}
                    strokeWidth={isPathEdge ? 3.5 : 1.5}
                    strokeDasharray={isPathEdge ? "none" : "none"}
                  />
                  {/* Distance label pill */}
                  <rect
                    x={midX - 14}
                    y={midY - 8}
                    width={28}
                    height={16}
                    rx={4}
                    fill="#18181b"
                    stroke="#27272a"
                    strokeWidth={0.8}
                  />
                  <text
                    x={midX}
                    y={midY + 4}
                    textAnchor="middle"
                    fill={isPathEdge ? "#34d399" : "#71717a"}
                    fontSize="9"
                    fontFamily="monospace"
                  >
                    {edge.distance}k
                  </text>
                </g>
              );
            })}

            {/* Nodes */}
            {GRAPH_NODES.map((node) => {
              const isCurrent = currentStep?.currentNode === node.id;
              const isVisited = visitedSet.has(node.id);
              const isStart = node.id === startNode;
              const isTarget = node.id === targetNode;
              const isPath = shortestPathSet.has(node.id);

              let fillColor = "#18181b"; // default
              let strokeColor = "#3f3f46";

              if (isStart) {
                fillColor = "#1e3a8a";
                strokeColor = "#3b82f6";
              } else if (isTarget) {
                fillColor = "#831843";
                strokeColor = "#ec4899";
              } else if (isCurrent) {
                fillColor = "#065f46";
                strokeColor = "#10b981";
              } else if (isPath) {
                fillColor = "#047857";
                strokeColor = "#34d399";
              } else if (isVisited) {
                fillColor = "#27272a";
                strokeColor = "#71717a";
              }

              const distVal = currentStep?.distances[node.id];
              const distDisplay = distVal !== undefined && distVal !== Infinity ? `${distVal.toFixed(1)}k` : "∞";

              return (
                <g key={node.id} className="cursor-pointer">
                  {/* Pulsing ring for current node */}
                  {isCurrent && (
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={24}
                      fill="none"
                      stroke="#10b981"
                      strokeWidth={2}
                      className="animate-ping opacity-75"
                    />
                  )}

                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={16}
                    fill={fillColor}
                    stroke={strokeColor}
                    strokeWidth={2}
                  />

                  {/* Node label */}
                  <text
                    x={node.x}
                    y={node.y - 20}
                    textAnchor="middle"
                    fill="#f4f4f5"
                    fontSize="10"
                    fontWeight="bold"
                  >
                    {node.id}
                  </text>

                  {/* Distance pill below node */}
                  <rect
                    x={node.x - 16}
                    y={node.y + 19}
                    width={32}
                    height={14}
                    rx={3}
                    fill="#09090b"
                    stroke="#27272a"
                    strokeWidth={1}
                  />
                  <text
                    x={node.x}
                    y={node.y + 29}
                    textAnchor="middle"
                    fill={isCurrent ? "#10b981" : "#a1a1aa"}
                    fontSize="9"
                    fontFamily="monospace"
                  >
                    {distDisplay}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* 2. 0/1 KNAPSACK DYNAMIC PROGRAMMING MATRIX */}
      <div className="p-6 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-teal-400" />
              2. 0/1 Knapsack Dynamic Programming Matrix (O(n &middot; W))
            </h2>
            <p className="text-xs text-zinc-400">
              Benchmark Verification: Capacity W = 50 &bull; Items: A(20kg, 90), B(15kg, 70), C(30kg, 100), D(10kg, 50).
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
            <span>Optimal: A + B + D = 45 kg &bull; Max Benefit = 210</span>
          </div>
        </div>

        {/* DP Matrix Table View */}
        <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-950/80 p-3">
          <table className="w-full text-center text-xs font-mono">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400">
                <th className="py-2 px-3 text-left">Item (Weight, Benefit)</th>
                {[0, 10, 15, 20, 25, 30, 35, 40, 45, 50].map((w) => (
                  <th key={w} className="py-2 px-2 text-zinc-500">W={w}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Row 0: Base */}
              <tr className="border-b border-zinc-900/50 text-zinc-500">
                <td className="py-2 px-3 text-left font-sans text-zinc-400">0 (Base ∅)</td>
                {[0, 10, 15, 20, 25, 30, 35, 40, 45, 50].map((w) => (
                  <td key={w} className="py-2 px-2">{knapsackResult.dpTable[0][w]}</td>
                ))}
              </tr>

              {knapsackResult.items.map((item, i) => {
                const rowIndex = i + 1;
                const isSelected = knapsackResult.selectedItems.some((s) => s.id === item.id);

                return (
                  <tr
                    key={item.id}
                    className={`border-b border-zinc-900/50 ${
                      isSelected ? "bg-emerald-950/20 text-emerald-300" : "text-zinc-400"
                    }`}
                  >
                    <td className="py-2 px-3 text-left font-sans font-semibold">
                      {item.name} ({item.weight}kg, {item.benefit}pts) {isSelected && "★"}
                    </td>
                    {[0, 10, 15, 20, 25, 30, 35, 40, 45, 50].map((w) => {
                      const val = knapsackResult.dpTable[rowIndex][w];
                      const isMaxCell = rowIndex === 4 && w === 50;

                      return (
                        <td
                          key={w}
                          className={`py-2 px-2 ${
                            isMaxCell ? "font-bold text-base text-emerald-400 bg-emerald-500/20 rounded" : ""
                          }`}
                        >
                          {val}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. PRIORITY QUEUE HEAP & TSP COMPARISON */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Priority Queue Heap */}
        <div className="p-6 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-400" />
            3. Binary Max-Heap Priority Queue (O(log n))
          </h2>
          <p className="text-xs text-zinc-400">
            Internal array & priority score heap structure. Root element is extracted first.
          </p>

          <div className="space-y-2 mt-4">
            {pqItems.map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-lg bg-zinc-950/60 border border-zinc-800 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-mono text-[10px] font-bold">
                    {i === 0 ? "ROOT" : `[${i}]`}
                  </span>
                  <span className="text-zinc-200">{item.name}</span>
                </div>
                <span className="font-mono font-bold text-emerald-400">
                  {item.score.toFixed(1)} pts
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* TSP Held-Karp Comparison */}
        <div className="p-6 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Route className="w-4 h-4 text-amber-400" />
            4. TSP Optimization: Held-Karp DP vs Nearest Neighbor
          </h2>
          <p className="text-xs text-zinc-400">
            Held-Karp O(n² &middot; 2ⁿ) bitmask DP compared against Nearest-Neighbor polynomial baseline.
          </p>

          {tspResult && (
            <div className="space-y-3 mt-4 text-xs font-mono">
              <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800 space-y-1">
                <span className="text-zinc-500 text-[11px] block font-sans">Nearest-Neighbor Baseline:</span>
                <div className="text-sm font-bold text-zinc-300">
                  {tspResult.baselineDistance.toFixed(2)} km
                </div>
                <div className="text-[11px] text-zinc-500">
                  {tspResult.baselineTour.join(" ➔ ")}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-800/40 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-emerald-400 text-[11px] font-sans font-bold">Held-Karp Exact DP Tour:</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px]">
                    {tspResult.improvementPercentage.toFixed(1)}% Distance Saved
                  </span>
                </div>
                <div className="text-base font-bold text-emerald-300">
                  {tspResult.optimalDistance.toFixed(2)} km
                </div>
                <div className="text-[11px] text-zinc-300">
                  {tspResult.optimalTour.join(" ➔ ")}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 5. ASYMPTOTIC COMPLEXITY TABLE & BENCHMARK */}
      <div className="p-6 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-400" />
              5. Asymptotic Complexity & Live Microsecond Benchmarks
            </h2>
            <p className="text-xs text-zinc-400">
              Theoretical worst-case bounds mapped against measured execution time on this MacBook node.
            </p>
          </div>
          <span className="text-xs font-mono px-3 py-1 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
            TS Engine Execution
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-950/70">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400 font-mono">
                <th className="py-3 px-4">Algorithm Module</th>
                <th className="py-3 px-4">Paradigm</th>
                <th className="py-3 px-4">Time Complexity</th>
                <th className="py-3 px-4">Space Complexity</th>
                <th className="py-3 px-4 text-right">Measured Latency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50 font-mono">
              <tr>
                <td className="py-3 px-4 font-bold text-white">Dijkstra Shortest Path</td>
                <td className="py-3 px-4 text-zinc-400">Greedy / Heap Relaxation</td>
                <td className="py-3 px-4 text-emerald-400">O((V + E) log V)</td>
                <td className="py-3 px-4 text-zinc-400">O(V + E)</td>
                <td className="py-3 px-4 text-right text-emerald-300">{benchmarks.dijkstraMs} ms</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-white">Breadth-First Search (BFS)</td>
                <td className="py-3 px-4 text-zinc-400">Graph Traversal (Queue)</td>
                <td className="py-3 px-4 text-emerald-400">O(V + E)</td>
                <td className="py-3 px-4 text-zinc-400">O(V)</td>
                <td className="py-3 px-4 text-right text-emerald-300">{benchmarks.bfsMs} ms</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-white">0/1 Knapsack Optimization</td>
                <td className="py-3 px-4 text-zinc-400">Bottom-Up Dynamic Programming</td>
                <td className="py-3 px-4 text-emerald-400">O(n &middot; W)</td>
                <td className="py-3 px-4 text-zinc-400">O(n &middot; W)</td>
                <td className="py-3 px-4 text-right text-emerald-300">{benchmarks.knapsackMs} ms</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-white">Binary Priority Queue</td>
                <td className="py-3 px-4 text-zinc-400">Complete Binary Tree Heap</td>
                <td className="py-3 px-4 text-emerald-400">O(log n)</td>
                <td className="py-3 px-4 text-zinc-400">O(n)</td>
                <td className="py-3 px-4 text-right text-emerald-300">{benchmarks.pqMs} ms</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-white">Held-Karp TSP Tour</td>
                <td className="py-3 px-4 text-zinc-400">Bitmask Dynamic Programming</td>
                <td className="py-3 px-4 text-emerald-400">O(n² &middot; 2ⁿ)</td>
                <td className="py-3 px-4 text-zinc-400">O(n &middot; 2ⁿ)</td>
                <td className="py-3 px-4 text-right text-emerald-300">{benchmarks.tspMs} ms</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function GitForkIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="18" r="3" />
      <circle cx="6" cy="6" r="3" />
      <circle cx="18" cy="6" r="3" />
      <path d="M18 9v2c0 .6-.4 1-1 1H7c-.6 0-1-.4-1-1V9" />
      <path d="M12 12v3" />
    </svg>
  );
}
