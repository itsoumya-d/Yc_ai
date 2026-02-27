enum DriverStatus { available, busy, offline }

class Driver {
  final String id;
  final String name;
  final String vehicle;
  final double? currentLat;
  final double? currentLng;
  final DriverStatus status;
  final int jobsToday;
  final String? phone;
  final String? avatarUrl;

  const Driver({
    required this.id,
    required this.name,
    required this.vehicle,
    this.currentLat,
    this.currentLng,
    required this.status,
    required this.jobsToday,
    this.phone,
    this.avatarUrl,
  });

  factory Driver.fromJson(Map<String, dynamic> json) {
    return Driver(
      id: json['id'] as String,
      name: json['name'] as String,
      vehicle: json['vehicle'] as String,
      currentLat: (json['current_lat'] as num?)?.toDouble(),
      currentLng: (json['current_lng'] as num?)?.toDouble(),
      status: DriverStatus.values.firstWhere(
        (e) => e.name == (json['status'] as String),
        orElse: () => DriverStatus.offline,
      ),
      jobsToday: json['jobs_today'] as int? ?? 0,
      phone: json['phone'] as String?,
      avatarUrl: json['avatar_url'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'vehicle': vehicle,
        'current_lat': currentLat,
        'current_lng': currentLng,
        'status': status.name,
        'jobs_today': jobsToday,
        'phone': phone,
        'avatar_url': avatarUrl,
      };

  Driver copyWith({
    String? id,
    String? name,
    String? vehicle,
    double? currentLat,
    double? currentLng,
    DriverStatus? status,
    int? jobsToday,
    String? phone,
    String? avatarUrl,
  }) {
    return Driver(
      id: id ?? this.id,
      name: name ?? this.name,
      vehicle: vehicle ?? this.vehicle,
      currentLat: currentLat ?? this.currentLat,
      currentLng: currentLng ?? this.currentLng,
      status: status ?? this.status,
      jobsToday: jobsToday ?? this.jobsToday,
      phone: phone ?? this.phone,
      avatarUrl: avatarUrl ?? this.avatarUrl,
    );
  }
}
