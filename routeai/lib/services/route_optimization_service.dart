import '../models/job.dart';

class RouteOptimizationService {
  // Nearest neighbor algorithm for route optimization
  static List<Job> optimizeRoute(List<Job> jobs, {double? startLat, double? startLng}) {
    if (jobs.isEmpty) return jobs;

    final unvisited = List<Job>.from(jobs);
    final optimized = <Job>[];

    double currentLat = startLat ?? 39.7817;
    double currentLng = startLng ?? -89.6501;

    while (unvisited.isNotEmpty) {
      Job? nearest;
      double minDist = double.infinity;

      for (final job in unvisited) {
        if (job.lat == null || job.lng == null) continue;
        final dist = _distance(currentLat, currentLng, job.lat!, job.lng!);
        if (dist < minDist) {
          minDist = dist;
          nearest = job;
        }
      }

      if (nearest == null) {
        // Jobs without coordinates - append at end
        optimized.addAll(unvisited.where((j) => j.lat == null || j.lng == null));
        unvisited.removeWhere((j) => j.lat == null || j.lng == null);
        break;
      }

      optimized.add(nearest);
      unvisited.remove(nearest);
      currentLat = nearest.lat!;
      currentLng = nearest.lng!;
    }

    return optimized;
  }

  static double _distance(double lat1, double lng1, double lat2, double lng2) {
    // Simplified Euclidean distance (for demo; use Haversine for production)
    final dlat = lat1 - lat2;
    final dlng = lng1 - lng2;
    return (dlat * dlat + dlng * dlng);
  }

  static double estimateTotalDistance(List<Job> jobs, {double? startLat, double? startLng}) {
    if (jobs.isEmpty) return 0.0;
    double total = 0.0;
    double prevLat = startLat ?? 39.7817;
    double prevLng = startLng ?? -89.6501;
    for (final job in jobs) {
      if (job.lat == null || job.lng == null) continue;
      // Rough miles conversion (1 degree ≈ 69 miles)
      final dlat = (prevLat - job.lat!) * 69;
      final dlng = (prevLng - job.lng!) * 54.6; // cos(39.7°) ≈ 0.7706
      total += (dlat * dlat + dlng * dlng).abs().clamp(0, double.infinity);
      prevLat = job.lat!;
      prevLng = job.lng!;
    }
    return (total / 100).clamp(0.0, 200.0);
  }

  static int estimateTotalDuration(List<Job> jobs) {
    final drivingMinutes = jobs.length * 12; // avg 12 min between stops
    final serviceMinutes = jobs.fold(0, (sum, j) => sum + j.durationMinutes);
    return drivingMinutes + serviceMinutes;
  }

  static Map<String, String> generateETAs(List<Job> jobs, DateTime startTime) {
    final etas = <String, String>{};
    var current = startTime;
    for (int i = 0; i < jobs.length; i++) {
      if (i > 0) {
        current = current.add(const Duration(minutes: 12)); // driving time
      }
      etas[jobs[i].id] = '${current.hour.toString().padLeft(2, '0')}:${current.minute.toString().padLeft(2, '0')}';
      current = current.add(Duration(minutes: jobs[i].durationMinutes));
    }
    return etas;
  }
}
