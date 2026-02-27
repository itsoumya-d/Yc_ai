import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/violation.dart';

class ViolationCard extends StatelessWidget {
  final Violation violation;
  final VoidCallback? onTap;
  final VoidCallback? onResolve;

  const ViolationCard({super.key, required this.violation, this.onTap, this.onResolve});

  Color _severityColor() {
    switch (violation.severity) {
      case ViolationSeverity.critical:
        return Colors.red.shade800;
      case ViolationSeverity.high:
        return Colors.red;
      case ViolationSeverity.medium:
        return Colors.orange;
      case ViolationSeverity.low:
        return Colors.amber;
    }
  }

  @override
  Widget build(BuildContext context) {
    final isOpen = violation.status == ViolationStatus.open;
    final isResolved = violation.status == ViolationStatus.resolved;

    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: _severityColor().withOpacity(0.1),
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(color: _severityColor().withOpacity(0.3)),
                    ),
                    child: Text(
                      violation.severity.name.toUpperCase(),
                      style: TextStyle(color: _severityColor(), fontSize: 10, fontWeight: FontWeight.bold),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Text(violation.category, style: const TextStyle(color: Colors.grey, fontSize: 12)),
                  const Spacer(),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      color: isResolved ? Colors.green.shade50 : Colors.red.shade50,
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(
                      violation.status.name.toUpperCase(),
                      style: TextStyle(
                        color: isResolved ? Colors.green : Colors.red,
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Text(violation.description, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
              if (violation.correctiveAction.isNotEmpty) ...[
                const SizedBox(height: 6),
                Text(
                  'Action: ${violation.correctiveAction}',
                  style: const TextStyle(fontSize: 12, color: Colors.grey),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
              const SizedBox(height: 8),
              Row(
                children: [
                  if (violation.dueDate != null) ...[
                    Icon(Icons.calendar_today_outlined, size: 12, color: Colors.grey.shade500),
                    const SizedBox(width: 4),
                    Text(
                      'Due: ${DateFormat('MMM d').format(violation.dueDate!)}',
                      style: TextStyle(
                        fontSize: 12,
                        color: violation.dueDate!.isBefore(DateTime.now()) && isOpen
                            ? Colors.red
                            : Colors.grey,
                      ),
                    ),
                  ],
                  const Spacer(),
                  if (isOpen && onResolve != null)
                    TextButton(
                      onPressed: onResolve,
                      style: TextButton.styleFrom(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                        minimumSize: Size.zero,
                      ),
                      child: const Text('Mark Resolved'),
                    ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
