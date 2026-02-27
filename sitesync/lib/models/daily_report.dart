class DailyReport {
  final String id;
  final String projectId;
  final DateTime date;
  final String weather;
  final int crewCount;
  final String workPerformed;
  final String equipmentUsed;
  final String issues;
  final List<String> photos;
  final String? location;
  final String createdBy;
  final DateTime createdAt;

  const DailyReport({
    required this.id,
    required this.projectId,
    required this.date,
    required this.weather,
    required this.crewCount,
    required this.workPerformed,
    required this.equipmentUsed,
    required this.issues,
    required this.photos,
    this.location,
    required this.createdBy,
    required this.createdAt,
  });

  factory DailyReport.fromJson(Map<String, dynamic> json) {
    return DailyReport(
      id: json['id'] as String,
      projectId: json['project_id'] as String,
      date: DateTime.parse(json['date'] as String),
      weather: json['weather'] as String,
      crewCount: json['crew_count'] as int,
      workPerformed: json['work_performed'] as String,
      equipmentUsed: json['equipment_used'] as String? ?? '',
      issues: json['issues'] as String? ?? '',
      photos: List<String>.from(json['photos'] as List? ?? []),
      location: json['location'] as String?,
      createdBy: json['created_by'] as String,
      createdAt: DateTime.parse(json['created_at'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'project_id': projectId,
      'date': date.toIso8601String(),
      'weather': weather,
      'crew_count': crewCount,
      'work_performed': workPerformed,
      'equipment_used': equipmentUsed,
      'issues': issues,
      'photos': photos,
      'location': location,
      'created_by': createdBy,
      'created_at': createdAt.toIso8601String(),
    };
  }

  DailyReport copyWith({
    String? id,
    String? projectId,
    DateTime? date,
    String? weather,
    int? crewCount,
    String? workPerformed,
    String? equipmentUsed,
    String? issues,
    List<String>? photos,
    String? location,
    String? createdBy,
    DateTime? createdAt,
  }) {
    return DailyReport(
      id: id ?? this.id,
      projectId: projectId ?? this.projectId,
      date: date ?? this.date,
      weather: weather ?? this.weather,
      crewCount: crewCount ?? this.crewCount,
      workPerformed: workPerformed ?? this.workPerformed,
      equipmentUsed: equipmentUsed ?? this.equipmentUsed,
      issues: issues ?? this.issues,
      photos: photos ?? this.photos,
      location: location ?? this.location,
      createdBy: createdBy ?? this.createdBy,
      createdAt: createdAt ?? this.createdAt,
    );
  }
}
