import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../models/job.dart';
import '../../models/driver.dart';
import '../../providers/jobs_provider.dart';
import '../../providers/drivers_provider.dart';

class DispatchScreen extends ConsumerStatefulWidget {
  const DispatchScreen({super.key});

  @override
  ConsumerState<DispatchScreen> createState() => _DispatchScreenState();
}

class _DispatchScreenState extends ConsumerState<DispatchScreen> {
  Driver? _selectedDriver;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final jobsAsync = ref.watch(jobsProvider);
    final driversAsync = ref.watch(driversProvider);

    final unassignedJobs = jobsAsync.value?.where((j) => j.driverId == null).toList() ?? [];
    final drivers = driversAsync.value ?? [];

    return Scaffold(
      appBar: AppBar(
        title: const Text('Dispatch'),
        actions: [
          IconButton(icon: const Icon(Icons.refresh, color: Colors.white), onPressed: () {
            ref.refresh(jobsProvider);
            ref.refresh(driversProvider);
          }),
        ],
      ),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Driver selector
          Container(
            color: theme.colorScheme.primary.withOpacity(0.05),
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Select Driver', style: TextStyle(fontWeight: FontWeight.bold)),
                const SizedBox(height: 8),
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: drivers.map((d) {
                      final isSelected = _selectedDriver?.id == d.id;
                      return GestureDetector(
                        onTap: () => setState(() => _selectedDriver = d),
                        child: Container(
                          margin: const EdgeInsets.only(right: 10),
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                          decoration: BoxDecoration(
                            color: isSelected ? theme.colorScheme.primary : Colors.white,
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(
                              color: isSelected ? theme.colorScheme.primary : Colors.grey.shade300,
                            ),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              CircleAvatar(
                                radius: 16,
                                backgroundColor: isSelected ? Colors.white24 : Colors.teal.shade100,
                                child: Text(
                                  d.name[0],
                                  style: TextStyle(
                                    color: isSelected ? Colors.white : Colors.teal.shade800,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                              const SizedBox(width: 8),
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    d.name.split(' ').first,
                                    style: TextStyle(
                                      fontWeight: FontWeight.bold,
                                      color: isSelected ? Colors.white : null,
                                      fontSize: 13,
                                    ),
                                  ),
                                  Text(
                                    d.status.name,
                                    style: TextStyle(
                                      fontSize: 10,
                                      color: isSelected ? Colors.white70 : Colors.grey,
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                ),
              ],
            ),
          ),
          // Unassigned jobs
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
            child: Row(
              children: [
                Text(
                  'Unassigned Jobs (${unassignedJobs.length})',
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                ),
                const Spacer(),
                if (_selectedDriver != null && unassignedJobs.isNotEmpty)
                  TextButton(
                    onPressed: () => _assignAll(unassignedJobs),
                    child: const Text('Assign All'),
                  ),
              ],
            ),
          ),
          Expanded(
            child: unassignedJobs.isEmpty
                ? const Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.check_circle_outline, size: 64, color: Colors.green),
                        SizedBox(height: 16),
                        Text('All jobs are assigned!', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                      ],
                    ),
                  )
                : ReorderableListView.builder(
                    onReorder: (oldIndex, newIndex) {
                      final list = List<Job>.from(unassignedJobs);
                      if (newIndex > oldIndex) newIndex--;
                      final item = list.removeAt(oldIndex);
                      list.insert(newIndex, item);
                      ref.read(jobsProvider.notifier).reorderJobs(list);
                    },
                    itemCount: unassignedJobs.length,
                    itemBuilder: (context, index) {
                      final job = unassignedJobs[index];
                      return Card(
                        key: ValueKey(job.id),
                        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                        child: ListTile(
                          leading: ReorderableDragStartListener(
                            index: index,
                            child: const Icon(Icons.drag_handle, color: Colors.grey),
                          ),
                          title: Text(job.customerName, style: const TextStyle(fontWeight: FontWeight.w600)),
                          subtitle: Text('${job.serviceType} • ${job.address}', maxLines: 1, overflow: TextOverflow.ellipsis),
                          trailing: _selectedDriver != null
                              ? ElevatedButton(
                                  onPressed: () => _assignJob(job),
                                  style: ElevatedButton.styleFrom(
                                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                    minimumSize: Size.zero,
                                    tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                                  ),
                                  child: const Text('Assign'),
                                )
                              : null,
                        ),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }

  Future<void> _assignJob(Job job) async {
    if (_selectedDriver == null) return;
    await ref.read(jobsProvider.notifier).assignDriver(job.id, _selectedDriver!.id);
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Assigned ${job.customerName} to ${_selectedDriver!.name}'),
          backgroundColor: Colors.green,
        ),
      );
    }
  }

  Future<void> _assignAll(List<Job> jobs) async {
    if (_selectedDriver == null) return;
    for (final job in jobs) {
      await ref.read(jobsProvider.notifier).assignDriver(job.id, _selectedDriver!.id);
    }
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('All ${jobs.length} jobs assigned to ${_selectedDriver!.name}'),
          backgroundColor: Colors.green,
        ),
      );
    }
  }
}
