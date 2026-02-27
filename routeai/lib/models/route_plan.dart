import 'job.dart';

class RoutePlan {
  final String id;
  final String driverId;
  final DateTime date;
  final List<Job> jobs;
  final double totalDistanceMiles;
  final int estimatedDurationMinutes;
  final bool optimized;

  const RoutePlan({
    required this.id,
    required this.driverId,
    required this.date,
    required this.jobs,
    required this.totalDistanceMiles,
    required this.estimatedDurationMinutes,
    required this.optimized,
  });

  factory RoutePlan.fromJson(Map<String, dynamic> json) {
    return RoutePlan(
      id: json['id'] as String,
      driverId: json['driver_id'] as String,
      date: DateTime.parse(json['date'] as String),
      jobs: (json['jobs'] as List?)?.map((j) => Job.fromJson(j)).toList() ?? [],
      totalDistanceMiles: (json['total_distance_miles'] as num?)?.toDouble() ?? 0.0,
      estimatedDurationMinutes: json['estimated_duration_minutes'] as int? ?? 0,
      optimized: json['optimized'] as bool? ?? false,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'driver_id': driverId,
        'date': date.toIso8601String(),
        'jobs': jobs.map((j) => j.toJson()).toList(),
        'total_distance_miles': totalDistanceMiles,
        'estimated_duration_minutes': estimatedDurationMinutes,
        'optimized': optimized,
      };
}
