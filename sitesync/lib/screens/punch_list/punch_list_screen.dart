import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../models/punch_item.dart';
import '../../providers/punch_list_provider.dart';
import '../../widgets/punch_item_card.dart';

class PunchListScreen extends ConsumerStatefulWidget {
  const PunchListScreen({super.key});

  @override
  ConsumerState<PunchListScreen> createState() => _PunchListScreenState();
}

class _PunchListScreenState extends ConsumerState<PunchListScreen> {
  PunchStatus? _statusFilter;
  PunchPriority? _priorityFilter;

  @override
  Widget build(BuildContext context) {
    final punchAsync = ref.watch(punchListProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Punch List'),
        actions: [
          IconButton(
            icon: const Icon(Icons.filter_list, color: Colors.white),
            onPressed: _showFilterSheet,
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => context.push('/add-punch-item'),
        icon: const Icon(Icons.add),
        label: const Text('Add Item'),
      ),
      body: Column(
        children: [
          // Filter chips
          punchAsync.when(
            loading: () => const SizedBox.shrink(),
            error: (_, __) => const SizedBox.shrink(),
            data: (items) {
              final open = items.where((i) => i.status == PunchStatus.open).length;
              final inProgress = items.where((i) => i.status == PunchStatus.inProgress).length;
              final resolved = items.where((i) => i.status == PunchStatus.resolved).length;
              return Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                child: Row(
                  children: [
                    _FilterChip(label: 'All (${items.length})', isSelected: _statusFilter == null, onTap: () => setState(() => _statusFilter = null)),
                    const SizedBox(width: 8),
                    _FilterChip(label: 'Open ($open)', isSelected: _statusFilter == PunchStatus.open, color: Colors.red, onTap: () => setState(() => _statusFilter = PunchStatus.open)),
                    const SizedBox(width: 8),
                    _FilterChip(label: 'In Progress ($inProgress)', isSelected: _statusFilter == PunchStatus.inProgress, color: Colors.orange, onTap: () => setState(() => _statusFilter = PunchStatus.inProgress)),
                    const SizedBox(width: 8),
                    _FilterChip(label: 'Resolved ($resolved)', isSelected: _statusFilter == PunchStatus.resolved, color: Colors.green, onTap: () => setState(() => _statusFilter = PunchStatus.resolved)),
                  ],
                ),
              );
            },
          ),
          // List
          Expanded(
            child: punchAsync.when(
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (e, _) => Center(child: Text('Error: $e')),
              data: (items) {
                var filtered = items;
                if (_statusFilter != null) {
                  filtered = filtered.where((i) => i.status == _statusFilter).toList();
                }
                if (_priorityFilter != null) {
                  filtered = filtered.where((i) => i.priority == _priorityFilter).toList();
                }

                if (filtered.isEmpty) {
                  return const Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.checklist_outlined, size: 64, color: Colors.grey),
                        SizedBox(height: 16),
                        Text('No punch items', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                        SizedBox(height: 8),
                        Text('Tap + to add an item to the punch list', style: TextStyle(color: Colors.grey)),
                      ],
                    ),
                  );
                }

                return RefreshIndicator(
                  onRefresh: () async => ref.refresh(punchListProvider),
                  child: ListView.builder(
                    padding: const EdgeInsets.only(top: 4, bottom: 100),
                    itemCount: filtered.length,
                    itemBuilder: (context, index) {
                      return PunchItemCard(
                        item: filtered[index],
                        onResolve: filtered[index].status == PunchStatus.open
                            ? () => ref.read(punchListProvider.notifier).resolveItem(filtered[index].id)
                            : null,
                      );
                    },
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  void _showFilterSheet() {
    showModalBottomSheet(
      context: context,
      builder: (_) => Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Filter by Priority', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
            const SizedBox(height: 12),
            Wrap(
              spacing: 8,
              children: PunchPriority.values.map((p) {
                return ChoiceChip(
                  label: Text(p.name.toUpperCase()),
                  selected: _priorityFilter == p,
                  onSelected: (_) {
                    setState(() => _priorityFilter = _priorityFilter == p ? null : p);
                    Navigator.pop(context);
                  },
                );
              }).toList(),
            ),
          ],
        ),
      ),
    );
  }
}

class _FilterChip extends StatelessWidget {
  final String label;
  final bool isSelected;
  final Color? color;
  final VoidCallback onTap;

  const _FilterChip({required this.label, required this.isSelected, this.color, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final c = color ?? Theme.of(context).colorScheme.primary;
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected ? c.withOpacity(0.15) : Colors.grey.shade100,
          border: Border.all(color: isSelected ? c : Colors.grey.shade300),
          borderRadius: BorderRadius.circular(20),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 12,
            color: isSelected ? c : Colors.grey.shade700,
            fontWeight: isSelected ? FontWeight.bold : null,
          ),
        ),
      ),
    );
  }
}
