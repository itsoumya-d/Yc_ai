import 'package:flutter/material.dart';
import '../models/diagnosis.dart';

class SafetyWarningCard extends StatelessWidget {
  final SafetyWarning warning;

  const SafetyWarningCard({super.key, required this.warning});

  @override
  Widget build(BuildContext context) {
    final color = Color(warning.severity.colorValue);
    final bgColor = color.withOpacity(0.08);
    final borderColor = color.withOpacity(0.3);

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: borderColor, width: 1.5),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(6),
            decoration: BoxDecoration(
              color: color.withOpacity(0.15),
              shape: BoxShape.circle,
            ),
            child: Icon(_iconForSeverity(warning.severity), color: color, size: 18),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                      decoration: BoxDecoration(
                        color: color,
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(
                        warning.severity.label.toUpperCase(),
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 10,
                          fontWeight: FontWeight.w800,
                          letterSpacing: 0.5,
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        warning.title,
                        style: TextStyle(fontWeight: FontWeight.w700, color: color, fontSize: 14),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                Text(
                  warning.description,
                  style: TextStyle(fontSize: 13, color: color.withOpacity(0.85), height: 1.4),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  IconData _iconForSeverity(WarningSeverity severity) {
    switch (severity) {
      case WarningSeverity.low: return Icons.info_outline;
      case WarningSeverity.medium: return Icons.warning_amber_outlined;
      case WarningSeverity.high: return Icons.warning_outlined;
      case WarningSeverity.critical: return Icons.dangerous_outlined;
    }
  }
}
