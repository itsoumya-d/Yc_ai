import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../providers/planning_provider.dart';
import '../../models/will_item.dart';
import '../../theme/app_theme.dart';

class WillScreen extends ConsumerWidget {
  const WillScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final planning = ref.watch(planningProvider);
    final willItems = planning.willItems;

    final grouped = <WillItemType, List<WillItem>>{};
    for (final item in willItems) {
      grouped.putIfAbsent(item.type, () => []).add(item);
    }

    return Scaffold(
      backgroundColor: AppTheme.warmCream,
      appBar: AppBar(
        title: const Text('My Will'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.go('/home'),
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _showAddItemSheet(context, ref),
        backgroundColor: AppTheme.primaryTeal,
        icon: const Icon(Icons.add, color: Colors.white),
        label: const Text('Add Item', style: TextStyle(color: Colors.white)),
      ),
      body: willItems.isEmpty
          ? _EmptyView(onAdd: () => _showAddItemSheet(context, ref))
          : ListView(
              padding: const EdgeInsets.all(16),
              children: [
                Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: AppTheme.primaryTeal.withOpacity(0.08),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppTheme.primaryTeal.withOpacity(0.2)),
                  ),
                  child: Row(
                    children: [
                      Icon(Icons.info_outline, color: AppTheme.primaryTeal, size: 18),
                      const SizedBox(width: 10),
                      const Expanded(
                        child: Text(
                          'This list supplements your legal will. Always work with an attorney for binding documents.',
                          style: TextStyle(fontSize: 12, color: AppTheme.darkTeal, height: 1.4),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 20),
                ...WillItemType.values.where((t) => grouped.containsKey(t)).map((type) {
                  final items = grouped[type]!;
                  return Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Padding(
                        padding: const EdgeInsets.only(bottom: 8),
                        child: Text(
                          type.label,
                          style: const TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                            color: AppTheme.warmBrown,
                          ),
                        ),
                      ),
                      ...items.map((item) => _WillItemCard(
                        item: item,
                        onDelete: () => ref.read(planningProvider.notifier).removeWillItem(item.id),
                      )),
                      const SizedBox(height: 16),
                    ],
                  );
                }),
                const SizedBox(height: 80),
              ],
            ),
    );
  }

  void _showAddItemSheet(BuildContext context, WidgetRef ref) {
    final descController = TextEditingController();
    final beneficiaryController = TextEditingController();
    final valueController = TextEditingController();
    WillItemType selectedType = WillItemType.property;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => StatefulBuilder(
        builder: (context, setState) => Padding(
          padding: EdgeInsets.fromLTRB(
            20, 20, 20, MediaQuery.of(context).viewInsets.bottom + 20,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Add Will Item',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 16),
              DropdownButtonFormField<WillItemType>(
                value: selectedType,
                decoration: const InputDecoration(labelText: 'Category'),
                onChanged: (v) => setState(() => selectedType = v!),
                items: WillItemType.values.map((t) {
                  return DropdownMenuItem(value: t, child: Text(t.label));
                }).toList(),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: descController,
                decoration: const InputDecoration(labelText: 'Description'),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: beneficiaryController,
                decoration: const InputDecoration(labelText: 'Beneficiary'),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: valueController,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(
                  labelText: 'Estimated Value (optional)',
                  prefixText: '\$',
                ),
              ),
              const SizedBox(height: 20),
              ElevatedButton(
                onPressed: () {
                  if (descController.text.isEmpty || beneficiaryController.text.isEmpty) return;
                  ref.read(planningProvider.notifier).addWillItem(
                    WillItem(
                      id: DateTime.now().millisecondsSinceEpoch.toString(),
                      type: selectedType,
                      description: descController.text,
                      beneficiary: beneficiaryController.text,
                      estimatedValue: double.tryParse(valueController.text),
                    ),
                  );
                  Navigator.pop(context);
                },
                child: const Text('Add Item'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _WillItemCard extends StatelessWidget {
  final WillItem item;
  final VoidCallback onDelete;

  const _WillItemCard({required this.item, required this.onDelete});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFE7E5E4)),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  item.description,
                  style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    const Icon(Icons.person_outline, size: 13, color: AppTheme.warmBrown),
                    const SizedBox(width: 4),
                    Text(
                      item.beneficiary,
                      style: const TextStyle(fontSize: 12, color: AppTheme.warmBrown),
                    ),
                    if (item.estimatedValue != null) ...[
                      const SizedBox(width: 12),
                      const Icon(Icons.attach_money, size: 13, color: AppTheme.primaryTeal),
                      Text(
                        '\$${item.estimatedValue!.toStringAsFixed(0)}',
                        style: const TextStyle(fontSize: 12, color: AppTheme.primaryTeal),
                      ),
                    ],
                  ],
                ),
              ],
            ),
          ),
          IconButton(
            icon: const Icon(Icons.delete_outline, color: Color(0xFFEF4444), size: 20),
            onPressed: onDelete,
          ),
        ],
      ),
    );
  }
}

class _EmptyView extends StatelessWidget {
  final VoidCallback onAdd;

  const _EmptyView({required this.onAdd});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.description_outlined, size: 72, color: Color(0xFFD6D3D1)),
          const SizedBox(height: 16),
          const Text(
            'Your will is empty',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 8),
          const Text(
            'Start adding assets, property, and\npersonal items you want to bequeath',
            textAlign: TextAlign.center,
            style: TextStyle(color: AppTheme.warmBrown),
          ),
          const SizedBox(height: 24),
          ElevatedButton.icon(
            onPressed: onAdd,
            icon: const Icon(Icons.add),
            label: const Text('Add First Item'),
            style: ElevatedButton.styleFrom(minimumSize: const Size(200, 48)),
          ),
        ],
      ),
    );
  }
}
