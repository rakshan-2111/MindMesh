// ============================================================================
// MindMesh Mobile - Donation Status Timeline (Android Provider)
// Live-updating stepper: Posted -> Matched -> Assigned -> Collected -> Delivered
// ============================================================================

import 'package:flutter/material.dart';
import '../../services/supabase_service.dart';
import '../../models/models.dart';

class DonationTimelineScreen extends StatefulWidget {
  final DonationModel donation;

  const DonationTimelineScreen({super.key, required this.donation});

  @override
  State<DonationTimelineScreen> createState() => _DonationTimelineScreenState();
}

class _DonationTimelineScreenState extends State<DonationTimelineScreen> {
  final service = MindMeshService();

  @override
  void initState() {
    super.initState();
    service.addListener(_onUpdate);
  }

  @override
  void dispose() {
    service.removeListener(_onUpdate);
    super.dispose();
  }

  void _onUpdate() {
    if (mounted) setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    // Look up latest donation state from service
    final currentDonation = service.donations.firstWhere(
      (d) => d.id == widget.donation.id,
      orElse: () => widget.donation,
    );

    int currentStep = 2; // Default to Volunteer Assigned in demo
    if (currentDonation.status == DonationStatus.delivered) {
      currentStep = 4;
    } else if (currentDonation.status == DonationStatus.collected) {
      currentStep = 3;
    } else if (currentDonation.status == DonationStatus.assigned) {
      currentStep = 2;
    }

    return Scaffold(
      backgroundColor: const Color(0xFF09090B),
      appBar: AppBar(
        backgroundColor: const Color(0xFF09090B),
        elevation: 0,
        title: const Text(
          'Donation Lifecycle Timeline',
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
              // Batch Card
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
                    Text(
                      currentDonation.foodName,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      '${currentDonation.quantity} portions (${currentDonation.weightKg} kg) &bull; Pickup: ${currentDonation.pickupLocation}',
                      style: const TextStyle(color: Color(0xFFA1A1AA), fontSize: 12),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 28),

              const Text(
                'REALTIME PROGRESSION',
                style: TextStyle(
                  color: Color(0xFF71717A),
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 1.0,
                ),
              ),
              const SizedBox(height: 16),

              // 5 Stages Stepper
              _TimelineStep(
                stepNumber: 1,
                title: 'Donation Posted',
                subtitle: 'Registered on Android Provider app. Synced via Supabase.',
                isCompleted: currentStep >= 0,
                isCurrent: currentStep == 0,
              ),
              _TimelineStep(
                stepNumber: 2,
                title: 'Recipient Matched (DAA Engine)',
                subtitle: 'Greedy Allocator matched demand with NGO Alpha & Shelter Beta.',
                isCompleted: currentStep >= 1,
                isCurrent: currentStep == 1,
              ),
              _TimelineStep(
                stepNumber: 3,
                title: 'Volunteer Assigned (0/1 Knapsack & Dijkstra)',
                subtitle: 'Vehicle payload confirmed. Route generated for Alex Chen.',
                isCompleted: currentStep >= 2,
                isCurrent: currentStep == 2,
              ),
              _TimelineStep(
                stepNumber: 4,
                title: 'Food Collected',
                subtitle: 'Volunteer confirmed physical pickup from Canteen counter.',
                isCompleted: currentStep >= 3,
                isCurrent: currentStep == 3,
              ),
              _TimelineStep(
                stepNumber: 5,
                title: 'Food Delivered & Confirmed',
                subtitle: 'Successful handoff at destination shelter. Zero waste achieved.',
                isCompleted: currentStep >= 4,
                isCurrent: currentStep == 4,
                isLast: true,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _TimelineStep extends StatelessWidget {
  final int stepNumber;
  final String title;
  final String subtitle;
  final bool isCompleted;
  final bool isCurrent;
  final bool isLast;

  const _TimelineStep({
    required this.stepNumber,
    required this.title,
    required this.subtitle,
    required this.isCompleted,
    required this.isCurrent,
    this.isLast = false,
  });

  @override
  Widget build(BuildContext context) {
    final dotColor = isCompleted
        ? const Color(0xFF10B981)
        : const Color(0xFF27272A);

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Column(
          children: [
            Container(
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                color: dotColor.withOpacity(0.2),
                shape: BoxShape.circle,
                border: Border.all(color: dotColor, width: 2),
              ),
              child: Center(
                child: isCompleted
                    ? const Icon(Icons.check, color: Color(0xFF10B981), size: 16)
                    : Text(
                        '$stepNumber',
                        style: const TextStyle(color: Color(0xFF71717A), fontSize: 12),
                      ),
              ),
            ),
            if (!isLast)
              Container(
                width: 2,
                height: 54,
                color: isCompleted ? const Color(0xFF10B981) : const Color(0xFF27272A),
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
                  title,
                  style: TextStyle(
                    color: isCompleted ? Colors.white : const Color(0xFF71717A),
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  subtitle,
                  style: const TextStyle(
                    color: Color(0xFFA1A1AA),
                    fontSize: 12,
                  ),
                ),
                const SizedBox(height: 20),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
