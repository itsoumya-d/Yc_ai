import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../providers/applications_provider.dart';
import '../../theme/app_theme.dart';
import '../../models/application.dart';
import '../../widgets/application_status_timeline.dart';

class MyApplicationsScreen extends ConsumerWidget {
  const MyApplicationsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final applications = ref.watch(applicationsProvider);

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text('My Applications'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.go('/home'),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: () => context.go('/my-applications/add'),
          ),
        ],
      ),
      body: applications.isEmpty
          ? _EmptyApplicationsView(onAdd: () => context.go('/my-applications/add'))
          : ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: applications.length,
              separatorBuilder: (_, __) => const SizedBox(height: 12),
              itemBuilder: (context, index) {
                final app = applications[index];
                return _ApplicationCard(
                  application: app,
                  onTap: () => _showApplicationDetail(context, app),
                  onDelete: () {
                    ref.read(applicationsProvider.notifier).removeApplication(app.id);
                  },
                );
              },
            ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => context.go('/my-applications/add'),
        backgroundColor: AppTheme.primaryBlue,
        icon: const Icon(Icons.add, color: Colors.white),
        label: const Text('Track Application', style: TextStyle(color: Colors.white)),
      ),
      bottomNavigationBar: _BottomNav(),
    );
  }

  void _showApplicationDetail(BuildContext context, Application app) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => DraggableScrollableSheet(
        initialChildSize: 0.7,
        maxChildSize: 0.95,
        minChildSize: 0.5,
        expand: false,
        builder: (context, scrollController) => SingleChildScrollView(
          controller: scrollController,
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: const Color(0xFFCBD5E1),
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 20),
              Text(
                app.serviceName,
                style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 4),
              Text(
                'Submitted ${DateFormat('MMMM d, yyyy').format(app.submittedAt)}',
                style: const TextStyle(color: Color(0xFF64748B), fontSize: 13),
              ),
              const SizedBox(height: 20),
              const Text(
                'Status Timeline',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 16),
              ApplicationStatusTimeline(
                history: app.statusHistory,
                currentStatus: app.status,
              ),
              if (app.notes != null) ...[
                const SizedBox(height: 20),
                const Text(
                  'Notes',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 8),
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF1F5F9),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    app.notes!,
                    style: const TextStyle(fontSize: 14, color: Color(0xFF475569)),
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

class _ApplicationCard extends StatelessWidget {
  final Application application;
  final VoidCallback onTap;
  final VoidCallback onDelete;

  const _ApplicationCard({
    required this.application,
    required this.onTap,
    required this.onDelete,
  });

  Color _getStatusColor(ApplicationStatus status) {
    switch (status) {
      case ApplicationStatus.approved:
        return const Color(0xFF10B981);
      case ApplicationStatus.rejected:
        return const Color(0xFFEF4444);
      case ApplicationStatus.processing:
        return const Color(0xFFF59E0B);
      case ApplicationStatus.pendingInfo:
        return const Color(0xFF8B5CF6);
      default:
        return const Color(0xFF3B82F6);
    }
  }

  @override
  Widget build(BuildContext context) {
    final color = _getStatusColor(application.status);

    return Dismissible(
      key: Key(application.id),
      direction: DismissDirection.endToStart,
      background: Container(
        alignment: Alignment.centerRight,
        padding: const EdgeInsets.only(right: 20),
        decoration: BoxDecoration(
          color: Colors.red,
          borderRadius: BorderRadius.circular(12),
        ),
        child: const Icon(Icons.delete, color: Colors.white),
      ),
      onDismissed: (_) => onDelete(),
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: const Color(0xFFE2E8F0)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Text(
                      application.serviceName,
                      style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 15),
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: color.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      application.status.label,
                      style: TextStyle(
                        fontSize: 12,
                        color: color,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  const Icon(Icons.calendar_today_outlined, size: 13, color: Color(0xFF94A3B8)),
                  const SizedBox(width: 4),
                  Text(
                    'Submitted ${DateFormat('MMM d, y').format(application.submittedAt)}',
                    style: const TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                  ),
                  const Spacer(),
                  Text(
                    'Tap for details',
                    style: TextStyle(fontSize: 12, color: AppTheme.primaryBlue),
                  ),
                ],
              ),
              if (application.notes != null) ...[
                const SizedBox(height: 8),
                Text(
                  application.notes!,
                  style: const TextStyle(fontSize: 12, color: Color(0xFF94A3B8)),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

class _EmptyApplicationsView extends StatelessWidget {
  final VoidCallback onAdd;

  const _EmptyApplicationsView({required this.onAdd});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.folder_open_outlined, size: 72, color: Color(0xFFCBD5E1)),
          const SizedBox(height: 16),
          const Text(
            'No applications tracked',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 8),
          const Text(
            'Start tracking your government\napplications to monitor progress',
            textAlign: TextAlign.center,
            style: TextStyle(color: Color(0xFF64748B)),
          ),
          const SizedBox(height: 24),
          ElevatedButton.icon(
            onPressed: onAdd,
            icon: const Icon(Icons.add),
            label: const Text('Track an Application'),
            style: ElevatedButton.styleFrom(
              minimumSize: const Size(200, 48),
            ),
          ),
        ],
      ),
    );
  }
}

class _BottomNav extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return BottomNavigationBar(
      currentIndex: 2,
      onTap: (index) {
        switch (index) {
          case 0: context.go('/home'); break;
          case 1: context.go('/search'); break;
          case 2: break;
          case 3: context.go('/profile'); break;
        }
      },
      items: const [
        BottomNavigationBarItem(icon: Icon(Icons.home_outlined), label: 'Home'),
        BottomNavigationBarItem(icon: Icon(Icons.search), label: 'Search'),
        BottomNavigationBarItem(icon: Icon(Icons.folder_outlined), label: 'Applications'),
        BottomNavigationBarItem(icon: Icon(Icons.person_outlined), label: 'Profile'),
      ],
    );
  }
}
