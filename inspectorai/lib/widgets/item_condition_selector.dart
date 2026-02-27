import 'package:flutter/material.dart';
import '../models/inspection_item.dart';

class ItemConditionSelector extends StatelessWidget {
  final ItemCondition? selected;
  final ValueChanged<ItemCondition> onChanged;

  const ItemConditionSelector({super.key, this.selected, required this.onChanged});

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: ItemCondition.values.where((c) => c != ItemCondition.notApplicable).map((condition) {
        final isSelected = selected == condition;
        final color = _conditionColor(condition);
        return GestureDetector(
          onTap: () => onChanged(condition),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
            decoration: BoxDecoration(
              color: isSelected ? color.withOpacity(0.15) : Colors.grey.shade100,
              borderRadius: BorderRadius.circular(8),
              border: Border.all(
                color: isSelected ? color : Colors.grey.shade300,
                width: isSelected ? 2 : 1,
              ),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(_conditionIcon(condition), size: 16, color: isSelected ? color : Colors.grey),
                const SizedBox(width: 6),
                Text(
                  _conditionLabel(condition),
                  style: TextStyle(
                    color: isSelected ? color : Colors.grey.shade700,
                    fontWeight: isSelected ? FontWeight.bold : null,
                    fontSize: 13,
                  ),
                ),
              ],
            ),
          ),
        );
      }).toList(),
    );
  }

  Color _conditionColor(ItemCondition condition) {
    switch (condition) {
      case ItemCondition.good:
        return Colors.green;
      case ItemCondition.fair:
        return Colors.orange;
      case ItemCondition.poor:
        return Colors.deepOrange;
      case ItemCondition.deficient:
        return Colors.red;
      case ItemCondition.notApplicable:
        return Colors.grey;
    }
  }

  IconData _conditionIcon(ItemCondition condition) {
    switch (condition) {
      case ItemCondition.good:
        return Icons.check_circle_outline;
      case ItemCondition.fair:
        return Icons.warning_amber_outlined;
      case ItemCondition.poor:
        return Icons.error_outline;
      case ItemCondition.deficient:
        return Icons.cancel_outlined;
      case ItemCondition.notApplicable:
        return Icons.block_outlined;
    }
  }

  String _conditionLabel(ItemCondition condition) {
    switch (condition) {
      case ItemCondition.good:
        return 'Good';
      case ItemCondition.fair:
        return 'Fair';
      case ItemCondition.poor:
        return 'Poor';
      case ItemCondition.deficient:
        return 'Deficient';
      case ItemCondition.notApplicable:
        return 'N/A';
    }
  }
}
