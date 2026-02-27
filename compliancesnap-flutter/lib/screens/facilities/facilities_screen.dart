import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../models/facility.dart';
import '../../providers/facilities_provider.dart';
import '../../widgets/facility_card.dart';

class FacilitiesScreen extends ConsumerStatefulWidget {
  const FacilitiesScreen({super.key});
  @override
  ConsumerState<FacilitiesScreen> createState() => _FacilitiesScreenState();
}

class _FacilitiesScreenState extends ConsumerState<FacilitiesScreen> {
  String? _typeFilter;
  String _sortBy = 'score_desc';
  final TextEditingController _searchController = TextEditingController();
  String _searchQuery = '';

  @override
  void dispose() { _searchController.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    final facilitiesAsync = ref.watch(facilitiesProvider);
    return Scaffold(
      appBar: AppBar(title: const Text('Facilities'), actions: [
        IconButton(icon: const Icon(Icons.sort, color: Colors.white), onPressed: _showSortSheet, tooltip: 'Sort'),
        IconButton(icon: const Icon(Icons.filter_list, color: Colors.white), onPressed: () => _showFilterSheet(facilitiesAsync.value ?? []), tooltip: 'Filter'),
      ]),
      body: Column(children: [
        Padding(padding: const EdgeInsets.fromLTRB(16, 12, 16, 4), child: TextField(
          controller: _searchController,
          decoration: InputDecoration(
            hintText: 'Search facilities...', prefixIcon: const Icon(Icons.search, color: Colors.grey),
            suffixIcon: _searchQuery.isNotEmpty ? IconButton(
                icon: const Icon(Icons.clear, color: Colors.grey),
                onPressed: () { _searchController.clear(); setState(() => _searchQuery = ''); })
              : null),
          onChanged: (v) => setState(() => _searchQuery = v.trim().toLowerCase()),
        )),
        facilitiesAsync.when(loading: () => const SizedBox.shrink(), error: (_, __) => const SizedBox.shrink(),
          data: (facilities) => _SummaryBar(facilities: facilities)),
        facilitiesAsync.when(loading: () => const SizedBox.shrink(), error: (_, __) => const SizedBox.shrink(),
          data: (facilities) {
            final types = facilities.map((f) => f.type).toSet().toList()..sort();
            return SingleChildScrollView(scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              child: Row(children: [
                _FacilityChip(label: 'All ${facilities.length}', isSelected: _typeFilter == null, onTap: () => setState(() => _typeFilter = null)),
                ...types.map((type) { final count = facilities.where((f) => f.type == type).length;
                  return Padding(padding: const EdgeInsets.only(left: 8),
                    child: _FacilityChip(label: '$type ($count)', isSelected: _typeFilter == type, onTap: () => setState(() => _typeFilter = type)));
                }),
              ]));
          }),
        Expanded(child: facilitiesAsync.when(
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (e, _) => Center(child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
            const Icon(Icons.error_outline, size: 48, color: Colors.red), const SizedBox(height: 12),
            const Text('Error loading facilities', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
            Text('$e', style: const TextStyle(color: Colors.grey, fontSize: 13)), const SizedBox(height: 16),
            ElevatedButton.icon(onPressed: () => ref.refresh(facilitiesProvider), icon: const Icon(Icons.refresh), label: const Text('Retry')),
          ])),
          data: (facilities) {
            var filtered = facilities.where((f) {
              final matchesType = _typeFilter == null || f.type == _typeFilter;
              final matchesSearch = _searchQuery.isEmpty || f.name.toLowerCase().contains(_searchQuery)
                  || f.address.toLowerCase().contains(_searchQuery) || f.type.toLowerCase().contains(_searchQuery);
              return matchesType && matchesSearch;
            }).toList();
            switch (_sortBy) {
              case 'score': filtered.sort((a, b) => a.complianceScore.compareTo(b.complianceScore));
              case 'score_desc': filtered.sort((a, b) => b.complianceScore.compareTo(a.complianceScore));
              case 'name': filtered.sort((a, b) => a.name.compareTo(b.name));
              case 'violations': filtered.sort((a, b) => b.openViolations.compareTo(a.openViolations));
            }
            if (filtered.isEmpty) return Center(child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
              Icon(Icons.business_outlined, size: 64, color: Colors.grey.shade300), const SizedBox(height: 16),
              const Text('No facilities found', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
              if (_searchQuery.isNotEmpty || _typeFilter != null) Padding(padding: const EdgeInsets.only(top: 8),
                child: TextButton(onPressed: () => setState(() { _searchQuery = ''; _searchController.clear(); _typeFilter = null; }),
                  child: const Text('Clear filters'))),
            ]));
            return RefreshIndicator(onRefresh: () async => ref.refresh(facilitiesProvider),
              child: ListView.builder(padding: const EdgeInsets.only(top: 4, bottom: 80), itemCount: filtered.length,
                itemBuilder: (context, index) {
                  final facility = filtered[index];
                  return FacilityCard(facility: facility,
                    onTap: () => context.push('/facilities/${facility.id}'),
                    onInspect: () => context.push('/new-inspection'));
                }));
          })),
      ]),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => context.push('/new-inspection'),
        icon: const Icon(Icons.add_task), label: const Text('New Inspection')),
    );
  }

  void _showSortSheet() {
    showModalBottomSheet(context: context, builder: (_) => Padding(padding: const EdgeInsets.all(20),
      child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.start, children: [
        const Text('Sort Facilities', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
        const SizedBox(height: 12),
        _SortTile(icon: Icons.arrow_downward, label: 'Score (High to Low)', value: 'score_desc', current: _sortBy, onTap: (v) => setState(() => _sortBy = v)),
        _SortTile(icon: Icons.arrow_upward, label: 'Score (Low to High)', value: 'score', current: _sortBy, onTap: (v) => setState(() => _sortBy = v)),
        _SortTile(icon: Icons.sort_by_alpha, label: 'Name (A-Z)', value: 'name', current: _sortBy, onTap: (v) => setState(() => _sortBy = v)),
        _SortTile(icon: Icons.warning_amber_outlined, label: 'Most Violations First', value: 'violations', current: _sortBy, onTap: (v) => setState(() => _sortBy = v)),
      ])));
  }

  void _showFilterSheet(List<Facility> facilities) {
    final types = facilities.map((f) => f.type).toSet().toList()..sort();
    showModalBottomSheet(context: context, builder: (ctx) => Padding(padding: const EdgeInsets.all(20),
      child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.start, children: [
        const Text('Filter by Type', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
        const SizedBox(height: 12),
        Wrap(spacing: 8, runSpacing: 8, children: [
          ChoiceChip(label: const Text('All Types'), selected: _typeFilter == null,
            onSelected: (_) { setState(() => _typeFilter = null); Navigator.pop(ctx); }),
          ...types.map((type) => ChoiceChip(label: Text(type), selected: _typeFilter == type,
            onSelected: (_) { setState(() => _typeFilter = type); Navigator.pop(ctx); })),
        ]),
      ])));
  }
}

