import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../models/job.dart';
import '../../providers/jobs_provider.dart';

class JobDetailScreen extends ConsumerWidget {
  final String jobId;
  const JobDetailScreen({super.key, required this.jobId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final jobsAsync = ref.watch(jobsProvider);

    return jobsAsync.when(
      loading: () => const Scaffold(body: Center(child: CircularProgressIndicator())),
      error: (e, _) => Scaffold(body: Center(child: Text('Error: $e'))),
      data: (jobs) {
        final job = jobs.where((j) => j.id == jobId).firstOrNull;
        if (job == null) return const Scaffold(body: Center(child: Text('Job not found')));
        return _buildDetail(context, ref, job);
      },
    );
  }

  Widget _buildDetail(BuildContext context, WidgetRef ref, Job job) {
    return Scaffold(
      appBar: AppBar(
        title: Text(job.customerName),
        leading: const BackButton(color: Colors.white),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Status card
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(job.serviceType, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                            const SizedBox(height: 4),
                            Text(job.customerName, style: const TextStyle(color: Colors.grey)),
                          ],
                        ),
                      ),
                      _StatusBadge(status: job.status),
                    ],
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 12),
          Card(
            child: Column(
              children: [
                _DetailTile(icon: Icons.location_on_outlined, title: 'Address', value: job.address),
                const Divider(height: 1),
                _DetailTile(
                  icon: Icons.schedule_outlined,
                  title: 'Scheduled',
                  value: DateFormat('h:mm a • MMM d, yyyy').format(job.scheduledTime),
                ),
                const Divider(height: 1),
                _DetailTile(icon: Icons.timer_outlined, title: 'Duration', value: '${job.durationMinutes} minutes'),
                if (job.notes.isNotEmpty) ...[
                  const Divider(height: 1),
                  _DetailTile(icon: Icons.notes_outlined, title: 'Notes', value: job.notes),
                ],
              ],
            ),
          ),
          const SizedBox(height: 20),
          const Text('Update Status', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
          const SizedBox(height: 10),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              _ActionButton(
                label: 'On My Way',
                icon: Icons.directions_car_outlined,
                color: Colors.orange,
                onTap: () => _updateStatus(context, ref, job, JobStatus.enRoute),
                isActive: job.status == JobStatus.enRoute,
              ),
              _ActionButton(
                label: 'Arrived',
                icon: Icons.location_on_outlined,
                color: Colors.purple,
                onTap: () => _updateStatus(context, ref, job, JobStatus.arrived),
                isActive: job.status == JobStatus.arrived,
              ),
              _ActionButton(
                label: 'Completed',
                icon: Icons.check_circle_outlined,
                color: Colors.green,
                onTap: () => _updateStatus(context, ref, job, JobStatus.completed),
                isActive: job.status == JobStatus.completed,
              ),
              _ActionButton(
                label: 'Cancel',
                icon: Icons.cancel_outlined,
                color: Colors.red,
                onTap: () => _updateStatus(context, ref, job, JobStatus.cancelled),
                isActive: job.status == JobStatus.cancelled,
              ),
            ],
          ),
          const SizedBox(height: 20),
          ElevatedButton.icon(
            onPressed: () {},
            icon: const Icon(Icons.navigation),
            label: const Text('Navigate to Job'),
            style: ElevatedButton.styleFrom(minimumSize: const Size.fromHeight(50)),
          ),
        ],
      ),
    );
  }

  Future<void> _updateStatus(BuildContext context, WidgetRef ref, Job job, JobStatus status) async {
    await ref.read(jobsProvider.notifier).updateJobStatus(job.id, status);
    if (context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Status updated to ${status.name}'), backgroundColor: Colors.green),
      );
    }
  }
}

class _StatusBadge extends StatelessWidget {
  final JobStatus status;
  const _StatusBadge({required this.status});

  @override
  Widget build(BuildContext context) {
    Color color;
    switch (status) {
      case JobStatus.scheduled: color = Colors.blue;
      case JobStatus.enRoute: color = Colors.orange;
      case JobStatus.arrived: color = Colors.purple;
      case JobStatus.completed: color = Colors.green;
      case JobStatus.cancelled: color = Colors.red;
    }
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(20), border: Border.all(color: color.withOpacity(0.3))),
      child: Text(status.name.toUpperCase(), style: TextStyle(color: color, fontWeight: FontWeight.bold, fontSize: 12)),
    );
  }
}

class _DetailTile extends StatelessWidget {
  final IconData icon;
  final String title;
  final String value;
  const _DetailTile({required this.icon, required this.title, required this.value});

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: Icon(icon, color: Theme.of(context).colorScheme.primary),
      title: Text(title, style: const TextStyle(fontSize: 12, color: Colors.grey)),
      subtitle: Text(value, style: const TextStyle(color: Colors.black87, fontWeight: FontWeight.w500)),
    );
  }
}

class _ActionButton extends StatelessWidget {
  final String label;
  final IconData icon;
  final Color color;
  final VoidCallback onTap;
  final bool isActive;

  const _ActionButton({required this.label, required this.icon, required this.color, required this.onTap, required this.isActive});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        decoration: BoxDecoration(
          color: isActive ? color.withOpacity(0.15) : Colors.grey.shade100,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: isActive ? color : Colors.grey.shade300, width: isActive ? 2 : 1),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, color: isActive ? color : Colors.grey, size: 18),
            const SizedBox(width: 6),
            Text(label, style: TextStyle(color: isActive ? color : Colors.grey, fontWeight: FontWeight.bold, fontSize: 13)),
          ],
        ),
      ),
    );
  }
}
