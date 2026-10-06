// ============================================================================
// MindMesh Mobile - Create Food Donation Screen (Android Provider)
// ============================================================================

import 'package:flutter/material.dart';
import '../../services/supabase_service.dart';

class CreateDonationScreen extends StatefulWidget {
  const CreateDonationScreen({super.key});

  @override
  State<CreateDonationScreen> createState() => _CreateDonationScreenState();
}

class _CreateDonationScreenState extends State<CreateDonationScreen> {
  final _formKey = GlobalKey<FormState>();
  final _foodNameController = TextEditingController(text: 'Hot Fresh Rice & Dal Trays');
  final _quantityController = TextEditingController(text: '50');
  final _weightController = TextEditingController(text: '25.0');

  int _selectedExpiryMinutes = 45;
  String _selectedNode = 'CANTEEN';
  String _selectedLocation = 'Campus Central Canteen';
  bool _isPosting = false;

  final Map<String, String> _locationPresets = {
    'CANTEEN': 'Campus Central Canteen',
    'NORTH_CAFE': 'North Hall Cafe',
    'BAKERY': 'East Quad Bakery',
  };

  Future<void> _handlePost() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isPosting = true);

    final service = MindMeshService();
    await service.postDonation(
      foodName: _foodNameController.text.trim(),
      quantity: int.tryParse(_quantityController.text) ?? 50,
      weightKg: double.tryParse(_weightController.text) ?? 25.0,
      expiryMinutes: _selectedExpiryMinutes,
      pickupLocation: _selectedLocation,
      nodeId: _selectedNode,
    );

    setState(() => _isPosting = false);

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          backgroundColor: Color(0xFF10B981),
          content: Text('Donation posted! Control Center received batch.'),
        ),
      );
      Navigator.pop(context);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF09090B),
      appBar: AppBar(
        backgroundColor: const Color(0xFF09090B),
        elevation: 0,
        title: const Text(
          'Post Food Donation',
          style: TextStyle(
            color: Colors.white,
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20.0),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Food Name
                const Text(
                  'FOOD BATCH DESCRIPTION',
                  style: TextStyle(color: Color(0xFF71717A), fontSize: 11, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 8),
                TextFormField(
                  controller: _foodNameController,
                  style: const TextStyle(color: Colors.white, fontSize: 14),
                  decoration: InputDecoration(
                    filled: true,
                    fillColor: const Color(0xFF18181B),
                    hintText: 'e.g. Fresh Lunch Buffet Trays',
                    hintStyle: const TextStyle(color: Color(0xFF52525B)),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(color: Color(0xFF27272A)),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(color: Color(0xFF27272A)),
                    ),
                  ),
                  validator: (val) => val == null || val.isEmpty ? 'Required' : null,
                ),
                const SizedBox(height: 20),

                // Quantity & Weight
                Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'PORTIONS',
                            style: TextStyle(color: Color(0xFF71717A), fontSize: 11, fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 8),
                          TextFormField(
                            controller: _quantityController,
                            keyboardType: TextInputType.number,
                            style: const TextStyle(color: Colors.white, fontSize: 14),
                            decoration: InputDecoration(
                              filled: true,
                              fillColor: const Color(0xFF18181B),
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12),
                                borderSide: const BorderSide(color: Color(0xFF27272A)),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'WEIGHT (KG)',
                            style: TextStyle(color: Color(0xFF71717A), fontSize: 11, fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 8),
                          TextFormField(
                            controller: _weightController,
                            keyboardType: TextInputType.number,
                            style: const TextStyle(color: Colors.white, fontSize: 14),
                            decoration: InputDecoration(
                              filled: true,
                              fillColor: const Color(0xFF18181B),
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12),
                                borderSide: const BorderSide(color: Color(0xFF27272A)),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 20),

                // Expiry Presets
                const Text(
                  'EXPIRY WINDOW (URGENCY FORMULA BOOST)',
                  style: TextStyle(color: Color(0xFF71717A), fontSize: 11, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 8),
                Row(
                  children: [30, 45, 60, 90].map((mins) {
                    final isSelected = _selectedExpiryMinutes == mins;
                    return Expanded(
                      child: GestureDetector(
                        onTap: () => setState(() => _selectedExpiryMinutes = mins),
                        child: Container(
                          margin: const EdgeInsets.symmetric(horizontal: 3),
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          decoration: BoxDecoration(
                            color: isSelected ? const Color(0xFFF59E0B) : const Color(0xFF18181B),
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(
                              color: isSelected ? const Color(0xFFF59E0B) : const Color(0xFF27272A),
                            ),
                          ),
                          child: Center(
                            child: Text(
                              '${mins}m',
                              style: TextStyle(
                                color: isSelected ? const Color(0xFF09090B) : Colors.white,
                                fontWeight: FontWeight.bold,
                                fontSize: 12,
                              ),
                            ),
                          ),
                        ),
                      ),
                    );
                  }).toList(),
                ),
                const SizedBox(height: 20),

                // Pickup Location Presets
                const Text(
                  'PICKUP LOCATION (GRAPH NODE)',
                  style: TextStyle(color: Color(0xFF71717A), fontSize: 11, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14),
                  decoration: BoxDecoration(
                    color: const Color(0xFF18181B),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: const Color(0xFF27272A)),
                  ),
                  child: DropdownButtonHideUnderline(
                    child: DropdownButton<String>(
                      value: _selectedNode,
                      dropdownColor: const Color(0xFF18181B),
                      isExpanded: true,
                      items: _locationPresets.entries.map((entry) {
                        return DropdownMenuItem<String>(
                          value: entry.key,
                          child: Text(
                            '${entry.value} (${entry.key})',
                            style: const TextStyle(color: Colors.white, fontSize: 13),
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
                const SizedBox(height: 36),

                // Submit Button
                SizedBox(
                  width: double.infinity,
                  height: 52,
                  child: ElevatedButton(
                    onPressed: _isPosting ? null : _handlePost,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFF59E0B),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      elevation: 0,
                    ),
                    child: _isPosting
                        ? const CircularProgressIndicator(color: Color(0xFF09090B))
                        : const Text(
                            'POST DONATION & TRIGGER ENGINE',
                            style: TextStyle(
                              color: Color(0xFF09090B),
                              fontWeight: FontWeight.w800,
                              fontSize: 13,
                              letterSpacing: 0.5,
                            ),
                          ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
