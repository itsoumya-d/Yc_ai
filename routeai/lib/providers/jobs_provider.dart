import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/job.dart';
import '../services/supabase_service.dart';

class JobsNotifier extends AsyncNotifier<List<Job>> {
  @override
  Future<List<Job>> build() async {
    return await SupabaseService.getJobs();
  }

  Future<void> refresh() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() => SupabaseService.getJobs());
  }

  Future<void> addJob(Job job) async {
    final created = await SupabaseService.createJob(job);
    state = state.whenData((jobs) => [...jobs, created]);
  }

  Future<void> updateJobStatus(String id, JobStatus status) async {
    final jobs = state.value ?? [];
    final job = jobs.firstWhere((j) => j.id == id);
    final updated = job.copyWith(status: status);
    await SupabaseService.updateJob(updated);
    state = state.whenData((jobs) => jobs.map((j) => j.id == id ? updated : j).toList());
  }

  Future<void> assignDriver(String jobId, String driverId) async {
    final jobs = state.value ?? [];
    final job = jobs.firstWhere((j) => j.id == jobId);
    final updated = job.copyWith(driverId: driverId);
    await SupabaseService.updateJob(updated);
    state = state.whenData((jobs) => jobs.map((j) => j.id == jobId ? updated : j).toList());
  }

  Future<void> reorderJobs(List<Job> newOrder) async {
    state = AsyncValue.data(newOrder);
  }
}

final jobsProvider = AsyncNotifierProvider<JobsNotifier, List<Job>>(JobsNotifier.new);

final todaysJobsProvider = Provider<List<Job>>((ref) {
  final jobs = ref.watch(jobsProvider).value ?? [];
  final today = DateTime.now();
  return jobs.where((j) {
    return j.scheduledTime.year == today.year &&
        j.scheduledTime.month == today.month &&
        j.scheduledTime.day == today.day;
  }).toList();
});

final pendingJobsProvider = Provider<List<Job>>((ref) {
  return ref.watch(jobsProvider).value
      ?.where((j) => j.status == JobStatus.scheduled)
      .toList() ?? [];
});

final completedJobsProvider = Provider<List<Job>>((ref) {
  return ref.watch(jobsProvider).value
      ?.where((j) => j.status == JobStatus.completed)
      .toList() ?? [];
});
