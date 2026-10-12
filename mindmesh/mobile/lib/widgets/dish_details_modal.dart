// ============================================================================
// MindMesh Mobile - Dish / Donation Details Modal
// Exact replica of Screen 2 from reference design:
// Dark header with circular dish presentation, back & favorite buttons,
// white curved sheet with 3 metric pills (time, calories/weight, rating),
// culinary description, portion counter [- 2 +], and primary action button.
// ============================================================================

import 'package:flutter/material.dart';
import '../services/supabase_service.dart';
import '../theme/mindmesh_theme.dart';

class DishDetailsModal extends StatefulWidget {
  final Map<String, dynamic> dish;
  final VoidCallback? onAccept;
  final bool isProvider;

  const DishDetailsModal({
    super.key,
    required this.dish,
    this.onAccept,
    this.isProvider = false,
  });

  static Future<void> show(
    BuildContext context, {
    required Map<String, dynamic> dish,
    VoidCallback? onAccept,
    bool isProvider = false,
  }) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => DishDetailsModal(
        dish: dish,
        onAccept: onAccept,
        isProvider: isProvider,
      ),
    );
  }

  @override
  State<DishDetailsModal> createState() => _DishDetailsModalState();
}

class _DishDetailsModalState extends State<DishDetailsModal> {
  int _quantity = 2;
  bool _isFavorite = true;
  bool _isClaiming = false;

  @override
  void initState() {
    super.initState();
    _quantity = widget.dish['portions'] != null ? (widget.dish['portions'] as int).clamp(1, 50) : 2;
  }

