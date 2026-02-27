import 'package:flutter/material.dart';
import '../models/claim.dart';

class StatusBadge extends StatelessWidget {
  final ClaimStatus status;

  const StatusBadge({super.key, required this.status});

  Color get _backgroundColor {
    switch (status) {
      case ClaimStatus.draft:
        return const Color(0xFFF1F5F9);
      case ClaimStatus.filed:
        return const Color(0xFFEFF6FF);
      case ClaimStatus.pending:
        return const Color(0xFFFFFBEB);
      case ClaimStatus.won:
        return const Color(0xFFF0FDF4);
      case ClaimStatus.lost:
        return const Color(0xFFFEF2F2);
      case ClaimStatus.settled:
        return const Color(0xFFF0FDF4);
      case ClaimStatus.withdrawn:
        return const Color(0xFFF8FAFC);
    }
  }

  Color get _textColor {
    switch (status) {
      case ClaimStatus.draft:
        return const Color(0xFF64748B);
      case ClaimStatus.filed:
        return const Color(0xFF2563EB);
      case ClaimStatus.pending:
        return const Color(0xFFD97706);
      case ClaimStatus.won:
        return const Color(0xFF16A34A);
      case ClaimStatus.lost:
        return const Color(0xFFDC2626);
      case ClaimStatus.settled:
        return const Color(0xFF059669);
      case ClaimStatus.withdrawn:
        return const Color(0xFF94A3B8);
    }
  }

  IconData get _icon {
    switch (status) {
      case ClaimStatus.draft:
        return Icons.edit_outlined;
      case ClaimStatus.filed:
        return Icons.send_outlined;
      case ClaimStatus.pending:
        return Icons.hourglass_empty;
      case ClaimStatus.won:
        return Icons.check_circle_outline;
      case ClaimStatus.lost:
        return Icons.cancel_outlined;
      case ClaimStatus.settled:
        return Icons.handshake_outlined;
      case ClaimStatus.withdrawn:
        return Icons.remove_circle_outline;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: _backgroundColor,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(_icon, size: 13, color: _textColor),
          const SizedBox(width: 4),
          Text(
            status.label,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: _textColor,
            ),
          ),
        ],
      ),
    );
  }
}
