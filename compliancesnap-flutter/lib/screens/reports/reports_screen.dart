import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../models/inspection.dart';
import '../../models/violation.dart';
import '../../providers/inspections_provider.dart';
import '../../providers/violations_provider.dart';
import '../../providers/facilities_provider.dart';
import '../../widgets/compliance_gauge.dart';

class ReportsScreen extends ConsumerStatefulWidget {
  const ReportsScreen({super.key});
  @override
  ConsumerState<ReportsScreen> createState() => _ReportsScreenState();
}

class _ReportsScreenState extends ConsumerState<ReportsScreen> {
  String _selectedPeriod = '30d';
  int _selectedTab = 0;

  @override
  Widget build(BuildContext context) {
    final inspectionsAsync = ref.watch(inspectionsProvider);
    final violations = ref.watch(violationsProvider).value ?? [];
    final facilities = ref.watch(facilitiesProvider).value ?? [];
    final avgScore = ref.watch(averageScoreProvider);
    final completedInspections = ref.watch(completedInspectionsProvider);
    final now = DateTime.now();
    final days = _selectedPeriod == '7d' ? 7 : _selectedPeriod == '30d' ? 30 : 90;
    final cutoff = now.subtract(Duration(days: days));
    final periodInspections = completedInspections.where((i) => i.date.isAfter(cutoff)).toList();
    final periodViolations = violations.where((v) => v.createdAt.isAfter(cutoff)).toList();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Reports'),
        actions: [
          IconButton(icon: const Icon(Icons.share_outlined, color: Colors.white),
            onPressed: () => _showShareSheet(context), tooltip: 'Export'),
        ],
      ),
      body: Column(children: [
        SingleChildScrollView(scrollDirection: Axis.horizontal, padding: const EdgeInsets.fromLTRB(12, 12, 12, 4),
          child: Row(children: [
            _PeriodChip(label: '7 Days', value: '7d', selected: _selectedPeriod, onTap: (v) => setState(() => _selectedPeriod = v)),
            const SizedBox(width: 8),
            _PeriodChip(label: '30 Days', value: '30d', selected: _selectedPeriod, onTap: (v) => setState(() => _selectedPeriod = v)),
            const SizedBox(width: 8),
            _PeriodChip(label: '90 Days', value: '90d', selected: _selectedPeriod, onTap: (v) => setState(() => _selectedPeriod = v)),
          ])),
        Padding(padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
          child: Row(children: [
            Expanded(child: _TabBtn(label: 'Overview', index: 0, selected: _selectedTab, onTap: (i) => setState(() => _selectedTab = i))),
            const SizedBox(width: 8),
            Expanded(child: _TabBtn(label: 'Violations', index: 1, selected: _selectedTab, onTap: (i) => setState(() => _selectedTab = i))),
            const SizedBox(width: 8),
            Expanded(child: _TabBtn(label: 'Facilities', index: 2, selected: _selectedTab, onTap: (i) => setState(() => _selectedTab = i))),
          ])),
        const Divider(height: 1),
        Expanded(child: RefreshIndicator(
          onRefresh: () async { ref.refresh(inspectionsProvider); ref.refresh(violationsProvider); ref.refresh(facilitiesProvider); },
          child: inspectionsAsync.when(
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (e, _) => Center(child: Text('Error: $e')),
            data: (_) {
              if (_selectedTab == 0) return _OverviewTab(avgScore: avgScore, periodInspections: periodInspections, periodViolations: periodViolations, facilities: facilities, period: _selectedPeriod);
              if (_selectedTab == 1) return _ViolationsTab(periodViolations: periodViolations);
              return _FacilitiesTab(facilities: facilities);
            }))),
      ]),
    );
  }

  void _showShareSheet(BuildContext context) {
    showModalBottomSheet(context: context, builder: (_) => Padding(padding: const EdgeInsets.all(20),
      child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.start, children: [
        const Text('Export Report', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
        const SizedBox(height: 16),
        ListTile(leading: const Icon(Icons.picture_as_pdf_outlined, color: Colors.red), title: const Text('Export as PDF'),
          onTap: () { Navigator.pop(context); ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('PDF export coming soon'))); }),
        ListTile(leading: const Icon(Icons.table_chart_outlined, color: Colors.green), title: const Text('Export as CSV'),
          onTap: () { Navigator.pop(context); ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('CSV export coming soon'))); }),
      ])));
  }
}

class _OverviewTab extends StatelessWidget {
  final double avgScore;
  final List<SafetyInspection> periodInspections;
  final List<dynamic> periodViolations;
  final List<dynamic> facilities;
  final String period;
  const _OverviewTab({required this.avgScore, required this.periodInspections, required this.periodViolations, required this.facilities, required this.period});

