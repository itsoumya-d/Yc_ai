import 'package:flutter/material.dart';
import '../models/inspection_item.dart';

class SeverityBadge extends StatelessWidget {
  final ItemSeverity severity;

  const SeverityBadge({super.key, required this.severity});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: _color.withOpacity(0.15),
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: _color.withOpacity(0.3)),
      ),
      child: Text(
        _label,
        style: TextStyle(color: _color, fontSize: 11, fontWeight: FontWeight.bold),
      ),
    );
  }

  Color get _color {
    switch (severity) {
      case ItemSeverity.minor:
        return Colors.amber;
      case ItemSeverity.moderate:
        return Colors.orange;
      case ItemSeverity.major:
        return Colors.deepOrange;
      case ItemSeverity.safety:
        return Colors.red;
    }
  }

  String get _label {
    switch (severity) {
      case ItemSeverity.minor:
        return 'MINOR';
      case ItemSeverity.moderate:
        return 'MODERATE';
      case ItemSeverity.major:
        return 'MAJOR';
      case ItemSeverity.safety:
        return 'SAFETY';
    }
  }
}
