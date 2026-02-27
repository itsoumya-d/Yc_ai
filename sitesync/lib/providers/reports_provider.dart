import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/daily_report.dart';
import '../services/supabase_service.dart';

class ReportsNotifier extends AsyncNotifier<List<DailyReport>> {
  @override
  Future<List<DailyReport>> build() async {
    return await SupabaseService.getReports();
  }

  Future<void> refresh() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() => SupabaseService.getReports());
  }

  Future<void> addReport(DailyReport report) async {
    final created = await SupabaseService.createReport(report);
    state = state.whenData((reports) => [created, ...reports]);
  }

  Future<void> updateReport(DailyReport report) async {
    await SupabaseService.updateReport(report);
    state = state.whenData((reports) =>
        reports.map((r) => r.id == report.id ? report : r).toList());
  }

  List<DailyReport> getFilteredByDate(DateTime date) {
    return state.value?.where((r) {
          return r.date.year == date.year &&
              r.date.month == date.month &&
              r.date.day == date.day;
        }).toList() ??
        [];
  }
}

final reportsProvider = AsyncNotifierProvider<ReportsNotifier, List<DailyReport>>(
  ReportsNotifier.new,
);

final filteredReportsProvider = Provider.family<List<DailyReport>, DateTime?>((ref, date) {
  final reports = ref.watch(reportsProvider).value ?? [];
  if (date == null) return reports;
  return reports.where((r) {
    return r.date.year == date.year &&
        r.date.month == date.month &&
        r.date.day == date.day;
  }).toList();
});
