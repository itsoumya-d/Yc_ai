import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../providers/claims_provider.dart';
import '../../theme/app_theme.dart';
import '../../widgets/claim_card.dart';
import '../../models/claim.dart';

class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final claims = ref.watch(claimsProvider);
    final stats = ref.watch(claimStatsProvider);

    final activeClaims = claims.where(
      (c) => c.status == ClaimStatus.pending || c.status == ClaimStatus.filed
    ).toList();

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            expandedHeight: 180,
            pinned: true,
            backgroundColor: AppTheme.primaryOrange,
            actions: [
              IconButton(
                icon: const Icon(Icons.person_outlined, color: Colors.white),
                onPressed: () {},
              ),
            ],
            flexibleSpace: FlexibleSpaceBar(
              background: Container(
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [AppTheme.darkOrange, AppTheme.primaryOrange],
                  ),
                ),
                padding: const EdgeInsets.fromLTRB(20, 80, 20, 16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    const Text(
                      'My Claims',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '${claims.length} total disputes',
                      style: const TextStyle(color: Colors.white70, fontSize: 13),
                    ),
                  ],
                ),
              ),
            ),
          ),
          SliverToBoxAdapter(
            child: Column(
              children: [
                Padding(
                  padding: const EdgeInsets.all(16),
                  child: _StatsGrid(stats: stats),
                ),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: Row(
                    children: [
                      Expanded(
                        child: _QuickActionButton(
                          icon: Icons.add_circle_outline,
                          label: 'New Claim',
                          onTap: () => context.go('/new-claim'),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: _QuickActionButton(
                          icon: Icons.description_outlined,
                          label: 'Templates',
                          onTap: () => context.go('/templates'),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: _QuickActionButton(
                          icon: Icons.list_alt,
                          label: 'All Claims',
                          onTap: () => context.go('/claims'),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 20),
                if (activeClaims.isNotEmpty) ...[
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'Active Claims',
                          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                        ),
                        TextButton(
                          onPressed: () => context.go('/claims'),
                          child: const Text('See all'),
                        ),
                      ],
                    ),
                  ),
                ],
              ],
            ),
          ),
          if (activeClaims.isNotEmpty)
            SliverPadding(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
              sliver: SliverList(
                delegate: SliverChildBuilderDelegate(
                  (context, index) {
                    final claim = activeClaims[index];
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: ClaimCard(
                        claim: claim,
                        onTap: () => context.go('/claims/${claim.id}'),
                      ),
                    );
                  },
                  childCount: activeClaims.length,
                ),
              ),
            )
          else
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.all(32),
                child: Center(
                  child: Column(
                    children: [
                      const Icon(Icons.shield_outlined, size: 64, color: Color(0xFFCBD5E1)),
                      const SizedBox(height: 16),
                      const Text(
                        'No active claims',
                        style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
                      ),
                      const SizedBox(height: 8),
                      const Text(
                        'Start a new claim to fight back against\nunfair charges and billing errors',
                        textAlign: TextAlign.center,
                        style: TextStyle(color: Color(0xFF64748B)),
                      ),
                      const SizedBox(height: 24),
                      ElevatedButton.icon(
                        onPressed: () => context.go('/new-claim'),
                        icon: const Icon(Icons.add),
                        label: const Text('Start a Claim'),
                        style: ElevatedButton.styleFrom(
                          minimumSize: const Size(200, 48),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => context.go('/new-claim'),
        backgroundColor: AppTheme.primaryOrange,
        icon: const Icon(Icons.add, color: Colors.white),
        label: const Text('New Claim', style: TextStyle(color: Colors.white)),
      ),
      bottomNavigationBar: _BottomNav(currentIndex: 0),
    );
  }
}

class _StatsGrid extends StatelessWidget {
  final Map<String, dynamic> stats;

  const _StatsGrid({required this.stats});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        _StatCard(
          label: 'Total Claimed',
          value: '\$${(stats['totalClaimed'] as double).toStringAsFixed(0)}',
          icon: Icons.monetization_on_outlined,
          color: AppTheme.primaryOrange,
        ),
        const SizedBox(width: 10),
        _StatCard(
          label: 'Recovered',
          value: '\$${(stats['recovered'] as double).toStringAsFixed(0)}',
          icon: Icons.trending_up,
          color: AppTheme.successGreen,
        ),
        const SizedBox(width: 10),
        _StatCard(
          label: 'Success Rate',
          value: '${(stats['successRate'] as double).toStringAsFixed(0)}%',
          icon: Icons.percent,
          color: const Color(0xFF7C3AED),
        ),
      ],
    );
  }
}

class _StatCard extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;
  final Color color;

  const _StatCard({
    required this.label,
    required this.value,
    required this.icon,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: const Color(0xFFE2E8F0)),
        ),
        child: Column(
          children: [
            Icon(icon, color: color, size: 20),
            const SizedBox(height: 6),
            Text(
              value,
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: color,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              label,
              style: const TextStyle(fontSize: 10, color: Color(0xFF94A3B8)),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}

class _QuickActionButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;

  const _QuickActionButton({
    required this.icon,
    required this.label,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          color: AppTheme.primaryOrange.withOpacity(0.08),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: AppTheme.primaryOrange.withOpacity(0.2)),
        ),
        child: Column(
          children: [
            Icon(icon, color: AppTheme.primaryOrange, size: 22),
            const SizedBox(height: 4),
            Text(
              label,
              style: const TextStyle(
                fontSize: 11,
                color: AppTheme.primaryOrange,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _BottomNav extends StatelessWidget {
  final int currentIndex;

  const _BottomNav({required this.currentIndex});

  @override
  Widget build(BuildContext context) {
    return BottomNavigationBar(
      currentIndex: currentIndex,
      selectedItemColor: AppTheme.primaryOrange,
      unselectedItemColor: const Color(0xFF94A3B8),
      onTap: (index) {
        switch (index) {
          case 0: context.go('/dashboard'); break;
          case 1: context.go('/claims'); break;
          case 2: context.go('/templates'); break;
        }
      },
      items: const [
        BottomNavigationBarItem(icon: Icon(Icons.home_outlined), label: 'Dashboard'),
        BottomNavigationBarItem(icon: Icon(Icons.list_alt), label: 'Claims'),
        BottomNavigationBarItem(icon: Icon(Icons.description_outlined), label: 'Templates'),
      ],
    );
  }
}
