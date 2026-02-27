import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../providers/guides_provider.dart';
import '../../widgets/step_card.dart';

class GuideDetailScreen extends ConsumerWidget {
  final String guideId;

  const GuideDetailScreen({super.key, required this.guideId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final guide = ref.watch(guidesProvider.notifier).findById(guideId);
    final theme = Theme.of(context);

    if (guide == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Guide')),
        body: const Center(child: Text('Guide not found')),
      );
    }

    final diffColor = Color(guide.difficulty.colorValue);

    return Scaffold(
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            expandedHeight: 200,
            pinned: true,
            backgroundColor: const Color(0xFF1C1917),
            leading: IconButton(
              icon: const Icon(Icons.arrow_back, color: Color(0xFFFBBF24)),
              onPressed: () => context.go('/guides'),
            ),
            flexibleSpace: FlexibleSpaceBar(
              background: Container(
                color: const Color(0xFF1C1917),
                alignment: Alignment.center,
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const SizedBox(height: 60),
                    Text(guide.thumbnailEmoji ?? '🔧', style: const TextStyle(fontSize: 52)),
                    const SizedBox(height: 8),
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 20),
                      child: Text(
                        guide.title,
                        style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w800),
                        textAlign: TextAlign.center,
                        maxLines: 2,
                      ),
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
                  // Meta info
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: [
                      _MetaBadge(
                        icon: Icons.signal_cellular_alt,
                        label: guide.difficulty.displayName,
                        color: diffColor,
                      ),
                      _MetaBadge(
                        icon: Icons.access_time,
                        label: guide.timeEstimate,
                        color: const Color(0xFF3B82F6),
                      ),
                      _MetaBadge(
                        icon: Icons.format_list_numbered,
                        label: '${guide.steps.length} steps',
                        color: const Color(0xFF8B5CF6),
                      ),
                      _MetaBadge(
                        icon: Icons.build_outlined,
                        label: guide.trade.toUpperCase(),
                        color: const Color(0xFFF59E0B),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),

                  // Tools needed
                  if (guide.toolsNeeded.isNotEmpty) ...[
                    const Text('Tools Needed', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
                    const SizedBox(height: 10),
                    Wrap(
                      spacing: 8,
                      runSpacing: 6,
                      children: guide.toolsNeeded.map((tool) => Chip(
                        label: Text(tool, style: const TextStyle(fontSize: 12)),
                        avatar: const Icon(Icons.build_outlined, size: 14),
                        backgroundColor: const Color(0xFFFEF3C7),
                        side: const BorderSide(color: Color(0xFFFCD34D)),
                      )).toList(),
                    ),
                    const SizedBox(height: 20),
                  ],

                  // Safety notes
                  if (guide.safetyNotes.isNotEmpty) ...[
                    Row(
                      children: [
                        const Icon(Icons.health_and_safety_outlined, color: Color(0xFFEF4444), size: 18),
                        const SizedBox(width: 6),
                        const Text('Safety Notes', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: Color(0xFFEF4444))),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: const Color(0xFFFEF2F2),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: const Color(0xFFFCA5A5)),
                      ),
                      child: Column(
                        children: guide.safetyNotes.map((note) => Padding(
                          padding: const EdgeInsets.symmetric(vertical: 4),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Icon(Icons.warning_amber_outlined, size: 15, color: Color(0xFFEF4444)),
                              const SizedBox(width: 8),
                              Expanded(child: Text(note, style: const TextStyle(fontSize: 13))),
                            ],
                          ),
                        )).toList(),
                      ),
                    ),
                    const SizedBox(height: 20),
                  ],

                  // Steps
                  Text('Steps (${guide.steps.length})', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
                  const SizedBox(height: 10),
                  ...guide.steps.map((step) => StepCard(
                    stepNumber: step.stepNumber,
                    title: step.title,
                    instruction: step.instruction,
                    tip: step.tip,
                    startExpanded: step.stepNumber == 1,
                  )),
                  const SizedBox(height: 80),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _MetaBadge extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;

  const _MetaBadge({required this.icon, required this.label, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: color.withOpacity(0.12),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: color),
          const SizedBox(width: 6),
          Text(label, style: TextStyle(color: color, fontWeight: FontWeight.w600, fontSize: 12)),
        ],
      ),
    );
  }
}
