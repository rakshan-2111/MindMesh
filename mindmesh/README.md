# MindMesh: Distributed Food Waste Redistribution & Route Optimization

> **DAA Course Project (CIA-3 / Final Evaluation)**  
> A multi-device distributed system demonstrating core algorithm designs: Priority Queues, Greedy Allocation, 0/1 Knapsack Dynamic Programming, Dijkstra's Shortest Path, and Held-Karp Traveling Salesperson Optimization.

---

## 1. System Architecture & 3-Device Concept

MindMesh orchestrates three devices in real-time over Supabase PostgreSQL & Realtime replication:

1. **Android Phone (`Provider App`)**:
   - Used by restaurant/canteen staff.
   - Posts food donation batches (food name, portion count, weight in kg, expiry minutes, pickup location node).
   - Live status timeline (Posted &rarr; Matched &rarr; Volunteer Assigned &rarr; Collected &rarr; Delivered).

2. **MacBook (`Control Center & DAA Engine`)**:
   - Web application built with **Next.js (App Router)** + **Tailwind CSS**.
   - Runs the pure TypeScript optimization pipeline upon donation arrival or state change.
   - Houses the **Interactive DAA Engine Visualizer**:
     - Animated Dijkstra exploration player on the 15-node, 28-edge campus graph.
     - 0/1 Knapsack Dynamic Programming table highlighting optimal sub-problem cell values.
     - Binary Max-Heap Priority Queue visualizer.
     - Held-Karp $O(n^2 \cdot 2^n)$ TSP Tour vs Nearest-Neighbor baseline comparison.
     - Live microsecond benchmark execution table.
   - Provides a live toggle for recipients (`AVAILABLE` &harr; `UNAVAILABLE`) triggering dynamic re-optimization in &lt; 2 ms!

3. **iPhone (`Volunteer Courier App`)**:
   - Single-codebase Flutter application running in Volunteer Courier mode.
   - Real-time notification of dispatch assignments.
   - Inspects pickup origin, target recipient demands, vehicle capacity gauge (50 kg), and optimal waypoint sequence.
   - Turn-by-turn route view with "FOOD COLLECTED" and "FOOD DELIVERED" confirmation triggers.
   - **Dynamic Re-optimization Alert**: Displays an animated **"Assignment Updated"** banner whenever the MacBook dashboard marks a recipient unavailable!

---

## 2. DAA Algorithm Mapping & Theoretical Complexities

All algorithms are implemented **from scratch** with zero third-party algorithm libraries, in both **TypeScript** (MacBook Engine) and **Dart** (Mobile Engine):

| # | Algorithm Module | Paradigm | Time Complexity | Space Complexity | TypeScript Implementation | Dart Implementation |
|---|---|---|---|---|---|---|
| **1** | **Priority Queue** | Complete Binary Heap | $O(\log n)$ insert / extract | $O(n)$ | [`priorityQueue.ts`](admin/src/lib/engine/priorityQueue.ts) | [`priority_queue.dart`](mobile/lib/algorithms/priority_queue.dart) |
| **2** | **Greedy Allocator** | Greedy Heuristic | $O(R \log R)$ | $O(R)$ | [`greedy.ts`](admin/src/lib/engine/greedy.ts) | [`greedy_allocator.dart`](mobile/lib/algorithms/greedy_allocator.dart) |
| **3** | **0/1 Knapsack** | Dynamic Programming | $O(n \cdot W)$ | $O(n \cdot W)$ | [`knapsack.ts`](admin/src/lib/engine/knapsack.ts) | [`knapsack.dart`](mobile/lib/algorithms/knapsack.dart) |
| **4** | **Dijkstra Pathfinding** | Min-Heap Relaxation | $O((V + E) \log V)$ | $O(V + E)$ | [`dijkstra.ts`](admin/src/lib/engine/dijkstra.ts) | [`dijkstra.dart`](mobile/lib/algorithms/dijkstra.dart) |
| **5** | **Held-Karp TSP** | Bitmask Dynamic Programming | $O(n^2 \cdot 2^n)$ | $O(n \cdot 2^n)$ | [`tsp.ts`](admin/src/lib/engine/tsp.ts) | [`tsp.dart`](mobile/lib/algorithms/tsp.dart) |
| **6** | **BFS Reachability** | Breadth-First Search | $O(V + E)$ | $O(V)$ | [`bfs.ts`](admin/src/lib/engine/bfs.ts) | [`bfs.dart`](mobile/lib/algorithms/bfs.dart) |

