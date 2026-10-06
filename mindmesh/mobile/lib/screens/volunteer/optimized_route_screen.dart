// ============================================================================
// MindMesh Mobile - Optimized Route View & Delivery Confirmation (iPhone)
// Ordered stops, distance, ETA, and "FOOD COLLECTED" / "FOOD DELIVERED" buttons
// ============================================================================

import 'package:flutter/material.dart';
import '../../services/supabase_service.dart';
import '../../models/models.dart';

class OptimizedRouteScreen extends StatefulWidget {
  final AssignmentModel assignment;

  const OptimizedRouteScreen({super.key, required this.assignment});

  @override
  State<OptimizedRouteScreen> createState() => _OptimizedRouteScreenState();
}

class _OptimizedRouteScreenState extends State<OptimizedRouteScreen> {
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
    final currentAssignment = service.assignments.firstWhere(
      (a) => a.id == widget.assignment.id,
      orElse: () => widget.assignment,
    );

    final isCollected = currentAssignment.status == AssignmentStatus.collected;
    final isDelivered = currentAssignment.status == AssignmentStatus.delivered;

    return Scaffold(
      backgroundColor: const Color(0xFF09090B),
      appBar: AppBar(
        backgroundColor: const Color(0xFF09090B),
        elevation: 0,
        title: const Text(
          'Optimized Courier Route',
          style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
        ),
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Notification banner if updated
              if (service.hasAssignmentUpdateNotification)
                Container(
                  margin: const EdgeInsets.only(bottom: 18),
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: const Color(0xFF831843).withOpacity(0.3),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: const Color(0xFFEC4899)),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.refresh_rounded, color: Color(0xFFF472B6), size: 20),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Text(
                          service.updateNotificationMessage ?? 'Assignment re-optimized by DAA engine!',
                          style: const TextStyle(color: Colors.white, fontSize: 12),
                        ),
                      ),
                    ],
                  ),
                ),

              // Route Stats Banner
              Container(
                padding: const EdgeInsets.all(18),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFF1E1B4B), Color(0xFF18181B)],
                  ),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFF6366F1).withOpacity(0.3)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          currentAssignment.algorithmUsed,
                          style: const TextStyle(
                            color: Color(0xFF818CF8),
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                            fontFamily: 'monospace',
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: const Color(0xFF10B981).withOpacity(0.2),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: const Text(
                            'OPTIMAL TOUR',
                            style: TextStyle(color: Color(0xFF34D399), fontSize: 9, fontWeight: FontWeight.bold),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('TOTAL DISTANCE', style: TextStyle(color: Color(0xFF9CA3AF), fontSize: 10)),
                            Text(
                              '${currentAssignment.totalDistance} km',
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 24,
                                fontWeight: FontWeight.bold,
                                fontFamily: 'monospace',
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(width: 32),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('ESTIMATED TIME', style: TextStyle(color: Color(0xFF9CA3AF), fontSize: 10)),
                            Text(
                              '${currentAssignment.estimatedTime} mins',
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 24,
                                fontWeight: FontWeight.bold,
                                fontFamily: 'monospace',
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // Ordered stops
              const Text(
                'ORDERED STOPS & WAYPOINTS',
                style: TextStyle(
                  color: Color(0xFF71717A),
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 1.0,
                ),
              ),
              const SizedBox(height: 12),

              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: const Color(0xFF18181B),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFF27272A)),
                ),
                child: Column(
                  children: currentAssignment.routeNodes.asMap().entries.map((entry) {
                    final idx = entry.key;
                    final node = entry.value;
                    final isFirst = idx == 0;
                    final isLast = idx == currentAssignment.routeNodes.length - 1;

                    return Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Column(
                          children: [
                            Container(
                              width: 28,
                              height: 28,
                              decoration: BoxDecoration(
                                color: isFirst
                                    ? const Color(0xFF3B82F6).withOpacity(0.2)
                                    : isLast
                                    ? const Color(0xFF10B981).withOpacity(0.2)
                                    : const Color(0xFFF59E0B).withOpacity(0.2),
                                shape: BoxShape.circle,
                                border: Border.all(
                                  color: isFirst
                                      ? const Color(0xFF3B82F6)
                                      : isLast
                                      ? const Color(0xFF10B981)
                                      : const Color(0xFFF59E0B),
                                ),
                              ),
                              child: Center(
                                child: Text(
                                  '${idx + 1}',
                                  style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                                ),
                              ),
                            ),
                            if (!isLast)
                              Container(
                                width: 2,
                                height: 36,
                                color: const Color(0xFF27272A),
                              ),
                          ],
                        ),
                        const SizedBox(width: 14),
                        Expanded(
                          child: Padding(
                            padding: const EdgeInsets.only(top: 4),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  node,
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 14,
                                    fontWeight: FontWeight.bold,
                                    fontFamily: 'monospace',
                                  ),
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  isFirst
                                      ? 'Volunteer Courier Dispatch Hub'
                                      : idx == 1
                                      ? 'Food Pickup: Provider Location'
                                      : 'Dropoff Destination Target',
                                  style: const TextStyle(color: Color(0xFF71717A), fontSize: 11),
                                ),
                                const SizedBox(height: 12),
                              ],
                            ),
                          ),
                        ),
                      ],
                    );
                  }).toList(),
                ),
              ),
              const SizedBox(height: 28),

              // Action Buttons: Food Collected / Food Delivered
              if (!isCollected && !isDelivered)
                SizedBox(
                  width: double.infinity,
                  height: 52,
                  child: ElevatedButton(
                    onPressed: () {
                      service.markCollected(currentAssignment.id);
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          backgroundColor: Color(0xFF6366F1),
                          content: Text('Food Collected! En route to recipients.'),
                        ),
                      );
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF6366F1),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    ),
                    child: const Text(
                      'FOOD COLLECTED',
                      style: TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.w800,
                        fontSize: 13,
                        letterSpacing: 0.5,
                      ),
                    ),
                  ),
                )
              else if (isCollected && !isDelivered)
                SizedBox(
                  width: double.infinity,
                  height: 52,
                  child: ElevatedButton(
                    onPressed: () {
                      service.markDelivered(currentAssignment.id);
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          backgroundColor: Color(0xFF10B981),
                          content: Text('Food Delivered! Zero food waste achieved.'),
                        ),
                      );
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF10B981),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    ),
                    child: const Text(
                      'FOOD DELIVERED',
                      style: TextStyle(
                        color: Color(0xFF09090B),
                        fontWeight: FontWeight.w800,
                        fontSize: 13,
                        letterSpacing: 0.5,
                      ),
                    ),
                  ),
                )
              else
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: const Color(0xFF10B981).withOpacity(0.15),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: const Color(0xFF10B981).withOpacity(0.3)),
                  ),
                  child: const Center(
                    child: Text(
                      'DELIVERY COMPLETED & VERIFIED',
                      style: TextStyle(
                        color: Color(0xFF10B981),
                        fontWeight: FontWeight.bold,
                        fontSize: 13,
                      ),
                    ),
                  ),
                ),

              const SizedBox(height: 16),

              // Demo Testing Trigger: Simulate Shelter Beta Unavailable
              Center(
                child: TextButton.icon(
                  onPressed: () {
                    service.simulateRecipientUnavailable(recipientName: 'Shelter Beta');
                  },
                  icon: const Icon(Icons.flash_on_rounded, color: Color(0xFFEC4899), size: 16),
                  label: const Text(
                    'Simulate Dynamic Re-optimization (Shelter Beta Offline)',
                    style: TextStyle(color: Color(0xFFEC4899), fontSize: 11),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
