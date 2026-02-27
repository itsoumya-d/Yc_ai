import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../models/product.dart';
import 'stock_level_indicator.dart';

class ProductCard extends StatelessWidget {
  final Product product;
  final VoidCallback? onTap;

  const ProductCard({
    super.key,
    required this.product,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final currencyFormat = NumberFormat.currency(symbol: '\$', decimalDigits: 2);

    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: onTap ?? () => context.go('/inventory/${product.id}'),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _CategoryIcon(category: product.category),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          product.name,
                          style: theme.textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.w600,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 2),
                        Text(
                          'SKU: ${product.sku}',
                          style: theme.textTheme.bodySmall?.copyWith(
                            color: Colors.grey.shade600,
                          ),
                        ),
                      ],
                    ),
                  ),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text(
                        currencyFormat.format(product.unitPrice),
                        style: theme.textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.w700,
                          color: theme.colorScheme.primary,
                        ),
                      ),
                      Text(
                        'per unit',
                        style: theme.textTheme.bodySmall?.copyWith(color: Colors.grey.shade500),
                      ),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 12),
              StockLevelIndicator(product: product, showLabel: true),
              const SizedBox(height: 8),
              Row(
                children: [
                  _InfoChip(icon: Icons.category_outlined, label: product.category),
                  if (product.location != null) ...[
                    const SizedBox(width: 8),
                    _InfoChip(icon: Icons.location_on_outlined, label: product.location!),
                  ],
                  const Spacer(),
                  Text(
                    'Value: ${currencyFormat.format(product.totalValue)}',
                    style: theme.textTheme.bodySmall?.copyWith(
                      fontWeight: FontWeight.w600,
                      color: Colors.grey.shade700,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _CategoryIcon extends StatelessWidget {
  final String category;
  const _CategoryIcon({required this.category});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 44,
      height: 44,
      decoration: BoxDecoration(
        color: const Color(0xFFD1FAE5),
        borderRadius: BorderRadius.circular(10),
      ),
      child: Icon(
        _iconForCategory(category),
        color: const Color(0xFF059669),
        size: 22,
      ),
    );
  }

  IconData _iconForCategory(String category) {
    switch (category.toLowerCase()) {
      case 'electronics': return Icons.electrical_services;
      case 'hardware': return Icons.hardware;
      case 'safety': return Icons.safety_check;
      case 'electrical': return Icons.bolt;
      case 'mechanical': return Icons.settings;
      case 'office': return Icons.work;
      case 'cleaning': return Icons.cleaning_services;
      default: return Icons.inventory_2_outlined;
    }
  }
}

class _InfoChip extends StatelessWidget {
  final IconData icon;
  final String label;
  const _InfoChip({required this.icon, required this.label});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 13, color: Colors.grey.shade500),
        const SizedBox(width: 4),
        Text(
          label,
          style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
        ),
      ],
    );
  }
}
