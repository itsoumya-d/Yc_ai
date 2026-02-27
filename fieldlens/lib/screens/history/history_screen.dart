import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../providers/diagnosis_provider.dart';

class HistoryScreen extends ConsumerWidget {
  const HistoryScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final history = ref.watch(diagnosisProvider).history;

    return Scaffold(
      appBar: AppBar(title: const Text('Diagnosis History')),
      body: history.isEmpty
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.history, size: 64, color: Colors.grey.shade400),
                  const SizedBox(height: 16),
                  Text('No diagnosis history yet', style: TextStyle(color: Colors.grey.shade600, fontSize: 16)),
                  const SizedBox(height: 8),
                  ElevatedButton.icon(
                    onPressed: () => context.go('/diagnose'),
                    icon: const Icon(Icons.camera_alt),
                    label: const Text('Start First Diagnosis'),
                    style: ElevatedButton.styleFrom(minimumSize: const Size(200, 48)),
                  ),
                ],
              ),
            )
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: history.length,
              itemBuilder: (ctx, i) {
                final d = history[i];
                return Card(
                  margin: const EdgeInsets.only(bottom: 10),
                  child: InkWell(
                    borderRadius: BorderRadius.circular(12),
                    onTap: () => context.go('/diagnose/result', extra: d),
                    child: Padding(
                      padding: const EdgeInsets.all(14),
                      child: Row(
                        children: [
                          Container(
                            width: 48,
                            height: 48,
                            decoration: BoxDecoration(color: const Color(0xFFFEF3C7), borderRadius: BorderRadius.circular(12)),
                            alignment: Alignment.center,
                            child: Text(_emojiForTrade(d.trade), style: const TextStyle(fontSize: 24)),
                          ),
                          const SizedBox(width: 14),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(d.trade.toUpperCase(), style: const TextStyle(fontSize: 11, color: Color(0xFFF59E0B), fontWeight: FontWeight.w700)),
                                Text(d.problemDescription, maxLines: 2, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 13)),
                                const SizedBox(height: 4),
                                Text(DateFormat('MMM d, yyyy • h:mm a').format(d.createdAt), style: TextStyle(fontSize: 11, color: Colors.grey.shade500)),
                              ],
                            ),
                          ),
                          const Icon(Icons.chevron_right, color: Colors.grey),
                        ],
                      ),
                    ),
                  ),
                );
              },
            ),
    );
  }

  String _emojiForTrade(String trade) {
    switch (trade) {
      case 'plumbing': return '🔧';
      case 'electrical': return '⚡';
      case 'hvac': return '❄️';
      case 'carpentry': return '🪵';
      default: return '🛠️';
    }
  }
}
