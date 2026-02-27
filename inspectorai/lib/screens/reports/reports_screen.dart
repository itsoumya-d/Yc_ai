import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../models/inspection.dart';
import '../../providers/inspections_provider.dart';
import '../../services/report_generation_service.dart';

class ReportsScreen extends ConsumerWidget {
  const ReportsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final completed = ref.watch(completedInspectionsProvider);
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(title: const Text('Inspection Reports')),
      body: completed.isEmpty
          ? const Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.description_outlined, size: 64, color: Colors.grey),
                  SizedBox(height: 16),
                  Text('No reports yet', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                  SizedBox(height: 8),
                  Text('Completed inspections will appear here', style: TextStyle(color: Colors.grey)),
                ],
              ),
            )
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: completed.length,
              itemBuilder: (context, index) {
                final inspection = completed[index];
                final summary = ReportGenerationService.generateReportSummary(inspection);
                return Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(8),
                              decoration: BoxDecoration(
                                color: theme.colorScheme.primary.withOpacity(0.1),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Icon(Icons.home_outlined, color: theme.colorScheme.primary),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(inspection.propertyAddress,
                                      style: const TextStyle(fontWeight: FontWeight.bold),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis),
                                  Text(inspection.clientName,
                                      style: const TextStyle(color: Colors.grey, fontSize: 13)),
                                ],
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        Row(
                          children: [
                            _ReportStat(label: 'Rooms', value: '${summary['total_rooms']}'),
                            const SizedBox(width: 16),
                            _ReportStat(label: 'Issues', value: '${summary['total_issues']}', color: Colors.orange),
                            const SizedBox(width: 16),
                            _ReportStat(
                              label: 'Condition',
                              value: inspection.overallCondition.name.toUpperCase(),
                              color: _conditionColor(inspection.overallCondition),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        Text(
                          'Inspector: ${inspection.inspectorName}  •  ${DateFormat('MMM d, yyyy').format(inspection.date)}',
                          style: const TextStyle(fontSize: 12, color: Colors.grey),
                        ),
                        const SizedBox(height: 12),
                        Row(
                          children: [
                            Expanded(
                              child: OutlinedButton.icon(
                                onPressed: () => _showReportPreview(context, inspection),
                                icon: const Icon(Icons.preview_outlined, size: 18),
                                label: const Text('Preview'),
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: ElevatedButton.icon(
                                onPressed: () => _exportPdf(context, inspection),
                                icon: const Icon(Icons.picture_as_pdf, size: 18),
                                label: const Text('Export PDF'),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                );
              },
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

  void _showReportPreview(BuildContext context, Inspection inspection) {
    final summary = ReportGenerationService.generateReportSummary(inspection);
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (_) => DraggableScrollableSheet(
        expand: false,
        initialChildSize: 0.8,
        builder: (_, controller) => Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(child: Container(width: 40, height: 4, color: Colors.grey.shade300, decoration: BoxDecoration(borderRadius: BorderRadius.circular(2)))),
              const SizedBox(height: 16),
              Text('Report Preview', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              const Divider(),
              Expanded(
                child: ListView(
                  controller: controller,
                  children: [
                    _PreviewSection(title: 'Property', content: inspection.propertyAddress),
                    _PreviewSection(title: 'Client', content: inspection.clientName),
                    _PreviewSection(title: 'Inspector', content: inspection.inspectorName),
                    _PreviewSection(title: 'Overall Condition', content: inspection.overallCondition.name.toUpperCase()),
                    _PreviewSection(title: 'Total Issues', content: '${summary['total_issues']}'),
                    const SizedBox(height: 16),
                    const Text('Issues Found:', style: TextStyle(fontWeight: FontWeight.bold)),
                    ...(summary['issues'] as List).map((issue) => ListTile(
                      leading: const Icon(Icons.warning_amber_outlined, color: Colors.orange, size: 20),
                      title: Text('${issue['room']}: ${issue['description']}', style: const TextStyle(fontSize: 13)),
                      subtitle: issue['recommendation']?.isNotEmpty == true ? Text(issue['recommendation'] as String) : null,
                    )),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _exportPdf(BuildContext context, Inspection inspection) {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('PDF export requires platform integration. HTML report generated.'), backgroundColor: Colors.blue),
    );
  }
}

class _ReportStat extends StatelessWidget {
  final String label;
  final String value;
  final Color? color;

  const _ReportStat({required this.label, required this.value, this.color});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(value, style: TextStyle(fontWeight: FontWeight.bold, color: color, fontSize: 16)),
        Text(label, style: const TextStyle(color: Colors.grey, fontSize: 11)),
      ],
    );
  }
}

class _PreviewSection extends StatelessWidget {
  final String title;
  final String content;
  const _PreviewSection({required this.title, required this.content});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(width: 120, child: Text(title, style: const TextStyle(color: Colors.grey, fontSize: 13))),
          Expanded(child: Text(content, style: const TextStyle(fontWeight: FontWeight.w600))),
        ],
      ),
    );
  }
}
