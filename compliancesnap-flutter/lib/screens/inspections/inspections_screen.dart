import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../models/inspection.dart';
import '../../providers/inspections_provider.dart';

class InspectionsScreen extends ConsumerStatefulWidget {
  const InspectionsScreen({super.key});

  @override
  ConsumerState<InspectionsScreen> createState() => _InspectionsScreenState();
}

class _InspectionsScreenState extends ConsumerState<InspectionsScreen> {
  InspectionStatus? _statusFilter;

  @override
  Widget build(BuildContext context) {
    final inspectionsAsync = ref.watch(inspectionsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Inspections'),
        actions: [
          IconButton(icon: const Icon(Icons.add, color: Colors.white), onPressed: () => context.push('/new-inspection')),
        ],
      ),
      body: Column(
        children: [
          // Filter chips
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
            child: Row(
              children: [
                _FilterChip(label: 'All', isSelected: _statusFilter == null, onTap: () => setState(() => _statusFilter = null)),
                ...InspectionStatus.values.map((s) => _FilterChip(
                      label: s.name.replaceAllMapped(RegExp(r'[A-Z]'), (m) => ' ${m[0]}').trim(),
                      isSelected: _statusFilter == s,
                      onTap: () => setState(() => _statusFilter = s),
                    )),
              ],
            ),
          ),
          Expanded(
            child: inspectionsAsync.when(
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (e, _) => Center(child: Text('Error: $e')),
              data: (inspections) {
                final filtered = _statusFilter == null
                    ? inspections
                    : inspections.where((i) => i.status == _statusFilter).toList();

                if (filtered.isEmpty) {
                  return const Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.checklist_outlined, size: 64, color: Colors.grey),
                        SizedBox(height: 16),
                        Text('No inspections found', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                      ],
                    ),
                  );
                }

                return RefreshIndicator(
                  onRefresh: () async => ref.refresh(inspectionsProvider),
                  child: ListView.builder(
                    padding: const EdgeInsets.only(bottom: 80),
                    itemCount: filtered.length,
                    itemBuilder: (context, index) {
                      final inspection = filtered[index];
                      return Card(
                        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                        child: InkWell(
                          onTap: () => context.push('/inspections/${inspection.id}'),
                          borderRadius: BorderRadius.circular(12),
                          child: Padding(
                            padding: const EdgeInsets.all(16),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                      decoration: BoxDecoration(
                                        color: Theme.of(context).colorScheme.primary.withOpacity(0.1),
                                        borderRadius: BorderRadius.circular(6),
                                      ),
                                      child: Text(inspection.type.name.toUpperCase(),
                                          style: TextStyle(color: Theme.of(context).colorScheme.primary, fontSize: 11, fontWeight: FontWeight.bold)),
                                    ),
                                    const Spacer(),
                                    _StatusDot(status: inspection.status),
                                  ],
                                ),
                                const SizedBox(height: 10),
                                Text('Facility: ${inspection.facilityId}',
                                    style: const TextStyle(fontWeight: FontWeight.bold)),
                                Text('Inspector: ${inspection.inspector}',
                                    style: const TextStyle(color: Colors.grey, fontSize: 13)),
                                const SizedBox(height: 8),
                                Row(
                                  children: [
                                    const Icon(Icons.schedule_outlined, size: 13, color: Colors.grey),
                                    const SizedBox(width: 4),
                                    Text(DateFormat('MMM d, yyyy').format(inspection.date),
                                        style: const TextStyle(fontSize: 12, color: Colors.grey)),
                                    const Spacer(),
                                    if (inspection.status == InspectionStatus.completed)
                                      Text('Score: ${inspection.score.round()}%',
                                          style: TextStyle(
                                              fontWeight: FontWeight.bold,
                                              color: inspection.score >= 80 ? Colors.green : Colors.red)),
                                    if (inspection.isOffline)
                                      const Padding(
                                        padding: EdgeInsets.only(left: 8),
                                        child: Icon(Icons.cloud_off_outlined, size: 14, color: Colors.orange),
                                      ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        ),
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
}

class _FilterChip extends StatelessWidget {
  final String label;
  final bool isSelected;
  final VoidCallback onTap;

  const _FilterChip({required this.label, required this.isSelected, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: ChoiceChip(
        label: Text(label),
        selected: isSelected,
        onSelected: (_) => onTap(),
        selectedColor: Theme.of(context).colorScheme.primary,
        labelStyle: TextStyle(color: isSelected ? Colors.white : null, fontSize: 12),
      ),
    );
  }
}

class _StatusDot extends StatelessWidget {
  final InspectionStatus status;
  const _StatusDot({required this.status});

  @override
  Widget build(BuildContext context) {
    Color color;
    switch (status) {
      case InspectionStatus.pending: color = Colors.grey;
      case InspectionStatus.inProgress: color = Colors.orange;
      case InspectionStatus.completed: color = Colors.green;
      case InspectionStatus.failed: color = Colors.red;
    }
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(width: 8, height: 8, decoration: BoxDecoration(color: color, shape: BoxShape.circle)),
        const SizedBox(width: 4),
        Text(status.name, style: TextStyle(color: color, fontSize: 11, fontWeight: FontWeight.bold)),
      ],
    );
  }
}
