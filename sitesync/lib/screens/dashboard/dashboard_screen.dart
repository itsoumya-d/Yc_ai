import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../providers/reports_provider.dart';
import '../../providers/punch_list_provider.dart';
import '../../services/supabase_service.dart';
import '../../models/project.dart';
import '../../models/punch_item.dart';

class DashboardScreen extends ConsumerStatefulWidget {
  const DashboardScreen({super.key});

  @override
  ConsumerState<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends ConsumerState<DashboardScreen> {
  Project? _activeProject;
  bool _loadingProject = true;

  @override
  void initState() {
    super.initState();
    _loadProject();
  }

  Future<void> _loadProject() async {
    final projects = await SupabaseService.getProjects();
    if (mounted) {
      setState(() {
        _activeProject = projects.isNotEmpty ? projects.first : null;
        _loadingProject = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final reports = ref.watch(reportsProvider);
    final punchItems = ref.watch(punchListProvider);
    final today = DateTime.now();
    final todayReports = reports.value?.where((r) =>
        r.date.year == today.year && r.date.month == today.month && r.date.day == today.day).toList() ?? [];
    final openItems = punchItems.value?.where((i) =>
        i.status == PunchStatus.open || i.status == PunchStatus.inProgress).toList() ?? [];
    final criticalItems = openItems.where((i) => i.priority == PunchPriority.critical || i.priority == PunchPriority.high).toList();

    return Scaffold(
      appBar: AppBar(
        title: const Text('SiteSync'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: Colors.white),
            onPressed: () {
              ref.refresh(reportsProvider);
              ref.refresh(punchListProvider);
            },
          ),
          IconButton(
            icon: const Icon(Icons.settings_outlined, color: Colors.white),
            onPressed: () {},
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => context.push('/new-report'),
        icon: const Icon(Icons.add),
        label: const Text('New Report'),
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          ref.refresh(reportsProvider);
          ref.refresh(punchListProvider);
        },
        child: ListView(
          padding: const EdgeInsets.only(bottom: 100),
          children: [
            // Active Project Banner
            _buildProjectBanner(context, theme),
            const SizedBox(height: 16),
            // Stats Row
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Row(
                children: [
                  Expanded(
                    child: _StatCard(
                      label: "Today's Reports",
                      value: '${todayReports.length}',
                      icon: Icons.article_rounded,
                      color: theme.colorScheme.primary,
                      onTap: () => context.go('/reports'),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _StatCard(
                      label: 'Open Issues',
                      value: '${openItems.length}',
                      icon: Icons.warning_amber_rounded,
                      color: Colors.orange,
                      onTap: () => context.go('/punch-list'),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _StatCard(
                      label: 'Critical',
                      value: '${criticalItems.length}',
                      icon: Icons.error_outline,
                      color: Colors.red,
                      onTap: () => context.go('/punch-list'),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
            // Today's Report Status
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: _SectionHeader(
                title: "Today's Report",
                subtitle: DateFormat('EEEE, MMMM d').format(today),
                action: TextButton(
                  onPressed: () => context.go('/reports'),
                  child: const Text('View All'),
                ),
              ),
            ),
            if (todayReports.isEmpty)
              _buildNoReportCard(context)
            else
              ...[
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: Card(
                    child: ListTile(
                      leading: const Icon(Icons.check_circle, color: Colors.green),
                      title: Text('Report submitted by ${todayReports.first.createdBy}'),
                      subtitle: Text('Crew: ${todayReports.first.crewCount} | Weather: ${todayReports.first.weather}'),
                      trailing: const Icon(Icons.chevron_right),
                      onTap: () => context.push('/reports/${todayReports.first.id}'),
                    ),
                  ),
                ),
              ],
            const SizedBox(height: 24),
            // Punch Items Due
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: _SectionHeader(
                title: 'Priority Punch Items',
                action: TextButton(
                  onPressed: () => context.go('/punch-list'),
                  child: const Text('View All'),
                ),
              ),
            ),
            if (criticalItems.isEmpty)
              const Padding(
                padding: EdgeInsets.symmetric(horizontal: 16),
                child: Card(
                  child: ListTile(
                    leading: Icon(Icons.check_circle_outline, color: Colors.green),
                    title: Text('No critical punch items'),
                    subtitle: Text('All high priority items resolved'),
                  ),
                ),
              )
            else
              ...criticalItems.take(3).map((item) => Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                    child: Card(
                      child: ListTile(
                        leading: CircleAvatar(
                          backgroundColor: item.priority == PunchPriority.critical
                              ? Colors.red.shade100
                              : Colors.orange.shade100,
                          child: Icon(
                            Icons.warning_amber_rounded,
                            color: item.priority == PunchPriority.critical ? Colors.red : Colors.orange,
                            size: 20,
                          ),
                        ),
                        title: Text(item.description, maxLines: 1, overflow: TextOverflow.ellipsis),
                        subtitle: Text(item.location),
                        trailing: const Icon(Icons.chevron_right),
                      ),
                    ),
                  )),
            const SizedBox(height: 24),
            // Recent Activity
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: _SectionHeader(
                title: 'Recent Activity',
                action: TextButton(
                  onPressed: () => context.go('/reports'),
                  child: const Text('View All'),
                ),
              ),
            ),
            ...reports.value?.take(3).map((report) => ListTile(
                      leading: CircleAvatar(
                        backgroundColor: Colors.orange.shade50,
                        child: const Icon(Icons.article_outlined, color: Colors.orange),
                      ),
                      title: Text(
                        'Report: ${DateFormat('MMM d').format(report.date)}',
                        style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
                      ),
                      subtitle: Text(report.createdBy),
                      trailing: Text(
                        DateFormat('h:mm a').format(report.createdAt),
                        style: const TextStyle(fontSize: 11, color: Colors.grey),
                      ),
                      onTap: () => context.push('/reports/${report.id}'),
                    )) ??
                [],
          ],
        ),
      ),
    );
  }

  Widget _buildProjectBanner(BuildContext context, ThemeData theme) {
    if (_loadingProject) {
      return const Padding(
        padding: EdgeInsets.all(16),
        child: LinearProgressIndicator(),
      );
    }
    if (_activeProject == null) return const SizedBox.shrink();

    return Container(
      margin: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [theme.colorScheme.primary, theme.colorScheme.secondary],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(Icons.construction, color: Colors.white, size: 20),
                const SizedBox(width: 8),
                const Text(
                  'ACTIVE PROJECT',
                  style: TextStyle(
                    color: Colors.white70,
                    fontSize: 11,
                    letterSpacing: 1.2,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const Spacer(),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: Colors.white24,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: const Text('In Progress', style: TextStyle(color: Colors.white, fontSize: 11)),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              _activeProject!.name,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              _activeProject!.client,
              style: const TextStyle(color: Colors.white70, fontSize: 13),
            ),
            const SizedBox(height: 4),
            Row(
              children: [
                const Icon(Icons.location_on_outlined, color: Colors.white70, size: 14),
                const SizedBox(width: 4),
                Expanded(
                  child: Text(
                    _activeProject!.address,
                    style: const TextStyle(color: Colors.white70, fontSize: 12),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildNoReportCard(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Card(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            children: [
              Icon(Icons.article_outlined, size: 40, color: Colors.orange.shade300),
              const SizedBox(height: 8),
              const Text(
                "No report filed today",
                style: TextStyle(fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 4),
              const Text(
                "File your daily report to keep the office informed.",
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.grey, fontSize: 13),
              ),
              const SizedBox(height: 12),
              ElevatedButton.icon(
                onPressed: () => context.push('/new-report'),
                icon: const Icon(Icons.add, size: 18),
                label: const Text('File Today\'s Report'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;
  final Color color;
  final VoidCallback? onTap;

  const _StatCard({
    required this.label,
    required this.value,
    required this.icon,
    required this.color,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 8),
          child: Column(
            children: [
              Icon(icon, color: color, size: 24),
              const SizedBox(height: 6),
              Text(
                value,
                style: TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.bold,
                  color: color,
                ),
              ),
              Text(
                label,
                style: const TextStyle(fontSize: 10, color: Colors.grey),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _SectionHeader extends StatelessWidget {
  final String title;
  final String? subtitle;
  final Widget? action;

  const _SectionHeader({required this.title, this.subtitle, this.action});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(title, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            if (subtitle != null)
              Text(subtitle!, style: const TextStyle(fontSize: 12, color: Colors.grey)),
          ],
        ),
        const Spacer(),
        if (action != null) action!,
      ],
    );
  }
}