### Mathematical Specifications:
- **Priority Urgency Score Formula**:
  $$\text{Score} = \text{ExpiryBonus} (<30\text{m} \rightarrow +50, <60\text{m} \rightarrow +30) + \text{DemandBonus} (+20) + \text{QuantityBonus} (\ge 20\text{kg} \rightarrow +10)$$
- **0/1 Knapsack Canonical Benchmark**:
  Vehicle Capacity $W = 50\text{ kg}$. Items: $A(20\text{kg}, 90)$, $B(15\text{kg}, 70)$, $C(30\text{kg}, 100)$, $D(10\text{kg}, 50)$.
  $$\text{Optimal choice} = \{A, B, D\}, \quad \text{Total Weight} = 45\text{ kg}, \quad \text{Maximum Benefit} = 210$$
- **Held-Karp DP Recurrence**:
  $$\text{memo}[\text{mask}][v] = \min_{u \in \text{mask} \setminus \{v\}} \left( \text{memo}[\text{mask} \oplus (1 \ll v)][u] + \text{dist}(u, v) \right)$$

---

## 3. Repository Layout

```
mindmesh/
├── mobile/                                   # Flutter Codebase (Android & iOS)
│   ├── lib/
│   │   ├── main.dart                         # Entrypoint & theme
│   │   ├── models/                           # User, Donation, Recipient, Volunteer, Assignment
│   │   ├── algorithms/                       # Pure Dart DAA modules
│   │   │   ├── priority_queue.dart           # Binary Heap + Urgency formula
│   │   │   ├── greedy_allocator.dart         # Multi-recipient demand matching
│   │   │   ├── knapsack.dart                 # 0/1 Knapsack DP + 2D matrix export
│   │   │   ├── dijkstra.dart                 # Shortest path + step trace
│   │   │   ├── tsp.dart                      # Held-Karp bitmask DP + Nearest-Neighbor
│   │   │   └── bfs.dart                      # Graph reachability & FIFO queue
│   │   ├── services/
│   │   │   └── supabase_service.dart         # Realtime streams + local demo state
│   │   ├── screens/
│   │   │   ├── login_screen.dart             # Role Switcher (Android Provider / iPhone Volunteer)
│   │   │   ├── provider/                     # Dashboard, Create Donation, Timeline
│   │   │   └── volunteer/                    # Dashboard, Assignment Details, Route View
│   │   └── widgets/
│   └── test/
│       └── algorithm_test.dart               # Complete unit test suite for all 6 algorithms
├── admin/                                    # Control Center Dashboard (Next.js 16)
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx                      # Command Center & Live Multi-Device Feed
│   │   │   ├── algorithms/page.tsx           # Interactive Graph, Knapsack Table, Complexity Table
│   │   │   ├── optimization/page.tsx         # 5-Stage Animated Stepper
│   │   │   ├── recipients/page.tsx           # Recipient availability toggle (Dynamic Re-opt)
│   │   │   ├── donations/page.tsx            # Donations ledger & Provider simulation
│   │   │   └── volunteers/page.tsx           # Volunteer fleet & status
│   │   ├── components/Navbar.tsx             # Header navigation & realtime status
│   │   ├── services/dataService.ts           # State orchestration & activity logging
│   │   └── lib/
│   │       ├── supabase.ts                   # Supabase client & fallback detector
│   │       ├── graphData.ts                  # 15 nodes, 28 edges & SVG coordinates
│   │       └── engine/                       # Pure TypeScript DAA modules
│   └── test/
│       └── algorithm.test.ts                 # TypeScript algorithm test suite
├── supabase/
│   ├── schema.sql                            # Tables, RLS demo policies & Realtime publication
│   └── seed.sql                              # 1 depot, 3 providers, 4 recipients, 2 volunteers, 28 edges
└── README.md
```

---

## 4. Setup Instructions

