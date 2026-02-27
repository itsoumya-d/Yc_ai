import 'package:flutter/material.dart';
import '../models/service.dart';
import '../theme/app_theme.dart';

class ServiceCard extends StatelessWidget {
  final GovernmentService service;
  final VoidCallback onTap;

  const ServiceCard({
    super.key,
    required this.service,
    required this.onTap,
  });

  IconData _getCategoryIcon(String category) {
    switch (category) {
      case 'passports':
        return Icons.book_outlined;
      case 'licenses':
        return Icons.drive_eta_outlined;
      case 'permits':
        return Icons.business_outlined;
      case 'benefits':
        return Icons.volunteer_activism_outlined;
      case 'taxes':
        return Icons.receipt_long_outlined;
      case 'voting':
        return Icons.how_to_vote_outlined;
      default:
        return Icons.description_outlined;
    }
  }

  Color _getCategoryColor(String category) {
    switch (category) {
      case 'passports':
        return const Color(0xFF2563EB);
      case 'licenses':
        return const Color(0xFF7C3AED);
      case 'permits':
        return const Color(0xFF059669);
      case 'benefits':
        return const Color(0xFFD97706);
      case 'taxes':
        return const Color(0xFFDC2626);
      case 'voting':
        return const Color(0xFF0891B2);
      default:
        return AppTheme.primaryBlue;
    }
  }

  @override
  Widget build(BuildContext context) {
    final categoryColor = _getCategoryColor(service.category);

    return Card(
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
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: categoryColor.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Icon(
                      _getCategoryIcon(service.category),
                      color: categoryColor,
                      size: 22,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          service.name,
                          style: const TextStyle(
                            fontWeight: FontWeight.w600,
                            fontSize: 15,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 2),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                          decoration: BoxDecoration(
                            color: categoryColor.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(
                            service.category.replaceFirst(
                              service.category[0],
                              service.category[0].toUpperCase(),
                            ),
                            style: TextStyle(
                              fontSize: 11,
                              color: categoryColor,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const Icon(Icons.chevron_right, color: Color(0xFF94A3B8)),
                ],
              ),
              const SizedBox(height: 12),
              Text(
                service.description,
                style: const TextStyle(
                  fontSize: 13,
                  color: Color(0xFF64748B),
                  height: 1.4,
                ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  _InfoChip(
                    icon: Icons.schedule_outlined,
                    label: service.processingTime.split(',').first,
                  ),
                  const SizedBox(width: 8),
                  _InfoChip(
                    icon: Icons.attach_money,
                    label: service.fee == 0.0
                        ? 'Free'
                        : '\$${service.fee.toStringAsFixed(0)}',
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

class _InfoChip extends StatelessWidget {
  final IconData icon;
  final String label;

  const _InfoChip({required this.icon, required this.label});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: const Color(0xFFF1F5F9),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 13, color: const Color(0xFF64748B)),
          const SizedBox(width: 4),
          Text(
            label,
            style: const TextStyle(
              fontSize: 12,
              color: Color(0xFF475569),
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }
}
