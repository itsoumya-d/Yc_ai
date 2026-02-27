import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/punch_item.dart';

class PunchItemCard extends StatelessWidget {
  final PunchItem item;
  final VoidCallback? onTap;
  final VoidCallback? onResolve;

  const PunchItemCard({super.key, required this.item, this.onTap, this.onResolve});

  Color _priorityColor() {
    switch (item.priority) {
      case PunchPriority.critical:
        return Colors.red;
      case PunchPriority.high:
        return Colors.orange;
      case PunchPriority.medium:
        return Colors.amber;
      case PunchPriority.low:
        return Colors.green;
    }
  }

  Color _statusColor() {
    switch (item.status) {
      case PunchStatus.open:
        return Colors.red.shade100;
      case PunchStatus.inProgress:
        return Colors.orange.shade100;
      case PunchStatus.resolved:
        return Colors.green.shade100;
      case PunchStatus.closed:
        return Colors.grey.shade100;
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
                  Container(
                    width: 10,
                    height: 10,
                    decoration: BoxDecoration(
                      color: _priorityColor(),
                      shape: BoxShape.circle,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    item.priority.name.toUpperCase(),
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      color: _priorityColor(),
                      letterSpacing: 0.5,
                    ),
                  ),
                  const Spacer(),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: _statusColor(),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      item.status.name.replaceAll('_', ' ').toUpperCase(),
                      style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Text(
                item.description,
                style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 6),
              Row(
                children: [
                  const Icon(Icons.location_on_outlined, size: 14, color: Colors.grey),
                  const SizedBox(width: 4),
                  Text(
                    item.location,
                    style: const TextStyle(fontSize: 12, color: Colors.grey),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              Row(
                children: [
                  if (item.assignedTo.isNotEmpty) ...[
                    const Icon(Icons.person_outline, size: 14, color: Colors.grey),
                    const SizedBox(width: 4),
                    Text(
                      item.assignedTo,
                      style: const TextStyle(fontSize: 12, color: Colors.grey),
                    ),
                  ],
                  const Spacer(),
                  if (item.dueDate != null)
                    Text(
                      'Due: ${DateFormat('MMM d').format(item.dueDate!)}',
                      style: TextStyle(
                        fontSize: 12,
                        color: item.dueDate!.isBefore(DateTime.now())
                            ? Colors.red
                            : Colors.grey,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                ],
              ),
              if (item.status == PunchStatus.open && onResolve != null) ...[
                const SizedBox(height: 10),
                SizedBox(
                  width: double.infinity,
                  child: OutlinedButton.icon(
                    onPressed: onResolve,
                    icon: const Icon(Icons.check_circle_outline, size: 16),
                    label: const Text('Mark Resolved'),
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 8),
                    ),
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
