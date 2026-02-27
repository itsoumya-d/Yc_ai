import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../models/job.dart';
import '../../providers/jobs_provider.dart';
import '../../widgets/job_card.dart';

class JobsScreen extends ConsumerStatefulWidget {
  const JobsScreen({super.key});

  @override
  ConsumerState<JobsScreen> createState() => _JobsScreenState();
}

class _JobsScreenState extends ConsumerState<JobsScreen> {
  JobStatus? _statusFilter;
  String _searchQuery = '';
  DateTime _selectedDate = DateTime.now();

  @override
  Widget build(BuildContext context) {
    final jobsAsync = ref.watch(jobsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Jobs'),
        actions: [
          IconButton(
            icon: const Icon(Icons.calendar_today, color: Colors.white),
            onPressed: _pickDate,
          ),
          IconButton(
            icon: const Icon(Icons.add, color: Colors.white),
            onPressed: () => context.push('/add-job'),
          ),
        ],
      ),
      body: Column(
        children: [
          // Search bar
          Padding(
            padding: const EdgeInsets.all(12),
            child: TextField(
              onChanged: (v) => setState(() => _searchQuery = v),
              decoration: InputDecoration(
                hintText: 'Search customer, address, service...',
                prefixIcon: const Icon(Icons.search),
                suffixIcon: _searchQuery.isNotEmpty
                    ? IconButton(icon: const Icon(Icons.clear), onPressed: () => setState(() => _searchQuery = ''))
                    : null,
                contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              ),
            ),
          ),
          // Date indicator
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              children: [
                const Icon(Icons.calendar_today, size: 14, color: Colors.grey),
                const SizedBox(width: 6),
                Text(DateFormat('EEEE, MMM d').format(_selectedDate), style: const TextStyle(color: Colors.grey)),
              ],
            ),
          ),
          // Status filter
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            child: Row(
              children: [
                _StatusChip(label: 'All', isSelected: _statusFilter == null, onTap: () => setState(() => _statusFilter = null)),
                ...JobStatus.values.map((s) => _StatusChip(
                      label: s.name.replaceAllMapped(RegExp(r'[A-Z]'), (m) => ' ${m[0]}').trim(),
                      isSelected: _statusFilter == s,
                      onTap: () => setState(() => _statusFilter = s),
                    )),
              ],
            ),
          ),
          // Job list
          Expanded(
            child: jobsAsync.when(
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (e, _) => Center(child: Text('Error: $e')),
              data: (jobs) {
                var filtered = jobs.where((j) {
                  final matchDate = j.scheduledTime.year == _selectedDate.year &&
                      j.scheduledTime.month == _selectedDate.month &&
                      j.scheduledTime.day == _selectedDate.day;
                  final matchStatus = _statusFilter == null || j.status == _statusFilter;
                  final matchSearch = _searchQuery.isEmpty ||
                      j.customerName.toLowerCase().contains(_searchQuery.toLowerCase()) ||
                      j.address.toLowerCase().contains(_searchQuery.toLowerCase()) ||
                      j.serviceType.toLowerCase().contains(_searchQuery.toLowerCase());
                  return matchDate && matchStatus && matchSearch;
                }).toList();

                if (filtered.isEmpty) {
                  return const Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.work_off_outlined, size: 64, color: Colors.grey),
                        SizedBox(height: 16),
                        Text('No jobs found', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                      ],
                    ),
                  );
                }

                return RefreshIndicator(
                  onRefresh: () async => ref.refresh(jobsProvider),
                  child: ListView.builder(
                    padding: const EdgeInsets.only(bottom: 80),
                    itemCount: filtered.length,
                    itemBuilder: (context, index) => JobCard(
                      job: filtered[index],
                      onTap: () => context.push('/jobs/${filtered[index].id}'),
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _pickDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _selectedDate,
      firstDate: DateTime(2020),
      lastDate: DateTime.now().add(const Duration(days: 365)),
    );
    if (picked != null) setState(() => _selectedDate = picked);
  }
}

class _StatusChip extends StatelessWidget {
  final String label;
  final bool isSelected;
  final VoidCallback onTap;

  const _StatusChip({required this.label, required this.isSelected, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: ChoiceChip(
        label: Text(label),
        selected: isSelected,
        onSelected: (_) => onTap(),
        selectedColor: Theme.of(context).colorScheme.primary,
        labelStyle: TextStyle(
          color: isSelected ? Colors.white : null,
          fontWeight: isSelected ? FontWeight.bold : null,
          fontSize: 12,
        ),
      ),
    );
  }
}
