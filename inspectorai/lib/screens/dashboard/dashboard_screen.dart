import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../models/inspection.dart';
import '../../providers/inspections_provider.dart';

class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final inspectionsAsync = ref.watch(inspectionsProvider);
    final pending = ref.watch(pendingInspectionsProvider);
    final completed = ref.watch(completedInspectionsProvider);

    final today = pending.where((i) {
      final now = DateTime.now();
      return i.date.year == now.year && i.date.month == now.month && i.date.day == now.day;
    }).toList();

    return Scaffold(
      appBar: AppBar(
        title: const Text('InspectorAI'),
        actions: [
          IconButton(icon: const Icon(Icons.add, color: Colors.white), onPressed: () => context.push('/new-inspection')),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async => ref.refresh(inspectionsProvider),
        child: ListView(
          padding: const EdgeInsets.only(bottom: 80),
          children: [
            // Welcome banner
            Container(
              margin: const EdgeInsets.all(16),
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [theme.colorScheme.primary, theme.colorScheme.secondary],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('INSPECTOR DASHBOARD', style: TextStyle(color: Colors.white70, fontSize: 11, letterSpacing: 1.2)),
                  const SizedBox(height: 6),
                  Text(DateFormat('EEEE, MMMM d').format(DateTime.now()),
                      style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      _BannerStat(label: "Today's\nInspections", value: '${today.length}'),
                      const SizedBox(width: 24),
                      _BannerStat(label: 'Pending\nReports', value: '${pending.length}'),
                      const SizedBox(width: 24),
                      _BannerStat(label: 'Completed\nTotal', value: '${completed.length}'),
                    ],
                  ),
                ],
              ),
            ),
            // Today's Appointments
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text("Today's Appointments", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                  TextButton(onPressed: () => context.go('/inspections'), child: const Text('View All')),
                ],
              ),
            ),
            inspectionsAsync.when(
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (e, _) => Center(child: Text('Error: $e')),
              data: (_) => today.isEmpty
                  ? Padding(
                      padding: const EdgeInsets.all(16),
                      child: Card(
                        child: Padding(
                          padding: const EdgeInsets.all(20),
                          child: Column(
                            children: [
                              Icon(Icons.calendar_today, size: 40, color: Colors.indigo.shade200),
                              const SizedBox(height: 8),
                              const Text('No inspections today', style: TextStyle(fontWeight: FontWeight.bold)),
                              const SizedBox(height: 12),
                              ElevatedButton.icon(
                                onPressed: () => context.push('/new-inspection'),
                                icon: const Icon(Icons.add, size: 18),
                                label: const Text('Schedule Inspection'),
                              ),
                            ],
                          ),
                        ),
                      ),
                    )
                  : Column(
                      children: today.map((inspection) => Card(
                        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                        child: ListTile(
                          leading: CircleAvatar(
                            backgroundColor: Colors.indigo.shade50,
                            child: const Icon(Icons.home_work_outlined, color: Color(0xFF3949AB)),
                          ),
                          title: Text(inspection.clientName, style: const TextStyle(fontWeight: FontWeight.bold)),
                          subtitle: Text(inspection.propertyAddress, maxLines: 1, overflow: TextOverflow.ellipsis),
                          trailing: Text(DateFormat('h:mm a').format(inspection.date), style: const TextStyle(color: Colors.grey)),
                          onTap: () => context.push('/inspections/${inspection.id}'),
                        ),
                      )).toList(),
                    ),
            ),
            const Divider(height: 32),
            // Recent Inspections
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Recent Inspections', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                  TextButton(onPressed: () => context.go('/inspections'), child: const Text('View All')),
                ],
              ),
            ),
            inspectionsAsync.when(
              loading: () => const SizedBox.shrink(),
              error: (_, __) => const SizedBox.shrink(),
              data: (inspections) => Column(
                children: inspections.take(5).map((inspection) {
                  final conditionColor = _conditionColor(inspection.overallCondition);
                  return Card(
                    margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                    child: ListTile(
                      leading: Container(
                        width: 44,
                        height: 44,
                        decoration: BoxDecoration(
                          color: conditionColor.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Icon(Icons.home_outlined, color: conditionColor),
                      ),
                      title: Text(inspection.propertyAddress, maxLines: 1, overflow: TextOverflow.ellipsis,
                          style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                      subtitle: Text('${inspection.clientName} • ${DateFormat('MMM d').format(inspection.date)}'),
                      trailing: _StatusBadge(status: inspection.status),
                      onTap: () => context.push('/inspections/${inspection.id}'),
                    ),
                  );
                }).toList(),
              ),
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => context.push('/new-inspection'),
        icon: const Icon(Icons.add),
        label: const Text('New Inspection'),
      ),
    );
  }

  Color _conditionColor(OverallCondition condition) {
    switch (condition) {
      case OverallCondition.excellent:
        return Colors.green;
      case OverallCondition.good:
        return Colors.teal;
      case OverallCondition.fair:
        return Colors.orange;
      case OverallCondition.poor:
        return Colors.red;
    }
  }
}

class _BannerStat extends StatelessWidget {
  final String label;
  final String value;
  const _BannerStat({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(value, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 26)),
        Text(label, style: const TextStyle(color: Colors.white70, fontSize: 11), textAlign: TextAlign.center),
      ],
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
