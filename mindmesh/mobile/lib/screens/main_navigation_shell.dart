// ============================================================================
// MindMesh Mobile - Main Navigation Shell
// Implements the exact consumer food-delivery aesthetic from user reference:
// - Fixed glassmorphic bottom navigation bar with BackdropFilter blur
// - Meaningful live data badges on EVERY navbar icon
// - Screen 1: Discovery Feed ("Good food. Fast rescue.", category carousel, dish cards)
// - Screen 2: Dish Inspection Modal (hero dish, 3 metric pills, description, counter, action)
// - Screen 3: Live Street Map Route & Tracking (vector map, moving scooter, pulsating pin,
//   Dijkstra+TSP vs Naive route switcher, courier card with call button)
// - Active Orders/Dispatches Tracker
// - DAA Algorithmic Telemetry & Hardware Hub (Android + iPhone + MacBook)
// - Node Profile & Role Switcher
// ============================================================================

import 'package:flutter/material.dart';
import '../services/supabase_service.dart';
import '../theme/mindmesh_theme.dart';
import '../widgets/glassmorphic_navbar.dart';
import '../widgets/dish_details_modal.dart';
import 'provider/create_donation_screen.dart';
import 'volunteer/optimized_route_screen.dart';
import 'login_screen.dart';

class MainNavigationShell extends StatefulWidget {
  final String role; // 'provider' or 'volunteer'

  const MainNavigationShell({
    super.key,
    this.role = 'provider',
  });

  @override
  State<MainNavigationShell> createState() => _MainNavigationShellState();
}

