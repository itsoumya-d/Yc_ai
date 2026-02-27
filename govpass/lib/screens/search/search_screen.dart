import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../providers/services_provider.dart';
import '../../widgets/service_card.dart';
import '../../widgets/category_chip.dart';

class SearchScreen extends ConsumerStatefulWidget {
  const SearchScreen({super.key});

  @override
  ConsumerState<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends ConsumerState<SearchScreen> {
  final _searchController = TextEditingController();

  final _categories = [
    {'label': 'All', 'value': null, 'icon': Icons.grid_view},
    {'label': 'Passports', 'value': 'passports', 'icon': Icons.book_outlined},
    {'label': 'Licenses', 'value': 'licenses', 'icon': Icons.drive_eta_outlined},
    {'label': 'Permits', 'value': 'permits', 'icon': Icons.business_outlined},
    {'label': 'Benefits', 'value': 'benefits', 'icon': Icons.volunteer_activism_outlined},
    {'label': 'Taxes', 'value': 'taxes', 'icon': Icons.receipt_long_outlined},
    {'label': 'Voting', 'value': 'voting', 'icon': Icons.how_to_vote_outlined},
  ];

  final _suggestions = [
    'How do I renew my passport?',
    'Apply for food stamps',
    'Get a business license',
    'Register to vote',
    'File my taxes for free',
    'Renew driver license',
  ];

  @override
  void initState() {
    super.initState();
    _searchController.text = ref.read(searchQueryProvider);
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final query = ref.watch(searchQueryProvider);
    final selectedCategory = ref.watch(selectedCategoryProvider);
    final filteredServices = ref.watch(filteredServicesProvider);

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text('Find Services'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.go('/home'),
        ),
      ),
      body: Column(
        children: [
          Container(
            color: const Color(0xFF0D2B6B),
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
            child: TextField(
              controller: _searchController,
              autofocus: true,
              style: const TextStyle(color: Colors.white),
              decoration: InputDecoration(
                hintText: 'Search or ask a question...',
                hintStyle: const TextStyle(color: Colors.white54),
                prefixIcon: const Icon(Icons.search, color: Colors.white70),
                suffixIcon: query.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear, color: Colors.white70),
                        onPressed: () {
                          _searchController.clear();
                          ref.read(searchQueryProvider.notifier).state = '';
                        },
                      )
                    : const Icon(Icons.auto_awesome, color: Colors.white70),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(10),
                  borderSide: BorderSide(color: Colors.white.withOpacity(0.3)),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(10),
                  borderSide: BorderSide(color: Colors.white.withOpacity(0.3)),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(10),
                  borderSide: const BorderSide(color: Colors.white, width: 2),
                ),
                filled: true,
                fillColor: Colors.white.withOpacity(0.1),
              ),
              onChanged: (v) => ref.read(searchQueryProvider.notifier).state = v,
            ),
          ),
          Container(
            height: 52,
            color: Colors.white,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              itemCount: _categories.length,
              separatorBuilder: (_, __) => const SizedBox(width: 8),
              itemBuilder: (context, index) {
                final cat = _categories[index];
                return CategoryChip(
                  label: cat['label'] as String,
                  value: (cat['value'] as String?) ?? 'all',
                  isSelected: selectedCategory == cat['value'],
                  icon: cat['icon'] as IconData,
                  onTap: () {
                    ref.read(selectedCategoryProvider.notifier).state =
                        cat['value'] as String?;
                  },
                );
              },
            ),
          ),
          const Divider(height: 1),
          Expanded(
            child: query.isEmpty && selectedCategory == null
                ? _SuggestionsView(
                    suggestions: _suggestions,
                    onSuggestionTap: (suggestion) {
                      _searchController.text = suggestion;
                      ref.read(searchQueryProvider.notifier).state = suggestion;
                    },
                  )
                : filteredServices.isEmpty
                    ? _EmptySearchView(query: query)
                    : ListView.separated(
                        padding: const EdgeInsets.all(16),
                        itemCount: filteredServices.length,
                        separatorBuilder: (_, __) => const SizedBox(height: 12),
                        itemBuilder: (context, index) {
                          final service = filteredServices[index];
                          return ServiceCard(
                            service: service,
                            onTap: () => context.go('/services/${service.id}'),
                          );
                        },
                      ),
          ),
        ],
      ),
    );
  }
}

class _SuggestionsView extends StatelessWidget {
  final List<String> suggestions;
  final ValueChanged<String> onSuggestionTap;

  const _SuggestionsView({
    required this.suggestions,
    required this.onSuggestionTap,
  });

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        const Text(
          'Common Questions',
          style: TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w600,
            color: Color(0xFF64748B),
          ),
        ),
        const SizedBox(height: 12),
        ...suggestions.map((s) => Padding(
          padding: const EdgeInsets.only(bottom: 8),
          child: ListTile(
            leading: const Icon(Icons.help_outline, color: Color(0xFF3B82F6), size: 20),
            title: Text(s, style: const TextStyle(fontSize: 14)),
            trailing: const Icon(Icons.north_west, size: 16, color: Color(0xFF94A3B8)),
            tileColor: Colors.white,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(10),
              side: const BorderSide(color: Color(0xFFE2E8F0)),
            ),
            onTap: () => onSuggestionTap(s),
          ),
        )),
      ],
    );
  }
}

class _EmptySearchView extends StatelessWidget {
  final String query;

  const _EmptySearchView({required this.query});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.search_off, size: 60, color: Color(0xFFCBD5E1)),
          const SizedBox(height: 16),
          const Text(
            'No services found',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 8),
          Text(
            'Try different keywords for "$query"',
            style: const TextStyle(color: Color(0xFF64748B)),
          ),
        ],
      ),
    );
  }
}
