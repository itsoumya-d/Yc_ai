import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../models/facility.dart';
import '../../models/inspection.dart';
import '../../models/violation.dart';
import '../../providers/facilities_provider.dart';
import '../../providers/inspections_provider.dart';
import '../../providers/violations_provider.dart';
import '../../widgets/compliance_gauge.dart';

class FacilityDetailScreen extends ConsumerWidget {
  final String facilityId;
  const FacilityDetailScreen({super.key, required this.facilityId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final facilitiesAsync = ref.watch(facilitiesProvider);
    final inspectionsAsync = ref.watch(inspectionsProvider);
    final violationsAsync = ref.watch(violationsProvider);

    return facilitiesAsync.when(
      loading: () => const Scaffold(body: Center(child: CircularProgressIndicator())),
      error: (e, _) => Scaffold(body: Center(child: Text('Error: $e'))),
      data: (facilities) {
        final facility = facilities.where((f) => f.id == facilityId).firstOrNull;
        if (facility == null) {
          return Scaffold(
            appBar: AppBar(title: const Text('Facility')),
            body: const Center(child: Text('Facility not found')),
          );
        }

        final facilityInspections = inspectionsAsync.value
            ?.where((i) => i.facilityId == facilityId).toList() ?? [];
        final facilityViolations = violationsAsync.value
            ?.where((v) => facilityInspections.any((i) => i.id == v.inspectionId)).toList() ?? [];
        final openViolations = facilityViolations
            .where((v) => v.status == ViolationStatus.open || v.status == ViolationStatus.inReview).toList();
        final score = facility.complianceScore;
        final scoreColor = score >= 90 ? Colors.green : score >= 75 ? Colors.orange : Colors.red;

        return Scaffold(
          appBar: AppBar(
            title: Text(facility.name),
            actions: [
              IconButton(icon: const Icon(Icons.add_task, color: Colors.white),
                onPressed: () => context.push('/new-inspection'), tooltip: 'New Inspection'),
            ],
          ),
          body: ListView(padding: const EdgeInsets.only(bottom: 80), children: [
            Container(
              color: Theme.of(context).colorScheme.primary.withOpacity(0.05),
              padding: const EdgeInsets.all(20),
              child: Row(children: [
                ComplianceGauge(score: score, size: 110),
                const SizedBox(width: 20),
                Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text(facility.type, style: TextStyle(color: Colors.grey.shade600, fontSize: 13)),
                  const SizedBox(height: 4),
                  Row(children: [
                    const Icon(Icons.location_on_outlined, size: 14, color: Colors.grey),
                    const SizedBox(width: 4),
                    Expanded(child: Text(facility.address, style: const TextStyle(color: Colors.grey, fontSize: 12), maxLines: 2, overflow: TextOverflow.ellipsis)),
                  ]),
                  const SizedBox(height: 8),
                  if (facility.lastInspection != null) Row(children: [
                    const Icon(Icons.schedule_outlined, size: 14, color: Colors.grey),
                    const SizedBox(width: 4),
                    Text('Last: ${DateFormat('MMM d, yyyy').format(facility.lastInspection!)}',
                      style: const TextStyle(color: Colors.grey, fontSize: 12)),
                  ]),
                  const SizedBox(height: 6),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(color: scoreColor.withOpacity(0.1), borderRadius: BorderRadius.circular(6)),
                    child: Text(_scoreLabel(score), style: TextStyle(color: scoreColor, fontWeight: FontWeight.bold, fontSize: 11))),
                ])),
              ]),
            ),
            Padding(padding: const EdgeInsets.all(16), child: Row(children: [
              Expanded(child: _InfoCard(icon: Icons.checklist_rounded, label: 'Total Inspections', value: '${facilityInspections.length}', color: Theme.of(context).colorScheme.primary)),
              const SizedBox(width: 12),
              Expanded(child: _InfoCard(icon: Icons.warning_amber_rounded, label: 'Open Violations', value: '${openViolations.length}', color: openViolations.isEmpty ? Colors.green : Colors.red)),
              const SizedBox(width: 12),
              Expanded(child: _InfoCard(icon: Icons.check_circle_outline, label: 'Resolved', value: '${facilityViolations.where((v) => v.status == ViolationStatus.resolved).length}', color: Colors.green)),
            ])),
            if (openViolations.isNotEmpty) ...[
              Padding(padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
                child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                  const Text('Open Violations', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                  TextButton(onPressed: () => context.go('/violations'), child: const Text('View All')),
                ])),
              ...openViolations.take(5).map((v) => Card(
                margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                color: v.severity == ViolationSeverity.critical || v.severity == ViolationSeverity.high ? Colors.red.shade50 : null,
                child: ListTile(
                  leading: _SeverityIcon(severity: v.severity),
                  title: Text(v.description, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                  subtitle: Text(v.category),
                  trailing: v.dueDate != null ? Text('Due ${DateFormat('MMM d').format(v.dueDate!)}', style: const TextStyle(color: Colors.red, fontSize: 11)) : null,
                ))),
            ],
            if (facilityInspections.isNotEmpty) ...[
              const Padding(padding: EdgeInsets.fromLTRB(16, 16, 16, 8),
                child: Text('Recent Inspections', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16))),
              ...facilityInspections.take(5).map((inspection) => Card(
                margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                child: InkWell(
                  onTap: () => context.push('/inspections/${inspection.id}'),
                  borderRadius: BorderRadius.circular(12),
                  child: Padding(padding: const EdgeInsets.all(14), child: Row(children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(color: Theme.of(context).colorScheme.primary.withOpacity(0.1), borderRadius: BorderRadius.circular(6)),
                      child: Text(inspection.type.name.toUpperCase(), style: TextStyle(color: Theme.of(context).colorScheme.primary, fontSize: 11, fontWeight: FontWeight.bold))),
                    const SizedBox(width: 12),
                    Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      Text(inspection.inspector, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                      Text(DateFormat('MMM d, yyyy').format(inspection.date), style: const TextStyle(color: Colors.grey, fontSize: 12)),
                    ])),
                    if (inspection.status == InspectionStatus.completed)
                      Text('${inspection.score.round()}%', style: TextStyle(fontWeight: FontWeight.bold, color: inspection.score >= 80 ? Colors.green : Colors.red)),
                    const Icon(Icons.chevron_right, color: Colors.grey),
                  ])),
                ))),
            ],
            if (facilityInspections.isEmpty && openViolations.isEmpty)
              Padding(padding: const EdgeInsets.all(32), child: Center(child: Column(children: [
                const Icon(Icons.check_circle_outline, size: 64, color: Colors.green),
                const SizedBox(height: 12),
                const Text('No inspections or violations yet', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                const Text('This facility is looking good!', style: TextStyle(color: Colors.grey)),
              ]))),
          ]),
          floatingActionButton: FloatingActionButton.extended(
            onPressed: () => context.push('/new-inspection'),
            icon: const Icon(Icons.add_task), label: const Text('Inspect')),
        );
      },
    );
  }

  String _scoreLabel(double score) {
    if (score >= 90) return 'Compliant';
    if (score >= 75) return 'Fair';
    if (score >= 60) return 'At Risk';
    return 'Non-Compliant';
  }
}

class _InfoCard extends StatelessWidget {
  final IconData icon; final String label; final String value; final Color color;
  const _InfoCard({required this.icon, required this.label, required this.value, required this.color});
  @override
  Widget build(BuildContext context) => Card(child: Padding(
    padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
    child: Column(children: [
      Icon(icon, color: color, size: 22), const SizedBox(height: 6),
      Text(value, style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: color)),
      Text(label, style: const TextStyle(fontSize: 10, color: Colors.grey), textAlign: TextAlign.center),
    ])));
}

class _SeverityIcon extends StatelessWidget {
  final ViolationSeverity severity;
  const _SeverityIcon({required this.severity});
  @override
  Widget build(BuildContext context) {
    Color color;
    switch (severity) {
      case ViolationSeverity.critical: color = Colors.red.shade900;
      case ViolationSeverity.high: color = Colors.red;
      case ViolationSeverity.medium: color = Colors.orange;
      case ViolationSeverity.low: color = Colors.amber;
    }
    return Icon(Icons.warning_amber_rounded, color: color);
  }
}