  @override
  Widget build(BuildContext context) {
    final openCount = periodViolations.where((v) => v.status == ViolationStatus.open).length;
    final resolvedCount = periodViolations.where((v) => v.status == ViolationStatus.resolved).length;
    final periodLabel = period == '7d' ? '7 days' : period == '30d' ? '30 days' : '90 days';
    return ListView(padding: const EdgeInsets.all(16), children: [
      Card(child: Padding(padding: const EdgeInsets.all(20), child: Column(children: [
        const Text('Overall Compliance Score', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
        const SizedBox(height: 16),
        ComplianceGauge(score: avgScore, size: 160),
        const SizedBox(height: 8),
        Text('Based on ${periodInspections.length} inspections in the last $periodLabel',
            style: const TextStyle(color: Colors.grey, fontSize: 12), textAlign: TextAlign.center),
      ]))),
      const SizedBox(height: 16),
      Row(children: [
        Expanded(child: _StatCard(icon: Icons.checklist_rounded, label: 'Inspections', value: '${periodInspections.length}', color: Theme.of(context).colorScheme.primary)),
        const SizedBox(width: 12),
        Expanded(child: _StatCard(icon: Icons.business_rounded, label: 'Facilities', value: '${facilities.length}', color: Colors.blueGrey)),
      ]),
      const SizedBox(height: 12),
      Row(children: [
        Expanded(child: _StatCard(icon: Icons.warning_amber_rounded, label: 'New Violations', value: '${openCount}', color: Colors.red)),
        const SizedBox(width: 12),
        Expanded(child: _StatCard(icon: Icons.check_circle_outline, label: 'Resolved', value: '${resolvedCount}', color: Colors.green)),
      ]),
      const SizedBox(height: 16),
      if (periodInspections.isNotEmpty) ...[
        const Text('Recent Completed Inspections', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
        const SizedBox(height: 8),
        ...periodInspections.take(5).map((i) => Card(child: ListTile(
          leading: CircleAvatar(
            backgroundColor: (i.score >= 80 ? Colors.green : Colors.red).withOpacity(0.1),
            child: Text('${i.score.round()}%', style: TextStyle(color: i.score >= 80 ? Colors.green : Colors.red, fontWeight: FontWeight.bold, fontSize: 11))),
          title: Text(i.type.name.toUpperCase(), style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
          subtitle: Text(DateFormat('MMM d, yyyy').format(i.date) + ' • ' + i.inspector),
          trailing: const Icon(Icons.chevron_right, color: Colors.grey),
        ))),
      ],
      if (periodInspections.isEmpty) Padding(padding: const EdgeInsets.all(24), child: Center(child: Column(children: [
        Icon(Icons.inbox_outlined, size: 48, color: Colors.grey.shade300), const SizedBox(height: 12),
        const Text('No completed inspections in this period', style: TextStyle(color: Colors.grey)),
      ]))),
    ]);
  }
}

class _ViolationsTab extends StatelessWidget {
  final List<dynamic> periodViolations;
  const _ViolationsTab({required this.periodViolations});
  @override
  Widget build(BuildContext context) {
    final bySeverity = <String, int>{};
    for (final sev in ViolationSeverity.values) { bySeverity[sev.name] = periodViolations.where((v) => v.severity == sev).length; }
    final byCategory = <String, int>{};
    for (final v in periodViolations) { byCategory[v.category] = (byCategory[v.category] ?? 0) + 1; }
    final sortedCats = byCategory.entries.toList()..sort((a, b) => b.value.compareTo(a.value));
    return ListView(padding: const EdgeInsets.all(16), children: [
      Card(child: Padding(padding: const EdgeInsets.all(16), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text('Violations by Severity (${periodViolations.length} total)', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
        const SizedBox(height: 12),
        ...ViolationSeverity.values.map((sev) {
          final count = bySeverity[sev.name] ?? 0;
          final color = sev == ViolationSeverity.critical ? Colors.red.shade900 : sev == ViolationSeverity.high ? Colors.red : sev == ViolationSeverity.medium ? Colors.orange : Colors.amber;
          final pct = periodViolations.isEmpty ? 0.0 : count / periodViolations.length;
          return Padding(padding: const EdgeInsets.only(bottom: 10), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Row(children: [
              Text(sev.name.toUpperCase(), style: TextStyle(color: color, fontWeight: FontWeight.bold, fontSize: 12)),
              const Spacer(),
              Text('$count', style: TextStyle(color: color, fontWeight: FontWeight.bold)),
            ]),
            const SizedBox(height: 4),
            ClipRRect(borderRadius: BorderRadius.circular(4), child: LinearProgressIndicator(
              value: pct, backgroundColor: Colors.grey.shade100, valueColor: AlwaysStoppedAnimation(color), minHeight: 8)),
          ]));
        }),
      ]))),
      const SizedBox(height: 16),
      if (sortedCats.isNotEmpty) ...[
        const Text('Top Violation Categories', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
        const SizedBox(height: 8),
        ...sortedCats.take(8).map((entry) => Card(child: ListTile(
          leading: CircleAvatar(backgroundColor: Theme.of(context).colorScheme.primary.withOpacity(0.1),
            child: Text('${entry.value}', style: TextStyle(color: Theme.of(context).colorScheme.primary, fontWeight: FontWeight.bold, fontSize: 13))),
          title: Text(entry.key),
          trailing: SizedBox(width: 80, child: ClipRRect(borderRadius: BorderRadius.circular(4), child: LinearProgressIndicator(
            value: periodViolations.isEmpty ? 0 : entry.value / periodViolations.length,
            backgroundColor: Colors.grey.shade100, valueColor: AlwaysStoppedAnimation(Theme.of(context).colorScheme.primary), minHeight: 8))),
        ))),
      ],
      if (periodViolations.isEmpty) Padding(padding: const EdgeInsets.all(24), child: Center(child: Column(children: [
        const Icon(Icons.check_circle_outline, size: 64, color: Colors.green), const SizedBox(height: 12),
        const Text('No violations in this period', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Colors.green)),
      ]))),
    ]);
  }
}