### Prerequisites
- Node.js &ge; 20 (Node 22 installed)
- Flutter SDK &ge; 3.13 (installed)
- Optional: Free Supabase Project ([supabase.com](https://supabase.com))

### A. Supabase Database Setup
1. In your Supabase project dashboard, open the **SQL Editor**.
2. Run the SQL script in [`supabase/schema.sql`](supabase/schema.sql).
3. Run the SQL script in [`supabase/seed.sql`](supabase/seed.sql).
4. Note your Project URL and Anon Public API Key.

> **Note on Presentation Reliability**: MindMesh comes with a built-in in-memory fallback state matching the seed data. If Supabase is not configured, both mobile and web dashboard operate seamlessly in standalone demo mode!

### B. Admin Web Dashboard (Next.js)
```bash
cd mindmesh/admin

# Install dependencies (already completed)
npm install

# (Optional) Add your Supabase credentials:
cp .env.example .env.local
# Edit .env.local with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY

# Run tests
npm test

# Start development server
npm run dev
# Open http://localhost:3000 in your browser
```

### C. Mobile App (Flutter for Android & iOS)
```bash
cd mindmesh/mobile

# Run the Dart unit test suite
flutter test

# Run code analyzer (0 errors)
flutter analyze

# Launch on connected Android device (Provider)
flutter run -d <android-device-id>

# Launch on connected iPhone / Simulator (Volunteer)
flutter run -d <iphone-device-id>
```

---

## 5. End-to-End Live Demo Script (3 Devices)

Follow this 5-minute script to demonstrate the system:

1. **Step 1: System Boot**
   - Open **MacBook**: Launch Dashboard at `http://localhost:3000`. Show the 6 stat cards, graph nodes, and empty/ready activity feed.
   - Open **Android Phone**: Select "Android Phone: Food Provider" on the login screen.
   - Open **iPhone**: Select "iPhone: Volunteer Courier" on the login screen.

2. **Step 2: Post Donation on Android**
   - On the Android device, tap **"POST FOOD DONATION"**.
   - Enter: "Fresh Lunch Buffet Trays", 50 portions, 25 kg, 45 mins expiry, location "Campus Central Canteen" (`CANTEEN`).
   - Tap **"POST DONATION & TRIGGER ENGINE"**.
   - Notice the status timeline immediately indicates "Posted &rarr; Matched".

3. **Step 3: Realtime Optimization on MacBook Control Center**
   - The MacBook Live Activity Feed displays in real-time:
     - `Android posted Donation #... (50 portions)`
     - `Priority Queue evaluating score (Result: 60 pts)`
     - `Greedy Recipient Matching: Matched NGO Alpha (30) & Shelter Beta (20)`
     - `0/1 Knapsack packed 25kg into carrier payload (Benefit: 170 pts)`
     - `Dijkstra & TSP optimal tour: DEPOT ➔ CANTEEN ➔ NGO_ALPHA ➔ SHELTER_BETA (5.6 km)`
     - `iPhone assigned to volunteer Alex Chen`
   - Switch to the **Pipeline Stepper** (`/optimization`) and show each algorithm's input/output breakdown.
   - Switch to **DAA Engine** (`/algorithms`) and click the **Play** button to show animated Dijkstra pathfinding step-by-step!

4. **Step 4: Volunteer iPhone Dispatched & Accepted**
   - The iPhone displays the new task: "NGO Alpha (30) & Shelter Beta (20)".
   - Tap to inspect **Assignment Details**.
   - Tap **"ACCEPT & VIEW OPTIMIZED ROUTE"**.
   - Show the ordered stops: `DEPOT` &rarr; `CANTEEN` &rarr; `NGO_ALPHA` &rarr; `SHELTER_BETA` (5.6 km, 18 min ETA).

5. **Step 5: Dynamic Re-optimization (The "Professor Wow" Moment)**
   - On the **MacBook Dashboard**, navigate to the **Recipients** tab (`/recipients`).
   - Find **Shelter Beta** and click **"MARK UNAVAILABLE"**!
   - The MacBook engine automatically recalculates: Shelter Beta is excluded, and the surplus is re-routed to **Hostel Gamma**!
   - On the **iPhone Volunteer App**, an alert banner immediately flashes:
     > **"ASSIGNMENT UPDATED! Shelter Beta became UNAVAILABLE! DAA Engine re-routed your drop-off."**
   - The route dynamically updates to: `DEPOT` &rarr; `CANTEEN` &rarr; `NGO_ALPHA` &rarr; `HOSTEL_GAMMA`!

6. **Step 6: Completion**
   - On the iPhone, tap **"FOOD COLLECTED"** &rarr; Android timeline updates to "Food Collected".
   - Tap **"FOOD DELIVERED"** &rarr; Android timeline updates to "Food Delivered & Confirmed". Zero waste achieved!

---

## 6. Verification & Test Evidence

All unit test suites verify the algorithms against project specifications:
- **Dart Tests** (`mindmesh/mobile`):
  `flutter test test/algorithm_test.dart` &rarr; **7/7 passed** (Heap order, Urgency formula, Knapsack 50kg benchmark, Greedy 50 portions, Dijkstra trace, TSP Held-Karp, BFS reachability).
- **TypeScript Tests** (`mindmesh/admin`):
  `npm test` &rarr; **7/7 passed** in **1.6 ms**.
- **Production Build**:
  `npm run build` &rarr; **Compiled successfully** with static generation across all routes.
- **Flutter Code Analysis**:
  `flutter analyze` &rarr; **No issues found**.
