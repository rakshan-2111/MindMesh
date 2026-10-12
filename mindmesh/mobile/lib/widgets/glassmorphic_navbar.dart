// ============================================================================
// MindMesh Mobile - Fixed Glassmorphic Bottom Navigation Bar
// Uses BackdropFilter for authentic frosted glassmorphic blur, translucent
// dark obsidian container with subtle border, and EVERY icon displays
// live meaningful data badges (surplus count, optimal route km, active dispatches,
// and hardware latency ping).
// ============================================================================

import 'dart:ui';
import 'package:flutter/material.dart';

class GlassmorphicNavItem {
  final IconData icon;
  final IconData? activeIcon;
  final String label;
  final String dataBadge;
  final Color? badgeColor;

  const GlassmorphicNavItem({
    required this.icon,
    this.activeIcon,
    required this.label,
    required this.dataBadge,
    this.badgeColor,
  });
}

class GlassmorphicNavBar extends StatelessWidget {
  final int currentIndex;
  final ValueChanged<int> onTap;
  final List<GlassmorphicNavItem> items;

  const GlassmorphicNavBar({
    super.key,
    required this.currentIndex,
    required this.onTap,
    required this.items,
  });

  @override
  Widget build(BuildContext context) {
    return Positioned(
      left: 16,
      right: 16,
      bottom: 20,
      child: ClipRRect(
        borderRadius: BorderRadius.circular(32),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 20, sigmaY: 20),
          child: Container(
            height: 72,
            padding: const EdgeInsets.symmetric(horizontal: 10),
            decoration: BoxDecoration(
              // Translucent dark frosted obsidian background
              color: const Color(0xDC12141A),
              borderRadius: BorderRadius.circular(32),
              border: Border.all(
                color: Colors.white.withOpacity(0.14),
                width: 1.2,
              ),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.38),
                  blurRadius: 28,
                  offset: const Offset(0, 10),
                ),
              ],
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: List.generate(items.length, (index) {
                final item = items[index];
                final isSelected = currentIndex == index;
                return _buildNavItem(index, item, isSelected);
              }),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildNavItem(int index, GlassmorphicNavItem item, bool isSelected) {
    return GestureDetector(
      behavior: HitTestBehavior.opaque,
      onTap: () => onTap(index),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? Colors.white.withOpacity(0.12) : Colors.transparent,
          borderRadius: BorderRadius.circular(20),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // Stack for Icon + Meaningful Data Badge
            Stack(
              clipBehavior: Clip.none,
              alignment: Alignment.center,
              children: [
                Icon(
                  isSelected ? (item.activeIcon ?? item.icon) : item.icon,
                  size: 22,
                  color: isSelected ? Colors.white : const Color(0xFF9CA3AF),
                ),
                // Meaningful Data Badge in Top Right
                Positioned(
                  top: -8,
                  right: -16,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1.5),
                    decoration: BoxDecoration(
                      color: item.badgeColor ?? (isSelected ? const Color(0xFF10B981) : const Color(0xFF374151)),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(
                        color: Colors.white.withOpacity(0.25),
                        width: 0.8,
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.2),
                          blurRadius: 4,
                          offset: const Offset(0, 1),
                        ),
                      ],
                    ),
                    child: Text(
                      item.dataBadge,
                      style: const TextStyle(
                        fontSize: 9,
                        fontWeight: FontWeight.w800,
                        color: Colors.white,
                        letterSpacing: -0.2,
                      ),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 4),

            // Item Label
            Text(
              item.label,
              style: TextStyle(
                fontSize: 10,
                fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                color: isSelected ? Colors.white : const Color(0xFF9CA3AF),
                letterSpacing: -0.2,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
