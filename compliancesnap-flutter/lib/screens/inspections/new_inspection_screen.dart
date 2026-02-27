import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:uuid/uuid.dart';
import '../../models/inspection.dart';
import '../../models/checklist_item.dart';
import '../../providers/inspections_provider.dart';
import '../../providers/facilities_provider.dart';
import '../../models/facility.dart';

class NewInspectionScreen extends ConsumerStatefulWidget {
  const NewInspectionScreen({super.key});

  @override
  ConsumerState<NewInspectionScreen> createState() => _NewInspectionScreenState();
}

class _NewInspectionScreenState extends ConsumerState<NewInspectionScreen> {
  final _formKey = GlobalKey<FormState>();
  final _inspectorController = TextEditingController(text: 'John Safety');
  Facility? _selectedFacility;
  InspectionType _type = InspectionType.general;
  bool _isSaving = false;

  final Map<InspectionType, List<Map<String, String>>> _checklists = {
    InspectionType.fire: [
      {'category': 'Extinguishers', 'description': 'Fire extinguishers accessible and charged'},
      {'category': 'Extinguishers', 'description': 'Extinguisher inspection tags current'},
      {'category': 'Exits', 'description': 'Emergency exits clearly marked'},
      {'category': 'Exits', 'description': 'Exit doors unobstructed and functional'},
      {'category': 'Exits', 'description': 'Emergency lighting operational'},
      {'category': 'Alarms', 'description': 'Smoke detectors present and functional'},
      {'category': 'Alarms', 'description': 'Pull stations accessible and marked'},
      {'category': 'Sprinklers', 'description': 'Sprinkler heads unobstructed'},
      {'category': 'Sprinklers', 'description': 'Sprinkler system pressure normal'},
    ],
    InspectionType.electrical: [
      {'category': 'Panels', 'description': 'Electrical panels properly labeled'},
      {'category': 'Panels', 'description': 'Panel doors accessible (36" clearance)'},
      {'category': 'Outlets', 'description': 'GFCI outlets installed in wet areas'},
      {'category': 'Outlets', 'description': 'No damaged or uncovered outlets'},
      {'category': 'Cords', 'description': 'No extension cords as permanent wiring'},
      {'category': 'Cords', 'description': 'Cords in good condition, not frayed'},
      {'category': 'Grounding', 'description': 'Equipment properly grounded'},
    ],
    InspectionType.general: [
      {'category': 'Housekeeping', 'description': 'Work areas clean and organized'},
      {'category': 'Housekeeping', 'description': 'Aisles and walkways clear'},
      {'category': 'PPE', 'description': 'Required PPE available and accessible'},
      {'category': 'PPE', 'description': 'PPE in good condition'},
      {'category': 'Signage', 'description': 'Safety signs posted and visible'},
      {'category': 'First Aid', 'description': 'First aid kit stocked and accessible'},
      {'category': 'Ergonomics', 'description': 'Workstations properly set up'},
    ],
    InspectionType.ergonomic: [
      {'category': 'Workstation', 'description': 'Chair adjusted for proper posture'},
      {'category': 'Workstation', 'description': 'Monitor at eye level'},
      {'category': 'Workstation', 'description': 'Keyboard and mouse within easy reach'},
      {'category': 'Lifting', 'description': 'Proper lifting technique posted'},
      {'category': 'Lighting', 'description': 'Adequate task lighting'},
      {'category': 'Breaks', 'description': 'Rest break schedule posted'},
    ],
  };

