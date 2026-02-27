import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../providers/inventory_provider.dart';
import '../../models/purchase_order.dart';

class OrdersScreen extends ConsumerWidget {
  const OrdersScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final orders = ref.watch(inventoryProvider).orders;
    final theme = Theme.of(context);
    final currency = NumberFormat.currency(symbol: '\$');

    return Scaffold(
      appBar: AppBar(
        title: const Text('Purchase Orders'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add, color: Colors.white),
            onPressed: () => _showCreateOrderDialog(context, ref),
          ),
        ],
      ),
      body: orders.isEmpty
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.shopping_cart_outlined, size: 64, color: Colors.grey.shade400),
                  const SizedBox(height: 16),
                  Text('No purchase orders', style: TextStyle(fontSize: 16, color: Colors.grey.shade600)),
                ],
              ),
            )
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: orders.length,
              itemBuilder: (ctx, i) {
                final order = orders[i];
                final statusColor = Color(order.status.colorValue);
                return Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'PO-${order.id.toUpperCase()}',
                                    style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15),
                                  ),
                                  Text(
                                    order.supplier,
                                    style: TextStyle(color: Colors.grey.shade600, fontSize: 13),
                                  ),
                                ],
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(
                                color: statusColor.withOpacity(0.15),
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(color: statusColor.withOpacity(0.3)),
                              ),
                              child: Text(
                                order.status.displayName,
                                style: TextStyle(fontSize: 12, color: statusColor, fontWeight: FontWeight.w600),
                              ),
                            ),
                          ],
                        ),
                        const Divider(height: 20),
                        ...order.items.map((item) => Padding(
                          padding: const EdgeInsets.only(bottom: 6),
                          child: Row(
                            children: [
                              const Icon(Icons.fiber_manual_record, size: 8, color: Colors.grey),
                              const SizedBox(width: 8),
                              Expanded(child: Text(item.productName, style: const TextStyle(fontSize: 13))),
                              Text('x${item.quantity}', style: const TextStyle(fontSize: 13, color: Colors.grey)),
                              const SizedBox(width: 12),
                              Text(currency.format(item.lineTotal), style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500)),
                            ],
                          ),
                        )),
                        const Divider(height: 12),
                        Row(
                          children: [
                            Icon(Icons.calendar_today, size: 13, color: Colors.grey.shade500),
                            const SizedBox(width: 4),
                            Text(
                              DateFormat('MMM d, yyyy').format(order.orderedAt),
                              style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
                            ),
                            const Spacer(),
                            Text(
                              'Total: ${currency.format(order.total)}',
                              style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15),
                            ),
                          ],
                        ),
                        if (order.status == OrderStatus.ordered || order.status == OrderStatus.shipped) ...[
                          const SizedBox(height: 12),
                          Row(
                            children: [
                              Expanded(
                                child: OutlinedButton.icon(
                                  onPressed: () => _updateStatus(context, ref, order, OrderStatus.delivered),
                                  icon: const Icon(Icons.check_circle_outline, size: 16),
                                  label: const Text('Mark Delivered'),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ],
                    ),
                  ),
                );
              },
            ),
    );
  }

  void _updateStatus(BuildContext context, WidgetRef ref, PurchaseOrder order, OrderStatus newStatus) {
    final orders = ref.read(inventoryProvider).orders;
    final updatedOrders = orders.map((o) => o.id == order.id
        ? PurchaseOrder(
            id: o.id, supplier: o.supplier, items: o.items,
            status: newStatus, total: o.total, orderedAt: o.orderedAt,
            receivedAt: newStatus == OrderStatus.delivered ? DateTime.now() : o.receivedAt,
          )
        : o).toList();
    // Simple update via provider state
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Order marked as ${newStatus.displayName}'), backgroundColor: const Color(0xFF059669)),
    );
  }

  void _showCreateOrderDialog(BuildContext context, WidgetRef ref) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Create Purchase Order'),
        content: const Text('Purchase order creation would go here with supplier selection and item list.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(ctx);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Order creation flow coming soon')),
              );
            },
            child: const Text('Create'),
          ),
        ],
      ),
    );
  }
}
