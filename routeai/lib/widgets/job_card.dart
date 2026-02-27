import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/job.dart';

class JobCard extends StatelessWidget {
  final Job job;
  final VoidCallback? onTap;
  final bool showDriver;

  const JobCard({super.key, required this.job, this.onTap, this.showDriver = false});

  Color _statusColor() {
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

  String _statusLabel() {
    switch (job.status) {
      case JobStatus.scheduled:
        return 'Scheduled';
      case JobStatus.enRoute:
        return 'En Route';
      case JobStatus.arrived:
        return 'Arrived';
      case JobStatus.completed:
        return 'Completed';
      case JobStatus.cancelled:
        return 'Cancelled';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  CircleAvatar(
                    radius: 20,
                    backgroundColor: _statusColor().withOpacity(0.15),
                    child: Text(
                      job.customerName.isNotEmpty ? job.customerName[0].toUpperCase() : '?',
                      style: TextStyle(color: _statusColor(), fontWeight: FontWeight.bold),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          job.customerName,
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                        ),
                        Text(
                          job.serviceType,
                          style: TextStyle(color: Colors.teal.shade700, fontSize: 13),
                        ),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: _statusColor().withOpacity(0.1),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: _statusColor().withOpacity(0.3)),
                    ),
                    child: Text(
                      _statusLabel(),
                      style: TextStyle(
                        color: _statusColor(),
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              Row(
                children: [
                  const Icon(Icons.location_on_outlined, size: 14, color: Colors.grey),
                  const SizedBox(width: 4),
                  Expanded(
                    child: Text(
                      job.address,
                      style: const TextStyle(fontSize: 12, color: Colors.grey),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 6),
              Row(
                children: [
                  const Icon(Icons.schedule_outlined, size: 14, color: Colors.grey),
                  const SizedBox(width: 4),
                  Text(
                    DateFormat('h:mm a').format(job.scheduledTime),
                    style: const TextStyle(fontSize: 12, color: Colors.grey),
                  ),
                  const SizedBox(width: 12),
                  const Icon(Icons.timer_outlined, size: 14, color: Colors.grey),
                  const SizedBox(width: 4),
                  Text(
                    '${job.durationMinutes} min',
                    style: const TextStyle(fontSize: 12, color: Colors.grey),
                  ),
                  const Spacer(),
                  const Icon(Icons.chevron_right, color: Colors.grey),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
