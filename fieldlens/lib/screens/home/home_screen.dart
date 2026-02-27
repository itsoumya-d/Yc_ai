import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../providers/diagnosis_provider.dart';
import '../../providers/guides_provider.dart';
import '../../widgets/trade_selector.dart';
import '../../theme/app_theme.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final diagState = ref.watch(diagnosisProvider);
    final guidesState = ref.watch(guidesProvider);
    final theme = Theme.of(context);

    return Scaffold(
      backgroundColor: const Color(0xFF1C1917),
      body: CustomScrollView(
        slivers: [
          // Header
          SliverAppBar(
            expandedHeight: 160,
            pinned: true,
            backgroundColor: const Color(0xFF1C1917),
            flexibleSpace: FlexibleSpaceBar(
              background: Container(
                padding: const EdgeInsets.fromLTRB(20, 60, 20, 20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: const Color(0xFFFBBF24),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: const Icon(Icons.camera_enhance, color: Color(0xFF1C1917), size: 20),
                        ),
                        const SizedBox(width: 10),
                        const Text(
                          'FieldLens',
                          style: TextStyle(color: Color(0xFFFBBF24), fontSize: 22, fontWeight: FontWeight.w800),
                        ),
                        const Spacer(),
                        IconButton(
                          icon: const Icon(Icons.person_outline, color: Color(0xFFFBBF24)),
                          onPressed: () => context.go('/profile'),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    const Text(
                      'What trade are you working on?',
                      style: TextStyle(color: Colors.white70, fontSize: 14),
                    ),
                  ],
                ),
              ),
            ),
          ),

          SliverToBoxAdapter(
            child: Container(
              decoration: const BoxDecoration(
                color: Color(0xFFF9FAFB),
                borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: 20),

                  // Trade selector
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: TradeSelector(
                      selectedTrade: diagState.selectedTrade,
                      onTradeSelected: (trade) => ref.read(diagnosisProvider.notifier).setTrade(trade),
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Quick diagnose CTA
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: Container(
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [Color(0xFFF59E0B), Color(0xFFF97316)],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                        borderRadius: BorderRadius.circular(16),
                        boxShadow: [
                          BoxShadow(color: const Color(0xFFF59E0B).withOpacity(0.4), blurRadius: 12, offset: const Offset(0, 4)),
                        ],
                      ),
                      child: Material(
                        color: Colors.transparent,
                        child: InkWell(
                          borderRadius: BorderRadius.circular(16),
                          onTap: () => context.go('/diagnose'),
                          child: const Padding(
                            padding: EdgeInsets.all(20),
                            child: Row(
                              children: [
                                Icon(Icons.camera_alt, color: Colors.white, size: 36),
                                SizedBox(width: 16),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text('AI Photo Diagnosis', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w800)),
                                      Text('Take a photo for instant AI analysis', style: TextStyle(color: Colors.white70, fontSize: 13)),
                                    ],
                                  ),
                                ),
                                Icon(Icons.arrow_forward_ios, color: Colors.white70),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Quick actions
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: Row(
                      children: [
                        Expanded(child: _QuickAction(
                          icon: Icons.menu_book_outlined,
                          label: 'Guides',
                          subtitle: '${guidesState.guides.length} available',
                          color: const Color(0xFF3B82F6),
                          onTap: () => context.go('/guides'),
                        )),
                        const SizedBox(width: 12),
                        Expanded(child: _QuickAction(
                          icon: Icons.build_circle_outlined,
                          label: 'Parts',
                          subtitle: 'Identify & source',
                          color: const Color(0xFF8B5CF6),
                          onTap: () => context.go('/parts'),
                        )),
                        const SizedBox(width: 12),
                        Expanded(child: _QuickAction(
                          icon: Icons.health_and_safety_outlined,
                          label: 'Safety',
                          subtitle: 'OSHA checklists',
                          color: const Color(0xFFEF4444),
                          onTap: () => context.go('/safety'),
                        )),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Recent diagnoses
                  if (diagState.history.isNotEmpty) ...[
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      child: Row(
                        children: [
                          const Text('Recent Diagnoses', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
                          const Spacer(),
                          TextButton(onPressed: () => context.go('/history'), child: const Text('View All')),
                        ],
                      ),
                    ),
                    ...diagState.history.take(2).map((d) => Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                      child: Card(
                        child: ListTile(
                          leading: Container(
                            width: 42,
                            height: 42,
                            decoration: BoxDecoration(
                              color: const Color(0xFFFEF3C7),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            alignment: Alignment.center,
                            child: Text(_emojiForTrade(d.trade), style: const TextStyle(fontSize: 20)),
                          ),
                          title: Text(d.trade.toUpperCase(), style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 12, color: Color(0xFFF59E0B))),
                          subtitle: Text(d.problemDescription, maxLines: 1, overflow: TextOverflow.ellipsis),
                          trailing: Text(DateFormat('MMM d').format(d.createdAt), style: TextStyle(fontSize: 11, color: Colors.grey.shade500)),
                          onTap: () => context.go('/diagnose/result', extra: d),
                        ),
                      ),
                    )),
                    const SizedBox(height: 16),
                  ],

                  // Featured guides
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: const Text('Featured Guides', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
                  ),
                  const SizedBox(height: 12),
                  SizedBox(
                    height: 160,
                    child: ListView(
                      scrollDirection: Axis.horizontal,
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      children: guidesState.guides.map((g) => Padding(
                        padding: const EdgeInsets.only(right: 12),
                        child: SizedBox(
                          width: 200,
                          child: Card(
                            child: InkWell(
                              borderRadius: BorderRadius.circular(12),
                              onTap: () => context.go('/guides/${g.id}'),
                              child: Padding(
                                padding: const EdgeInsets.all(14),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(g.thumbnailEmoji ?? '🔧', style: const TextStyle(fontSize: 28)),
                                    const SizedBox(height: 8),
                                    Text(g.title, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13), maxLines: 2, overflow: TextOverflow.ellipsis),
                                    const Spacer(),
                                    Row(
                                      children: [
                                        Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                          decoration: BoxDecoration(
                                            color: Color(g.difficulty.colorValue).withOpacity(0.15),
                                            borderRadius: BorderRadius.circular(4),
                                          ),
                                          child: Text(g.difficulty.displayName, style: TextStyle(fontSize: 10, color: Color(g.difficulty.colorValue), fontWeight: FontWeight.w600)),
                                        ),
                                        const Spacer(),
                                        Text(g.timeEstimate, style: TextStyle(fontSize: 10, color: Colors.grey.shade500)),
                                      ],
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ),
                        ),
                      )).toList(),
                    ),
                  ),
                  const SizedBox(height: 100),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  String _emojiForTrade(String trade) {
    switch (trade) {
      case 'plumbing': return '🔧';
      case 'electrical': return '⚡';
      case 'hvac': return '❄️';
      case 'carpentry': return '🪵';
      default: return '🛠️';
    }
  }
}

class _QuickAction extends StatelessWidget {
  final IconData icon;
  final String label;
  final String subtitle;
  final Color color;
  final VoidCallback onTap;

  const _QuickAction({required this.icon, required this.label, required this.subtitle, required this.color, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Card(
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 8),
          child: Column(
            children: [
              Icon(icon, color: color, size: 28),
              const SizedBox(height: 8),
              Text(label, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13)),
              Text(subtitle, style: TextStyle(fontSize: 10, color: Colors.grey.shade500), textAlign: TextAlign.center),
            ],
          ),
        ),
      ),
    );
  }
}
