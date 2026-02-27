import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../models/daily_report.dart';
import '../../providers/reports_provider.dart';
import '../../widgets/photo_grid.dart';

class ReportDetailScreen extends ConsumerWidget {
  final String reportId;
  const ReportDetailScreen({super.key, required this.reportId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final reportsAsync = ref.watch(reportsProvider);

    return reportsAsync.when(
      loading: () => const Scaffold(body: Center(child: CircularProgressIndicator())),
      error: (e, _) => Scaffold(body: Center(child: Text('Error: $e'))),
      data: (reports) {
        final report = reports.where((r) => r.id == reportId).firstOrNull;
        if (report == null) {
          return const Scaffold(body: Center(child: Text('Report not found')));
        }
        return _buildContent(context, report);
      },
    );
  }

  Widget _buildContent(BuildContext context, DailyReport report) {
    return Scaffold(
      appBar: AppBar(
        title: Text(DateFormat('MMM d, yyyy').format(report.date)),
        leading: const BackButton(color: Colors.white),
        actions: [
          IconButton(
            icon: const Icon(Icons.share_outlined, color: Colors.white),
            onPressed: () {},
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('REPORT SUMMARY', style: TextStyle(fontSize: 11, color: Colors.grey, letterSpacing: 1)),
                  const SizedBox(height: 12),
                  _DetailRow(icon: Icons.wb_sunny_outlined, label: 'Weather', value: report.weather),
                  _DetailRow(icon: Icons.group_outlined, label: 'Crew Count', value: '${report.crewCount} workers'),
                  _DetailRow(icon: Icons.person_outline, label: 'Filed By', value: report.createdBy),
                  _DetailRow(
                    icon: Icons.schedule_outlined,
                    label: 'Filed At',
                    value: DateFormat('h:mm a').format(report.createdAt),
                  ),
                  if (report.location != null)
                    _DetailRow(icon: Icons.location_on_outlined, label: 'GPS', value: report.location!),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          _SectionCard(
            title: 'Work Performed',
            icon: Icons.construction,
            child: Text(report.workPerformed, style: const TextStyle(height: 1.5)),
          ),
          if (report.equipmentUsed.isNotEmpty) ...[
            const SizedBox(height: 12),
            _SectionCard(
              title: 'Equipment Used',
              icon: Icons.build_outlined,
              child: Text(report.equipmentUsed, style: const TextStyle(height: 1.5)),
            ),
          ],
          if (report.issues.isNotEmpty) ...[
            const SizedBox(height: 12),
            _SectionCard(
              title: 'Issues / Delays',
              icon: Icons.warning_amber_outlined,
              iconColor: Colors.orange,
              child: Text(report.issues, style: const TextStyle(height: 1.5)),
            ),
          ],
          const SizedBox(height: 12),
          _SectionCard(
            title: 'Site Photos (${report.photos.length})',
            icon: Icons.photo_library_outlined,
            child: report.photos.isEmpty
                ? const Padding(
                    padding: EdgeInsets.symmetric(vertical: 16),
                    child: Center(
                      child: Text('No photos attached', style: TextStyle(color: Colors.grey)),
                    ),
                  )
                : PhotoGrid(photoUrls: report.photos),
          ),
        ],
      ),
    );
  }
}

class _DetailRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;

  const _DetailRow({required this.icon, required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        children: [
          Icon(icon, size: 18, color: Colors.grey.shade600),
          const SizedBox(width: 10),
          Text(label, style: const TextStyle(color: Colors.grey, fontSize: 13)),
          const Spacer(),
          Text(value, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
        ],
      ),
    );
  }
}

class _SectionCard extends StatelessWidget {
  final String title;
  final IconData icon;
  final Color? iconColor;
  final Widget child;

  const _SectionCard({required this.title, required this.icon, this.iconColor, required this.child});

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(icon, size: 18, color: iconColor ?? Theme.of(context).colorScheme.primary),
                const SizedBox(width: 8),
                Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
              ],
            ),
            const Divider(height: 20),
            child,
          ],
        ),
      ),
    );
  }
}
