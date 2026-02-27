import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../models/job.dart';
import '../../models/driver.dart';
import '../../providers/jobs_provider.dart';
import '../../providers/drivers_provider.dart';
import '../../widgets/map_view_widget.dart';

class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final jobsAsync = ref.watch(jobsProvider);
    final driversAsync = ref.watch(driversProvider);

    final todaysJobs = ref.watch(todaysJobsProvider);
    final completed = todaysJobs.where((j) => j.status == JobStatus.completed).length;
    final activeDrivers = ref.watch(activeDriversProvider);
    final onTimeRate = todaysJobs.isEmpty ? 0 : ((completed / todaysJobs.length) * 100).round();

    return Scaffold(
      appBar: AppBar(
        title: const Text('RouteAI'),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_outlined, color: Colors.white),
            onPressed: () {},
          ),
          IconButton(
            icon: const Icon(Icons.add, color: Colors.white),
            onPressed: () => context.push('/add-job'),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          ref.refresh(jobsProvider);
          ref.refresh(driversProvider);
        },
        child: ListView(
          padding: const EdgeInsets.only(bottom: 80),
          children: [
            // Header
            Container(
              padding: const EdgeInsets.all(16),
              color: theme.colorScheme.primary,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    DateFormat('EEEE, MMMM d').format(DateTime.now()),
                    style: const TextStyle(color: Colors.white70, fontSize: 13),
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    'Dispatch Overview',
                    style: TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
            ),
            // Stats Row
            Container(
              color: theme.colorScheme.primary,
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 20),
              child: Row(
                children: [
                  _StatBox(label: "Today's Jobs", value: '${todaysJobs.length}', icon: Icons.work_rounded),
                  _StatBox(label: 'Drivers Active', value: '${activeDrivers.length}', icon: Icons.directions_car),
                  _StatBox(label: 'Completed', value: '$completed', icon: Icons.check_circle_outline),
                  _StatBox(label: 'On-Time %', value: '$onTimeRate%', icon: Icons.timer_outlined),
                ],
              ),
            ),
            // Map Overview
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Route Map', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                  const SizedBox(height: 10),
                  MapViewWidget(jobs: todaysJobs),
                ],
              ),
            ),
            // Recent Jobs
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text("Today's Jobs", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                  TextButton(onPressed: () => context.go('/jobs'), child: const Text('View All')),
                ],
              ),
            ),
            jobsAsync.when(
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (e, _) => Center(child: Text('Error: $e')),
              data: (_) => Column(
                children: todaysJobs.take(3).map((job) => ListTile(
                  leading: CircleAvatar(
                    backgroundColor: _jobColor(job).withOpacity(0.15),
                    child: Icon(_jobIcon(job), color: _jobColor(job), size: 20),
                  ),
                  title: Text(job.customerName, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                  subtitle: Text('${DateFormat('h:mm a').format(job.scheduledTime)} • ${job.serviceType}'),
                  trailing: Text(
                    job.status.name.toUpperCase(),
                    style: TextStyle(color: _jobColor(job), fontWeight: FontWeight.bold, fontSize: 11),
                  ),
                  onTap: () => context.push('/jobs/${job.id}'),
                )).toList(),
              ),
            ),
            const Divider(height: 24),
            // Active Drivers
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Active Drivers', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                  TextButton(onPressed: () => context.go('/drivers'), child: const Text('View All')),
                ],
              ),
            ),
            driversAsync.when(
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (e, _) => Center(child: Text('Error: $e')),
              data: (drivers) => Column(
                children: drivers.where((d) => d.status != DriverStatus.offline).take(3).map((d) => ListTile(
                  leading: Stack(
                    children: [
                      CircleAvatar(
                        backgroundColor: Colors.teal.shade100,
                        child: Text(d.name[0], style: TextStyle(color: Colors.teal.shade800, fontWeight: FontWeight.bold)),
                      ),
                      Positioned(
                        right: 0,
                        bottom: 0,
                        child: Container(
                          width: 12,
                          height: 12,
                          decoration: BoxDecoration(
                            color: d.status == DriverStatus.available ? Colors.green : Colors.orange,
                            shape: BoxShape.circle,
                            border: Border.all(color: Colors.white, width: 2),
                          ),
                        ),
                      ),
                    ],
                  ),
                  title: Text(d.name, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                  subtitle: Text(d.vehicle, maxLines: 1, overflow: TextOverflow.ellipsis),
                  trailing: Text('${d.jobsToday} jobs', style: const TextStyle(color: Colors.grey, fontSize: 12)),
                )).toList(),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Color _jobColor(Job job) {
    switch (job.status) {
      case JobStatus.scheduled:
        return Colors.blue;
      case JobStatus.enRoute:
        return Colors.orange;
      case JobStatus.arrived:
        return Colors.purple;
      case JobStatus.completed:
        return Colors.green;
      case JobStatus.cancelled:
        return Colors.red;
    }
  }

  IconData _jobIcon(Job job) {
    switch (job.status) {
      case JobStatus.completed:
        return Icons.check_circle_outline;
      case JobStatus.enRoute:
        return Icons.directions_car_outlined;
      case JobStatus.arrived:
        return Icons.location_on_outlined;
      default:
        return Icons.schedule_outlined;
    }
  }
}

class _StatBox extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;

  const _StatBox({required this.label, required this.value, required this.icon});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        margin: const EdgeInsets.only(right: 8),
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.15),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Column(
          children: [
            Icon(icon, color: Colors.white, size: 20),
            const SizedBox(height: 4),
            Text(value, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 18)),
            Text(label, style: const TextStyle(color: Colors.white70, fontSize: 9), textAlign: TextAlign.center),
          ],
        ),
      ),
    );
  }
}
