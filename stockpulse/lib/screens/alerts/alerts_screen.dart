import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../providers/inventory_provider.dart';
import '../../models/product.dart';

class AlertsScreen extends ConsumerWidget {
  const AlertsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(inventoryProvider);
    final outOfStock = state.outOfStockProducts;
    final lowStock = state.lowStockProducts.where((p) => !p.isOutOfStock).toList();
    final theme = Theme.of(context);
    final currency = NumberFormat.currency(symbol: '\$');

    return Scaffold(
      appBar: AppBar(
        title: const Text('Stock Alerts'),
        actions: [
          if (outOfStock.isNotEmpty || lowStock.isNotEmpty)
            IconButton(
              icon: const Icon(Icons.shopping_cart_outlined, color: Colors.white),
              onPressed: () => context.go('/orders'),
              tooltip: 'Create Order',
            ),
        ],
      ),
      body: (outOfStock.isEmpty && lowStock.isEmpty)
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.check_circle, size: 72, color: Color(0xFF059669)),
                  const SizedBox(height: 16),
                  Text('All stock levels are healthy!', style: theme.textTheme.titleMedium),
                  const SizedBox(height: 8),
                  Text('No alerts at this time.', style: TextStyle(color: Colors.grey.shade600)),
                ],
              ),
            )
          : ListView(
              padding: const EdgeInsets.all(16),
              children: [
                // Summary
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: const Color(0xFFFFF7ED),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: const Color(0xFFFED7AA)),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.warning_amber, color: Color(0xFFF97316), size: 28),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              '${outOfStock.length + lowStock.length} item${outOfStock.length + lowStock.length != 1 ? 's' : ''} need attention',
                              style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15),
                            ),
                            Text(
                              '${outOfStock.length} out of stock • ${lowStock.length} low stock',
                              style: TextStyle(color: Colors.grey.shade600, fontSize: 13),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 20),

                // Out of Stock
                if (outOfStock.isNotEmpty) ...[
                  _SectionHeader(
                    title: 'Out of Stock',
                    count: outOfStock.length,
                    color: const Color(0xFFEF4444),
                  ),
                  const SizedBox(height: 8),
                  ...outOfStock.map((p) => _AlertCard(
                    product: p,
                    isOutOfStock: true,
                    currency: currency,
                  )),
                  const SizedBox(height: 16),
                ],

                // Low Stock
                if (lowStock.isNotEmpty) ...[
                  _SectionHeader(
                    title: 'Low Stock',
                    count: lowStock.length,
                    color: const Color(0xFFF59E0B),
                  ),
                  const SizedBox(height: 8),
                  ...lowStock.map((p) => _AlertCard(
                    product: p,
                    isOutOfStock: false,
                    currency: currency,
                  )),
                ],
              ],
            ),
    );
  }
}

class _SectionHeader extends StatelessWidget {
  final String title;
  final int count;
  final Color color;

  const _SectionHeader({required this.title, required this.count, required this.color});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          width: 4,
          height: 20,
          decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(2)),
        ),
        const SizedBox(width: 10),
        Text(title, style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: color)),
        const SizedBox(width: 8),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
          decoration: BoxDecoration(
            color: color.withOpacity(0.15),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Text('$count', style: TextStyle(fontSize: 12, color: color, fontWeight: FontWeight.w700)),
        ),
      ],
    );
  }
}

class _AlertCard extends StatelessWidget {
  final Product product;
  final bool isOutOfStock;
  final NumberFormat currency;

  const _AlertCard({required this.product, required this.isOutOfStock, required this.currency});

  @override
  Widget build(BuildContext context) {
    final color = isOutOfStock ? const Color(0xFFEF4444) : const Color(0xFFF59E0B);
    final bgColor = isOutOfStock ? const Color(0xFFFEF2F2) : const Color(0xFFFFFBEB);
    final suggested = product.minQuantity * 3;

    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      color: bgColor,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(color: color.withOpacity(0.3)),
      ),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(
                  isOutOfStock ? Icons.error_outline : Icons.warning_amber_outlined,
                  color: color,
                  size: 20,
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    product.name,
                    style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15),
                  ),
                ),
                TextButton(
                  onPressed: () => GoRouter.of(context).go('/inventory/${product.id}'),
                  child: const Text('View'),
                ),
              ],
            ),
            const SizedBox(height: 4),
            Row(
              children: [
                _Badge(label: 'SKU: ${product.sku}', color: Colors.grey),
                const SizedBox(width: 8),
                _Badge(
                  label: isOutOfStock ? 'OUT OF STOCK' : 'ONLY ${product.quantity} LEFT',
                  color: color,
                ),
              ],
            ),
            const SizedBox(height: 10),
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                children: [
                  const Icon(Icons.lightbulb_outline, size: 16, color: Color(0xFF059669)),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Suggested reorder: $suggested units (${currency.format(suggested * product.unitPrice)})',
                      style: const TextStyle(fontSize: 12, color: Color(0xFF059669), fontWeight: FontWeight.w500),
                    ),
                  ),
                ],
              ),
            ),
            if (product.supplier != null) ...[
              const SizedBox(height: 8),
              Row(
                children: [
                  const Icon(Icons.business_outlined, size: 13, color: Colors.grey),
                  const SizedBox(width: 4),
                  Text('Supplier: ${product.supplier}', style: const TextStyle(fontSize: 12, color: Colors.grey)),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _Badge extends StatelessWidget {
  final String label;
  final Color color;
  const _Badge({required this.label, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: color.withOpacity(0.12),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(label, style: TextStyle(fontSize: 11, color: color, fontWeight: FontWeight.w600)),
    );
  }
}
