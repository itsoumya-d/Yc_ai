import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/inspection.dart';
import '../models/room.dart';
import '../services/supabase_service.dart';

class InspectionsNotifier extends AsyncNotifier<List<Inspection>> {
  @override
  Future<List<Inspection>> build() async {
    return await SupabaseService.getInspections();
  }

  Future<void> refresh() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() => SupabaseService.getInspections());
  }

  Future<void> addInspection(Inspection inspection) async {
    final created = await SupabaseService.createInspection(inspection);
    state = state.whenData((items) => [created, ...items]);
  }

  Future<void> updateInspection(Inspection inspection) async {
    await SupabaseService.updateInspection(inspection);
    state = state.whenData((items) =>
        items.map((i) => i.id == inspection.id ? inspection : i).toList());
  }

  Future<void> updateRoom(String inspectionId, Room room) async {
    final inspections = state.value ?? [];
    final inspection = inspections.firstWhere((i) => i.id == inspectionId);
    final updatedRooms = inspection.rooms.map((r) => r.id == room.id ? room : r).toList();
    final updated = inspection.copyWith(rooms: updatedRooms);
    await updateInspection(updated);
  }

  Future<void> completeInspection(String id) async {
    final inspections = state.value ?? [];
    final inspection = inspections.firstWhere((i) => i.id == id);
    final updated = inspection.copyWith(status: InspectionStatus.completed);
    await updateInspection(updated);
  }
}

final inspectionsProvider = AsyncNotifierProvider<InspectionsNotifier, List<Inspection>>(
  InspectionsNotifier.new,
);

final pendingInspectionsProvider = Provider<List<Inspection>>((ref) {
  return ref.watch(inspectionsProvider).value
      ?.where((i) => i.status == InspectionStatus.scheduled || i.status == InspectionStatus.inProgress)
      .toList() ?? [];
});

final completedInspectionsProvider = Provider<List<Inspection>>((ref) {
  return ref.watch(inspectionsProvider).value
      ?.where((i) => i.status == InspectionStatus.completed || i.status == InspectionStatus.reportGenerated)
      .toList() ?? [];
});
