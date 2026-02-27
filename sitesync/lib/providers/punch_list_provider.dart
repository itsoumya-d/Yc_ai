import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/punch_item.dart';
import '../services/supabase_service.dart';

class PunchListNotifier extends AsyncNotifier<List<PunchItem>> {
  @override
  Future<List<PunchItem>> build() async {
    return await SupabaseService.getPunchItems();
  }

  Future<void> refresh() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() => SupabaseService.getPunchItems());
  }

  Future<void> addItem(PunchItem item) async {
    final created = await SupabaseService.createPunchItem(item);
    state = state.whenData((items) => [created, ...items]);
  }

  Future<void> updateItem(PunchItem item) async {
    await SupabaseService.updatePunchItem(item);
    state = state.whenData((items) =>
        items.map((i) => i.id == item.id ? item : i).toList());
  }

  Future<void> resolveItem(String id) async {
    final items = state.value ?? [];
    final item = items.firstWhere((i) => i.id == id);
    final resolved = item.copyWith(
      status: PunchStatus.resolved,
      resolvedAt: DateTime.now(),
    );
    await updateItem(resolved);
  }
}

final punchListProvider = AsyncNotifierProvider<PunchListNotifier, List<PunchItem>>(
  PunchListNotifier.new,
);

final filteredPunchItemsProvider = Provider.family<List<PunchItem>, PunchStatus?>((ref, status) {
  final items = ref.watch(punchListProvider).value ?? [];
  if (status == null) return items;
  return items.where((i) => i.status == status).toList();
});

final openPunchItemsProvider = Provider<List<PunchItem>>((ref) {
  return ref.watch(punchListProvider).value
      ?.where((i) => i.status == PunchStatus.open || i.status == PunchStatus.inProgress)
      .toList() ?? [];
});
