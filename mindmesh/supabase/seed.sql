-- ============================================================================
-- MindMesh DAA Project - Supabase Seed Data
-- ============================================================================

-- Clean up existing data in reverse order of foreign keys
TRUNCATE TABLE public.routes CASCADE;
TRUNCATE TABLE public.assignments CASCADE;
TRUNCATE TABLE public.donations CASCADE;
TRUNCATE TABLE public.volunteers CASCADE;
TRUNCATE TABLE public.recipients CASCADE;
TRUNCATE TABLE public.graph_edges CASCADE;
TRUNCATE TABLE public.users CASCADE;

-- ----------------------------------------------------------------------------
-- 1. SEED USERS
-- ----------------------------------------------------------------------------
INSERT INTO public.users (id, name, email, role, phone) VALUES
('11111111-1111-1111-1111-111111111111', 'Operations Coordinator', 'admin@mindmesh.org', 'admin', '+919880112233'),
('22222222-2222-2222-2222-222222222221', 'CHRIST Canteen A', 'canteen.a@christ.edu', 'provider', '+919880223344'),
('22222222-2222-2222-2222-222222222222', 'North Hall Cafe', 'northcafe@indiranagar.org', 'provider', '+919880334455'),
('22222222-2222-2222-2222-222222222223', 'Koramangala Bakery', 'orders@koramangalabakery.in', 'provider', '+919880445566'),
('33333333-3333-3333-3333-333333333331', 'Ravi Kumar', 'ravi.kumar@mindmesh.org', 'volunteer', '+919880556677'),
('33333333-3333-3333-3333-333333333332', 'Priya Sharma', 'priya.sharma@mindmesh.org', 'volunteer', '+919880667788');

-- ----------------------------------------------------------------------------
-- 2. SEED RECIPIENTS (Target demand & priorities)
-- ----------------------------------------------------------------------------
INSERT INTO public.recipients (id, name, type, required_quantity, remaining_demand, latitude, longitude, node_id, priority, status) VALUES
('44444444-4444-4444-4444-444444444441', 'Asha Foundation', 'NGO', 30, 30, 12.9352, 77.6245, 'NGO_ALPHA', 5, 'available'),
('44444444-4444-4444-4444-444444444442', 'Sneha Shelter', 'Shelter', 40, 40, 12.9784, 77.6408, 'SHELTER_BETA', 4, 'available'),
('44444444-4444-4444-4444-444444444443', 'St. Joseph''s Hostel', 'Hostel', 20, 20, 12.9602, 77.6015, 'HOSTEL_GAMMA', 3, 'available'),
('44444444-4444-4444-4444-444444444444', 'Hosur Road Community Center', 'Community Center', 25, 25, 12.9340, 77.6101, 'COMMUNITY_DELTA', 2, 'available');

-- ----------------------------------------------------------------------------
-- 3. SEED VOLUNTEERS (Vehicle capacity 50 kg)
-- ----------------------------------------------------------------------------
INSERT INTO public.volunteers (id, user_id, name, vehicle_type, vehicle_capacity, current_location, node_id, availability) VALUES
('55555555-5555-5555-5555-555555555551', '33333333-3333-3333-3333-333333333331', 'Ravi Kumar', 'Delivery Scooter', 50.0, 'Koramangala Hub', 'DEPOT', 'available'),
('55555555-5555-5555-5555-555555555552', '33333333-3333-3333-3333-333333333332', 'Priya Sharma', 'Compact EV', 50.0, 'Indiranagar Hub', 'DEPOT', 'available');

-- ----------------------------------------------------------------------------
-- 4. SEED WEIGHTED GRAPH (15 nodes, 28 edges with distances in km)
-- ----------------------------------------------------------------------------
-- Nodes:
-- 1. DEPOT, 2. CANTEEN, 3. NORTH_CAFE, 4. BAKERY
-- 5. NGO_ALPHA, 6. SHELTER_BETA, 7. HOSTEL_GAMMA, 8. COMMUNITY_DELTA
-- 9. JUNCTION_A, 10. JUNCTION_B, 11. JUNCTION_C, 12. JUNCTION_D
-- 13. STUDENT_HUB, 14. LIBRARY_PLAZA, 15. SPORTS_COMPLEX
INSERT INTO public.graph_edges (source_node, target_node, distance_km, is_bidirectional) VALUES
-- Direct & Hub connections from DEPOT
('DEPOT', 'JUNCTION_B', 1.2, true),
('DEPOT', 'JUNCTION_A', 1.8, true),
('DEPOT', 'CANTEEN', 2.0, true),
('DEPOT', 'SPORTS_COMPLEX', 2.5, true),

-- Canteen & North Area Connections
('CANTEEN', 'JUNCTION_B', 1.1, true),
('CANTEEN', 'LIBRARY_PLAZA', 1.5, true),
('NORTH_CAFE', 'LIBRARY_PLAZA', 0.9, true),
('NORTH_CAFE', 'HOSTEL_GAMMA', 1.4, true),
('LIBRARY_PLAZA', 'HOSTEL_GAMMA', 1.6, true),

-- Bakery & East Sector
('BAKERY', 'JUNCTION_C', 1.0, true),
('BAKERY', 'STUDENT_HUB', 1.3, true),
('JUNCTION_C', 'SHELTER_BETA', 1.5, true),
('JUNCTION_C', 'JUNCTION_B', 1.7, true),

-- Junction B (Central Hub) distributions
('JUNCTION_B', 'STUDENT_HUB', 1.0, true),
('JUNCTION_B', 'NGO_ALPHA', 1.8, true),
('JUNCTION_B', 'JUNCTION_A', 1.4, true),

-- Junction A (West Sector) & Community
('JUNCTION_A', 'COMMUNITY_DELTA', 1.3, true),
('JUNCTION_A', 'SPORTS_COMPLEX', 2.1, true),
('COMMUNITY_DELTA', 'JUNCTION_D', 1.2, true),

-- Junction D (South Sector) & NGO Alpha
('JUNCTION_D', 'NGO_ALPHA', 1.5, true),
('JUNCTION_D', 'SPORTS_COMPLEX', 1.9, true),
('NGO_ALPHA', 'SHELTER_BETA', 2.2, true),
('NGO_ALPHA', 'STUDENT_HUB', 1.6, true),

-- Shelter Beta & Student Hub
('SHELTER_BETA', 'STUDENT_HUB', 1.4, true),
('STUDENT_HUB', 'HOSTEL_GAMMA', 2.0, true),

-- Auxiliary connectors to reach exactly 28 edges
('HOSTEL_GAMMA', 'JUNCTION_A', 2.8, true),
('NORTH_CAFE', 'JUNCTION_B', 2.4, true),
('BAKERY', 'SHELTER_BETA', 2.1, true);

-- ----------------------------------------------------------------------------
-- 5. INITIAL SEED DONATION (Demo starting state)
-- ----------------------------------------------------------------------------
INSERT INTO public.donations (
    id, provider_id, food_name, quantity, unit, weight_kg, 
    expiry_time, pickup_location, node_id, latitude, longitude, status
) VALUES (
    '66666666-6666-6666-6666-666666666661',
    '22222222-2222-2222-2222-222222222221',
    'Cooked Rice & Dal Trays',
    50,
    'portions',
    25.0,
    NOW() + INTERVAL '45 minutes',
    'CHRIST Central Dining Hall, Hosur Road',
    'CANTEEN',
    12.9345,
    77.6060,
    'available'
);
