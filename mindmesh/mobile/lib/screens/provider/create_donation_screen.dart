// ============================================================================
// MindMesh Mobile - Create Donation Screen
// Clear form groups: Food, Quantity, Pickup, Expiry with sticky footer
// ============================================================================

import 'package:flutter/material.dart';
import 'package:uuid/uuid.dart';
import '../../models/models.dart';
import '../../services/supabase_service.dart';
import '../../theme/mindmesh_theme.dart';

class CreateDonationScreen extends StatefulWidget {
  const CreateDonationScreen({super.key});

  @override
  State<CreateDonationScreen> createState() => _CreateDonationScreenState();
}

class _CreateDonationScreenState extends State<CreateDonationScreen> {
  final _service = MindMeshService();

  final _foodNameController = TextEditingController(text: 'Cooked Rice & Dal Trays');
  int _portions = 50;
  double _weightKg = 25.0;
  int _expiryMinutes = 45;

  String _selectedNode = 'CANTEEN';
  String _selectedLocation = 'CHRIST Central Dining Hall, Hosur Road';

  final Map<String, String> _locationPresets = {
    'CANTEEN': 'CHRIST Central Dining Hall, Hosur Road',
    'NORTH_CAFE': 'North Hall Cafe, Indiranagar',
    'BAKERY': 'Koramangala Bakery, 80ft Road',
  };

  bool _isSubmitting = false;

  void _submitDonation() async {
    if (_foodNameController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter food description.')),
      );
      return;
    }

    setState(() => _isSubmitting = true);

    final donation = DonationModel(
      id: const Uuid().v4(),
      providerId: '22222222-2222-2222-2222-222222222221',
      foodName: _foodNameController.text.trim(),
      quantity: _portions,
      unit: 'portions',
      weightKg: _weightKg,
      expiryTime: DateTime.now().add(Duration(minutes: _expiryMinutes)),
      pickupLocation: _selectedLocation,
      nodeId: _selectedNode,
      latitude: 12.9345,
      longitude: 77.6060,
      status: DonationStatus.available,
      createdAt: DateTime.now(),
    );

    await _service.createDonation(donation);

    if (!mounted) return;
    setState(() => _isSubmitting = false);
    Navigator.of(context).pop();

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Donation posted. Nearby volunteers notified.')),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: MindMeshColors.canvas,
      appBar: AppBar(
        title: const Text('New Donation'),
      ),
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // Group 1: Food Description
                    _buildFormSection(
                      title: 'Food',
                      subtitle: 'Description of the surplus package',
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Item name',
                            style: TextStyle(fontSize: 12, fontWeight: FontWeight.w500, color: MindMeshColors.ink),
                          ),
                          const SizedBox(height: 6),
                          TextField(
                            controller: _foodNameController,
                            style: const TextStyle(fontSize: 13, color: MindMeshColors.ink),
                            decoration: const InputDecoration(
                              hintText: 'e.g. Cooked Rice Trays, Sandwich Platters',
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Group 2: Quantity & Weight
                    _buildFormSection(
                      title: 'Quantity',
                      subtitle: 'Portions count and estimated mass',
                      child: Column(
                        children: [
                          // Portions Stepper
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Text(
                                    'Meal portions',
                                    style: TextStyle(fontSize: 12, fontWeight: FontWeight.w500, color: MindMeshColors.ink),
                                  ),
                                  Text(
                                    '$_portions portions',
                                    style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: MindMeshColors.ink),
                                  ),
                                ],
                              ),
                              Row(
                                children: [
                                  _StepperButton(
                                    icon: Icons.remove,
                                    onTap: () {
                                      if (_portions > 10) setState(() => _portions -= 5);
                                    },
                                  ),
                                  const SizedBox(width: 8),
                                  _StepperButton(
                                    icon: Icons.add,
                                    onTap: () {
                                      setState(() => _portions += 5);
                                    },
                                  ),
                                ],
                              ),
                            ],
                          ),
                          const Divider(height: 24, color: MindMeshColors.border),

