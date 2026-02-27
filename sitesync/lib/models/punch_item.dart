enum PunchPriority { low, medium, high, critical }
enum PunchStatus { open, inProgress, resolved, closed }

class PunchItem {
  final String id;
  final String projectId;
  final String description;
  final String location;
  final PunchPriority priority;
  final PunchStatus status;
  final String assignedTo;
  final DateTime? dueDate;
  final List<String> photos;
  final DateTime? resolvedAt;
  final DateTime createdAt;

  const PunchItem({
    required this.id,
    required this.projectId,
    required this.description,
    required this.location,
    required this.priority,
    required this.status,
    required this.assignedTo,
    this.dueDate,
    required this.photos,
    this.resolvedAt,
    required this.createdAt,
  });

  factory PunchItem.fromJson(Map<String, dynamic> json) {
    return PunchItem(
      id: json['id'] as String,
      projectId: json['project_id'] as String,
      description: json['description'] as String,
      location: json['location'] as String,
      priority: PunchPriority.values.firstWhere(
        (e) => e.name == (json['priority'] as String),
        orElse: () => PunchPriority.medium,
      ),
      status: PunchStatus.values.firstWhere(
        (e) => e.name == (json['status'] as String),
        orElse: () => PunchStatus.open,
      ),
      assignedTo: json['assigned_to'] as String? ?? '',
      dueDate: json['due_date'] != null ? DateTime.parse(json['due_date'] as String) : null,
      photos: List<String>.from(json['photos'] as List? ?? []),
      resolvedAt: json['resolved_at'] != null ? DateTime.parse(json['resolved_at'] as String) : null,
      createdAt: DateTime.parse(json['created_at'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'project_id': projectId,
      'description': description,
      'location': location,
      'priority': priority.name,
      'status': status.name,
      'assigned_to': assignedTo,
      'due_date': dueDate?.toIso8601String(),
      'photos': photos,
      'resolved_at': resolvedAt?.toIso8601String(),
      'created_at': createdAt.toIso8601String(),
    };
  }

  PunchItem copyWith({
    String? id,
    String? projectId,
    String? description,
    String? location,
    PunchPriority? priority,
    PunchStatus? status,
    String? assignedTo,
    DateTime? dueDate,
    List<String>? photos,
    DateTime? resolvedAt,
    DateTime? createdAt,
  }) {
    return PunchItem(
      id: id ?? this.id,
      projectId: projectId ?? this.projectId,
      description: description ?? this.description,
      location: location ?? this.location,
      priority: priority ?? this.priority,
      status: status ?? this.status,
      assignedTo: assignedTo ?? this.assignedTo,
      dueDate: dueDate ?? this.dueDate,
      photos: photos ?? this.photos,
      resolvedAt: resolvedAt ?? this.resolvedAt,
      createdAt: createdAt ?? this.createdAt,
    );
  }
}
