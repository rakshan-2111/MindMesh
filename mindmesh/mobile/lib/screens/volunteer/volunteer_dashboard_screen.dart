// ============================================================================
// MindMesh Mobile - Volunteer Dashboard Screen
// Cupertino-styled iPhone experience: Tasks, Active, History, Profile
// ============================================================================

import 'package:flutter/material.dart';
import '../../models/models.dart';
import '../../services/supabase_service.dart';
import '../../theme/mindmesh_theme.dart';
import '../../widgets/status_chip.dart';
import 'assignment_details_screen.dart';
import 'optimized_route_screen.dart';
import '../login_screen.dart';

class VolunteerDashboardScreen extends StatefulWidget {
  const VolunteerDashboardScreen({super.key});

  @override
  State<VolunteerDashboardScreen> createState() => _VolunteerDashboardScreenState();
}

class _VolunteerDashboardScreenState extends State<VolunteerDashboardScreen> {
  final _service = MindMeshService();
  int _currentTabIndex = 0;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
    _service.addListener(_onServiceUpdate);
  }

  @override
  void dispose() {
    _service.removeListener(_onServiceUpdate);
    super.dispose();
  }

  void _onServiceUpdate() {
    if (mounted) setState(() {});
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    await _service.fetchInitialData();
    if (mounted) setState(() => _isLoading = false);
  }

  void _openTaskDetails(DonationModel donation) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(10)),
      ),
      builder: (_) => FractionallySizedBox(
        heightFactor: 0.85,
        child: AssignmentDetailsScreen(
          donation: donation,
          onAccept: () {
            Navigator.of(context).pop();
            Navigator.of(context).push(
              MaterialPageRoute(
                builder: (_) => OptimizedRouteScreen(donation: donation),
              ),
            );
          },
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final assignment = _service.assignments.isNotEmpty ? _service.assignments.first : null;
    final donations = _service.donations;
    final availableTasks = donations.where((d) => d.status != DonationStatus.delivered).toList();

    return Scaffold(
      backgroundColor: MindMeshColors.canvas,
      appBar: AppBar(
        title: Row(
          children: [
            Container(
              width: 8,
              height: 8,
              decoration: const BoxDecoration(
                color: MindMeshColors.brand,
                shape: BoxShape.circle,
              ),
            ),
            const SizedBox(width: 8),
            const Text('MindMesh Volunteer'),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, size: 20, color: MindMeshColors.textSecondary),
            onPressed: _loadData,
          ),
          IconButton(
            icon: const Icon(Icons.logout_outlined, size: 20, color: MindMeshColors.textSecondary),
            onPressed: () {
              Navigator.of(context).pushReplacement(
                MaterialPageRoute(builder: (_) => const LoginScreen()),
              );
            },
          ),
        ],
      ),
      body: SafeArea(
        child: Column(
          children: [
            // Dynamic Plan Change Banner if route recalculated
            if (_service.hasAssignmentUpdateNotification)
              Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                color: MindMeshColors.warningBg,
                child: Row(
                  children: [
                    const Icon(Icons.info_outline, size: 16, color: MindMeshColors.warning),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        _service.updateNotificationMessage ?? 'Route updated. One stop changed by coordinator.',
                        style: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w500,
                          color: MindMeshColors.warning,
                        ),
                      ),
                    ),
                    TextButton(
                      style: TextButton.styleFrom(
                        padding: EdgeInsets.zero,
                        minimumSize: Size.zero,
                        tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                      ),
                      onPressed: () {
                        if (availableTasks.isNotEmpty) {
                          _openTaskDetails(availableTasks.first);
                        }
                      },
                      child: const Text(
                        'View changes',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: MindMeshColors.warning,
                        ),
                      ),
                    ),
                  ],
                ),
              ),

            // Subtle live indicator
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              alignment: Alignment.centerLeft,
              child: Row(
                children: [
                  Container(
                    width: 6,
                    height: 6,
                    decoration: const BoxDecoration(
                      color: MindMeshColors.success,
                      shape: BoxShape.circle,
                    ),
                  ),
                  const SizedBox(width: 6),
                  const Text(
                    'Updated just now · Ravi Kumar (50 kg Scooter)',
                    style: TextStyle(
                      fontSize: 11,
                      color: MindMeshColors.textSecondary,
                    ),
                  ),
                ],
              ),
            ),

            // Tasks List
            Expanded(
              child: RefreshIndicator(
                color: MindMeshColors.brand,
                onRefresh: _loadData,
                child: ListView(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  children: [
                    // Active Assignment Banner if exists
                    if (assignment != null) ...[
                      InkWell(
                        onTap: () {
                          if (availableTasks.isNotEmpty) {
                            Navigator.of(context).push(
                              MaterialPageRoute(
                                builder: (_) => OptimizedRouteScreen(donation: availableTasks.first),
                              ),
                            );
                          }
                        },
                        borderRadius: BorderRadius.circular(10),
                        child: Container(
                          padding: const EdgeInsets.all(14),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(color: MindMeshColors.brand, width: 1.5),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  const Text(
                                    'Active delivery in progress',
                                    style: TextStyle(
                                      fontSize: 11,
                                      fontWeight: FontWeight.w600,
                                      color: MindMeshColors.brand,
                                      letterSpacing: 0.5,
                                    ),
                                  ),
                                  StatusChip(
                                    label: '${assignment.totalDistance} km · ${assignment.estimatedTime} min',
                                    variant: StatusChipVariant.info,
                                    showDot: false,
                                  ),
                                ],
                              ),
                              const SizedBox(height: 6),
                              Text(
                                '${assignment.routeNodes.length} stops scheduled',
                                style: const TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w700,
                                  color: MindMeshColors.ink,
                                ),
                              ),
                              const SizedBox(height: 8),
                              const Text(
                                'Tap to resume turn-by-turn stop order ➔',
                                style: TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w500,
                                  color: MindMeshColors.brand,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 16),
                    ],

                    const Text(
                      'Available pickups',
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: MindMeshColors.ink,
                      ),
                    ),
                    const SizedBox(height: 8),

                    if (_isLoading)
                      _buildSkeleton()
                    else if (availableTasks.isEmpty)
                      Container(
                        padding: const EdgeInsets.symmetric(vertical: 40, horizontal: 20),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: MindMeshColors.border),
                        ),
                        child: const Text(
                          'No available pickups nearby. New donations will appear automatically.',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            fontSize: 13,
                            color: MindMeshColors.textSecondary,
                          ),
                        ),
                      )
                    else
                      ...availableTasks.map((task) {
                        final expiryDiff = task.expiryTime.difference(DateTime.now()).inMinutes;
                        final isUrgent = expiryDiff <= 60;

                        return Container(
                          margin: const EdgeInsets.only(bottom: 8),
                          child: InkWell(
                            onTap: () => _openTaskDetails(task),
                            borderRadius: BorderRadius.circular(10),
                            child: Container(
                              padding: const EdgeInsets.all(14),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(10),
                                border: Border.all(color: MindMeshColors.border),
                              ),
                              child: Row(
                                children: [
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Row(
                                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                          children: [
                                            Expanded(
                                              child: Text(
                                                task.pickupLocation,
                                                style: const TextStyle(
                                                  fontSize: 13,
                                                  fontWeight: FontWeight.w600,
                                                  color: MindMeshColors.ink,
                                                ),
                                              ),
                                            ),
                                            StatusChip(
                                              label: isUrgent ? 'High Urgency' : 'Medium Urgency',
                                              variant: isUrgent ? StatusChipVariant.critical : StatusChipVariant.warning,
                                            ),
                                          ],
                                        ),
                                        const SizedBox(height: 4),
                                        Text(
                                          '${task.quantity} portions (${task.weightKg} kg) · ${task.foodName}',
                                          style: const TextStyle(
                                            fontSize: 12,
                                            color: MindMeshColors.textSecondary,
                                          ),
                                        ),
                                        const SizedBox(height: 8),
                                        Row(
                                          children: [
                                            Text(
                                              'Deadline: ${_formatTime(task.expiryTime)}',
                                              style: const TextStyle(
                                                fontSize: 11,
                                                color: MindMeshColors.textTertiary,
                                              ),
                                            ),
                                            const Text(' · ', style: TextStyle(color: MindMeshColors.textTertiary)),
                                            const Text(
                                              '1.8 km away',
                                              style: TextStyle(
                                                fontSize: 11,
                                                color: MindMeshColors.textTertiary,
                                              ),
                                            ),
                                          ],
                                        ),
                                      ],
                                    ),
                                  ),
                                  const Icon(Icons.chevron_right, size: 18, color: MindMeshColors.textTertiary),
                                ],
                              ),
                            ),
                          ),
                        );
                      }),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentTabIndex,
        onTap: (idx) => setState(() => _currentTabIndex = idx),
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.list_alt_outlined),
            activeIcon: Icon(Icons.list_alt),
            label: 'Tasks',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.navigation_outlined),
            activeIcon: Icon(Icons.navigation),
            label: 'Active',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.history_outlined),
            activeIcon: Icon(Icons.history),
            label: 'History',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.person_outline),
            activeIcon: Icon(Icons.person),
            label: 'Profile',
          ),
        ],
      ),
    );
  }

  String _formatTime(DateTime dt) {
    final h = dt.hour > 12 ? dt.hour - 12 : (dt.hour == 0 ? 12 : dt.hour);
    final m = dt.minute.toString().padLeft(2, '0');
    final period = dt.hour >= 12 ? 'PM' : 'AM';
    return '$h:$m $period';
  }

  Widget _buildSkeleton() {
    return Column(
      children: List.generate(
        2,
        (i) => Container(
          margin: const EdgeInsets.only(bottom: 8),
          height: 80,
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: MindMeshColors.border),
          ),
        ),
      ),
    );
  }
}