  @override
  Widget build(BuildContext context) {
    final facilitiesAsync = ref.watch(facilitiesProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('New Inspection'),
        leading: IconButton(icon: const Icon(Icons.close, color: Colors.white), onPressed: () => context.pop()),
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            const Text('Select Facility *', style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            facilitiesAsync.when(
              loading: () => const CircularProgressIndicator(),
              error: (e, _) => Text('Error: $e'),
              data: (facilities) => DropdownButtonFormField<Facility>(
                value: _selectedFacility,
                decoration: const InputDecoration(hintText: 'Choose facility'),
                items: facilities.map((f) => DropdownMenuItem(value: f, child: Text(f.name))).toList(),
                onChanged: (f) => setState(() => _selectedFacility = f),
                validator: (v) => v == null ? 'Please select a facility' : null,
              ),
            ),
            const SizedBox(height: 20),
            const Text('Inspection Type', style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: InspectionType.values.map((t) {
                final isSelected = _type == t;
                return GestureDetector(
                  onTap: () => setState(() => _type = t),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                    decoration: BoxDecoration(
                      color: isSelected ? Theme.of(context).colorScheme.primary.withOpacity(0.1) : Colors.grey.shade100,
                      border: Border.all(
                        color: isSelected ? Theme.of(context).colorScheme.primary : Colors.grey.shade300,
                        width: isSelected ? 2 : 1,
                      ),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(_typeIcon(t), size: 18, color: isSelected ? Theme.of(context).colorScheme.primary : Colors.grey),
                        const SizedBox(width: 6),
                        Text(
                          t.name.toUpperCase(),
                          style: TextStyle(
                            color: isSelected ? Theme.of(context).colorScheme.primary : Colors.grey.shade700,
                            fontWeight: isSelected ? FontWeight.bold : null,
                            fontSize: 12,
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              }).toList(),
            ),
            const SizedBox(height: 20),
            const Text('Inspector', style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            TextFormField(
              controller: _inspectorController,
              decoration: const InputDecoration(hintText: 'Inspector name'),
              validator: (v) => v == null || v.trim().isEmpty ? 'Required' : null,
            ),
            const SizedBox(height: 16),
            // Checklist preview
            if (_checklists[_type] != null) ...[
              Text('Checklist Preview (${_checklists[_type]!.length} items)', style: const TextStyle(fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.grey.shade50,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: Colors.grey.shade200),
                ),
                child: Column(
                  children: _checklists[_type]!.take(4).map((item) => Padding(
                    padding: const EdgeInsets.symmetric(vertical: 3),
                    child: Row(
                      children: [
                        const Icon(Icons.check_box_outline_blank, size: 16, color: Colors.grey),
                        const SizedBox(width: 8),
                        Text(item['description']!, style: const TextStyle(fontSize: 13)),
                      ],
                    ),
                  )).toList()
                  ..add(
                    _checklists[_type]!.length > 4
                        ? Padding(
                            padding: const EdgeInsets.only(top: 4),
                            child: Text(
                              '+ ${_checklists[_type]!.length - 4} more items',
                              style: TextStyle(color: Colors.grey.shade600, fontSize: 12, fontStyle: FontStyle.italic),
                            ),
                          )
                        : const SizedBox.shrink(),
                  ),
                ),
              ),
            ],
            const SizedBox(height: 32),
            ElevatedButton(
              onPressed: _isSaving ? null : _startInspection,
              style: ElevatedButton.styleFrom(minimumSize: const Size.fromHeight(52)),
              child: _isSaving
                  ? const CircularProgressIndicator(color: Colors.white)
                  : const Text('START INSPECTION', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      ),
    );
  }

  IconData _typeIcon(InspectionType type) {
    switch (type) {
      case InspectionType.fire:
        return Icons.local_fire_department_outlined;
      case InspectionType.electrical:
        return Icons.bolt_outlined;
      case InspectionType.general:
        return Icons.fact_check_outlined;
      case InspectionType.ergonomic:
        return Icons.accessibility_new_outlined;
      case InspectionType.chemical:
        return Icons.science_outlined;
      case InspectionType.emergency:
        return Icons.emergency_outlined;
    }
  }

  Future<void> _startInspection() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _isSaving = true);

    try {
      final checklist = _checklists[_type] ?? [];
      final items = checklist.map((c) => ChecklistItem(
            id: const Uuid().v4(),
            category: c['category']!,
            description: c['description']!,
            notes: '',
            photos: [],
          )).toList();

      final inspection = SafetyInspection(
        id: const Uuid().v4(),
        facilityId: _selectedFacility!.id,
        type: _type,
        inspector: _inspectorController.text.trim(),
        date: DateTime.now(),
        status: InspectionStatus.inProgress,
        items: items,
        violations: [],
        score: 100.0,
        isOffline: false,
      );

      await ref.read(inspectionsProvider.notifier).addInspection(inspection);
      if (mounted) {
        context.pushReplacement('/inspections/${inspection.id}');
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e'), backgroundColor: Colors.red),
        );
      }
    } finally {
      setState(() => _isSaving = false);
    }
  }
}
