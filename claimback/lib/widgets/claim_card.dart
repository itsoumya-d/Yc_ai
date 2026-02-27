import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/claim.dart';
import 'status_badge.dart';
import 'amount_display.dart';

class ClaimCard extends StatelessWidget {
  final Claim claim;
  final VoidCallback onTap;

  const ClaimCard({
    super.key,
    required this.claim,
    required this.onTap,
  });

  IconData _getTypeIcon(ClaimType type) {
    switch (type) {
      case ClaimType.chargeback:
        return Icons.credit_card_off_outlined;
      case ClaimType.refund:
        return Icons.replay_outlined;
      case ClaimType.billingError:
        return Icons.receipt_long_outlined;
      case ClaimType.insurance:
        return Icons.health_and_safety_outlined;
      case ClaimType.serviceFailed:
        return Icons.cancel_outlined;
      case ClaimType.subscriptionCancel:
        return Icons.unsubscribe_outlined;
    }
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
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
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: const Color(0xFFFFF7ED),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Icon(
                    _getTypeIcon(claim.type),
                    size: 18,
                    color: const Color(0xFFEA580C),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        claim.company,
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 15,
                        ),
                      ),
                      Text(
                        claim.type.label,
                        style: const TextStyle(
                          fontSize: 12,
                          color: Color(0xFF94A3B8),
                        ),
                      ),
                    ],
                  ),
                ),
                AmountDisplay(amount: claim.amount, fontSize: 16),
              ],
            ),
            const SizedBox(height: 10),
            Text(
              claim.description,
              style: const TextStyle(
                fontSize: 13,
                color: Color(0xFF64748B),
                height: 1.4,
              ),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 10),
            Row(
              children: [
                StatusBadge(status: claim.status),
                const Spacer(),
                Text(
                  DateFormat('MMM d, y').format(claim.createdAt),
                  style: const TextStyle(fontSize: 11, color: Color(0xFF94A3B8)),
                ),
              ],
            ),
            if (claim.recoveredAmount != null) ...[
              const SizedBox(height: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                decoration: BoxDecoration(
                  color: const Color(0xFFF0FDF4),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.check_circle, size: 14, color: Color(0xFF16A34A)),
                    const SizedBox(width: 6),
                    Text(
                      'Recovered \$${claim.recoveredAmount!.toStringAsFixed(2)}',
                      style: const TextStyle(
                        fontSize: 12,
                        color: Color(0xFF16A34A),
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
