import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../models/driver.dart';
import '../../providers/drivers_provider.dart';
import '../../widgets/driver_card.dart';

class DriversScreen extends ConsumerWidget {
  const DriversScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final driversAsync = ref.watch(driversProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Drivers'),
        actions: [
          IconButton(icon: const Icon(Icons.refresh, color: Colors.white), onPressed: () => ref.refresh(driversProvider)),
        ],
      ),
      body: driversAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Error: $e')),
        data: (drivers) {
          final active = drivers.where((d) => d.status != DriverStatus.offline).toList();
          final offline = drivers.where((d) => d.status == DriverStatus.offline).toList();

          return RefreshIndicator(
            onRefresh: () async => ref.refresh(driversProvider),
            child: ListView(
              padding: const EdgeInsets.only(top: 8, bottom: 80),
              children: [
                // Summary
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  child: Row(
                    children: [
                      _DriverStat(label: 'Total', value: '${drivers.length}', color: Colors.teal),
                      const SizedBox(width: 16),
                      _DriverStat(
                        label: 'Active',
                        value: '${active.length}',
                        color: Colors.green,
                      ),
                      const SizedBox(width: 16),
                      _DriverStat(
                        label: 'Offline',
                        value: '${offline.length}',
                        color: Colors.grey,
                      ),
                    ],
                  ),
                ),
                if (active.isNotEmpty) ...[
                  const Padding(
                    padding: EdgeInsets.only(left: 16, bottom: 4, top: 8),
                    child: Text('ACTIVE', style: TextStyle(fontSize: 11, color: Colors.grey, letterSpacing: 1)),
                  ),
                  ...active.map((d) => DriverCard(driver: d)),
                ],
                if (offline.isNotEmpty) ...[
                  const Padding(
                    padding: EdgeInsets.only(left: 16, bottom: 4, top: 16),
                    child: Text('OFFLINE', style: TextStyle(fontSize: 11, color: Colors.grey, letterSpacing: 1)),
                  ),
                  ...offline.map((d) => DriverCard(driver: d)),
                ],
              ],
            ),
          );
        },
      ),
    );
  }
}

class _DriverStat extends StatelessWidget {
  final String label;
  final String value;
  final Color color;

  const _DriverStat({required this.label, required this.value, required this.color});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 10,
          height: 10,
          decoration: BoxDecoration(color: color, shape: BoxShape.circle),
        ),
        const SizedBox(width: 6),
        Text(value, style: TextStyle(fontWeight: FontWeight.bold, color: color)),
        const SizedBox(width: 4),
        Text(label, style: const TextStyle(color: Colors.grey, fontSize: 13)),
      ],
    );
  }
}