class _MainNavigationShellState extends State<MainNavigationShell>
    with TickerProviderStateMixin {
  final _service = MindMeshService();
  int _currentIndex = 0;
  late String _currentRole;
  int _selectedCategoryIndex = 0;
  AlgorithmicRouteType _selectedMapRoute = AlgorithmicRouteType.dijkstraTsp;
  late AnimationController _pulseController;
  late AnimationController _scooterController;

  // Curated surplus dishes matching reference UI
  final List<Map<String, dynamic>> _catalogDishes = [
    {
      'id': 'dish-1',
      'name': 'Garlic Butter Steak with Asparagus',
      'category': 'Main',
      'portions': 25,
      'weightKg': 12.5,
      'price': '\$11',
      'time': '35 min',
      'calories': '480 cal',
      'rating': 4.9,
      'icon': '🥩',
      'isSpicy': true,
      'pickup': 'CHRIST Central Dining Hall, Hub A',
      'description':
          'Tender grilled steak medallions seared with garlic herb butter, served alongside fresh crisp asparagus spears and roasted baby potatoes.',
    },
    {
      'id': 'dish-2',
      'name': 'Mediterranean Chicken Quinoa',
      'category': 'Salads',
      'portions': 20,
      'weightKg': 10.0,
      'price': '\$12',
      'time': '55 min',
      'calories': '390 cal',
      'rating': 4.8,
      'icon': '🥗',
      'isSpicy': false,
      'pickup': 'CHRIST Faculty Lounge, Block 2',
      'description':
          'Grilled lemon herb chicken tossed with fluffy organic quinoa, kalamata olives, cherry tomatoes, cucumbers, and crumbled feta cheese with light herb vinaigrette.',
    },
    {
      'id': 'dish-3',
      'name': 'Chicken Curry with Rice',
      'category': 'Main',
      'portions': 30,
      'weightKg': 18.5,
      'price': '\$18',
      'time': '30 min',
      'calories': '275 cal',
      'rating': 4.9,
      'icon': '🍛',
      'isSpicy': true,
      'pickup': 'Main Campus Canteen, Counter 4',
      'description':
          'Indian chicken curry stewed in an onion- and tomato-based sauce, flavoured with ginger, garlic, tomato puree, chilli peppers and a variety of spices, often including turmeric, cumin, cardamom.',
    },
    {
      'id': 'dish-4',
      'name': 'South Indian Mini Tiffin',
      'category': 'Main',
      'portions': 40,
      'weightKg': 15.0,
      'price': '\$8',
      'time': '1h 10m',
      'calories': '320 cal',
      'rating': 4.9,
      'icon': '🥘',
      'isSpicy': false,
      'pickup': 'CHRIST South Dining Hall',
      'description':
          'Steamed fluffy idlis, crispy medu vadas, and fragrant ghee pongal served with piping hot drumstick sambar and fresh coconut and tomato chutneys.',
    },
    {
      'id': 'dish-5',
      'name': 'Slow-Simmered Lentil Soup (Dal)',
      'category': 'Soups',
      'portions': 35,
      'weightKg': 16.0,
      'price': '\$7',
      'time': '2h 00m',
      'calories': '210 cal',
      'rating': 4.7,
      'icon': '🍲',
      'isSpicy': false,
      'pickup': 'Central Hostel Kitchen',
      'description':
          'Yellow lentils slow-cooked with turmeric and garlic, tempered with cumin, mustard seeds, and fresh coriander in golden ghee.',
    },
    {
      'id': 'dish-6',
      'name': 'Artisan Sourdough & Croissant Box',
      'category': 'Bakery',
      'portions': 22,
      'weightKg': 8.0,
      'price': '\$9',
      'time': '2h 30m',
      'calories': '310 cal',
      'rating': 4.9,
      'icon': '🥐',
      'isSpicy': false,
      'pickup': 'Campus Bakery & Patisserie',
      'description':
          'Fresh morning batch of crusty sourdough boules, butter croissants, and pain au chocolat from the hospitality kitchen.',
    },
    {
      'id': 'dish-7',
      'name': 'Cold Pressed Citrus & Berry Juices',
      'category': 'Drinks',
      'portions': 25,
      'weightKg': 12.0,
      'price': '\$5',
      'time': '2h 30m',
      'calories': '140 cal',
      'rating': 4.8,
      'icon': '🥤',
      'isSpicy': false,
      'pickup': 'Juice Bar, Sports Complex',
      'description':
          'Chilled cold-pressed valencia orange and wild berry refreshers packed with natural vitamin C and antioxidants.',
    },
  ];

  final List<Map<String, dynamic>> _categories = [
    {'name': 'All', 'icon': '🍱'},
    {'name': 'Main', 'icon': '🥟'},
    {'name': 'Soups', 'icon': '🍲'},
    {'name': 'Salads', 'icon': '🥗'},
    {'name': 'Drinks', 'icon': '🥤'},
    {'name': 'Bakery', 'icon': '🥐'},
  ];

  @override
  void initState() {
    super.initState();
    _currentRole = widget.role;
    _service.sendDeviceHeartbeat(_currentRole);
    _service.addListener(_onServiceUpdate);

    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1400),
    )..repeat(reverse: true);

    _scooterController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 4000),
    )..repeat();
  }

  @override
  void dispose() {
    _service.removeListener(_onServiceUpdate);
    _pulseController.dispose();
    _scooterController.dispose();
    super.dispose();
  }

  void _onServiceUpdate() {
    if (mounted) setState(() {});
  }

  void _openDishModal(Map<String, dynamic> dish) {
    DishDetailsModal.show(
      context,
      dish: dish,
      isProvider: _currentRole == 'provider',
      onAccept: () {
        setState(() => _currentIndex = 1); // Switch smoothly to Route Map!
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final liveDonations = _service.donations;
    final totalSurplusCount = _catalogDishes.length + liveDonations.length;
    final activeDispatchesCount = (_service.assignments.length + 1);

    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FA),
      body: Stack(
        children: [
          // 1. Indexed Main Content Area (padding bottom to avoid overlap with fixed nav)
          SafeArea(
            bottom: false,
            child: IndexedStack(
              index: _currentIndex,
              children: [
                _buildCatalogFeedPage(), // Tab 0: Screen 1 Discovery Feed
                _buildRouteMapPage(), // Tab 1: Screen 3 Vector Map & Algorithms
                _buildOrdersDispatchesPage(), // Tab 2: Orders & Timeline
                _buildImpactTelemetryPage(), // Tab 3: DAA Telemetry & Impact
                _buildNodeProfilePage(), // Tab 4: Node Specs & Settings
              ],
            ),
          ),

          // 2. Fixed Glassmorphic Bottom Navigation Bar
          // EVERY icon displays meaningful live data badges!
          GlassmorphicNavBar(
            currentIndex: _currentIndex,
            onTap: (index) => setState(() => _currentIndex = index),
            items: [
              GlassmorphicNavItem(
                icon: Icons.lunch_dining_outlined,
                activeIcon: Icons.lunch_dining_rounded,
                label: 'Surplus',
                dataBadge: '$totalSurplusCount pkgs',
                badgeColor: const Color(0xFF10B981), // Emerald
              ),
              const GlassmorphicNavItem(
                icon: Icons.explore_outlined,
                activeIcon: Icons.explore_rounded,
                label: 'Route',
                dataBadge: '4.2 km',
                badgeColor: Color(0xFF3B82F6), // Blue
              ),
              GlassmorphicNavItem(
                icon: Icons.local_shipping_outlined,
                activeIcon: Icons.local_shipping_rounded,
                label: 'Orders',
                dataBadge: '$activeDispatchesCount active',
                badgeColor: const Color(0xFFF59E0B), // Amber
              ),
              const GlassmorphicNavItem(
                icon: Icons.insights_outlined,
                activeIcon: Icons.insights_rounded,
                label: 'Impact',
                dataBadge: '18 ms',
                badgeColor: Color(0xFF8B5CF6), // Purple
              ),
              GlassmorphicNavItem(
                icon: Icons.dns_outlined,
                activeIcon: Icons.dns_rounded,
                label: 'Node',
                dataBadge: 'Online',
                badgeColor: const Color(0xFF10B981), // Emerald
              ),
            ],
          ),
        ],
      ),
    );
  }

  // ============================================================================
  // TAB 0: Discovery & Surplus Catalog (Exact Screen 1 Aesthetic)
  // ============================================================================
  Widget _buildCatalogFeedPage() {
    final selectedCat = _categories[_selectedCategoryIndex]['name'] as String;
    final filteredDishes = selectedCat == 'All'
        ? _catalogDishes
        : _catalogDishes.where((d) => d['category'] == selectedCat).toList();

    return SingleChildScrollView(
      physics: const BouncingScrollPhysics(),
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 110),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Top Bar: Hamburger Menu `=` + Title + User Avatar
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              // Hamburger Menu Button
              GestureDetector(
                onTap: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text(
                        _currentRole == 'provider'
                            ? 'Food Provider Node: CHRIST Canteen A'
                            : 'Courier Node: Ravi Kumar (50 kg vehicle cap)',
                      ),
                      duration: const Duration(seconds: 1),
                    ),
                  );
                },
                child: Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: const Color(0xFFE5E7EB)),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.03),
                        blurRadius: 6,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: const Center(
                    child: Text(
                      '=',
                      style: TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.w700,
                        color: MindMeshColors.ink,
                      ),
                    ),
                  ),
                ),
              ),

              // Center Brand Tag
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: const Color(0xFFE7F1EC),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 7,
                      height: 7,
                      decoration: const BoxDecoration(
                        color: Color(0xFF1F5D46),
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 6),
                    Text(
                      _currentRole == 'provider' ? 'Provider Mode' : 'Courier Mode',
                      style: const TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                        color: Color(0xFF1F5D46),
                      ),
                    ),
                  ],
                ),
              ),

              // User Avatar Circle
              GestureDetector(
                onTap: () => setState(() => _currentIndex = 4), // go to profile
                child: Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    color: const Color(0xFFFDE68A),
                    shape: BoxShape.circle,
                    border: Border.all(color: Colors.white, width: 2),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.06),
                        blurRadius: 8,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Center(
                    child: Text(
                      _currentRole == 'provider' ? '👨‍🍳' : '🛵',
                      style: const TextStyle(fontSize: 22),
                    ),
                  ),
                ),
              ),
            ],
          ),

          const SizedBox(height: 24),

          // Bold Headline matching Screen 1 from user image
          const Text(
            'Good food.',
            style: TextStyle(
              fontSize: 32,
              fontWeight: FontWeight.w900,
              color: MindMeshColors.ink,
              letterSpacing: -0.8,
              height: 1.15,
            ),
          ),
          Text(
            _currentRole == 'provider' ? 'Fast rescue.' : 'Fast delivery.',
            style: const TextStyle(
              fontSize: 32,
              fontWeight: FontWeight.w900,
              color: Color(0xFF1F5D46),
              letterSpacing: -0.8,
              height: 1.15,
            ),
          ),

          const SizedBox(height: 20),

          // Search Bar
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFFE5E7EB)),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.02),
                  blurRadius: 10,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Row(
              children: const [
                Icon(Icons.search, size: 20, color: Color(0xFF9CA3AF)),
                SizedBox(width: 10),
                Text(
                  'Search fresh surplus dishes...',
                  style: TextStyle(fontSize: 13, color: Color(0xFF9CA3AF)),
                ),
              ],
            ),
          ),

          const SizedBox(height: 24),

          // Horizontal Categories Row (Matching Screen 1)
          SizedBox(
            height: 84,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              physics: const BouncingScrollPhysics(),
              itemCount: _categories.length,
              separatorBuilder: (context, index) => const SizedBox(width: 12),
              itemBuilder: (context, index) {
                final cat = _categories[index];
                final isSelected = _selectedCategoryIndex == index;
                return GestureDetector(
                  onTap: () => setState(() => _selectedCategoryIndex = index),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    width: 72,
                    decoration: BoxDecoration(
                      color: isSelected ? const Color(0xFF1F5D46) : Colors.white,
                      borderRadius: BorderRadius.circular(18),
                      border: Border.all(
                        color: isSelected ? const Color(0xFF1F5D46) : const Color(0xFFE5E7EB),
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(isSelected ? 0.08 : 0.02),
                          blurRadius: 8,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          cat['icon'] as String,
                          style: const TextStyle(fontSize: 24),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          cat['name'] as String,
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                            color: isSelected ? Colors.white : MindMeshColors.ink,
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),

          const SizedBox(height: 28),

          // Section Title: "Popular now"
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Popular now',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w800,
                  color: MindMeshColors.ink,
                  letterSpacing: -0.4,
                ),
              ),
              if (_currentRole == 'provider')
                GestureDetector(
                  onTap: () {
                    Navigator.of(context).push(
                      MaterialPageRoute(builder: (_) => const CreateDonationScreen()),
                    );
                  },
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: const Color(0xFF1F5D46),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Row(
                      children: const [
                        Icon(Icons.add, size: 14, color: Colors.white),
                        SizedBox(width: 4),
                        Text(
                          'New Surplus',
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                            color: Colors.white,
                          ),
                        ),
                      ],
                    ),
                  ),
                )
              else
                Text(
                  '${filteredDishes.length} available',
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: Color(0xFF1F5D46),
                  ),
                ),
            ],
          ),

          const SizedBox(height: 16),

          // Dish Cards Grid/List matching Screen 1
          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: filteredDishes.length,
            separatorBuilder: (context, index) => const SizedBox(height: 16),
            itemBuilder: (context, index) {
              final dish = filteredDishes[index];
              return _buildCatalogDishCard(dish);
            },
          ),
        ],
      ),
    );
  }

  // Dish Card with circular appetizing preview, title, price/portions & chili indicator
  Widget _buildCatalogDishCard(Map<String, dynamic> dish) {
    return GestureDetector(
      onTap: () => _openDishModal(dish),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(24),
          border: Border.all(color: const Color(0xFFE5E7EB)),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.04),
              blurRadius: 14,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Row(
          children: [
            // Circular Dish Image / Graphic with Hero animation
            Hero(
              tag: 'dish_image_${dish['name']}',
              child: Container(
                width: 76,
                height: 76,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: const Color(0xFFF3F4F6),
                  border: Border.all(color: const Color(0xFFE5E7EB), width: 2),
                ),
                child: Center(
                  child: Text(
                    dish['icon'] ?? '🍛',
                    style: const TextStyle(fontSize: 36),
                  ),
                ),
              ),
            ),
            const SizedBox(width: 16),

            // Food details
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    dish['name'] ?? '',
                    style: const TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w800,
                      color: MindMeshColors.ink,
                      letterSpacing: -0.2,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '${dish['portions']} portions · ${dish['weightKg']} kg',
                    style: const TextStyle(
                      fontSize: 12,
                      color: Color(0xFF6B7280),
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Text(
                        dish['price'] ?? '\$11',
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w900,
                          color: MindMeshColors.ink,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: const Color(0xFFE7F1EC),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: const Text(
                          'Rescue',
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.w800,
                            color: Color(0xFF1F5D46),
                          ),
                        ),
                      ),
                      const Spacer(),
                      if (dish['isSpicy'] == true)
                        const Text('🌶️', style: TextStyle(fontSize: 14))
                      else
                        Text(
                          '⏱️ ${dish['time']}',
                          style: const TextStyle(fontSize: 11, color: Color(0xFF9CA3AF)),
                        ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ============================================================================
  // TAB 1: Live Street Map & Route Tracking (Exact Screen 3 Aesthetic)
  // ============================================================================
  Widget _buildRouteMapPage() {
    return Stack(
      children: [
        // 1. Custom Vector Street Map
        AnimatedBuilder(
          animation: Listenable.merge([_pulseController, _scooterController]),
          builder: (context, child) {
            return CustomPaint(
              size: Size.infinite,
              painter: _VectorStreetMapPainter(
                routeType: _selectedMapRoute,
                pulseValue: _pulseController.value,
                scooterProgress: _scooterController.value,
              ),
            );
          },
        ),

        // 2. Top Controls: Route Selector Pills & Target GPS Button
        Positioned(
          top: 16,
          left: 16,
          right: 16,
          child: Column(
            children: [
              // Top Bar with GPS button
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(20),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.08),
                          blurRadius: 8,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Row(
                      children: const [
                        Icon(Icons.route, size: 16, color: Color(0xFF1F5D46)),
                        SizedBox(width: 6),
                        Text(
                          'DAA Multi-Stop Tour',
                          style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700),
                        ),
                      ],
                    ),
                  ),
                  Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.08),
                          blurRadius: 8,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: const Icon(Icons.my_location, size: 18, color: MindMeshColors.ink),
                  ),
                ],
              ),

              const SizedBox(height: 10),

              // Algorithm Switcher Pills
              Container(
                padding: const EdgeInsets.all(4),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.92),
                  borderRadius: BorderRadius.circular(14),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.06),
                      blurRadius: 8,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: Row(
                  children: [
                    _buildRoutePill('Dijkstra+TSP (4.2km)', AlgorithmicRouteType.dijkstraTsp, const Color(0xFF1F5D46)),
                    _buildRoutePill('Naive (7.4km)', AlgorithmicRouteType.naiveSequence, const Color(0xFFE11D48)),
                    _buildRoutePill('Alt (5.1km)', AlgorithmicRouteType.alternativeCorridor, const Color(0xFF2563EB)),
                  ],
                ),
              ),
            ],
          ),
        ),

        // 3. Floating Bottom Delivery Card matching Screen 3 from reference
        Positioned(
          left: 16,
          right: 16,
          bottom: 104, // Sits comfortably above glassmorphic navbar
          child: Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(24),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.12),
                  blurRadius: 20,
                  offset: const Offset(0, 6),
                ),
              ],
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Delivery Time Row
                Row(
                  children: [
                    Container(
                      width: 32,
                      height: 32,
                      decoration: const BoxDecoration(
                        color: Color(0xFFF3F4F6),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.access_time_filled, size: 16, color: MindMeshColors.ink),
                    ),
                    const SizedBox(width: 12),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: const [
                        Text(
                          '10-15 min',
                          style: TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.w800,
                            color: MindMeshColors.ink,
                          ),
                        ),
                        Text(
                          'Delivery time · Dijkstra+TSP Optimal',
                          style: TextStyle(fontSize: 11, color: Color(0xFF6B7280)),
                        ),
                      ],
                    ),
                  ],
                ),

                const SizedBox(height: 12),

                // Delivery Address Row
                Row(
                  children: [
                    Container(
                      width: 32,
                      height: 32,
                      decoration: const BoxDecoration(
                        color: Color(0xFFF3F4F6),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.location_on, size: 16, color: Color(0xFFE11D48)),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: const [
                          Text(
                            '70 Washington Square (Asha Foundation)',
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w700,
                              color: MindMeshColors.ink,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          Text(
                            'Drop-off location · Koramangala 4th Block',
                            style: TextStyle(fontSize: 11, color: Color(0xFF6B7280)),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 14),

                // Driver Banner matching Screen 3 bottom pill
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  decoration: BoxDecoration(
                    color: const Color(0xFF1E2022),
                    borderRadius: BorderRadius.circular(18),
                  ),
                  child: Row(
                    children: [
                      Container(
                        width: 36,
                        height: 36,
                        decoration: const BoxDecoration(
                          color: Color(0xFFFDE68A),
                          shape: BoxShape.circle,
                        ),
                        child: const Center(
                          child: Text('🛵', style: TextStyle(fontSize: 18)),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: const [
                            Text(
                              'Jordan Kieth (Ravi Kumar)',
                              style: TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w700,
                                color: Colors.white,
                              ),
                            ),
                            Text(
                              'Courier · 50 kg Capacity',
                              style: TextStyle(fontSize: 11, color: Color(0xFF9CA3AF)),
                            ),
                          ],
                        ),
                      ),
                      // Call Button
                      Container(
                        width: 36,
                        height: 36,
                        decoration: BoxDecoration(
                          color: const Color(0xFF10B981),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.phone, color: Colors.white, size: 16),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildRoutePill(String title, AlgorithmicRouteType route, Color color) {
    final isSelected = _selectedMapRoute == route;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => _selectedMapRoute = route),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 6),
          decoration: BoxDecoration(
            color: isSelected ? color : Colors.transparent,
            borderRadius: BorderRadius.circular(10),
          ),
          alignment: Alignment.center,
          child: Text(
            title,
            style: TextStyle(
              fontSize: 10,
              fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
              color: isSelected ? Colors.white : MindMeshColors.ink,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ),
      ),
    );
  }

  // ============================================================================
  // TAB 2: Orders & Realtime Dispatches
  // ============================================================================
  Widget _buildOrdersDispatchesPage() {
    return SingleChildScrollView(
      physics: const BouncingScrollPhysics(),
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 110),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Active Dispatches',
            style: TextStyle(
              fontSize: 26,
              fontWeight: FontWeight.w800,
              color: MindMeshColors.ink,
              letterSpacing: -0.5,
            ),
          ),
          const SizedBox(height: 6),
          const Text(
            'Real-time batch tracking & courier status',
            style: TextStyle(fontSize: 13, color: Color(0xFF6B7280)),
          ),
          const SizedBox(height: 20),

          // Active Order Tracking Card
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(24),
              border: Border.all(color: const Color(0xFFE5E7EB)),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.04),
                  blurRadius: 12,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Tour #R-204 · En Route',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w800,
                        color: MindMeshColors.ink,
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: const Color(0xFFE7F1EC),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Text(
                        'Dijkstra Tour',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                          color: Color(0xFF1F5D46),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 14),
                const Text(
                  'Chicken Curry with Rice (30 portions · 18.5 kg)',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: MindMeshColors.ink,
                  ),
                ),
                const SizedBox(height: 16),

                // 4-Step Progress Line
                _buildTimelineStep(1, 'Logged & Verified', 'CHRIST Canteen A', true),
                _buildTimelineStep(2, 'Courier Assigned', 'Jordan Kieth (Ravi Kumar)', true),
                _buildTimelineStep(3, 'En Route to Shelter', 'ETA: 10-15 min (4.2 km)', true, isCurrent: true),
                _buildTimelineStep(4, 'Delivered', 'Asha Foundation Kitchen', false, isLast: true),

                const SizedBox(height: 18),
                SizedBox(
                  width: double.infinity,
                  height: 48,
                  child: ElevatedButton(
                    onPressed: () => setState(() => _currentIndex = 1),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF1F5D46),
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    ),
                    child: const Text('View Live on Map', style: TextStyle(fontWeight: FontWeight.w700)),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTimelineStep(int step, String title, String subtitle, bool isCompleted,
      {bool isCurrent = false, bool isLast = false}) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Column(
          children: [
            Container(
              width: 22,
              height: 22,
              decoration: BoxDecoration(
                color: isCompleted
                    ? (isCurrent ? const Color(0xFF3B82F6) : const Color(0xFF10B981))
                    : const Color(0xFFE5E7EB),
                shape: BoxShape.circle,
              ),
              child: Center(
                child: Text(
                  '$step',
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w800,
                    color: isCompleted ? Colors.white : const Color(0xFF9CA3AF),
                  ),
                ),
              ),
            ),
            if (!isLast)
              Container(
                width: 2,
                height: 28,
                color: isCompleted ? const Color(0xFF10B981) : const Color(0xFFE5E7EB),
              ),
          ],
        ),
        const SizedBox(width: 14),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                  color: isCurrent ? const Color(0xFF1F5D46) : MindMeshColors.ink,
                ),
              ),
              Text(
                subtitle,
                style: const TextStyle(fontSize: 11, color: Color(0xFF6B7280)),
              ),
              const SizedBox(height: 10),
            ],
          ),
        ),
      ],
    );
  }

  // ============================================================================
  // TAB 3: DAA Algorithmic Telemetry & Hardware Hub
  // ============================================================================
  Widget _buildImpactTelemetryPage() {
    return SingleChildScrollView(
      physics: const BouncingScrollPhysics(),
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 110),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Algorithmic Telemetry',
            style: TextStyle(
              fontSize: 26,
              fontWeight: FontWeight.w800,
              color: MindMeshColors.ink,
              letterSpacing: -0.5,
            ),
          ),
          const SizedBox(height: 6),
          const Text(
            'Hardware nodes & DAA sub-millisecond execution speeds',
            style: TextStyle(fontSize: 13, color: Color(0xFF6B7280)),
          ),
          const SizedBox(height: 20),

          // 4 Metric Cards
          Row(
            children: [
              _buildTelemetryTile('3 / 3', 'Hardware Nodes', 'Android + iOS + Mac', const Color(0xFF10B981)),
              const SizedBox(width: 12),
              _buildTelemetryTile('2.63 ms', 'Engine Runtime', '5 DAA Modules', const Color(0xFF3B82F6)),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              _buildTelemetryTile('18 ms', 'Supabase Ping', 'Postgres Realtime', const Color(0xFF8B5CF6)),
              const SizedBox(width: 12),
              _buildTelemetryTile('3.2 km', 'Detour Saved', 'Dijkstra + TSP Gain', const Color(0xFFF59E0B)),
            ],
          ),

          const SizedBox(height: 24),

          // Algorithmic Complexity Table
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: const Color(0xFFE5E7EB)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Core Algorithm Execution Benchmarks',
                  style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: MindMeshColors.ink),
                ),
                const SizedBox(height: 12),
                _buildBenchmarkRow('Urgency Priority Queue', 'Max-Heap', 'O(log N)', '0.12 ms'),
                _buildBenchmarkRow('Recipient Matching', 'Greedy Ratio', 'O(N log N)', '0.28 ms'),
                _buildBenchmarkRow('Vehicle Capacity Fit', '0/1 Knapsack', 'O(N × W)', '0.81 ms'),
                _buildBenchmarkRow('Shortest Campus Path', 'Dijkstra', 'O((V+E)logV)', '0.45 ms'),
                _buildBenchmarkRow('Optimal Delivery Tour', 'Held-Karp TSP', 'O(N² 2ᴺ)', '0.97 ms'),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTelemetryTile(String val, String title, String sub, Color col) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: const Color(0xFFE5E7EB)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              val,
              style: TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: col),
            ),
            const SizedBox(height: 4),
            Text(
              title,
              style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: MindMeshColors.ink),
            ),
            Text(
              sub,
              style: const TextStyle(fontSize: 10, color: Color(0xFF6B7280)),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBenchmarkRow(String name, String algo, String comp, String time) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(name, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700)),
                Text('$algo · $comp', style: const TextStyle(fontSize: 10, color: Color(0xFF6B7280))),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
            decoration: BoxDecoration(
              color: const Color(0xFFE7F1EC),
              borderRadius: BorderRadius.circular(6),
            ),
            child: Text(
              time,
              style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: Color(0xFF1F5D46)),
            ),
          ),
        ],
      ),
    );
  }

  // ============================================================================
  // TAB 4: Node Profile & Settings
  // ============================================================================
  Widget _buildNodeProfilePage() {
    return SingleChildScrollView(
      physics: const BouncingScrollPhysics(),
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 110),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Node Profile',
            style: TextStyle(
              fontSize: 26,
              fontWeight: FontWeight.w800,
              color: MindMeshColors.ink,
              letterSpacing: -0.5,
            ),
          ),
          const SizedBox(height: 20),

          // Profile Card
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(24),
              border: Border.all(color: const Color(0xFFE5E7EB)),
            ),
            child: Column(
              children: [
                Row(
                  children: [
                    Container(
                      width: 56,
                      height: 56,
                      decoration: const BoxDecoration(
                        color: Color(0xFFFDE68A),
                        shape: BoxShape.circle,
                      ),
                      child: Center(
                        child: Text(
                          _currentRole == 'provider' ? '👨‍🍳' : '🛵',
                          style: const TextStyle(fontSize: 28),
                        ),
                      ),
                    ),
                    const SizedBox(width: 16),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          _currentRole == 'provider' ? 'CHRIST Canteen A' : 'Ravi Kumar',
                          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800),
                        ),
                        Text(
                          _currentRole == 'provider' ? 'canteen.a@christ.edu' : 'ravi.kumar@mindmesh.org',
                          style: const TextStyle(fontSize: 12, color: Color(0xFF6B7280)),
                        ),
                      ],
                    ),
                  ],
                ),
                const SizedBox(height: 20),

                // Fast Role Switch Button
                SizedBox(
                  width: double.infinity,
                  height: 46,
                  child: OutlinedButton.icon(
                    onPressed: () {
                      setState(() {
                        _currentRole = _currentRole == 'provider' ? 'volunteer' : 'provider';
                      });
                      _service.sendDeviceHeartbeat(_currentRole);
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text('Switched to ${_currentRole == "provider" ? "Provider" : "Courier"} mode'),
                          duration: const Duration(seconds: 1),
                        ),
                      );
                    },
                    icon: const Icon(Icons.swap_horiz),
                    label: Text('Switch to ${_currentRole == "provider" ? "Volunteer Courier" : "Food Provider"}'),
                  ),
                ),
                const SizedBox(height: 12),

                // Sign out
                SizedBox(
                  width: double.infinity,
                  height: 46,
                  child: TextButton.icon(
                    onPressed: () {
                      Navigator.of(context).pushReplacement(
                        MaterialPageRoute(builder: (_) => const LoginScreen()),
                      );
                    },
                    icon: const Icon(Icons.logout, color: Color(0xFFE11D48)),
                    label: const Text('Sign out of Node', style: TextStyle(color: Color(0xFFE11D48))),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// ============================================================================
// Vector Street Map Custom Painter (Matching Screen 3 Aesthetic)
// ============================================================================
class _VectorStreetMapPainter extends CustomPainter {
  final AlgorithmicRouteType routeType;
  final double pulseValue;
  final double scooterProgress;

  _VectorStreetMapPainter({
    required this.routeType,
    required this.pulseValue,
    required this.scooterProgress,
  });

  @override
  void paint(Canvas canvas, Size size) {
    // 1. Base Map Color (Crisp light street map)
    final bgPaint = Paint()..color = const Color(0xFFEBF0ED);
    canvas.drawRect(Rect.fromLTWH(0, 0, size.width, size.height), bgPaint);

    // 2. City Blocks
    final blockPaint = Paint()..color = const Color(0xFFDEE5E0);
    final blocks = [
      Rect.fromLTWH(20, 100, 100, 140),
      Rect.fromLTWH(140, 120, 120, 80),
      Rect.fromLTWH(280, 90, 90, 110),
      Rect.fromLTWH(30, 280, 80, 160),
      Rect.fromLTWH(130, 240, 110, 140),
      Rect.fromLTWH(260, 230, 110, 130),
      Rect.fromLTWH(40, 480, 120, 120),
      Rect.fromLTWH(180, 420, 100, 160),
      Rect.fromLTWH(300, 400, 80, 140),
    ];
    for (final b in blocks) {
      canvas.drawRRect(RRect.fromRectAndRadius(b, const Radius.circular(8)), blockPaint);
    }

    // 3. Roads
    final minorRoadPaint = Paint()
      ..color = Colors.white
      ..strokeWidth = 14
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;

    final roadPaths = [
      Path()..moveTo(0, 220)..lineTo(size.width, 220),
      Path()..moveTo(0, 390)..lineTo(size.width, 390),
      Path()..moveTo(125, 0)..lineTo(125, size.height),
      Path()..moveTo(250, 0)..lineTo(250, size.height),
    ];
    for (final r in roadPaths) {
      canvas.drawPath(r, minorRoadPaint);
    }

    final mainRoadPaint = Paint()
      ..color = Colors.white
      ..strokeWidth = 24
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;

    final mainRoad = Path()
      ..moveTo(60, 0)
      ..cubicTo(70, 200, 220, 260, 220, 380)
      ..cubicTo(220, 480, 340, 520, 340, size.height);
    canvas.drawPath(mainRoad, mainRoadPaint);

    // 4. Coordinates
    const pDepot = Offset(80, 560);
    const pCanteen = Offset(125, 390);
    const pAsha = Offset(220, 240);
    const pSneha = Offset(310, 140);
    const pDetour = Offset(320, 390);

    // 5. Draw Routes
    if (routeType == AlgorithmicRouteType.naiveSequence) {
      // Red dashed detour
      final naivePaint = Paint()
        ..color = const Color(0xFFE11D48)
        ..strokeWidth = 5
        ..style = PaintingStyle.stroke
        ..strokeCap = StrokeCap.round;

      final naivePath = Path()
        ..moveTo(pDepot.dx, pDepot.dy)
        ..lineTo(pCanteen.dx, pCanteen.dy)
        ..lineTo(pDetour.dx, pDetour.dy)
        ..lineTo(pSneha.dx, pSneha.dy)
        ..lineTo(pAsha.dx, pAsha.dy);

      canvas.drawPath(naivePath, naivePaint);
    } else if (routeType == AlgorithmicRouteType.alternativeCorridor) {
      // Blue path
      final altPaint = Paint()
        ..color = const Color(0xFF2563EB)
        ..strokeWidth = 5
        ..style = PaintingStyle.stroke
        ..strokeCap = StrokeCap.round;

      final altPath = Path()
        ..moveTo(pDepot.dx, pDepot.dy)
        ..lineTo(60, 320)
        ..lineTo(pCanteen.dx, pCanteen.dy)
        ..lineTo(180, 200)
        ..lineTo(pSneha.dx, pSneha.dy);

      canvas.drawPath(altPath, altPaint);
    } else {
      // Green Optimal Dijkstra+TSP
      final optimalPaint = Paint()
        ..color = const Color(0xFF1F5D46)
        ..strokeWidth = 6
        ..style = PaintingStyle.stroke
        ..strokeCap = StrokeCap.round;

      final optimalPath = Path()
        ..moveTo(pDepot.dx, pDepot.dy)
        ..lineTo(pCanteen.dx, pCanteen.dy)
        ..lineTo(pAsha.dx, pAsha.dy)
        ..lineTo(pSneha.dx, pSneha.dy);

      canvas.drawPath(optimalPath, optimalPaint);
    }

    // 6. Pulsating Destination Halo at Asha Foundation (220, 240)
    final haloPaint = Paint()
      ..color = const Color(0xFF1F5D46).withOpacity(0.3 * (1 - pulseValue))
      ..style = PaintingStyle.fill;
    canvas.drawCircle(pAsha, 18 + (pulseValue * 14), haloPaint);

    final destPinPaint = Paint()
      ..color = const Color(0xFF1F5D46)
      ..style = PaintingStyle.fill;
    canvas.drawCircle(pAsha, 12, destPinPaint);

    // 7. Scooter Courier moving along path
    // Interpolate position based on progress
    final scooterPos = Offset.lerp(pCanteen, pAsha, scooterProgress) ?? pCanteen;
    final scooterBg = Paint()
      ..color = Colors.white
      ..style = PaintingStyle.fill;
    canvas.drawCircle(scooterPos, 16, scooterBg);
    final scooterBorder = Paint()
      ..color = const Color(0xFF1F5D46)
      ..strokeWidth = 2
      ..style = PaintingStyle.stroke;
    canvas.drawCircle(scooterPos, 16, scooterBorder);

    // Draw Scooter Icon/Text
    final textPainter = TextPainter(
      text: const TextSpan(text: '🛵', style: TextStyle(fontSize: 16)),
      textDirection: TextDirection.ltr,
    )..layout();
    textPainter.paint(canvas, scooterPos - Offset(textPainter.width / 2, textPainter.height / 2));
  }

  @override
  bool shouldRepaint(covariant _VectorStreetMapPainter oldDelegate) => true;
}
