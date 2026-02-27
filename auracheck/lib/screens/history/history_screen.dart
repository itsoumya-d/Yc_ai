import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../providers/spots_provider.dart';
import '../../models/skin_check.dart';

class HistoryScreen extends ConsumerWidget {
  const HistoryScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(spotsProvider);
    final checks = state.checkHistory;
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(title: const Text('Check History')),
      body: checks.isEmpty
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Text('📅', style: TextStyle(fontSize: 48)),
                  const SizedBox(height: 12),
                  Text('No check history yet', style: TextStyle(color: Colors.grey.shade600, fontSize: 16)),
                  const SizedBox(height: 8),
                  ElevatedButton(
                    onPressed: () => context.go('/check'),
                    child: const Text('Start First Check'),
                    style: ElevatedButton.styleFrom(minimumSize: const Size(180, 48)),
                  ),
                ],
              ),
            )
          : Column(
              children: [
                // Summary stats
                Container(
                  padding: const EdgeInsets.all(16),
                  color: Colors.white,
                  child: Row(
                    children: [
                      Expanded(child: _StatBubble(
                        label: 'Total Checks',
                        value: checks.length.toString(),
                        icon: Icons.check_circle_outline,
                        color: const Color(0xFF22C55E),
                      )),
                      Expanded(child: _StatBubble(
                        label: 'Current Streak',
                        value: '${state.checkStreak}d',
                        icon: Icons.local_fire_department,
                        color: const Color(0xFFF97316),
                      )),
                      Expanded(child: _StatBubble(
                        label: 'New Spots',
                        value: checks.fold(0, (sum, c) => sum + c.newSpotsFound).toString(),
                        icon: Icons.add_circle_outline,
                        color: const Color(0xFFE11D48),
                      )),
                    ],
                  ),
                ),
                const Divider(height: 1),

                // Calendar-style list grouped by month
                Expanded(
                  child: ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: _buildItems(checks).length,
                    itemBuilder: (ctx, i) {
                      final item = _buildItems(checks)[i];
                      if (item is String) {
                        return Padding(
                          padding: const EdgeInsets.fromLTRB(0, 16, 0, 8),
                          child: Text(item, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14, color: Color(0xFFE11D48))),
                        );
                      }
                      final check = item as SkinCheck;
                      return _CheckTile(check: check);
                    },
                  ),
                ),
              ],
            ),
    );
  }

  List<dynamic> _buildItems(List<SkinCheck> checks) {
    final items = <dynamic>[];
    String? lastMonth;
    for (final check in checks) {
      final month = DateFormat('MMMM yyyy').format(check.date);
      if (month != lastMonth) {
        items.add(month);
        lastMonth = month;
      }
      items.add(check);
    }
    return items;
  }
}

class _CheckTile extends StatelessWidget {
  final SkinCheck check;
  const _CheckTile({required this.check});

  @override
  Widget build(BuildContext context) {
    final isToday = _isToday(check.date);

    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: isToday ? const BorderSide(color: Color(0xFFE11D48), width: 1.5) : BorderSide.none,
      ),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Row(
          children: [
            Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(
                color: const Color(0xFFFECDD3),
                borderRadius: BorderRadius.circular(10),
              ),
              alignment: Alignment.center,
              child: Text(
                check.date.day.toString(),
                style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: Color(0xFFE11D48)),
              ),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Text(
                        DateFormat('EEEE').format(check.date),
                        style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
                      ),
                      if (isToday) ...[
                        const SizedBox(width: 6),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(color: const Color(0xFFE11D48), borderRadius: BorderRadius.circular(6)),
                          child: const Text('Today', style: TextStyle(fontSize: 10, color: Colors.white, fontWeight: FontWeight.w700)),
                        ),
                      ],
                    ],
                  ),
                  Text(
                    '${check.spotsChecked} spots • ${check.areasChecked.length} areas${check.newSpotsFound > 0 ? ' • ${check.newSpotsFound} new' : ''}',
                    style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
                  ),
                ],
              ),
            ),
            Icon(Icons.check_circle, color: check.completed ? const Color(0xFF22C55E) : Colors.grey.shade300, size: 22),
          ],
        ),
      ),
    );
  }

  bool _isToday(DateTime date) {
    final now = DateTime.now();
    return date.year == now.year && date.month == now.month && date.day == now.day;
  }
}

class _StatBubble extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;
  final Color color;

  const _StatBubble({required this.label, required this.value, required this.icon, required this.color});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Icon(icon, color: color, size: 24),
        const SizedBox(height: 4),
        Text(value, style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: color)),
        Text(label, style: const TextStyle(fontSize: 11, color: Colors.grey), textAlign: TextAlign.center),
      ],
    );
  }
}
