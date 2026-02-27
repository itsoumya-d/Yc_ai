import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../models/spot.dart';
import '../../providers/spots_provider.dart';
import '../../widgets/spot_card.dart';
import '../../widgets/risk_badge.dart';

class SpotsScreen extends ConsumerWidget {
  const SpotsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(spotsProvider);
    final notifier = ref.read(spotsProvider.notifier);
    final filtered = state.filteredSpots;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Tracked Spots'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add_circle_outline),
            onPressed: () => context.go('/spots/add'),
          ),
        ],
      ),
      body: Column(
        children: [
          // Risk filter chips
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            child: Row(
              children: [
                FilterChip(
                  label: const Text('All'),
                  selected: state.filterRisk == null,
                  onSelected: (_) => notifier.setFilter(null),
                  selectedColor: const Color(0xFFFECDD3),
                  checkmarkColor: const Color(0xFFE11D48),
                ),
                const SizedBox(width: 8),
                ...RiskLevel.values.map((risk) => Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: FilterChip(
                    label: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        RiskBadge(riskLevel: risk, compact: true),
                        const SizedBox(width: 6),
                        Text(risk.displayName),
                      ],
                    ),
                    selected: state.filterRisk == risk,
                    onSelected: (s) => notifier.setFilter(s ? risk : null),
                    selectedColor: Color(risk.colorValue).withOpacity(0.15),
                    checkmarkColor: Color(risk.colorValue),
                  ),
                )),
              ],
            ),
          ),

          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
            child: Row(
              children: [
                Text(
                  '${filtered.length} spot${filtered.length != 1 ? 's' : ''}',
                  style: TextStyle(fontSize: 13, color: Colors.grey.shade600),
                ),
              ],
            ),
          ),

          Expanded(
            child: state.isLoading
                ? const Center(child: CircularProgressIndicator(color: Color(0xFFE11D48)))
                : filtered.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Text('🔍', style: TextStyle(fontSize: 48)),
                            const SizedBox(height: 12),
                            Text(
                              state.filterRisk != null ? 'No spots with this risk level' : 'No spots tracked yet',
                              style: TextStyle(color: Colors.grey.shade600, fontSize: 16),
                            ),
                            const SizedBox(height: 16),
                            ElevatedButton.icon(
                              onPressed: () => context.go('/spots/add'),
                              icon: const Icon(Icons.add),
                              label: const Text('Track a Spot'),
                              style: ElevatedButton.styleFrom(minimumSize: const Size(180, 48)),
                            ),
                          ],
                        ),
                      )
                    : ListView.builder(
                        padding: const EdgeInsets.only(bottom: 80),
                        itemCount: filtered.length,
                        itemBuilder: (ctx, i) => SpotCard(spot: filtered[i]),
                      ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => context.go('/spots/add'),
        backgroundColor: const Color(0xFFE11D48),
        child: const Icon(Icons.add, color: Colors.white),
      ),
    );
  }
}
