enum JobStatus { scheduled, enRoute, arrived, completed, cancelled }

class Job {
  final String id;
  final String customerName;
  final String address;
  final String serviceType;
  final DateTime scheduledTime;
  final int durationMinutes;
  final JobStatus status;
  final String notes;
  final String? driverId;
  final double? lat;
  final double? lng;

  const Job({
    required this.id,
    required this.customerName,
    required this.address,
    required this.serviceType,
    required this.scheduledTime,
    required this.durationMinutes,
    required this.status,
    required this.notes,
    this.driverId,
    this.lat,
    this.lng,
  });

  factory Job.fromJson(Map<String, dynamic> json) {
    return Job(
      id: json['id'] as String,
      customerName: json['customer_name'] as String,
      address: json['address'] as String,
      serviceType: json['service_type'] as String,
      scheduledTime: DateTime.parse(json['scheduled_time'] as String),
      durationMinutes: json['duration_minutes'] as int,
      status: JobStatus.values.firstWhere(
        (e) => e.name == (json['status'] as String),
        orElse: () => JobStatus.scheduled,
      ),
      notes: json['notes'] as String? ?? '',
      driverId: json['driver_id'] as String?,
      lat: (json['lat'] as num?)?.toDouble(),
      lng: (json['lng'] as num?)?.toDouble(),
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'customer_name': customerName,
        'address': address,
        'service_type': serviceType,
        'scheduled_time': scheduledTime.toIso8601String(),
        'duration_minutes': durationMinutes,
        'status': status.name,
        'notes': notes,
        'driver_id': driverId,
        'lat': lat,
        'lng': lng,
      };

  Job copyWith({
    String? id,
    String? customerName,
    String? address,
    String? serviceType,
    DateTime? scheduledTime,
    int? durationMinutes,
    JobStatus? status,
    String? notes,
    String? driverId,
    double? lat,
    double? lng,
  }) {
    return Job(
      id: id ?? this.id,
      customerName: customerName ?? this.customerName,
      address: address ?? this.address,
      serviceType: serviceType ?? this.serviceType,
      scheduledTime: scheduledTime ?? this.scheduledTime,
      durationMinutes: durationMinutes ?? this.durationMinutes,
      status: status ?? this.status,
      notes: notes ?? this.notes,
      driverId: driverId ?? this.driverId,
      lat: lat ?? this.lat,
      lng: lng ?? this.lng,
    );
  }
}
