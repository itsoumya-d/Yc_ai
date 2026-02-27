import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:uuid/uuid.dart';
import '../../models/inspection.dart';
import '../../models/checklist_item.dart';
import '../../models/violation.dart';
import '../../providers/inspections_provider.dart';
import '../../providers/violations_provider.dart';
import '../../widgets/checklist_item_tile.dart';
import '../../widgets/compliance_gauge.dart';

class InspectionScreen extends ConsumerStatefulWidget {
  final String inspectionId;
  const InspectionScreen({super.key, required this.inspectionId});

  @override
  ConsumerState<InspectionScreen> createState() => _InspectionScreenState();
}

class _InspectionScreenState extends ConsumerState<InspectionScreen> {
  String? _selectedCategory;
  bool _isSaving = false;

  @override
  Widget build(BuildContext context) {
    final inspectionsAsync = ref.watch(inspectionsProvider);

    return inspectionsAsync.when(
      loading: () => const Scaffold(body: Center(child: CircularProgressIndicator())),
      error: (e, _) => Scaffold(body: Center(child: Text('Error: $e'))),
      data: (inspections) {
        final inspection = inspections.where((i) => i.id == widget.inspectionId).firstOrNull;
        if (inspection == null) return const Scaffold(body: Center(child: Text('Inspection not found')));
        return _buildContent(context, inspection);
      },
    );
  }

  Widget _buildContent(BuildContext context, SafetyInspection inspection) {
    final theme = Theme.of(context);
    final categories = inspection.items.map((i) => i.category).toSet().toList();
    final score = inspection.calculatedScore;

    final displayItems = _selectedCategory == null
        ? inspection.items
        : inspection.items.where((i) => i.category == _selectedCategory).toList();

    return Scaffold(
      appBar: AppBar(
        title: Text('${inspection.type.name.toUpperCase()} Inspection'),
        leading: const BackButton(color: Colors.white),
        actions: [
          if (inspection.status == InspectionStatus.inProgress)
            TextButton(
              onPressed: _isSaving ? null : () => _completeInspection(inspection),
              child: const Text('Complete', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
            ),
        ],
      ),
      body: Column(
        children: [
          // Score header
          Container(
            color: theme.colorScheme.primary.withOpacity(0.05),
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            child: Row(
              children: [
                ComplianceGauge(score: score, size: 80, showLabel: false),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Score: ${score.round()}%', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                      const SizedBox(height: 4),
                      ClipRRect(
                        borderRadius: BorderRadius.circular(4),
                        child: LinearProgressIndicator(
                          value: inspection.progress / 100,
                          backgroundColor: Colors.grey.shade200,
                          valueColor: AlwaysStoppedAnimation(theme.colorScheme.primary),
                          minHeight: 6,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        '${inspection.items.where((i) => i.isAnswered).length}/${inspection.items.length} items answered',
                        style: const TextStyle(color: Colors.grey, fontSize: 12),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          // Category filter
          if (categories.isNotEmpty)
            SizedBox(
              height: 44,
              child: ListView(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                children: [
                  _CategoryChip(label: 'All', isSelected: _selectedCategory == null, onTap: () => setState(() => _selectedCategory = null)),
                  ...categories.map((c) => _CategoryChip(
                        label: c,
                        isSelected: _selectedCategory == c,
                        onTap: () => setState(() => _selectedCategory = c),
                      )),
                ],
              ),
            ),
          // Checklist
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.all(12),
              itemCount: displayItems.length,
              itemBuilder: (context, index) {
                final item = displayItems[index];
                return ChecklistItemTile(
                  item: item,
                  onChanged: (isCompliant) async {
                    final updated = item.copyWith(isCompliant: isCompliant);
                    await ref.read(inspectionsProvider.notifier).updateChecklistItem(widget.inspectionId, updated);
                    if (isCompliant == false) {
                      _showViolationDialog(context, inspection, updated);
                    }
                  },
                  onAddNote: () => _showNoteDialog(context, inspection, item),
                  onAddPhoto: () {},
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  void _showViolationDialog(BuildContext context, SafetyInspection inspection, ChecklistItem item) {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Log Violation?'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(item.description),
            const SizedBox(height: 8),
            const Text('Do you want to log this as a violation?', style: TextStyle(color: Colors.grey)),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Skip')),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              _createViolation(inspection, item);
            },
            child: const Text('Log Violation'),
          ),
        ],
      ),
    );
  }

  Future<void> _createViolation(SafetyInspection inspection, ChecklistItem item) async {
    final violation = Violation(
      id: const Uuid().v4(),
      inspectionId: inspection.id,
      category: item.category,
      description: item.description,
      severity: ViolationSeverity.medium,
      photos: [],
      status: ViolationStatus.open,
      correctiveAction: '',
      dueDate: DateTime.now().add(const Duration(days: 14)),
      createdAt: DateTime.now(),
    );
    await ref.read(violationsProvider.notifier).updateViolation(violation);
  }

  void _showNoteDialog(BuildContext context, SafetyInspection inspection, ChecklistItem item) {
    final controller = TextEditingController(text: item.notes);
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Add Note'),
        content: TextField(
          controller: controller,
          maxLines: 3,
          decoration: const InputDecoration(hintText: 'Enter observation or note...'),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () async {
              Navigator.pop(context);
              final updated = item.copyWith(notes: controller.text);
              await ref.read(inspectionsProvider.notifier).updateChecklistItem(widget.inspectionId, updated);
            },
            child: const Text('Save'),
          ),
        ],
      ),
    );
  }

  Future<void> _completeInspection(SafetyInspection inspection) async {
    setState(() => _isSaving = true);
    try {
      final completed = inspection.copyWith(
        status: InspectionStatus.completed,
        score: inspection.calculatedScore,
      );
      await ref.read(inspectionsProvider.notifier).updateInspection(completed);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Inspection completed!'), backgroundColor: Colors.green),
        );
        context.pop();
      }
    } finally {
      setState(() => _isSaving = false);
    }
  }
}

class _CategoryChip extends StatelessWidget {
  final String label;
  final bool isSelected;
  final VoidCallback onTap;

  const _CategoryChip({required this.label, required this.isSelected, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: ChoiceChip(
        label: Text(label),
        selected: isSelected,
        onSelected: (_) => onTap(),
        selectedColor: Theme.of(context).colorScheme.primary,
        labelStyle: TextStyle(color: isSelected ? Colors.white : null, fontSize: 12),
      ),
    );
  }
}
