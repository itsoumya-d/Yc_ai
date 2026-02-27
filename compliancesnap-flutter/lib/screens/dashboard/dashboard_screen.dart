import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../models/violation.dart';
import '../../providers/inspections_provider.dart';
import '../../providers/violations_provider.dart';
import '../../providers/facilities_provider.dart';
import '../../widgets/compliance_gauge.dart';

class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final avgScore = ref.watch(averageScoreProvider);
    final openViolations = ref.watch(openViolationsProvider);
    final criticalViolations = ref.watch(criticalViolationsProvider);
    final pending = ref.watch(pendingInspectionsProvider);
    final facilitiesAsync = ref.watch(facilitiesProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('ComplianceSnap'),
        actions: [
          IconButton(
            icon: const Icon(Icons.sync, color: Colors.white),
            onPressed: () {
              ref.read(inspectionsProvider.notifier).syncOfflineQueue();
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Syncing offline data...'), backgroundColor: Colors.blue),
              );
            },
          ),
          IconButton(
            icon: const Icon(Icons.add, color: Colors.white),
            onPressed: () => context.push('/new-inspection'),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          ref.refresh(inspectionsProvider);
          ref.refresh(violationsProvider);
          ref.refresh(facilitiesProvider);
        },
        child: ListView(
          padding: const EdgeInsets.only(bottom: 80),
          children: [
            // Compliance Score Gauge
            Container(
              color: theme.colorScheme.primary.withOpacity(0.05),
              padding: const EdgeInsets.all(20),
              child: Column(
                children: [
                  const Text('Overall Compliance Score',
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                  const SizedBox(height: 16),
                  ComplianceGauge(score: avgScore, size: 180),
                  const SizedBox(height: 8),
                  Text(DateFormat('MMMM d, yyyy').format(DateTime.now()),
                      style: const TextStyle(color: Colors.grey, fontSize: 12)),
                ],
              ),
            ),
            // Stats row
            Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  Expanded(
                    child: _DashboardStatCard(
                      label: 'Open\nViolations',
                      value: '${openViolations.length}',
                      icon: Icons.warning_amber_rounded,
                      color: Colors.red,
                      onTap: () => context.go('/violations'),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _DashboardStatCard(
                      label: 'Pending\nInspections',
                      value: '${pending.length}',
                      icon: Icons.checklist_rounded,
                      color: Colors.orange,
                      onTap: () => context.go('/inspections'),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _DashboardStatCard(
                      label: 'Critical\nAlerts',
                      value: '${criticalViolations.length}',
                      icon: Icons.error_outline,
                      color: Colors.red.shade800,
                      onTap: () => context.go('/violations'),
                    ),
                  ),
                ],
              ),
            ),
            // Critical Violations
            if (criticalViolations.isNotEmpty) ...[
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Critical Violations', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                    TextButton(onPressed: () => context.go('/violations'), child: const Text('View All')),
                  ],
                ),
              ),
              ...criticalViolations.take(3).map((v) => Card(
                    margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                    color: Colors.red.shade50,
                    child: ListTile(
                      leading: const Icon(Icons.warning_amber_rounded, color: Colors.red),
                      title: Text(v.description, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                      subtitle: Text(v.category),
                      trailing: Text(
                        v.dueDate != null ? 'Due ${DateFormat('MMM d').format(v.dueDate!)}' : '',
                        style: const TextStyle(color: Colors.red, fontSize: 11),
                      ),
                    ),
                  )),
              const Divider(height: 24),
            ],
            // Facilities Overview
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Facilities', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                  TextButton(onPressed: () => context.go('/facilities'), child: const Text('View All')),
                ],
              ),
            ),
            facilitiesAsync.when(
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (e, _) => Center(child: Text('Error: $e')),
              data: (facilities) => Column(
                children: facilities.take(3).map((f) {
                  final score = f.complianceScore;
                  final color = score >= 90 ? Colors.green : score >= 75 ? Colors.orange : Colors.red;
                  return Card(
                    margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                    child: ListTile(
                      leading: CircleAvatar(
                        backgroundColor: color.withOpacity(0.1),
                        child: Text(
                          '${score.round()}%',
                          style: TextStyle(color: color, fontWeight: FontWeight.bold, fontSize: 12),
                        ),
                      ),
                      title: Text(f.name, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                      subtitle: Text(f.type),
                      trailing: f.openViolations > 0
                          ? Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(color: Colors.red.shade100, borderRadius: BorderRadius.circular(4)),
                              child: Text('${f.openViolations}', style: const TextStyle(color: Colors.red, fontWeight: FontWeight.bold)),
                            )
                          : const Icon(Icons.check_circle_outline, color: Colors.green),
                      onTap: () => context.push('/new-inspection'),
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
        icon: const Icon(Icons.add_task),
        label: const Text('New Inspection'),
      ),
    );
  }
}

class _DashboardStatCard extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;
  final Color color;
  final VoidCallback? onTap;

  const _DashboardStatCard({required this.label, required this.value, required this.icon, required this.color, this.onTap});

  @override
  Widget build(BuildContext context) {
    return Card(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 8),
          child: Column(
            children: [
              Icon(icon, color: color, size: 24),
              const SizedBox(height: 6),
              Text(value, style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: color)),
              Text(label, style: const TextStyle(fontSize: 10, color: Colors.grey), textAlign: TextAlign.center),
            ],
          ),
        ),
      ),
    );
  }
}