                          // Weight in kg
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text(
                                'Estimated weight (kg)',
                                style: TextStyle(fontSize: 12, fontWeight: FontWeight.w500, color: MindMeshColors.ink),
                              ),
                              Text(
                                '${_weightKg.toStringAsFixed(1)} kg',
                                style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: MindMeshColors.ink),
                              ),
                            ],
                          ),
                          Slider(
                            value: _weightKg,
                            min: 5.0,
                            max: 50.0,
                            divisions: 45,
                            activeColor: MindMeshColors.brand,
                            inactiveColor: MindMeshColors.subtleFill,
                            onChanged: (val) => setState(() => _weightKg = val),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Group 3: Pickup Location
                    _buildFormSection(
                      title: 'Pickup',
                      subtitle: 'Campus location for volunteer courier arrival',
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Saved location',
                            style: TextStyle(fontSize: 12, fontWeight: FontWeight.w500, color: MindMeshColors.ink),
                          ),
                          const SizedBox(height: 6),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(6),
                              border: Border.all(color: MindMeshColors.border),
                            ),
                            child: DropdownButtonHideUnderline(
                              child: DropdownButton<String>(
                                value: _selectedNode,
                                isExpanded: true,
                                icon: const Icon(Icons.keyboard_arrow_down, size: 18),
                                items: _locationPresets.entries.map((e) {
                                  return DropdownMenuItem(
                                    value: e.key,
                                    child: Text(
                                      e.value,
                                      style: const TextStyle(fontSize: 13, color: MindMeshColors.ink),
                                    ),
                                  );
                                }).toList(),
                                onChanged: (val) {
                                  if (val != null) {
                                    setState(() {
                                      _selectedNode = val;
                                      _selectedLocation = _locationPresets[val]!;
                                    });
                                  }
                                },
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Group 4: Expiry Time
                    _buildFormSection(
                      title: 'Expiry',
                      subtitle: 'Collection deadline before food perishes',
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              _ExpiryChip(
                                label: '30 min',
                                isSelected: _expiryMinutes == 30,
                                onTap: () => setState(() => _expiryMinutes = 30),
                              ),
                              const SizedBox(width: 8),
                              _ExpiryChip(
                                label: '45 min',
                                isSelected: _expiryMinutes == 45,
                                onTap: () => setState(() => _expiryMinutes = 45),
                              ),
                              const SizedBox(width: 8),
                              _ExpiryChip(
                                label: '1 hr',
                                isSelected: _expiryMinutes == 60,
                                onTap: () => setState(() => _expiryMinutes = 60),
                              ),
                              const SizedBox(width: 8),
                              _ExpiryChip(
                                label: '2 hr',
                                isSelected: _expiryMinutes == 120,
                                onTap: () => setState(() => _expiryMinutes = 120),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),

            // Sticky Footer Button
            Container(
              padding: const EdgeInsets.all(16),
              decoration: const BoxDecoration(
                color: Colors.white,
                border: Border(top: BorderSide(color: MindMeshColors.border)),
              ),
              child: Column(
                children: [
                  SizedBox(
                    height: 44,
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: _isSubmitting ? null : _submitDonation,
                      child: _isSubmitting
                          ? const SizedBox(
                              width: 18,
                              height: 18,
                              child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                            )
                          : const Text('Post donation'),
                    ),
                  ),
                  const SizedBox(height: 6),
                  const Text(
                    'Nearby volunteers are notified immediately.',
                    style: TextStyle(
                      fontSize: 11,
                      color: MindMeshColors.textTertiary,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFormSection({
    required String title,
    required String subtitle,
    required Widget child,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: MindMeshColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: const TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: MindMeshColors.ink,
            ),
          ),
          Text(
            subtitle,
            style: const TextStyle(
              fontSize: 11,
              color: MindMeshColors.textSecondary,
            ),
          ),
          const SizedBox(height: 14),
          child,
        ],
      ),
    );
  }
}

class _StepperButton extends StatelessWidget {
  final IconData icon;
  final VoidCallback onTap;

  const _StepperButton({required this.icon, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(6),
      child: Container(
        width: 36,
        height: 36,
        decoration: BoxDecoration(
          color: MindMeshColors.subtleFill,
          borderRadius: BorderRadius.circular(6),
          border: Border.all(color: MindMeshColors.border),
        ),
        child: Icon(icon, size: 18, color: MindMeshColors.ink),
      ),
    );
  }
}

class _ExpiryChip extends StatelessWidget {
  final String label;
  final bool isSelected;
  final VoidCallback onTap;

  const _ExpiryChip({
    required this.label,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(6),
        child: Container(
          height: 34,
          alignment: Alignment.center,
          decoration: BoxDecoration(
            color: isSelected ? MindMeshColors.brand : Colors.white,
            borderRadius: BorderRadius.circular(6),
            border: Border.all(
              color: isSelected ? MindMeshColors.brand : MindMeshColors.border,
            ),
          ),
          child: Text(
            label,
            style: TextStyle(
              fontSize: 12,
              fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
              color: isSelected ? Colors.white : MindMeshColors.textSecondary,
            ),
          ),
        ),
      ),
    );
  }
}
