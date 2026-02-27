import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../models/violation.dart';
import '../../providers/violations_provider.dart';
import '../../widgets/violation_card.dart';

class ViolationsScreen extends ConsumerStatefulWidget {
  const ViolationsScreen({super.key});

  @override
  ConsumerState<ViolationsScreen> createState() => _ViolationsScreenState();
}

class _ViolationsScreenState extends ConsumerState<ViolationsScreen> {
  ViolationSeverity? _severityFilter;
  ViolationStatus? _statusFilter;

  @override
  Widget build(BuildContext context) {
    final violationsAsync = ref.watch(violationsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Violations'),
        actions: [
          IconButton(
            icon: const Icon(Icons.filter_list, color: Colors.white),
            onPressed: _showFilterSheet,
          ),
        ],
      ),
      body: Column(
        children: [
          // Quick filters
          violationsAsync.when(
            loading: () => const SizedBox.shrink(),
            error: (_, __) => const SizedBox.shrink(),
            data: (violations) {
              final open = violations.where((v) => v.status == ViolationStatus.open).length;
              final inReview = violations.where((v) => v.status == ViolationStatus.inReview).length;
              final resolved = violations.where((v) => v.status == ViolationStatus.resolved).length;
              return Padding(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                child: Row(
                  children: [
                    _QuickChip(label: 'All (${violations.length})', isSelected: _statusFilter == null && _severityFilter == null, color: Colors.grey, onTap: () => setState(() { _statusFilter = null; _severityFilter = null; })),
                    const SizedBox(width: 8),
                    _QuickChip(label: 'Open ($open)', isSelected: _statusFilter == ViolationStatus.open, color: Colors.red, onTap: () => setState(() => _statusFilter = ViolationStatus.open)),
                    const SizedBox(width: 8),
                    _QuickChip(label: 'In Review ($inReview)', isSelected: _statusFilter == ViolationStatus.inReview, color: Colors.orange, onTap: () => setState(() => _statusFilter = ViolationStatus.inReview)),
                    const SizedBox(width: 8),
                    _QuickChip(label: 'Resolved ($resolved)', isSelected: _statusFilter == ViolationStatus.resolved, color: Colors.green, onTap: () => setState(() => _statusFilter = ViolationStatus.resolved)),
                  ],
                ),
              );
            },
          ),
          Expanded(
            child: violationsAsync.when(
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (e, _) => Center(child: Text('Error: $e')),
              data: (violations) {
                var filtered = violations;
                if (_statusFilter != null) filtered = filtered.where((v) => v.status == _statusFilter).toList();
                if (_severityFilter != null) filtered = filtered.where((v) => v.severity == _severityFilter).toList();

                // Sort by severity
                filtered.sort((a, b) => b.severity.index.compareTo(a.severity.index));

                if (filtered.isEmpty) {
                  return const Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.check_circle_outline, size: 64, color: Colors.green),
                        SizedBox(height: 16),
                        Text('No violations found!', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.green)),
                      ],
                    ),
                  );
                }

                return RefreshIndicator(
                  onRefresh: () async => ref.refresh(violationsProvider),
                  child: ListView.builder(
                    padding: const EdgeInsets.only(top: 4, bottom: 80),
                    itemCount: filtered.length,
                    itemBuilder: (context, index) => ViolationCard(
                      violation: filtered[index],
                      onResolve: filtered[index].status == ViolationStatus.open
                          ? () => _showResolveDialog(context, filtered[index])
                          : null,
                    ),
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
            const Text('Filter by Severity', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
            const SizedBox(height: 12),
            Wrap(
              spacing: 8,
              children: ViolationSeverity.values.map((s) => ChoiceChip(
                label: Text(s.name.toUpperCase()),
                selected: _severityFilter == s,
                onSelected: (_) {
                  setState(() => _severityFilter = _severityFilter == s ? null : s);
                  Navigator.pop(context);
                },
              )).toList(),
            ),
          ],
        ),
      ),
    );
  }

  void _showResolveDialog(BuildContext context, Violation violation) {
    final controller = TextEditingController(text: violation.correctiveAction);
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Resolve Violation'),
        content: TextField(
          controller: controller,
          maxLines: 3,
          decoration: const InputDecoration(hintText: 'Describe corrective action taken...'),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              ref.read(violationsProvider.notifier).resolveViolation(violation.id, controller.text);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Violation resolved!'), backgroundColor: Colors.green),
              );
            },
            child: const Text('Mark Resolved'),
          ),
        ],
      ),
    );
  }
}

class _QuickChip extends StatelessWidget {
  final String label;
  final bool isSelected;
  final Color color;
  final VoidCallback onTap;

  const _QuickChip({required this.label, required this.isSelected, required this.color, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
        decoration: BoxDecoration(
          color: isSelected ? color.withOpacity(0.15) : Colors.grey.shade100,
          border: Border.all(color: isSelected ? color : Colors.grey.shade300),
          borderRadius: BorderRadius.circular(20),
        ),
        child: Text(label, style: TextStyle(fontSize: 12, color: isSelected ? color : Colors.grey.shade700, fontWeight: isSelected ? FontWeight.bold : null)),
      ),
    );
  }
}