class _FacilitiesTab extends StatelessWidget {
  final List<dynamic> facilities;
  const _FacilitiesTab({required this.facilities});
  @override
  Widget build(BuildContext context) {
    final sorted = [...facilities]..sort((a, b) => a.complianceScore.compareTo(b.complianceScore));
    return ListView(padding: const EdgeInsets.all(16), children: [
      const Text('Compliance by Facility', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
      const SizedBox(height: 8),
      ...sorted.map((f) {
        final color = f.complianceScore >= 90 ? Colors.green : f.complianceScore >= 75 ? Colors.orange : Colors.red;
        return Card(margin: const EdgeInsets.only(bottom: 8), child: Padding(padding: const EdgeInsets.all(14), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(children: [
            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(f.name, style: const TextStyle(fontWeight: FontWeight.bold)),
              Text(f.type, style: const TextStyle(color: Colors.grey, fontSize: 12)),
            ])),
            Text('${f.complianceScore.round()}%', style: TextStyle(color: color, fontWeight: FontWeight.bold, fontSize: 18)),
          ]),
          const SizedBox(height: 8),
          ClipRRect(borderRadius: BorderRadius.circular(4), child: LinearProgressIndicator(
            value: f.complianceScore / 100, backgroundColor: Colors.grey.shade200,
            valueColor: AlwaysStoppedAnimation(color), minHeight: 6)),
          if (f.openViolations > 0) ...[
            const SizedBox(height: 6),
            Row(children: [
              Icon(Icons.warning_amber_outlined, size: 13, color: Colors.red.shade400),
              const SizedBox(width: 4),
              Text('${f.openViolations} open violation${f.openViolations > 1 ? 's' : ''}', style: TextStyle(color: Colors.red.shade400, fontSize: 12)),
            ]),
          ],
        ])));
      }),
      if (facilities.isEmpty) Padding(padding: const EdgeInsets.all(24), child: Center(child: Column(children: [
        Icon(Icons.business_outlined, size: 48, color: Colors.grey.shade300), const SizedBox(height: 12),
        const Text('No facilities found', style: TextStyle(color: Colors.grey)),
      ]))),
    ]);
  }
}

class _StatCard extends StatelessWidget {
  final IconData icon; final String label; final String value; final Color color;
  const _StatCard({required this.icon, required this.label, required this.value, required this.color});
  @override
  Widget build(BuildContext context) => Card(child: Padding(
    padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 8),
    child: Column(children: [
      Icon(icon, color: color, size: 28), const SizedBox(height: 8),
      Text(value, style: TextStyle(fontSize: 26, fontWeight: FontWeight.bold, color: color)),
      Text(label, style: const TextStyle(fontSize: 11, color: Colors.grey), textAlign: TextAlign.center),
    ])));
}

class _PeriodChip extends StatelessWidget {
  final String label; final String value; final String selected; final ValueChanged<String> onTap;
  const _PeriodChip({required this.label, required this.value, required this.selected, required this.onTap});
  @override
  Widget build(BuildContext context) {
    final isSel = selected == value;
    return ChoiceChip(label: Text(label), selected: isSel, onSelected: (_) => onTap(value),
      selectedColor: Theme.of(context).colorScheme.primary,
      labelStyle: TextStyle(color: isSel ? Colors.white : null, fontSize: 12));
  }
}

class _TabBtn extends StatelessWidget {
  final String label; final int index; final int selected; final ValueChanged<int> onTap;
  const _TabBtn({required this.label, required this.index, required this.selected, required this.onTap});
  @override
  Widget build(BuildContext context) {
    final isSel = selected == index;
    return GestureDetector(onTap: () => onTap(index), child: Container(
      padding: const EdgeInsets.symmetric(vertical: 8),
      decoration: BoxDecoration(
        color: isSel ? Theme.of(context).colorScheme.primary : Colors.grey.shade100,
        borderRadius: BorderRadius.circular(8)),
      child: Center(child: Text(label, style: TextStyle(
        color: isSel ? Colors.white : Colors.grey.shade700,
        fontWeight: isSel ? FontWeight.bold : null, fontSize: 13)))));
  }
}