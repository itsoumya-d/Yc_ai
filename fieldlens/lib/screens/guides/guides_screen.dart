import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../providers/guides_provider.dart';
import '../../models/guide.dart';

class GuidesScreen extends ConsumerStatefulWidget {
  const GuidesScreen({super.key});

  @override
  ConsumerState<GuidesScreen> createState() => _GuidesScreenState();
}

class _GuidesScreenState extends ConsumerState<GuidesScreen> {
  final _searchCtrl = TextEditingController();

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(guidesProvider);
    final notifier = ref.read(guidesProvider.notifier);
    final filtered = state.filteredGuides;

    return Scaffold(
      appBar: AppBar(title: const Text('How-To Guides')),
      body: Column(
        children: [
          // Search
          Container(
            color: const Color(0xFF1C1917),
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
            child: TextField(
              controller: _searchCtrl,
              onChanged: notifier.setSearch,
              style: const TextStyle(color: Colors.white),
              decoration: InputDecoration(
                hintText: 'Search guides...',
                hintStyle: const TextStyle(color: Colors.white54),
                prefixIcon: const Icon(Icons.search, color: Colors.white54),
                filled: true,
                fillColor: Colors.white.withOpacity(0.15),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
              ),
            ),
          ),

          // Filters
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            child: Row(
              children: [
                FilterChip(label: const Text('All Trades'), selected: state.selectedTrade == null, onSelected: (_) => notifier.setTrade(null)),
                const SizedBox(width: 8),
                ...['plumbing', 'electrical', 'hvac', 'carpentry'].map((t) => Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: FilterChip(
                    label: Text(_capitalize(t)),
                    selected: state.selectedTrade == t,
                    onSelected: (s) => notifier.setTrade(s ? t : null),
                  ),
                )),
                const SizedBox(width: 8),
                PopupMenuButton<GuideDifficulty?>(
                  onSelected: notifier.setDifficulty,
                  itemBuilder: (ctx) => [
                    const PopupMenuItem(value: null, child: Text('All Difficulties')),
                    ...GuideDifficulty.values.map((d) => PopupMenuItem(value: d, child: Text(d.displayName))),
                  ],
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(border: Border.all(color: Colors.grey.shade300), borderRadius: BorderRadius.circular(20)),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(state.selectedDifficulty?.displayName ?? 'Difficulty', style: const TextStyle(fontSize: 13)),
                        const Icon(Icons.arrow_drop_down, size: 18),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),

          // Guide list
          Expanded(
            child: state.isLoading
                ? const Center(child: CircularProgressIndicator(color: Color(0xFFF59E0B)))
                : filtered.isEmpty
                    ? Center(child: Text('No guides found', style: TextStyle(color: Colors.grey.shade600)))
                    : ListView.builder(
                        padding: const EdgeInsets.all(16),
                        itemCount: filtered.length,
                        itemBuilder: (ctx, i) => _GuideCard(guide: filtered[i]),
                      ),
          ),
        ],
      ),
    );
  }

  String _capitalize(String s) => s.isEmpty ? s : s[0].toUpperCase() + s.substring(1);
}

class _GuideCard extends StatelessWidget {
  final Guide guide;
  const _GuideCard({required this.guide});

  @override
  Widget build(BuildContext context) {
    final diffColor = Color(guide.difficulty.colorValue);

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: () => context.go('/guides/${guide.id}'),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              Container(
                width: 52,
                height: 52,
                decoration: BoxDecoration(
                  color: const Color(0xFFFEF3C7),
                  borderRadius: BorderRadius.circular(12),
                ),
                alignment: Alignment.center,
                child: Text(guide.thumbnailEmoji ?? '🔧', style: const TextStyle(fontSize: 26)),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(guide.title, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15)),
                    const SizedBox(height: 6),
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: diffColor.withOpacity(0.12),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(guide.difficulty.displayName, style: TextStyle(fontSize: 11, color: diffColor, fontWeight: FontWeight.w600)),
                        ),
                        const SizedBox(width: 8),
                        Icon(Icons.access_time, size: 13, color: Colors.grey.shade500),
                        const SizedBox(width: 3),
                        Text(guide.timeEstimate, style: TextStyle(fontSize: 12, color: Colors.grey.shade500)),
                        const SizedBox(width: 8),
                        Icon(Icons.format_list_numbered, size: 13, color: Colors.grey.shade500),
                        const SizedBox(width: 3),
                        Text('${guide.steps.length} steps', style: TextStyle(fontSize: 12, color: Colors.grey.shade500)),
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
}
