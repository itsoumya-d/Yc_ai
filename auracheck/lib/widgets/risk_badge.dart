import 'package:flutter/material.dart';
import '../models/spot.dart';

class RiskBadge extends StatelessWidget {
  final RiskLevel riskLevel;
  final bool compact;
  final bool showIcon;

  const RiskBadge({
    super.key,
    required this.riskLevel,
    this.compact = false,
    this.showIcon = true,
  });

  @override
  Widget build(BuildContext context) {
    final color = Color(riskLevel.colorValue);

    if (compact) {
      return Container(
        width: 12,
        height: 12,
        decoration: BoxDecoration(
          color: color,
          shape: BoxShape.circle,
          boxShadow: [BoxShadow(color: color.withOpacity(0.4), blurRadius: 4)],
        ),
      );
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: color.withOpacity(0.12),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color.withOpacity(0.4), width: 1.5),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (showIcon) ...[
            Icon(_iconForRisk(riskLevel), size: 12, color: color),
            const SizedBox(width: 5),
          ],
          Text(
            riskLevel.displayName,
            style: TextStyle(
              fontSize: 11,
              color: color,
              fontWeight: FontWeight.w700,
              letterSpacing: 0.3,
            ),
          ),
        ],
      ),
    );
  }

  IconData _iconForRisk(RiskLevel level) {
    switch (level) {
      case RiskLevel.low: return Icons.check_circle_outline;
      case RiskLevel.moderate: return Icons.remove_circle_outline;
      case RiskLevel.high: return Icons.warning_amber_outlined;
      case RiskLevel.urgent: return Icons.error_outline;
    }
  }
}
