import 'package:flutter/material.dart';
import '../models/product.dart';

class StockLevelIndicator extends StatelessWidget {
  final Product product;
  final bool showLabel;
  final bool compact;

  const StockLevelIndicator({
    super.key,
    required this.product,
    this.showLabel = true,
    this.compact = false,
  });

  @override
  Widget build(BuildContext context) {
    final status = product.stockStatus;
    final color = _colorForStatus(status);
    final label = _labelForStatus(status);
    final icon = _iconForStatus(status);

    if (compact) {
      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        decoration: BoxDecoration(
          color: color.withOpacity(0.15),
          borderRadius: BorderRadius.circular(6),
          border: Border.all(color: color.withOpacity(0.3)),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 12, color: color),
            const SizedBox(width: 4),
            Text(
              label,
              style: TextStyle(fontSize: 11, color: color, fontWeight: FontWeight.w600),
            ),
          ],
        ),
      );
    }

    final double fillRatio = product.minQuantity > 0
        ? (product.quantity / (product.minQuantity * 3)).clamp(0.0, 1.0)
        : 1.0;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Icon(icon, size: 16, color: color),
            const SizedBox(width: 6),
            Text(
              '${product.quantity} units',
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: color,
              ),
            ),
            const Spacer(),
            if (showLabel)
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: color.withOpacity(0.12),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  label,
                  style: TextStyle(
                    fontSize: 11,
                    color: color,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
          ],
        ),
        const SizedBox(height: 8),
        ClipRRect(
          borderRadius: BorderRadius.circular(4),
          child: LinearProgressIndicator(
            value: fillRatio,
            backgroundColor: color.withOpacity(0.15),
            valueColor: AlwaysStoppedAnimation<Color>(color),
            minHeight: 6,
          ),
        ),
        if (product.minQuantity > 0) ...[
          const SizedBox(height: 4),
          Text(
            'Min: ${product.minQuantity}',
            style: TextStyle(fontSize: 11, color: Colors.grey.shade600),
          ),
        ],
      ],
    );
  }

  Color _colorForStatus(StockStatus status) {
    switch (status) {
      case StockStatus.good: return const Color(0xFF059669);
      case StockStatus.medium: return const Color(0xFFF59E0B);
      case StockStatus.low: return const Color(0xFFEF4444);
      case StockStatus.outOfStock: return const Color(0xFF7F1D1D);
    }
  }

  String _labelForStatus(StockStatus status) {
    switch (status) {
      case StockStatus.good: return 'In Stock';
      case StockStatus.medium: return 'Medium';
      case StockStatus.low: return 'Low Stock';
      case StockStatus.outOfStock: return 'Out of Stock';
    }
  }

  IconData _iconForStatus(StockStatus status) {
    switch (status) {
      case StockStatus.good: return Icons.check_circle_outline;
      case StockStatus.medium: return Icons.remove_circle_outline;
      case StockStatus.low: return Icons.warning_amber_outlined;
      case StockStatus.outOfStock: return Icons.error_outline;
    }
  }
}
