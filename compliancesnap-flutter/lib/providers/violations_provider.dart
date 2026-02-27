import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/violation.dart';
import '../services/supabase_service.dart';

class ViolationsNotifier extends AsyncNotifier<List<Violation>> {
  @override
  Future<List<Violation>> build() async {
    return await SupabaseService.getViolations();
  }

  Future<void> refresh() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() => SupabaseService.getViolations());
  }

  Future<void> updateViolation(Violation violation) async {
    await SupabaseService.updateViolation(violation);
    state = state.whenData((items) =>
        items.map((v) => v.id == violation.id ? violation : v).toList());
  }

  Future<void> resolveViolation(String id, String correctiveAction) async {
    final violations = state.value ?? [];
    final violation = violations.firstWhere((v) => v.id == id);
    final resolved = violation.copyWith(
      status: ViolationStatus.resolved,
      correctiveAction: correctiveAction,
    );
    await updateViolation(resolved);
  }
}

final violationsProvider = AsyncNotifierProvider<ViolationsNotifier, List<Violation>>(
  ViolationsNotifier.new,
);

final openViolationsProvider = Provider<List<Violation>>((ref) {
  return ref.watch(violationsProvider).value
      ?.where((v) => v.status == ViolationStatus.open || v.status == ViolationStatus.inReview)
      .toList() ?? [];
});

final criticalViolationsProvider = Provider<List<Violation>>((ref) {
  return ref.watch(violationsProvider).value
      ?.where((v) => v.severity == ViolationSeverity.critical || v.severity == ViolationSeverity.high)
      .where((v) => v.status == ViolationStatus.open)
      .toList() ?? [];
});
