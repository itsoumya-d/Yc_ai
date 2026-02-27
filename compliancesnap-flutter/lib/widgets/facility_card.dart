import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/facility.dart';

class FacilityCard extends StatelessWidget {
  final Facility facility;
  final VoidCallback? onTap;
  final VoidCallback? onInspect;

  const FacilityCard({super.key, required this.facility, this.onTap, this.onInspect});

  Color _scoreColor(double score) {
    if (score >= 90) return Colors.green;
    if (score >= 75) return Colors.orange;
    if (score >= 60) return Colors.deepOrange;
    return Colors.red;
  }

  @override
  Widget build(BuildContext context) {
    final color = _scoreColor(facility.complianceScore);

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
                    width: 48,
                    height: 48,
                    decoration: BoxDecoration(
                      color: color.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Icon(_facilityIcon(facility.type), color: color, size: 24),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(facility.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                        Text(facility.type, style: const TextStyle(color: Colors.grey, fontSize: 12)),
                      ],
                    ),
                  ),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text(
                        '${facility.complianceScore.round()}%',
                        style: TextStyle(color: color, fontWeight: FontWeight.bold, fontSize: 22),
                      ),
                      Text(
                        _scoreLabel(facility.complianceScore),
                        style: TextStyle(color: color, fontSize: 10, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 10),
              ClipRRect(
                borderRadius: BorderRadius.circular(4),
                child: LinearProgressIndicator(
                  value: facility.complianceScore / 100,
                  backgroundColor: Colors.grey.shade200,
                  valueColor: AlwaysStoppedAnimation(color),
                  minHeight: 6,
                ),
              ),
              const SizedBox(height: 10),
              Row(
                children: [
                  const Icon(Icons.location_on_outlined, size: 13, color: Colors.grey),
                  const SizedBox(width: 4),
                  Expanded(
                    child: Text(facility.address, style: const TextStyle(color: Colors.grey, fontSize: 12), maxLines: 1, overflow: TextOverflow.ellipsis),
                  ),
                ],
              ),
              const SizedBox(height: 6),
              Row(
                children: [
                  if (facility.lastInspection != null) ...[
                    const Icon(Icons.schedule_outlined, size: 13, color: Colors.grey),
                    const SizedBox(width: 4),
                    Text(
                      'Last: ${DateFormat('MMM d').format(facility.lastInspection!)}',
                      style: const TextStyle(color: Colors.grey, fontSize: 12),
                    ),
                    const SizedBox(width: 12),
                  ],
                  if (facility.openViolations > 0) ...[
                    Icon(Icons.warning_amber_outlined, size: 13, color: Colors.red.shade400),
                    const SizedBox(width: 4),
                    Text(
                      '${facility.openViolations} violation${facility.openViolations > 1 ? 's' : ''}',
                      style: TextStyle(color: Colors.red.shade400, fontSize: 12, fontWeight: FontWeight.bold),
                    ),
                  ],
                  const Spacer(),
                  if (onInspect != null)
                    TextButton(
                      onPressed: onInspect,
                      style: TextButton.styleFrom(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                        minimumSize: Size.zero,
                        foregroundColor: Theme.of(context).colorScheme.primary,
                      ),
                      child: const Text('Inspect'),
                    ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  String _scoreLabel(double score) {
    if (score >= 90) return 'COMPLIANT';
    if (score >= 75) return 'FAIR';
    if (score >= 60) return 'AT RISK';
    return 'NON-COMPLIANT';
  }

  IconData _facilityIcon(String type) {
    switch (type.toLowerCase()) {
      case 'manufacturing':
        return Icons.factory_outlined;
      case 'warehouse':
        return Icons.warehouse_outlined;
      case 'office':
        return Icons.business_outlined;
      case 'retail':
        return Icons.store_outlined;
      default:
        return Icons.business_outlined;
    }
  }
}
