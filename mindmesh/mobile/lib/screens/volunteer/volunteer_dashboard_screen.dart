// ============================================================================
// MindMesh Mobile - iPhone Volunteer Dashboard Screen
// Live task queue with prominent "Assignment Updated" banner for dynamic re-route
// ============================================================================

import 'package:flutter/material.dart';
import '../../services/supabase_service.dart';
import '../../models/models.dart';
import '../login_screen.dart';
import 'assignment_details_screen.dart';

class VolunteerDashboardScreen extends StatefulWidget {
  const VolunteerDashboardScreen({super.key});

  @override
  State<VolunteerDashboardScreen> createState() => _VolunteerDashboardScreenState();
}

class _VolunteerDashboardScreenState extends State<VolunteerDashboardScreen> {
  final service = MindMeshService();

  @override
  void initState() {
    super.initState();
    service.addListener(_onServiceUpdate);
  }

  @override
  void dispose() {
    service.removeListener(_onServiceUpdate);
    super.dispose();
  }

  void _onServiceUpdate() {
    if (mounted) setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    final assignments = service.assignments;

    return Scaffold(
      backgroundColor: const Color(0xFF09090B),
      appBar: AppBar(
        backgroundColor: const Color(0xFF09090B),
        elevation: 0,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: const [
            Text(
              'Volunteer Hub',
              style: TextStyle(
                color: Colors.white,
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            Text(
              'iPhone Client &bull; Alex Chen (50kg Bike)',
              style: TextStyle(
                color: Color(0xFF6366F1),
                fontSize: 11,
                fontFamily: 'monospace',
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.swap_horiz_rounded, color: Color(0xFFA1A1AA)),
            tooltip: 'Switch Role',
            onPressed: () {
              Navigator.pushReplacement(
                context,
                MaterialPageRoute(builder: (_) => const LoginScreen()),
              );
            },
          ),
        ],
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // --------------------------------------------------------------
              // CRITICAL DAA REQUIREMENT: "Assignment Updated" Banner
              // Appears when dashboard sets recipient unavailable or dynamic re-opt triggers
              // --------------------------------------------------------------
              if (service.hasAssignmentUpdateNotification)
                Container(
                  margin: const EdgeInsets.only(bottom: 20),
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: const Color(0xFF831843).withOpacity(0.3),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: const Color(0xFFEC4899), width: 1.5),
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFFEC4899).withOpacity(0.2),
                        blurRadius: 10,
                        offset: const Offset(0, 3),
                      ),
                    ],
                  ),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: const Color(0xFFEC4899).withOpacity(0.2),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.notifications_active_rounded, color: Color(0xFFF472B6), size: 20),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'ASSIGNMENT UPDATED!',
                              style: TextStyle(
                                color: Color(0xFFF472B6),
                                fontWeight: FontWeight.w900,
                                fontSize: 12,
                                letterSpacing: 0.5,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              service.updateNotificationMessage ??
                                  'Shelter Beta became unavailable! DAA engine recalculated optimal path.',
                              style: const TextStyle(color: Colors.white, fontSize: 12),
                            ),
                          ],
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.close, color: Colors.white70, size: 18),
                        onPressed: () => service.clearUpdateNotification(),
                      ),
                    ],
                  ),
                ),

              // Courier Capacity Gauge
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: const Color(0xFF18181B),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFF27272A)),
                ),
                child: Row(
                  children: [
                    Container(
                      width: 44,
                      height: 44,
                      decoration: BoxDecoration(
                        color: const Color(0xFF6366F1).withOpacity(0.15),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Icon(Icons.pedal_bike_rounded, color: Color(0xFF6366F1)),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: const [
                          Text(
                            'VEHICLE PAYLOAD CAPACITY',
                            style: TextStyle(color: Color(0xFF71717A), fontSize: 10, fontWeight: FontWeight.bold),
                          ),
                          SizedBox(height: 2),
                          Text(
                            '50.0 kg Max Load (0/1 Knapsack Verified)',
                            style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                    ),
                    const Text(
                      'READY',
                      style: TextStyle(color: Color(0xFF10B981), fontWeight: FontWeight.bold, fontSize: 11),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              const Text(
                'ASSIGNED DISPATCH TASKS (REALTIME)',
                style: TextStyle(
                  color: Color(0xFF71717A),
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 1.0,
                ),
              ),
              const SizedBox(height: 12),

              if (assignments.isEmpty)
                Container(
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    color: const Color(0xFF18181B),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: const Center(
                    child: Text('No active assignments. Standby for dispatch.'),
                  ),
                )
              else
                ...assignments.map((assignment) => _AssignmentCard(
                  assignment: assignment,
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => AssignmentDetailsScreen(assignment: assignment),
                      ),
                    );
                  },
                )),
            ],
          ),
        ),
      ),
    );
  }
}

class _AssignmentCard extends StatelessWidget {
  final AssignmentModel assignment;
  final VoidCallback onTap;

  const _AssignmentCard({required this.assignment, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final isUpdated = assignment.status == AssignmentStatus.updated;

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        margin: const EdgeInsets.only(bottom: 14),
        padding: const EdgeInsets.all(18),
        decoration: BoxDecoration(
          color: const Color(0xFF18181B),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isUpdated ? const Color(0xFFEC4899) : const Color(0xFF27272A),
            width: isUpdated ? 1.5 : 1.0,
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Text(
                    assignment.recipientName,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 15,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: isUpdated
                        ? const Color(0xFFEC4899).withOpacity(0.2)
                        : const Color(0xFF10B981).withOpacity(0.15),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(
                      color: isUpdated
                          ? const Color(0xFFEC4899).withOpacity(0.4)
                          : const Color(0xFF10B981).withOpacity(0.3),
                    ),
                  ),
                  child: Text(
                    assignment.status.name.toUpperCase(),
                    style: TextStyle(
                      color: isUpdated ? const Color(0xFFF472B6) : const Color(0xFF10B981),
                      fontSize: 10,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),
            Row(
              children: [
                const Icon(Icons.location_on_outlined, color: Color(0xFF71717A), size: 14),
                const SizedBox(width: 4),
                Text(
                  'Pickup: ${assignment.pickupLocation}',
                  style: const TextStyle(color: Color(0xFFA1A1AA), fontSize: 12),
                ),
              ],
            ),
            const SizedBox(height: 6),
            Row(
              children: [
                const Icon(Icons.scale_rounded, color: Color(0xFF71717A), size: 14),
                const SizedBox(width: 4),
                Text(
                  'Payload: ${assignment.weightKg} kg (${assignment.quantity} portions)',
                  style: const TextStyle(color: Color(0xFFA1A1AA), fontSize: 12, fontFamily: 'monospace'),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  '${assignment.totalDistance} km &bull; ${assignment.estimatedTime} mins ETA',
                  style: const TextStyle(
                    color: Color(0xFF10B981),
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    fontFamily: 'monospace',
                  ),
                ),
                const Text(
                  'View Route &rarr;',
                  style: TextStyle(color: Color(0xFF6366F1), fontSize: 12, fontWeight: FontWeight.bold),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
