import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../models/job.dart';
import '../../providers/jobs_provider.dart';
import '../../services/route_optimization_service.dart';
import '../../widgets/map_view_widget.dart';

class RouteScreen extends ConsumerStatefulWidget {
  const RouteScreen({super.key});

  @override
  ConsumerState<RouteScreen> createState() => _RouteScreenState();
}

class _RouteScreenState extends ConsumerState<RouteScreen> {
  bool _isOptimized = false;
  List<Job>? _optimizedJobs;
  Map<String, String> _etas = {};

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final todaysJobs = ref.watch(todaysJobsProvider);
    final displayJobs = _optimizedJobs ?? todaysJobs;
    final totalDist = RouteOptimizationService.estimateTotalDistance(displayJobs);
    final totalDuration = RouteOptimizationService.estimateTotalDuration(displayJobs);

    return Scaffold(
      appBar: AppBar(
        title: const Text('My Route'),
        actions: [
          TextButton.icon(
            onPressed: _optimizeRoute,
            icon: const Icon(Icons.auto_awesome, color: Colors.white, size: 18),
            label: const Text('Optimize', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
      body: Column(
        children: [
          // Map
          Padding(
            padding: const EdgeInsets.all(12),
            child: MapViewWidget(jobs: displayJobs, height: 220),
          ),
          // Route summary
          Container(
            margin: const EdgeInsets.symmetric(horizontal: 12),
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              color: theme.colorScheme.primary.withOpacity(0.05),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: theme.colorScheme.primary.withOpacity(0.2)),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _RouteStat(label: 'Stops', value: '${displayJobs.length}', icon: Icons.location_on_outlined),
                _RouteStat(label: 'Distance', value: '${totalDist.toStringAsFixed(1)} mi', icon: Icons.straighten),
                _RouteStat(label: 'Duration', value: '${(totalDuration / 60).toStringAsFixed(1)} hrs', icon: Icons.schedule),
                if (_isOptimized)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.green.shade50,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.auto_awesome, size: 12, color: Colors.green),
                        SizedBox(width: 4),
                        Text('Optimized', style: TextStyle(color: Colors.green, fontSize: 11, fontWeight: FontWeight.bold)),
                      ],
                    ),
                  ),
              ],
            ),
          ),
          const SizedBox(height: 12),
          // Stop list
          Expanded(
            child: displayJobs.isEmpty
                ? const Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.route_outlined, size: 64, color: Colors.grey),
                        SizedBox(height: 16),
                        Text('No jobs scheduled today', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                      ],
                    ),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.only(bottom: 80),
                    itemCount: displayJobs.length,
                    itemBuilder: (context, index) {
                      final job = displayJobs[index];
                      final eta = _etas[job.id];
                      return _RouteStopTile(
                        index: index + 1,
                        job: job,
                        eta: eta,
                        isLast: index == displayJobs.length - 1,
                      );
                    },
                  ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {},
        icon: const Icon(Icons.navigation),
        label: const Text('Start Navigation'),
      ),
    );
  }

  void _optimizeRoute() {
    final jobs = ref.read(todaysJobsProvider);
    final optimized = RouteOptimizationService.optimizeRoute(jobs);
    final etas = RouteOptimizationService.generateETAs(optimized, DateTime.now());
    setState(() {
      _isOptimized = true;
      _optimizedJobs = optimized;
      _etas = etas;
    });
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Route optimized!'), backgroundColor: Colors.green),
    );
  }
}

class _RouteStat extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;

  const _RouteStat({required this.label, required this.value, required this.icon});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Icon(icon, size: 18, color: Theme.of(context).colorScheme.primary),
        const SizedBox(height: 2),
        Text(value, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
        Text(label, style: const TextStyle(fontSize: 10, color: Colors.grey)),
      ],
    );
  }
}

class _RouteStopTile extends StatelessWidget {
  final int index;
  final Job job;
  final String? eta;
  final bool isLast;

  const _RouteStopTile({required this.index, required this.job, this.eta, required this.isLast});

  @override
  Widget build(BuildContext context) {
    final isCompleted = job.status == JobStatus.completed;
    final color = isCompleted ? Colors.green : Theme.of(context).colorScheme.primary;

    return IntrinsicHeight(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.only(left: 24),
            child: Column(
              children: [
                Container(
                  width: 32,
                  height: 32,
                  decoration: BoxDecoration(
                    color: isCompleted ? Colors.green : color,
                    shape: BoxShape.circle,
                    boxShadow: [BoxShadow(blurRadius: 4, color: color.withOpacity(0.3))],
                  ),
                  child: Center(
                    child: isCompleted
                        ? const Icon(Icons.check, color: Colors.white, size: 16)
                        : Text('$index', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
                  ),
                ),
                if (!isLast)
                  Container(width: 2, height: 50, color: Colors.grey.shade200),
              ],
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Card(
              margin: const EdgeInsets.only(right: 16, bottom: 4),
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(job.customerName, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                        ),
                        if (eta != null)
                          Text('ETA $eta', style: TextStyle(color: color, fontWeight: FontWeight.bold, fontSize: 12)),
                      ],
                    ),
                    Text(job.address, style: const TextStyle(color: Colors.grey, fontSize: 12), maxLines: 1, overflow: TextOverflow.ellipsis),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        Text(job.serviceType, style: TextStyle(color: color, fontSize: 12)),
                        const Spacer(),
                        Text('${job.durationMinutes} min', style: const TextStyle(color: Colors.grey, fontSize: 11)),
                      ],
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
