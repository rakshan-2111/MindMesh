-- ============================================================================
-- MindMesh DAA Project - Supabase Database Schema
-- Distributed Food Waste Redistribution & Route Optimization Platform
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------------------
-- 1. USERS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('provider', 'volunteer', 'admin', 'recipient')),
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 2. RECIPIENTS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.recipients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('NGO', 'Shelter', 'Community Center', 'Hostel')),
    required_quantity INT NOT NULL DEFAULT 0,
    remaining_demand INT NOT NULL DEFAULT 0,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    node_id TEXT NOT NULL, -- Corresponds to graph node for Dijkstra/TSP
    priority INT NOT NULL DEFAULT 1 CHECK (priority >= 1 AND priority <= 5), -- 5 is highest priority
    status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'unavailable')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 3. FOOD DONATIONS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.donations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    food_name TEXT NOT NULL,
    quantity INT NOT NULL, -- Portions or items
    unit TEXT NOT NULL DEFAULT 'portions',
    weight_kg DOUBLE PRECISION NOT NULL,
    expiry_time TIMESTAMPTZ NOT NULL,
    pickup_location TEXT NOT NULL,
    node_id TEXT NOT NULL, -- Graph node reference
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    status TEXT NOT NULL DEFAULT 'available' 
        CHECK (status IN ('available', 'assigned', 'collected', 'delivered', 'expired', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 4. VOLUNTEERS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.volunteers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    vehicle_type TEXT NOT NULL DEFAULT 'Bike' CHECK (vehicle_type IN ('Bike', 'Car', 'Van', 'Foot')),
    vehicle_capacity DOUBLE PRECISION NOT NULL DEFAULT 50.0, -- In kg
    current_location TEXT NOT NULL DEFAULT 'Depot',
    node_id TEXT NOT NULL DEFAULT 'DEPOT',
    availability TEXT NOT NULL DEFAULT 'available' CHECK (availability IN ('available', 'busy', 'offline')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 5. ASSIGNMENTS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    donation_id UUID REFERENCES public.donations(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES public.recipients(id) ON DELETE CASCADE,
    volunteer_id UUID REFERENCES public.volunteers(id) ON DELETE SET NULL,
    quantity INT NOT NULL,
    status TEXT NOT NULL DEFAULT 'assigned' 
        CHECK (status IN ('pending', 'assigned', 'collected', 'delivered', 'updated', 'cancelled')),
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- ----------------------------------------------------------------------------
-- 6. ROUTES TABLE (Calculated by Dijkstra / TSP Engine)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.routes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assignment_id UUID REFERENCES public.assignments(id) ON DELETE CASCADE,
    route_nodes JSONB NOT NULL, -- Array of node IDs e.g. ["DEPOT", "CANTEEN", "NGO_ALPHA", "SHELTER_BETA"]
    total_distance DOUBLE PRECISION NOT NULL, -- in km
    estimated_time INT NOT NULL, -- in minutes
    algorithm_used TEXT NOT NULL DEFAULT 'Dijkstra + Knapsack',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 7. GRAPH EDGES TABLE (Weighted Map Graph for Dijkstra & TSP)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.graph_edges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_node TEXT NOT NULL,
    target_node TEXT NOT NULL,
    distance_km DOUBLE PRECISION NOT NULL,
    is_bidirectional BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 8. ROW LEVEL SECURITY (RLS) FOR DEMO
-- ----------------------------------------------------------------------------
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.graph_edges ENABLE ROW LEVEL SECURITY;

-- Permissive demo policies (Allow public anon/authenticated read and write for multi-device live sync)
CREATE POLICY "Allow public read users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Allow public insert users" ON public.users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update users" ON public.users FOR UPDATE USING (true);

CREATE POLICY "Allow public read donations" ON public.donations FOR SELECT USING (true);
CREATE POLICY "Allow public insert donations" ON public.donations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update donations" ON public.donations FOR UPDATE USING (true);

CREATE POLICY "Allow public read recipients" ON public.recipients FOR SELECT USING (true);
CREATE POLICY "Allow public update recipients" ON public.recipients FOR UPDATE USING (true);

CREATE POLICY "Allow public read volunteers" ON public.volunteers FOR SELECT USING (true);
CREATE POLICY "Allow public update volunteers" ON public.volunteers FOR UPDATE USING (true);

CREATE POLICY "Allow public read assignments" ON public.assignments FOR SELECT USING (true);
CREATE POLICY "Allow public insert assignments" ON public.assignments FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update assignments" ON public.assignments FOR UPDATE USING (true);

CREATE POLICY "Allow public read routes" ON public.routes FOR SELECT USING (true);
CREATE POLICY "Allow public insert routes" ON public.routes FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read graph_edges" ON public.graph_edges FOR SELECT USING (true);

-- ----------------------------------------------------------------------------
-- 9. SUPABASE REALTIME REPLICATION CONFIGURATION
-- ----------------------------------------------------------------------------
-- Add tables to supabase_realtime publication
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'donations'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.donations;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'assignments'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.assignments;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'recipients'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.recipients;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'routes'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.routes;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'volunteers'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.volunteers;
  END IF;
END $$;
