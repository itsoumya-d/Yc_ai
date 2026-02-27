import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../providers/claims_provider.dart';
import '../../models/claim.dart';
import '../../widgets/claim_card.dart';
import '../../theme/app_theme.dart';

class ClaimListScreen extends ConsumerWidget {
  const ClaimListScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final filteredClaims = ref.watch(filteredClaimsProvider);
    final selectedFilter = ref.watch(claimsFilterProvider);

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text('All Claims'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.go('/dashboard'),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: () => context.go('/new-claim'),
          ),
        ],
      ),
      body: Column(
        children: [
          Container(
            color: Colors.white,
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: [
                  _FilterChip(
                    label: 'All',
                    isSelected: selectedFilter == null,
                    onTap: () => ref.read(claimsFilterProvider.notifier).state = null,
                  ),
                  const SizedBox(width: 8),
                  ...ClaimStatus.values.map((status) => Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: _FilterChip(
                      label: status.label,
                      isSelected: selectedFilter == status,
                      onTap: () => ref.read(claimsFilterProvider.notifier).state = status,
                    ),
                  )),
                ],
              ),
            ),
          ),
          const Divider(height: 1),
          Expanded(
            child: filteredClaims.isEmpty
                ? _EmptyView(
                    filter: selectedFilter,
                    onAdd: () => context.go('/new-claim'),
                  )
                : ListView.separated(
                    padding: const EdgeInsets.all(16),
                    itemCount: filteredClaims.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 12),
                    itemBuilder: (context, index) {
                      final claim = filteredClaims[index];
                      return ClaimCard(
                        claim: claim,
                        onTap: () => context.go('/claims/${claim.id}'),
                      );
                    },
                  ),
          ),
        ],
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: 1,
        selectedItemColor: AppTheme.primaryOrange,
        unselectedItemColor: const Color(0xFF94A3B8),
        onTap: (index) {
          switch (index) {
            case 0: context.go('/dashboard'); break;
            case 1: break;
            case 2: context.go('/templates'); break;
          }
        },
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.home_outlined), label: 'Dashboard'),
          BottomNavigationBarItem(icon: Icon(Icons.list_alt), label: 'Claims'),
          BottomNavigationBarItem(icon: Icon(Icons.description_outlined), label: 'Templates'),
        ],
      ),
    );
  }
}

class _FilterChip extends StatelessWidget {
  final String label;
  final bool isSelected;
  final VoidCallback onTap;

  const _FilterChip({
    required this.label,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected ? AppTheme.primaryOrange : Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected ? AppTheme.primaryOrange : const Color(0xFFE2E8F0),
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w600,
            color: isSelected ? Colors.white : const Color(0xFF64748B),
          ),
        ),
      ),
    );
  }
}

class _EmptyView extends StatelessWidget {
  final ClaimStatus? filter;
  final VoidCallback onAdd;

  const _EmptyView({this.filter, required this.onAdd});

  @override
  Widget build(BuildContext context) {
    final message = filter != null
        ? 'No ${filter!.label.toLowerCase()} claims'
        : 'No claims yet';

    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.inbox, size: 72, color: Color(0xFFCBD5E1)),
          const SizedBox(height: 16),
          Text(message, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w600)),
          const SizedBox(height: 24),
          ElevatedButton.icon(
            onPressed: onAdd,
            icon: const Icon(Icons.add),
            label: const Text('File New Claim'),
            style: ElevatedButton.styleFrom(minimumSize: const Size(200, 48)),
          ),
        ],
      ),
    );
  }
}
