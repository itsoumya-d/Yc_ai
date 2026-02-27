import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../providers/spots_provider.dart';
import '../../widgets/progress_streak.dart';
import '../../widgets/spot_card.dart';
import '../../widgets/risk_badge.dart';
import '../../theme/app_theme.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(spotsProvider);
    final theme = Theme.of(context);

    return Scaffold(
      backgroundColor: const Color(0xFFFFF1F2),
      body: state.isLoading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFFE11D48)))
          : RefreshIndicator(
              onRefresh: ref.read(spotsProvider.notifier).refresh,
              color: const Color(0xFFE11D48),
              child: CustomScrollView(
                slivers: [
                  // App bar
                  SliverAppBar(
                    expandedHeight: 130,
                    pinned: true,
                    backgroundColor: Colors.white,
                    surfaceTintColor: Colors.transparent,
                    flexibleSpace: FlexibleSpaceBar(
                      background: Container(
                        padding: const EdgeInsets.fromLTRB(20, 50, 20, 16),
                        color: Colors.white,
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.center,
                          children: [
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Text(
                                    'AuraCheck',
                                    style: theme.textTheme.headlineSmall?.copyWith(
                                      fontWeight: FontWeight.w800,
                                      color: const Color(0xFFE11D48),
                                    ),
                                  ),
                                  Text(
                                    DateFormat('MMMM d, yyyy').format(DateTime.now()),
                                    style: TextStyle(fontSize: 13, color: Colors.grey.shade500),
                                  ),
                                ],
                              ),
                            ),
                            // Health score circle
                            Container(
                              width: 72,
                              height: 72,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                border: Border.all(color: const Color(0xFFFDA4AF), width: 3),
                                color: const Color(0xFFFFF1F2),
                              ),
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Text(
                                    '${state.overallHealthScore.toInt()}',
                                    style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: Color(0xFFE11D48)),
                                  ),
                                  const Text('score', style: TextStyle(fontSize: 9, color: Colors.grey)),
                                ],
                              ),
                            ),
                            const SizedBox(width: 8),
                            IconButton(
                              icon: const Icon(Icons.settings_outlined),
                              onPressed: () => context.go('/settings'),
                              color: Colors.grey,
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),

                  SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Today's check prompt
                          if (!state.hasTodayCheck) ...[
                            Container(
                              decoration: BoxDecoration(
                                gradient: const LinearGradient(
                                  colors: [Color(0xFFE11D48), Color(0xFFFB923C)],
                                  begin: Alignment.topLeft,
                                  end: Alignment.bottomRight,
                                ),
                                borderRadius: BorderRadius.circular(16),
                              ),
                              child: Material(
                                color: Colors.transparent,
                                child: InkWell(
                                  borderRadius: BorderRadius.circular(16),
                                  onTap: () => context.go('/check'),
                                  child: const Padding(
                                    padding: EdgeInsets.all(20),
                                    child: Row(
                                      children: [
                                        Icon(Icons.check_circle_outline, color: Colors.white, size: 36),
                                        SizedBox(width: 16),
                                        Expanded(
                                          child: Column(
                                            crossAxisAlignment: CrossAxisAlignment.start,
                                            children: [
                                              Text("Today's Skin Check", style: TextStyle(color: Colors.white, fontSize: 17, fontWeight: FontWeight.w800)),
                                              Text('Complete your daily check to maintain your streak', style: TextStyle(color: Colors.white70, fontSize: 12)),
                                            ],
                                          ),
                                        ),
                                        Icon(Icons.arrow_forward_ios, color: Colors.white70, size: 16),
                                      ],
                                    ),
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(height: 16),
                          ] else ...[
                            Container(
                              padding: const EdgeInsets.all(14),
                              decoration: BoxDecoration(
                                color: const Color(0xFFF0FDF4),
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(color: const Color(0xFFBBF7D0)),
                              ),
                              child: const Row(
                                children: [
                                  Icon(Icons.check_circle, color: Color(0xFF22C55E)),
                                  SizedBox(width: 10),
                                  Text("Today's check complete!", style: TextStyle(fontWeight: FontWeight.w600, color: Color(0xFF166534))),
                                ],
                              ),
                            ),
                            const SizedBox(height: 16),
                          ],

                          // Streak
                          ProgressStreak(streakDays: state.checkStreak),
                          const SizedBox(height: 16),

                          // Weekly dots
                          Card(
                            child: Padding(
                              padding: const EdgeInsets.all(16),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Text('This Week', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
                                  const SizedBox(height: 12),
                                  WeeklyStreakDots(
                                    completedDays: List.generate(7, (i) {
                                      final date = DateTime.now().subtract(Duration(days: 6 - i));
                                      return state.checkHistory.any((c) {
                                        return c.date.year == date.year && c.date.month == date.month && c.date.day == date.day;
                                      });
                                    }),
                                  ),
                                ],
                              ),
                            ),
                          ),
                          const SizedBox(height: 20),

                          // High risk alert
                          if (state.highRiskSpots.isNotEmpty) ...[
                            Container(
                              padding: const EdgeInsets.all(14),
                              decoration: BoxDecoration(
                                color: const Color(0xFFFFF7ED),
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(color: const Color(0xFFFED7AA)),
                              ),
                              child: Row(
                                children: [
                                  const Icon(Icons.warning_amber, color: Color(0xFFF97316), size: 22),
                                  const SizedBox(width: 10),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text('${state.highRiskSpots.length} spot${state.highRiskSpots.length != 1 ? 's' : ''} need attention',
                                            style: const TextStyle(fontWeight: FontWeight.w700)),
                                        const Text('Consider scheduling a dermatologist visit', style: TextStyle(fontSize: 12, color: Colors.grey)),
                                      ],
                                    ),
                                  ),
                                  TextButton(onPressed: () => context.go('/insights'), child: const Text('View')),
                                ],
                              ),
                            ),
                            const SizedBox(height: 16),
                          ],

                          // Spots grid
                          Row(
                            children: [
                              const Text('Tracked Spots', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
                              const Spacer(),
                              TextButton(onPressed: () => context.go('/spots'), child: const Text('View All')),
                            ],
                          ),
                          const SizedBox(height: 8),
                          if (state.spots.isEmpty)
                            Center(
                              child: Padding(
                                padding: const EdgeInsets.all(24),
                                child: Column(
                                  children: [
                                    const Text('🔍', style: TextStyle(fontSize: 40)),
                                    const SizedBox(height: 8),
                                    const Text('No spots tracked yet'),
                                    ElevatedButton.icon(
                                      onPressed: () => context.go('/spots/add'),
                                      icon: const Icon(Icons.add),
                                      label: const Text('Add First Spot'),
                                      style: ElevatedButton.styleFrom(minimumSize: const Size(180, 44)),
                                    ),
                                  ],
                                ),
                              ),
                            )
                          else ...[
                            ...state.spots.take(3).map((s) => SpotCard(spot: s)),
                            if (state.spots.length > 3)
                              TextButton(
                                onPressed: () => context.go('/spots'),
                                child: Text('See ${state.spots.length - 3} more...'),
                              ),
                          ],
                          const SizedBox(height: 80),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => context.go('/spots/add'),
        icon: const Icon(Icons.add),
        label: const Text('Add Spot'),
        backgroundColor: const Color(0xFFE11D48),
      ),
    );
  }
}