class _SummaryBar extends StatelessWidget {
  final List<Facility> facilities;
  const _SummaryBar({required this.facilities});
  @override
  Widget build(BuildContext context) {
    if (facilities.isEmpty) return const SizedBox.shrink();
    final compliant = facilities.where((f) => f.complianceScore >= 90).length;
    final atRisk = facilities.where((f) => f.complianceScore >= 60 && f.complianceScore < 90).length;
    final nonCompliant = facilities.where((f) => f.complianceScore < 60).length;
    final avg = facilities.fold(0.0, (sum, f) => sum + f.complianceScore) / facilities.length;
    return Container(
      margin: const EdgeInsets.fromLTRB(16, 8, 16, 4),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.primary.withOpacity(0.05),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Theme.of(context).colorScheme.primary.withOpacity(0.15))),
      child: Row(children: [
        Expanded(child: Column(children: [
          Text('${avg.round()}%', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold,
              color: avg >= 90 ? Colors.green : avg >= 75 ? Colors.orange : Colors.red)),
          const Text('Avg Score', style: TextStyle(fontSize: 11, color: Colors.grey)),
        ])),
        _VDiv(),
        Expanded(child: _Stat(value: '${compliant}', label: 'Compliant', color: Colors.green)),
        _VDiv(),
        Expanded(child: _Stat(value: '${atRisk}', label: 'At Risk', color: Colors.orange)),
        _VDiv(),
        Expanded(child: _Stat(value: '${nonCompliant}', label: 'Critical', color: Colors.red)),
      ]));
  }
}

class _VDiv extends StatelessWidget {
  @override
  Widget build(BuildContext context) => Container(width: 1, height: 36, color: Colors.grey.shade200, margin: const EdgeInsets.symmetric(horizontal: 4));
}

class _Stat extends StatelessWidget {
  final String value; final String label; final Color color;
  const _Stat({required this.value, required this.label, required this.color});
  @override
  Widget build(BuildContext context) => Column(children: [
    Text(value, style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: color)),
    Text(label, style: const TextStyle(fontSize: 11, color: Colors.grey)),
  ]);
}

class _FacilityChip extends StatelessWidget {
  final String label; final bool isSelected; final VoidCallback onTap;
  const _FacilityChip({required this.label, required this.isSelected, required this.onTap});
  @override
  Widget build(BuildContext context) => ChoiceChip(
      label: Text(label), selected: isSelected, onSelected: (_) => onTap(),
      selectedColor: Theme.of(context).colorScheme.primary,
      labelStyle: TextStyle(color: isSelected ? Colors.white : null, fontSize: 12));
}

class _SortTile extends StatelessWidget {
  final IconData icon; final String label; final String value; final String current; final ValueChanged<String> onTap;
  const _SortTile({required this.icon, required this.label, required this.value, required this.current, required this.onTap});
  @override
  Widget build(BuildContext context) {
    final sel = current == value;
    return ListTile(
      leading: Icon(icon, color: sel ? Theme.of(context).colorScheme.primary : Colors.grey),
      title: Text(label),
      trailing: sel ? Icon(Icons.check, color: Theme.of(context).colorScheme.primary) : null,
      onTap: () { onTap(value); Navigator.pop(context); });
  }
}