import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../models/inspection.dart';
import '../../providers/inspections_provider.dart';
import '../../widgets/room_card.dart';

class InspectionScreen extends ConsumerWidget {
  final String inspectionId;
  const InspectionScreen({super.key, required this.inspectionId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final inspectionsAsync = ref.watch(inspectionsProvider);

    return inspectionsAsync.when(
      loading: () => const Scaffold(body: Center(child: CircularProgressIndicator())),
      error: (e, _) => Scaffold(body: Center(child: Text('Error: $e'))),
      data: (inspections) {
        final inspection = inspections.where((i) => i.id == inspectionId).firstOrNull;
        if (inspection == null) return const Scaffold(body: Center(child: Text('Inspection not found')));
        return _buildContent(context, ref, inspection);
      },
    );
  }

  Widget _buildContent(BuildContext context, WidgetRef ref, Inspection inspection) {
    final theme = Theme.of(context);
    final progress = inspection.progress;

    return Scaffold(
      appBar: AppBar(
        title: Text(inspection.clientName),
        leading: const BackButton(color: Colors.white),
        actions: [
          if (inspection.status == InspectionStatus.completed)
            TextButton(
              onPressed: () => context.go('/reports'),
              child: const Text('Reports', style: TextStyle(color: Colors.white)),
            ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.only(bottom: 100),
        children: [
          // Info banner
          Container(
            color: theme.colorScheme.primary.withOpacity(0.08),
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(inspection.propertyAddress, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                const SizedBox(height: 4),
                Text(DateFormat('MMM d, yyyy • h:mm a').format(inspection.date),
                    style: const TextStyle(color: Colors.grey)),
                const SizedBox(height: 12),
                // Progress
                Row(
                  children: [
                    Text('Progress: ${inspection.completedRooms}/${inspection.rooms.length} rooms',
                        style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                    const Spacer(),
                    Text('${(progress * 100).round()}%',
                        style: TextStyle(color: theme.colorScheme.primary, fontWeight: FontWeight.bold)),
                  ],
                ),
                const SizedBox(height: 6),
                ClipRRect(
                  borderRadius: BorderRadius.circular(4),
                  child: LinearProgressIndicator(
                    value: progress,
                    backgroundColor: Colors.grey.shade200,
                    valueColor: AlwaysStoppedAnimation(
                      progress == 1.0 ? Colors.green : theme.colorScheme.primary,
                    ),
                    minHeight: 8,
                  ),
                ),
                if (inspection.totalIssues > 0) ...[
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Icon(Icons.warning_amber_rounded, size: 14, color: Colors.orange.shade700),
                      const SizedBox(width: 4),
                      Text('${inspection.totalIssues} issues found',
                          style: TextStyle(color: Colors.orange.shade700, fontSize: 13)),
                    ],
                  ),
                ],
              ],
            ),
          ),
          // Rooms
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
            child: Text('Rooms (${inspection.rooms.length})',
                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
          ),
          if (inspection.rooms.isEmpty)
            const Padding(
              padding: EdgeInsets.all(20),
              child: Center(child: Text('No rooms defined', style: TextStyle(color: Colors.grey))),
            )
          else
            ...inspection.rooms.map((room) => RoomCard(
                  room: room,
                  onTap: () => context.push('/inspections/$inspectionId/room/${room.id}'),
                )),
        ],
      ),
      floatingActionButton: inspection.status != InspectionStatus.completed && progress == 1.0
          ? FloatingActionButton.extended(
              onPressed: () async {
                await ref.read(inspectionsProvider.notifier).completeInspection(inspectionId);
                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Inspection marked complete!'), backgroundColor: Colors.green),
                  );
                }
              },
              icon: const Icon(Icons.check),
              label: const Text('Complete Inspection'),
            )
          : null,
    );
  }
}
