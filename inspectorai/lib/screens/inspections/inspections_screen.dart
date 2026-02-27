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
          // Filter
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
            child: Row(
              children: [
                _FilterChip(label: 'All', isSelected: _statusFilter == null, onTap: () => setState(() => _statusFilter = null)),
                ...InspectionStatus.values.map((s) => _FilterChip(
                      label: _statusLabel(s),
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
                        Icon(Icons.home_work_outlined, size: 64, color: Colors.grey),
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
                                    Expanded(
                                      child: Text(inspection.propertyAddress,
                                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                                    ),
                                    _StatusBadge(status: inspection.status),
                                  ],
                                ),
                                const SizedBox(height: 6),
                                Text(inspection.clientName, style: const TextStyle(color: Colors.grey)),
                                const SizedBox(height: 8),
                                Row(
                                  children: [
                                    const Icon(Icons.schedule_outlined, size: 14, color: Colors.grey),
                                    const SizedBox(width: 4),
                                    Text(DateFormat('MMM d, yyyy • h:mm a').format(inspection.date),
                                        style: const TextStyle(fontSize: 12, color: Colors.grey)),
                                    const Spacer(),
                                    if (inspection.rooms.isNotEmpty) ...[
                                      const Icon(Icons.home_outlined, size: 14, color: Colors.grey),
                                      const SizedBox(width: 4),
                                      Text('${inspection.rooms.length} rooms',
                                          style: const TextStyle(fontSize: 12, color: Colors.grey)),
                                    ],
                                  ],
                                ),
                                if (inspection.rooms.isNotEmpty) ...[
                                  const SizedBox(height: 8),
                                  ClipRRect(
                                    borderRadius: BorderRadius.circular(4),
                                    child: LinearProgressIndicator(
                                      value: inspection.progress,
                                      backgroundColor: Colors.grey.shade200,
                                      valueColor: AlwaysStoppedAnimation(
                                        inspection.progress == 1.0 ? Colors.green : Theme.of(context).colorScheme.primary,
                                      ),
                                      minHeight: 6,
                                    ),
                                  ),
                                ],
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

  String _statusLabel(InspectionStatus status) {
    switch (status) {
      case InspectionStatus.scheduled:
        return 'Scheduled';
      case InspectionStatus.inProgress:
        return 'In Progress';
      case InspectionStatus.completed:
        return 'Completed';
      case InspectionStatus.reportGenerated:
        return 'Report Ready';
    }
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

class _StatusBadge extends StatelessWidget {
  final InspectionStatus status;
  const _StatusBadge({required this.status});

  @override
  Widget build(BuildContext context) {
    Color color;
    switch (status) {
      case InspectionStatus.scheduled: color = Colors.blue;
      case InspectionStatus.inProgress: color = Colors.orange;
      case InspectionStatus.completed: color = Colors.green;
      case InspectionStatus.reportGenerated: color = Colors.purple;
    }
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(6)),
      child: Text(status.name, style: TextStyle(color: color, fontSize: 11, fontWeight: FontWeight.bold)),
    );
  }
}