  void _handleAction() {
    setState(() => _isClaiming = true);
    final service = MindMeshService();

    // If there's an active assignment, mark it accepted
    if (service.assignments.isNotEmpty) {
      service.acceptAssignment(service.assignments.first.id);
    }

    Future.delayed(const Duration(milliseconds: 400), () {
      if (!mounted) return;
      setState(() => _isClaiming = false);
      Navigator.of(context).pop();
      widget.onAccept?.call();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            widget.isProvider
                ? 'Surplus batch dispatched to live shelter network!'
                : 'Rescue batch accepted! Optimal route generated.',
          ),
          backgroundColor: const Color(0xFF1F5D46),
          duration: const Duration(seconds: 2),
        ),
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    final name = widget.dish['name'] ?? 'Chicken Curry with Rice';
    final time = widget.dish['time'] ?? '30 min';
    final calories = widget.dish['calories'] ?? '275 calories';
    final rating = widget.dish['rating']?.toString() ?? '4.9';
    final description = widget.dish['description'] ??
        'Indian chicken curry stewed in an onion- and tomato-based sauce, flavoured with ginger, garlic, tomato puree, chilli peppers and a variety of spices, often including turmeric, cumin, cardamom.';
    final price = widget.dish['price'] ?? '\$18';
    final imageUrl = widget.dish['imageUrl'] as String?;
    final iconEmoji = widget.dish['icon'] ?? '🍛';

    return Container(
      height: MediaQuery.of(context).size.height * 0.90,
      decoration: const BoxDecoration(
        color: Color(0xFF181A20), // Dark background matching screen 2 top
        borderRadius: BorderRadius.vertical(top: Radius.circular(36)),
      ),
      child: Column(
        children: [
          // 1. Dark Top Hero with Dish Picture, Back Button & Favorite Heart
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 8),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                // Circular Back Button
                GestureDetector(
                  onTap: () => Navigator.of(context).pop(),
                  child: Container(
                    width: 44,
                    height: 44,
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.12),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.arrow_back_ios_new, color: Colors.white, size: 18),
                  ),
                ),
                // Pill handle
                Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
                // Circular Favorite Heart Button
                GestureDetector(
                  onTap: () => setState(() => _isFavorite = !_isFavorite),
                  child: Container(
                    width: 44,
                    height: 44,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.1),
                          blurRadius: 8,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Icon(
                      _isFavorite ? Icons.favorite : Icons.favorite_border,
                      color: _isFavorite ? const Color(0xFFEF4444) : MindMeshColors.ink,
                      size: 20,
                    ),
                  ),
                ),
              ],
            ),
          ),

          // 2. Center Circular Food Dish Presentation
          Expanded(
            flex: 3,
            child: Center(
              child: Hero(
                tag: 'dish_image_$name',
                child: Container(
                  width: 210,
                  height: 210,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: const Color(0xFF2A2D35),
                    border: Border.all(color: Colors.white.withOpacity(0.15), width: 4),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.4),
                        blurRadius: 30,
                        offset: const Offset(0, 12),
                      ),
                    ],
                  ),
                  child: ClipOval(
                    child: imageUrl != null && imageUrl.isNotEmpty
                        ? Image.network(
                            imageUrl,
                            fit: BoxFit.cover,
                            errorBuilder: (context, error, stackTrace) => _buildEmojiFallback(iconEmoji),
                          )
                        : _buildEmojiFallback(iconEmoji),
                  ),
                ),
              ),
            ),
          ),

          // 3. Sliding White Curved Bottom Card (Matching Screen 2 from reference)
          Expanded(
            flex: 5,
            child: Container(
              width: double.infinity,
              padding: const EdgeInsets.fromLTRB(28, 28, 28, 20),
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.vertical(top: Radius.circular(36)),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black12,
                    blurRadius: 20,
                    offset: Offset(0, -5),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Dish Title
                  Text(
                    name,
                    style: const TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.w800,
                      color: MindMeshColors.ink,
                      letterSpacing: -0.5,
                    ),
                  ),
                  const SizedBox(height: 14),

                  // Three Metric Pills (⏱️ 30 min, 🔥 275 calories, ⭐ 4.9)
                  Row(
                    children: [
                      _buildMetricPill('⏱️', time),
                      const SizedBox(width: 14),
                      _buildMetricPill('🔥', calories),
                      const SizedBox(width: 14),
                      _buildMetricPill('⭐', rating),
                    ],
                  ),
                  const SizedBox(height: 20),

                  // Culinary Description
                  Expanded(
                    child: SingleChildScrollView(
                      physics: const BouncingScrollPhysics(),
                      child: Text(
                        description,
                        style: const TextStyle(
                          fontSize: 14,
                          color: Color(0xFF6B7280),
                          height: 1.55,
                        ),
                      ),
                    ),
                  ),

                  const SizedBox(height: 16),

                  // Bottom Controls: Stepper [- 2 +] and Action Button [Add to Cart $18]
                  Row(
                    children: [
                      // Counter [- 2 +]
                      Container(
                        height: 52,
                        padding: const EdgeInsets.symmetric(horizontal: 10),
                        decoration: BoxDecoration(
                          color: const Color(0xFFF3F4F6),
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: Row(
                          children: [
                            IconButton(
                              icon: const Icon(Icons.remove, size: 18, color: MindMeshColors.ink),
                              onPressed: () {
                                if (_quantity > 1) setState(() => _quantity--);
                              },
                              splashRadius: 18,
                            ),
                            Text(
                              '$_quantity',
                              style: const TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w700,
                                color: MindMeshColors.ink,
                              ),
                            ),
                            IconButton(
                              icon: const Icon(Icons.add, size: 18, color: MindMeshColors.ink),
                              onPressed: () {
                                setState(() => _quantity++);
                              },
                              splashRadius: 18,
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 16),

                      // Primary Action Button (Add to Cart $18 / Accept Rescue)
                      Expanded(
                        child: SizedBox(
                          height: 52,
                          child: ElevatedButton(
                            onPressed: _isClaiming ? null : _handleAction,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFF1E2022), // Dark pill matching screen 2 button
                              foregroundColor: Colors.white,
                              elevation: 0,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(16),
                              ),
                            ),
                            child: _isClaiming
                                ? const SizedBox(
                                    width: 20,
                                    height: 20,
                                    child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                                  )
                                : Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Text(
                                        widget.isProvider ? 'Dispatch Batch' : 'Add to Tour',
                                        style: const TextStyle(
                                          fontSize: 15,
                                          fontWeight: FontWeight.w700,
                                        ),
                                      ),
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                        decoration: BoxDecoration(
                                          color: Colors.white.withOpacity(0.18),
                                          borderRadius: BorderRadius.circular(10),
                                        ),
                                        child: Text(
                                          price,
                                          style: const TextStyle(
                                            fontSize: 14,
                                            fontWeight: FontWeight.w800,
                                            color: Colors.white,
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMetricPill(String icon, String label) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: const Color(0xFFF9FAFB),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFE5E7EB)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(icon, style: const TextStyle(fontSize: 13)),
          const SizedBox(width: 6),
          Text(
            label,
            style: const TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: MindMeshColors.ink,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEmojiFallback(String emoji) {
    return Container(
      color: const Color(0xFF22252C),
      child: Center(
        child: Text(
          emoji,
          style: const TextStyle(fontSize: 90),
        ),
      ),
    );
  }
}
