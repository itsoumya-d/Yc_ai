import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/facility.dart';
import '../services/supabase_service.dart';

class FacilitiesNotifier extends AsyncNotifier<List<Facility>> {
  @override
  Future<List<Facility>> build() async {
    return await SupabaseService.getFacilities();
  }

  Future<void> refresh() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() => SupabaseService.getFacilities());
  }
}

final facilitiesProvider = AsyncNotifierProvider<FacilitiesNotifier, List<Facility>>(
  FacilitiesNotifier.new,
);
