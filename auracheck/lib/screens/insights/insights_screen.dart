import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../providers/spots_provider.dart';
import '../../models/spot.dart';
import '../../widgets/risk_badge.dart';

class InsightsScreen extends ConsumerWidget {
  const InsightsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(spotsProvider);
    final theme = Theme.of(context);

    final riskBreakdown = <RiskLevel, int>{};
    for (final level in RiskLevel.values) {
      riskBreakdown[level] = state.spots.where((s) => s.aiRiskLevel == level).length;
    }

    return Scaffold(
      appBar: AppBar(title: const Text('AI Insights')),
      body: state.isLoading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFFE11D48)))
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Overall score
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(20),
                      child: Row(
                        children: [
                          SizedBox(
                            width: 80,
                            height: 80,
                            child: Stack(
                              alignment: Alignment.center,
                              children: [
                                CircularProgressIndicator(
                                  value: state.overallHealthScore / 100,
                                  strokeWidth: 8,
                                  backgroundColor: const Color(0xFFFFE4E6),
                                  valueColor: AlwaysStoppedAnimation<Color>(
                                    state.overallHealthScore > 80
                                        ? const Color(0xFF22C55E)
                                        : state.overallHealthScore > 60
                                            ? const Color(0xFFF59E0B)
                                            : const Color(0xFFEF4444),
                                  ),
                                ),
                                Column(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Text(
                                      '${state.overallHealthScore.toInt()}',
                                      style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w800),
                                    ),
                                    const Text('/ 100', style: TextStyle(fontSize: 9, color: Colors.grey)),
                                  ],
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(width: 20),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text('Skin Health Score', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
                                const SizedBox(height: 4),
                                Text(
                                  state.overallHealthScore >= 90
                                      ? 'Excellent — keep monitoring!'
                                      : state.overallHealthScore >= 70
                                          ? 'Good — a few spots need attention'
                                          : 'Attention needed — consider a dermatologist visit',
                                  style: TextStyle(fontSize: 13, color: Colors.grey.shade600),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),

                  // Risk breakdown
                  const Text('Risk Breakdown', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
                  const SizedBox(height: 12),
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        children: RiskLevel.values.map((level) {
                          final count = riskBreakdown[level] ?? 0;
                          final total = state.spots.isEmpty ? 1 : state.spots.length;
                          final color = Color(level.colorValue);
                          return Padding(
                            padding: const EdgeInsets.symmetric(vertical: 6),
                            child: Row(
                              children: [
                                RiskBadge(riskLevel: level, showIcon: false),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: LinearProgressIndicator(
                                    value: count / total,
                                    backgroundColor: color.withOpacity(0.1),
                                    valueColor: AlwaysStoppedAnimation<Color>(color),
                                    minHeight: 8,
                                    borderRadius: BorderRadius.circular(4),
                                  ),
                                ),
                                const SizedBox(width: 12),
                                SizedBox(
                                  width: 30,
                                  child: Text(
                                    '$count',
                                    style: TextStyle(fontWeight: FontWeight.w700, color: color),
                                    textAlign: TextAlign.right,
                                  ),
                                ),
                              ],
                            ),
                          );
                        }).toList(),
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),

                  // High risk spots
                  if (state.highRiskSpots.isNotEmpty) ...[
                    Row(
                      children: [
                        const Icon(Icons.warning_amber, color: Color(0xFFF97316), size: 20),
                        const SizedBox(width: 6),
                        const Text('Spots Needing Attention', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
                      ],
                    ),
                    const SizedBox(height: 8),
                    ...state.highRiskSpots.map((spot) => _InsightSpotCard(spot: spot)),
                    const SizedBox(height: 16),
                  ],

                  // Changes detected
                  if (state.changedSpots.isNotEmpty) ...[
                    Row(
                      children: [
                        const Icon(Icons.change_circle_outlined, color: Color(0xFFE11D48), size: 20),
                        const SizedBox(width: 6),
                        const Text('Changes Detected', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
                      ],
                    ),
                    const SizedBox(height: 8),
                    ...state.changedSpots.map((spot) => _InsightSpotCard(spot: spot, showChange: true)),
                    const SizedBox(height: 16),
                  ],

                  // Recommendations
                  const Text('Recommended Actions', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
                  const SizedBox(height: 8),
                  ..._buildRecommendations(state).map((rec) => Container(
                    margin: const EdgeInsets.only(bottom: 8),
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: const Color(0xFFFFE4E6)),
                    ),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Icon(rec.$1, color: const Color(0xFFE11D48), size: 20),
                        const SizedBox(width: 10),
                        Expanded(child: Text(rec.$2, style: const TextStyle(fontSize: 14))),
                      ],
                    ),
                  )),
                  const SizedBox(height: 80),
                ],
              ),
            ),
    );
  }

  List<(IconData, String)> _buildRecommendations(SpotsState state) {
    final recs = <(IconData, String)>[];
    if (state.checkStreak == 0) {
      recs.add((Icons.calendar_today, 'Start your daily check habit — consistency is key for early detection'));
    }
    if (state.highRiskSpots.isNotEmpty) {
      recs.add((Icons.local_hospital_outlined, 'Schedule a dermatologist appointment for your high-risk spots within the next 2-4 weeks'));
    }
    if (state.changedSpots.isNotEmpty) {
      recs.add((Icons.photo_camera_outlined, 'Take new photos of changed spots to monitor progression'));
    }
    recs.add((Icons.wb_sunny_outlined, 'Apply SPF 30+ sunscreen daily, even on cloudy days'));
    recs.add((Icons.check_circle_outline, 'Perform a full-body check monthly — use mirrors or ask a partner for hard-to-see areas'));
    return recs;
  }
}

class _InsightSpotCard extends StatelessWidget {
  final SkinSpot spot;
  final bool showChange;

  const _InsightSpotCard({required this.spot, this.showChange = false});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(color: Color(spot.aiRiskLevel.colorValue).withOpacity(0.3)),
      ),
      child: ListTile(
        leading: RiskBadge(riskLevel: spot.aiRiskLevel, compact: true),
        title: Text(spot.name, style: const TextStyle(fontWeight: FontWeight.w600)),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(_formatLocation(spot.locationOnBody), style: const TextStyle(fontSize: 12)),
            if (showChange)
              const Text('Change detected in recent photo', style: TextStyle(fontSize: 11, color: Color(0xFFF97316), fontWeight: FontWeight.w600)),
          ],
        ),
        trailing: const Icon(Icons.chevron_right),
        onTap: () => GoRouter.of(context).go('/spots/${spot.id}'),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
    );
  }

  String _formatLocation(String location) {
    return location.split('_').map((w) => w.isEmpty ? '' : w[0].toUpperCase() + w.substring(1)).join(' ');
  }
}
