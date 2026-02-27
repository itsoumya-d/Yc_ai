import 'dart:io';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../models/spot.dart';
import 'risk_badge.dart';

class SpotCard extends StatelessWidget {
  final SkinSpot spot;
  final VoidCallback? onTap;

  const SpotCard({super.key, required this.spot, this.onTap});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final riskColor = Color(spot.aiRiskLevel.colorValue);
    final hasChange = spot.photos.any((p) => p.changeDetected);

    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: hasChange ? BorderSide(color: riskColor.withOpacity(0.4), width: 1.5) : BorderSide.none,
      ),
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: onTap ?? () => context.go('/spots/${spot.id}'),
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Row(
            children: [
              // Photo or placeholder
              Stack(
                children: [
                  Container(
                    width: 64,
                    height: 64,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(12),
                      color: const Color(0xFFFECDD3),
                    ),
                    child: _buildThumbnail(),
                  ),
                  if (hasChange)
                    Positioned(
                      top: -2,
                      right: -2,
                      child: Container(
                        width: 18,
                        height: 18,
                        decoration: BoxDecoration(
                          color: riskColor,
                          shape: BoxShape.circle,
                          border: Border.all(color: Colors.white, width: 2),
                        ),
                        child: const Icon(Icons.warning, size: 10, color: Colors.white),
                      ),
                    ),
                ],
              ),
              const SizedBox(width: 14),

              // Info
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            spot.name,
                            style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15),
                          ),
                        ),
                        RiskBadge(riskLevel: spot.aiRiskLevel),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        const Icon(Icons.location_on_outlined, size: 13, color: Colors.grey),
                        const SizedBox(width: 3),
                        Text(
                          _formatLocation(spot.locationOnBody),
                          style: const TextStyle(fontSize: 12, color: Colors.grey),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        Icon(Icons.access_time, size: 13, color: Colors.grey.shade500),
                        const SizedBox(width: 3),
                        Text(
                          spot.lastChecked != null
                              ? 'Checked ${DateFormat('MMM d').format(spot.lastChecked!)}'
                              : 'Not yet checked',
                          style: TextStyle(fontSize: 12, color: Colors.grey.shade500),
                        ),
                        if (hasChange) ...[
                          const SizedBox(width: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: riskColor.withOpacity(0.12),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              'Change Detected',
                              style: TextStyle(fontSize: 10, color: riskColor, fontWeight: FontWeight.w600),
                            ),
                          ),
                        ],
                      ],
                    ),
                  ],
                ),
              ),
              const Icon(Icons.chevron_right, color: Colors.grey),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildThumbnail() {
    final latestPhoto = spot.photos.isNotEmpty ? spot.photos.first : null;
    if (latestPhoto?.localPath != null) {
      return ClipRRect(
        borderRadius: BorderRadius.circular(12),
        child: Image.file(File(latestPhoto!.localPath!), fit: BoxFit.cover, width: 64, height: 64),
      );
    }
    return const Center(
      child: Icon(Icons.circle_outlined, color: Color(0xFFE11D48), size: 30),
    );
  }

  String _formatLocation(String location) {
    return location.split('_').map((w) => w.isEmpty ? '' : w[0].toUpperCase() + w.substring(1)).join(' ');
  }
}
