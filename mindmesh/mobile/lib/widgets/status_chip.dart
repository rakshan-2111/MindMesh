import 'package:flutter/material.dart';
import '../theme/mindmesh_theme.dart';

enum StatusChipVariant { critical, warning, success, info, neutral }

class StatusChip extends StatelessWidget {
  final String label;
  final StatusChipVariant variant;
  final bool showDot;

  const StatusChip({
    super.key,
    required this.label,
    this.variant = StatusChipVariant.neutral,
    this.showDot = true,
  });

  @override
  Widget build(BuildContext context) {
    Color bg;
    Color text;
    Color dot;

    switch (variant) {
      case StatusChipVariant.critical:
        bg = MindMeshColors.criticalBg;
        text = MindMeshColors.critical;
        dot = MindMeshColors.critical;
        break;
      case StatusChipVariant.warning:
        bg = MindMeshColors.warningBg;
        text = MindMeshColors.warning;
        dot = MindMeshColors.warning;
        break;
      case StatusChipVariant.success:
        bg = MindMeshColors.successBg;
        text = MindMeshColors.success;
        dot = MindMeshColors.success;
        break;
      case StatusChipVariant.info:
        bg = MindMeshColors.infoBg;
        text = MindMeshColors.info;
        dot = MindMeshColors.info;
        break;
      case StatusChipVariant.neutral:
        bg = MindMeshColors.neutralChipBg;
        text = MindMeshColors.neutralChip;
        dot = MindMeshColors.textTertiary;
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(6),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (showDot) ...[
            Container(
              width: 6,
              height: 6,
              decoration: BoxDecoration(
                color: dot,
                shape: BoxShape.circle,
              ),
            ),
            const SizedBox(width: 5),
          ],
          Text(
            label,
            style: TextStyle(
              color: text,
              fontSize: 11,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
}
