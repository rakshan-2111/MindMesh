// ============================================================================
// MindMesh Mobile - Donation Detail & Lifecycle Timeline
// Vertical timeline: Posted, Matched, Assigned, Collected, Delivered
// ============================================================================

import 'package:flutter/material.dart';
import '../../models/models.dart';
import '../../theme/mindmesh_theme.dart';
import '../../widgets/status_chip.dart';

class DonationTimelineScreen extends StatelessWidget {
  final DonationModel donation;

  const DonationTimelineScreen({super.key, required this.donation});

  void _showCancelConfirmation(BuildContext context) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(10)),
      ),
      backgroundColor: Colors.white,
      builder: (ctx) {
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Text(
                  'Cancel this donation?',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color: MindMeshColors.ink,
                  ),
                ),
                const SizedBox(height: 6),
                const Text(
                  'Assigned volunteers and matched recipients will be notified. This action cannot be undone.',
                  style: TextStyle(fontSize: 13, color: MindMeshColors.textSecondary),
                ),
                const SizedBox(height: 20),
                SizedBox(
                  height: 44,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: MindMeshColors.critical,
                    ),
                    onPressed: () {
                      Navigator.of(ctx).pop();
                      Navigator.of(context).pop();
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Donation cancelled.')),
                      );
                    },
                    child: const Text('Confirm cancellation'),
                  ),
                ),
                const SizedBox(height: 8),
                SizedBox(
                  height: 44,
                  child: OutlinedButton(
                    onPressed: () => Navigator.of(ctx).pop(),
                    child: const Text('Keep donation'),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final expiryDiff = donation.expiryTime.difference(DateTime.now()).inMinutes;
    final expiryText = expiryDiff > 0 ? 'Expires in $expiryDiff min' : 'Expired';

    return Scaffold(
      backgroundColor: MindMeshColors.canvas,
      appBar: AppBar(
        title: const Text('Donation Detail'),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Summary Spec Card
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: MindMeshColors.border),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Batch #${donation.id.length > 8 ? donation.id.substring(0, 8) : donation.id}',
                          style: const TextStyle(
                            fontSize: 11,
                            fontFamily: 'JetBrains Mono',
                            color: MindMeshColors.textTertiary,
                          ),
                        ),
                        StatusChip(
                          label: expiryText,
                          variant: expiryDiff <= 60 ? StatusChipVariant.critical : StatusChipVariant.warning,
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text(
                      donation.foodName,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                        color: MindMeshColors.ink,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '${donation.quantity} portions · ${donation.weightKg} kg',
                      style: const TextStyle(fontSize: 13, color: MindMeshColors.textSecondary),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      donation.pickupLocation,
                      style: const TextStyle(fontSize: 12, color: MindMeshColors.textTertiary),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),

              // Lifecycle Timeline
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: MindMeshColors.border),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Lifecycle progression',
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: MindMeshColors.ink,
                      ),
                    ),
                    const SizedBox(height: 16),

                    const _TimelineNode(
                      title: 'Posted',
                      subtitle: 'CHRIST Central Dining Hall, Hosur Road · Today, 13:42',
                      isCompleted: true,
                    ),
                    const _TimelineNode(
                      title: 'Matched',
                      subtitle: '30 portions for Asha Foundation · 20 portions for Sneha Shelter',
                      isCompleted: true,
                    ),
                    const _TimelineNode(
                      title: 'Volunteer assigned',
                      subtitle: 'Ravi Kumar (+91 98801 12233) · Delivery Scooter',
                      isCompleted: true,
                    ),
                    const _TimelineNode(
                      title: 'Collected',
                      subtitle: 'Scheduled pickup window by 14:15',
                      isCompleted: false,
                    ),
                    const _TimelineNode(
                      title: 'Delivered',
                      subtitle: 'Pending confirmation from shelter drop-offs',
                      isCompleted: false,
                      isLast: true,
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // Cancel Action
              Center(
                child: TextButton(
                  onPressed: () => _showCancelConfirmation(context),
                  child: const Text(
                    'Cancel donation',
                    style: TextStyle(
                      color: MindMeshColors.critical,
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                    ),
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

class _TimelineNode extends StatelessWidget {
  final String title;
  final String subtitle;
  final bool isCompleted;
  final bool isLast;

  const _TimelineNode({
    required this.title,
    required this.subtitle,
    required this.isCompleted,
    this.isLast = false,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Column(
          children: [
            Container(
              width: 14,
              height: 14,
              decoration: BoxDecoration(
                color: isCompleted ? MindMeshColors.success : MindMeshColors.canvas,
                shape: BoxShape.circle,
                border: Border.all(
                  color: isCompleted ? MindMeshColors.success : MindMeshColors.textTertiary,
                  width: 2,
                ),
              ),
            ),
            if (!isLast)
              Container(
                width: 1,
                height: 36,
                color: MindMeshColors.border,
              ),
          ],
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: isCompleted ? MindMeshColors.ink : MindMeshColors.textSecondary,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  subtitle,
                  style: const TextStyle(
                    fontSize: 11,
                    color: MindMeshColors.textTertiary,
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
