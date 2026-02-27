import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../providers/auth_provider.dart';
import '../../providers/planning_provider.dart';
import '../../theme/app_theme.dart';
import '../../widgets/completion_ring.dart';
import '../../widgets/section_card.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(currentUserProvider);
    final planning = ref.watch(planningProvider);
    final name = user?.userMetadata?['full_name'] as String? ?? 'Friend';

    final sections = [
      {
        'title': 'My Will',
        'subtitle': 'Document your assets and wishes',
        'icon': Icons.description_outlined,
        'route': '/will',
        'count': planning.willItems.length,
        'color': const Color(0xFF0D9488),
      },
      {
        'title': 'Healthcare Directives',
        'subtitle': 'Medical decisions and POA',
        'icon': Icons.local_hospital_outlined,
        'route': '/directives',
        'count': planning.directives.length,
        'color': const Color(0xFF0891B2),
      },
      {
        'title': 'Digital Assets',
        'subtitle': 'Accounts and online presence',
        'icon': Icons.devices_outlined,
        'route': '/digital-assets',
        'count': planning.digitalAssets.length,
        'color': const Color(0xFF7C3AED),
      },
      {
        'title': 'Important Contacts',
        'subtitle': 'Attorney, executor, family',
        'icon': Icons.contacts_outlined,
        'route': '/contacts',
        'count': planning.contacts.length,
        'color': const Color(0xFFD97706),
      },
      {
        'title': 'Funeral Preferences',
        'subtitle': 'Ceremony and burial wishes',
        'icon': Icons.spa_outlined,
        'route': '/funeral',
        'count': planning.funeralPreferences.isNotEmpty ? 1 : 0,
        'color': const Color(0xFF84A98C),
      },
      {
        'title': 'Document Vault',
        'subtitle': 'Important documents stored safely',
        'icon': Icons.lock_outlined,
        'route': '/vault',
        'count': planning.vaultDocuments.length,
        'color': const Color(0xFF64748B),
      },
    ];

    return Scaffold(
      backgroundColor: AppTheme.warmCream,
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            expandedHeight: 220,
            pinned: true,
            backgroundColor: AppTheme.primaryTeal,
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
                    colors: [AppTheme.darkTeal, AppTheme.primaryTeal],
                  ),
                ),
                padding: const EdgeInsets.fromLTRB(20, 80, 20, 16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Hello, $name',
                                style: const TextStyle(
                                  color: Colors.white70,
                                  fontSize: 14,
                                ),
                              ),
                              const SizedBox(height: 4),
                              const Text(
                                'My Legacy Plan',
                                style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 22,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              const SizedBox(height: 8),
                              const Text(
                                'A thoughtful gift to those you love.',
                                style: TextStyle(color: Colors.white60, fontSize: 13),
                              ),
                            ],
                          ),
                        ),
                        CompletionRing(
                          percentage: planning.completionPercentage,
                          size: 90,
                          strokeWidth: 8,
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
              child: Row(
                children: [
                  const Text(
                    'Planning Sections',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF1C1917),
                    ),
                  ),
                  const Spacer(),
                  Text(
                    '${sections.where((s) => (s['count'] as int) > 0).length}/${sections.length} started',
                    style: const TextStyle(fontSize: 12, color: AppTheme.warmBrown),
                  ),
                ],
              ),
            ),
          ),
          SliverPadding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 24),
            sliver: SliverList(
              delegate: SliverChildBuilderDelegate(
                (context, index) {
                  final section = sections[index];
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 10),
                    child: SectionCard(
                      title: section['title'] as String,
                      subtitle: section['subtitle'] as String,
                      icon: section['icon'] as IconData,
                      isComplete: (section['count'] as int) > 0,
                      itemCount: section['count'] as int,
                      color: section['color'] as Color,
                      onTap: () => context.go(section['route'] as String),
                    ),
                  );
                },
                childCount: sections.length,
              ),
            ),
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 32),
              child: Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppTheme.primaryTeal.withOpacity(0.08),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: AppTheme.primaryTeal.withOpacity(0.2)),
                ),
                child: Row(
                  children: [
                    Icon(Icons.info_outline, color: AppTheme.primaryTeal, size: 20),
                    const SizedBox(width: 12),
                    const Expanded(
                      child: Text(
                        'Remember to share your plan location with a trusted person.',
                        style: TextStyle(fontSize: 13, color: AppTheme.darkTeal, height: 1.4),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
