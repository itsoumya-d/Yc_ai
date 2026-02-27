import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/inspection.dart';
import '../models/checklist_item.dart';
import '../services/supabase_service.dart';

class InspectionsNotifier extends AsyncNotifier<List<SafetyInspection>> {
  @override
  Future<List<SafetyInspection>> build() async {
    return await SupabaseService.getInspections();
  }

  Future<void> refresh() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() => SupabaseService.getInspections());
  }

  Future<void> addInspection(SafetyInspection inspection) async {
    await SupabaseService.createInspection(inspection);
    state = state.whenData((items) => [inspection, ...items]);
  }

  Future<void> updateInspection(SafetyInspection inspection) async {
    await SupabaseService.updateInspection(inspection);
    state = state.whenData((items) =>
        items.map((i) => i.id == inspection.id ? inspection : i).toList());
  }

  Future<void> updateChecklistItem(String inspectionId, ChecklistItem item) async {
    final inspections = state.value ?? [];
    final inspection = inspections.firstWhere((i) => i.id == inspectionId);
    final updatedItems = inspection.items.map((i) => i.id == item.id ? item : i).toList();
    final updatedInspection = inspection.copyWith(
      items: updatedItems,
      score: _calculateScore(updatedItems),
    );
    await updateInspection(updatedInspection);
  }

  double _calculateScore(List<ChecklistItem> items) {
    final answered = items.where((i) => i.isAnswered).length;
    if (answered == 0) return 100.0;
    final compliant = items.where((i) => i.isCompliant == true).length;
    return (compliant / answered * 100).clamp(0, 100);
  }

  Future<void> syncOfflineQueue() async {
    await SupabaseService.processOfflineQueue();
    await refresh();
  }
}

final inspectionsProvider = AsyncNotifierProvider<InspectionsNotifier, List<SafetyInspection>>(
  InspectionsNotifier.new,
);

final completedInspectionsProvider = Provider<List<SafetyInspection>>((ref) {
  return ref.watch(inspectionsProvider).value
      ?.where((i) => i.status == InspectionStatus.completed)
      .toList() ?? [];
});

final pendingInspectionsProvider = Provider<List<SafetyInspection>>((ref) {
  return ref.watch(inspectionsProvider).value
      ?.where((i) => i.status == InspectionStatus.pending || i.status == InspectionStatus.inProgress)
      .toList() ?? [];
});

final averageScoreProvider = Provider<double>((ref) {
  final inspections = ref.watch(inspectionsProvider).value ?? [];
  if (inspections.isEmpty) return 100.0;
  final completed = inspections.where((i) => i.status == InspectionStatus.completed).toList();
  if (completed.isEmpty) return 100.0;
  return completed.fold(0.0, (sum, i) => sum + i.score) / completed.length;
});
