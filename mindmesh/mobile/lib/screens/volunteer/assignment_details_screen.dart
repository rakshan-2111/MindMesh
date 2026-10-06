// ============================================================================
// MindMesh Mobile - Assignment Details Screen (iPhone Volunteer)
// Inspect pickup, deliveries with quantities, weight, priority, and ACCEPT
// ============================================================================

import 'package:flutter/material.dart';
import '../../services/supabase_service.dart';
import '../../models/models.dart';
import 'optimized_route_screen.dart';

class AssignmentDetailsScreen extends StatefulWidget {
  final AssignmentModel assignment;

  const AssignmentDetailsScreen({super.key, required this.assignment});

  @override
  State<AssignmentDetailsScreen> createState() => _AssignmentDetailsScreenState();
}

class _AssignmentDetailsScreenState extends State<AssignmentDetailsScreen> {
  final service = MindMeshService();

  @override
  Widget build(BuildContext context) {
    final currentAssignment = service.assignments.firstWhere(
      (a) => a.id == widget.assignment.id,
      orElse: () => widget.assignment,
    );

    return Scaffold(
      backgroundColor: const Color(0xFF09090B),
      appBar: AppBar(
        backgroundColor: const Color(0xFF09090B),
        elevation: 0,
        title: const Text(
          'Assignment Details',
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
              // Header Card
              Container(
                padding: const EdgeInsets.all(18),
                decoration: BoxDecoration(
                  color: const Color(0xFF18181B),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFF27272A)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'TASK #${currentAssignment.id.substring(0, 10)}',
                          style: const TextStyle(
                            color: Color(0xFF71717A),
                            fontSize: 11,
                            fontFamily: 'monospace',
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: const Color(0xFF10B981).withOpacity(0.15),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            currentAssignment.status.name.toUpperCase(),
                            style: const TextStyle(
                              color: Color(0xFF10B981),
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text(
                      currentAssignment.recipientName,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // Specs Grid
              Row(
                children: [
                  Expanded(
                    child: _DetailBox(
                      title: 'PORTIONS',
                      value: '${currentAssignment.quantity}',
                      subtitle: 'demands fulfilled',
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: _DetailBox(
                      title: 'WEIGHT',
                      value: '${currentAssignment.weightKg} kg',
                      subtitle: 'carrier payload',
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: _DetailBox(
                      title: 'DISTANCE',
                      value: '${currentAssignment.totalDistance} km',
                      subtitle: 'Dijkstra shortest',
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),

              // Pickup Section
              const Text(
                'PICKUP ORIGIN',
                style: TextStyle(color: Color(0xFF71717A), fontSize: 11, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: const Color(0xFF18181B),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: const Color(0xFF27272A)),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.storefront_rounded, color: Color(0xFFF59E0B), size: 22),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            currentAssignment.pickupLocation,
                            style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 2),
                          const Text(
                            'Provider ready &bull; Check portions before departure',
                            style: TextStyle(color: Color(0xFFA1A1AA), fontSize: 11),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),

              // Delivery Destinations
              const Text(
                'DESTINATION DROPOFF',
                style: TextStyle(color: Color(0xFF71717A), fontSize: 11, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: const Color(0xFF18181B),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: const Color(0xFF27272A)),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.volunteer_activism_rounded, color: Color(0xFF10B981), size: 22),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            currentAssignment.recipientName,
                            style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 2),
                          const Text(
                            'High Priority Community Shelter Demands',
                            style: TextStyle(color: Color(0xFFA1A1AA), fontSize: 11),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 36),

              // Accept / View Route Button
              SizedBox(
                width: double.infinity,
                height: 52,
                child: ElevatedButton(
                  onPressed: () {
                    service.acceptAssignment(currentAssignment.id);
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => OptimizedRouteScreen(assignment: currentAssignment),
                      ),
                    );
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF6366F1),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: const [
                      Icon(Icons.check_circle_outline, color: Colors.white, size: 20),
                      SizedBox(width: 8),
                      Text(
                        'ACCEPT & VIEW OPTIMIZED ROUTE',
                        style: TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.w800,
                          fontSize: 13,
                          letterSpacing: 0.5,
                        ),
                      ),
                    ],
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

class _DetailBox extends StatelessWidget {
  final String title;
  final String value;
  final String subtitle;

  const _DetailBox({required this.title, required this.value, required this.subtitle});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFF18181B),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFF27272A)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: const TextStyle(color: Color(0xFF71717A), fontSize: 9, fontWeight: FontWeight.bold)),
          const SizedBox(height: 6),
          Text(
            value,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 16,
              fontWeight: FontWeight.bold,
              fontFamily: 'monospace',
            ),
          ),
          const SizedBox(height: 2),
          Text(subtitle, style: const TextStyle(color: Color(0xFF52525B), fontSize: 9)),
        ],
      ),
    );
  }
}
