// ============================================================================
// MindMesh Mobile - Volunteer Task Details (Bottom Sheet / Screen)
// Clean stop list, route schematic, 2 large figures, and Accept Task button
// ============================================================================

import 'package:flutter/material.dart';
import '../../models/models.dart';
import '../../theme/mindmesh_theme.dart';

class AssignmentDetailsScreen extends StatelessWidget {
  final DonationModel donation;
  final VoidCallback onAccept;

  const AssignmentDetailsScreen({
    super.key,
    required this.donation,
    required this.onAccept,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text('Task Details'),
        automaticallyImplyLeading: true,
      ),
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // Two Large Figures Strip: Total Distance & Estimated Time
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: MindMeshColors.canvas,
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: MindMeshColors.border),
                      ),
                      child: Row(
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: const [
                                Text(
                                  'Total distance',
                                  style: TextStyle(
                                    fontSize: 11,
                                    fontWeight: FontWeight.w500,
                                    color: MindMeshColors.textSecondary,
                                  ),
                                ),
                                SizedBox(height: 2),
                                Text(
                                  '4.2 km',
                                  style: TextStyle(
                                    fontSize: 24,
                                    fontWeight: FontWeight.w700,
                                    color: MindMeshColors.ink,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          Container(width: 1, height: 36, color: MindMeshColors.border),
                          Expanded(
                            child: Padding(
                              padding: const EdgeInsets.only(left: 16),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: const [
                                  Text(
                                    'Estimated time',
                                    style: TextStyle(
                                      fontSize: 11,
                                      fontWeight: FontWeight.w500,
                                      color: MindMeshColors.textSecondary,
                                    ),
                                  ),
                                  SizedBox(height: 2),
                                  Text(
                                    '14 min',
                                    style: TextStyle(
                                      fontSize: 24,
                                      fontWeight: FontWeight.w700,
                                      color: MindMeshColors.brand,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 20),

                    // Compact Route Schematic (Clean vector lines and numbered circles)
                    const Text(
                      'Route schematic',
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: MindMeshColors.ink,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 16),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: MindMeshColors.border),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceAround,
                        children: [
                          _buildSchematicNode(1, 'CHRIST Canteen', isPickup: true),
                          _buildSchematicLine('1.8 km'),
                          _buildSchematicNode(2, 'Asha Foundation', isPickup: false),
                          _buildSchematicLine('1.2 km'),
                          _buildSchematicNode(3, 'Sneha Shelter', isPickup: false),
                        ],
                      ),
                    ),
                    const SizedBox(height: 20),

                    // Stop List: Pickup and Drop-offs
                    const Text(
                      'Stop list',
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: MindMeshColors.ink,
                      ),
                    ),
                    const SizedBox(height: 8),

                    _buildStopCard(
                      stepNumber: 1,
                      type: 'Pickup',
                      title: donation.pickupLocation,
                      details: '${donation.quantity} portions (${donation.weightKg} kg) · ${donation.foodName}',
                      window: 'Arrive by 14:15 PM',
                      isPickup: true,
                    ),
                    const SizedBox(height: 8),
                    _buildStopCard(
                      stepNumber: 2,
                      type: 'Drop-off 1',
                      title: 'Asha Foundation',
                      details: '30 portions · Koramangala 4th Block',
                      window: 'Arrive by 14:30 PM',
                      isPickup: false,
                    ),
                    const SizedBox(height: 8),
                    _buildStopCard(
                      stepNumber: 3,
                      type: 'Drop-off 2',
                      title: 'Sneha Shelter',
                      details: '20 portions · Indiranagar 100ft Road',
                      window: 'Arrive by 14:45 PM',
                      isPickup: false,
                    ),
                  ],
                ),
              ),
            ),

            // Full-width Accept Task Button
            Container(
              padding: const EdgeInsets.all(16),
              decoration: const BoxDecoration(
                color: Colors.white,
                border: Border(top: BorderSide(color: MindMeshColors.border)),
              ),
              child: SizedBox(
                height: 44,
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: onAccept,
                  child: const Text('Accept task'),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSchematicNode(int number, String label, {required bool isPickup}) {
    return Column(
      children: [
        Container(
          width: 26,
          height: 26,
          decoration: BoxDecoration(
            color: isPickup ? MindMeshColors.brand : Colors.white,
            shape: BoxShape.circle,
            border: Border.all(color: MindMeshColors.brand, width: 2),
          ),
          alignment: Alignment.center,
          child: Text(
            '$number',
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w700,
              color: isPickup ? Colors.white : MindMeshColors.brand,
            ),
          ),
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: const TextStyle(fontSize: 10, color: MindMeshColors.textSecondary),
        ),
      ],
    );
  }

  Widget _buildSchematicLine(String distance) {
    return Expanded(
      child: Column(
        children: [
          Container(
            height: 2,
            color: MindMeshColors.brand,
          ),
          const SizedBox(height: 2),
          Text(
            distance,
            style: const TextStyle(fontSize: 9, color: MindMeshColors.textTertiary, fontFamily: 'monospace'),
          ),
        ],
      ),
    );
  }

  Widget _buildStopCard({
    required int stepNumber,
    required String type,
    required String title,
    required String details,
    required String window,
    required bool isPickup,
  }) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: MindMeshColors.border),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 22,
            height: 22,
            decoration: BoxDecoration(
              color: isPickup ? MindMeshColors.brandTint : MindMeshColors.subtleFill,
              borderRadius: BorderRadius.circular(4),
            ),
            alignment: Alignment.center,
            child: Text(
              '$stepNumber',
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w700,
                color: isPickup ? MindMeshColors.brand : MindMeshColors.ink,
              ),
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      type,
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        color: isPickup ? MindMeshColors.brand : MindMeshColors.textSecondary,
                      ),
                    ),
                    Text(
                      window,
                      style: const TextStyle(fontSize: 10, color: MindMeshColors.textTertiary),
                    ),
                  ],
                ),
                const SizedBox(height: 2),
                Text(
                  title,
                  style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: MindMeshColors.ink),
                ),
                const SizedBox(height: 2),
                Text(
                  details,
                  style: const TextStyle(fontSize: 11, color: MindMeshColors.textSecondary),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
