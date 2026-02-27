import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/driver.dart';
import '../services/supabase_service.dart';

class DriversNotifier extends AsyncNotifier<List<Driver>> {
  @override
  Future<List<Driver>> build() async {
    return await SupabaseService.getDrivers();
  }

  Future<void> refresh() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() => SupabaseService.getDrivers());
  }

  Future<void> updateDriver(Driver driver) async {
    await SupabaseService.updateDriver(driver);
    state = state.whenData((drivers) =>
        drivers.map((d) => d.id == driver.id ? driver : d).toList());
  }
}

final driversProvider = AsyncNotifierProvider<DriversNotifier, List<Driver>>(DriversNotifier.new);

final activeDriversProvider = Provider<List<Driver>>((ref) {
  return ref.watch(driversProvider).value
      ?.where((d) => d.status != DriverStatus.offline)
      .toList() ?? [];
});
