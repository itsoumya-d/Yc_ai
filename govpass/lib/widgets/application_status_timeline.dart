import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/application.dart';

class ApplicationStatusTimeline extends StatelessWidget {
  final List<StatusUpdate> history;
  final ApplicationStatus currentStatus;

  const ApplicationStatusTimeline({
    super.key,
    required this.history,
    required this.currentStatus,
  });

  Color _getStatusColor(ApplicationStatus status) {
    switch (status) {
      case ApplicationStatus.submitted:
        return const Color(0xFF3B82F6);
      case ApplicationStatus.processing:
        return const Color(0xFFF59E0B);
      case ApplicationStatus.approved:
        return const Color(0xFF10B981);
      case ApplicationStatus.rejected:
        return const Color(0xFFEF4444);
      case ApplicationStatus.pendingInfo:
        return const Color(0xFF8B5CF6);
    }
  }

  IconData _getStatusIcon(ApplicationStatus status) {
    switch (status) {
      case ApplicationStatus.submitted:
        return Icons.send_outlined;
      case ApplicationStatus.processing:
        return Icons.hourglass_empty;
      case ApplicationStatus.approved:
        return Icons.check_circle_outline;
      case ApplicationStatus.rejected:
        return Icons.cancel_outlined;
      case ApplicationStatus.pendingInfo:
        return Icons.info_outline;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: List.generate(history.length, (index) {
        final update = history[index];
        final isLast = index == history.length - 1;
        final color = _getStatusColor(update.status);

        return Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Column(
              children: [
                Container(
                  width: 36,
                  height: 36,
                  decoration: BoxDecoration(
                    color: color.withOpacity(0.15),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    _getStatusIcon(update.status),
                    size: 18,
                    color: color,
                  ),
                ),
                if (!isLast)
                  Container(
                    width: 2,
                    height: 40,
                    color: const Color(0xFFE2E8F0),
                  ),
              ],
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Padding(
                padding: EdgeInsets.only(bottom: isLast ? 0 : 24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          update.status.label,
                          style: TextStyle(
                            fontWeight: FontWeight.w600,
                            fontSize: 14,
                            color: color,
                          ),
                        ),
                        Text(
                          DateFormat('MMM d, y').format(update.date),
                          style: const TextStyle(
                            fontSize: 12,
                            color: Color(0xFF94A3B8),
                          ),
                        ),
                      ],
                    ),
                    if (update.message != null) ...[
                      const SizedBox(height: 4),
                      Text(
                        update.message!,
                        style: const TextStyle(
                          fontSize: 13,
                          color: Color(0xFF64748B),
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ),
          ],
        );
      }),
    );
  }
}
