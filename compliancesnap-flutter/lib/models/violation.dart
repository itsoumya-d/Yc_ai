enum ViolationSeverity { low, medium, high, critical }
enum ViolationStatus { open, inReview, resolved, closed }

class Violation {
  final String id;
  final String inspectionId;
  final String category;
  final String description;
  final ViolationSeverity severity;
  final List<String> photos;
  final ViolationStatus status;
  final String correctiveAction;
  final DateTime? dueDate;
  final DateTime createdAt;

  const Violation({
    required this.id,
    required this.inspectionId,
    required this.category,
    required this.description,
    required this.severity,
    required this.photos,
    required this.status,
    required this.correctiveAction,
    this.dueDate,
    required this.createdAt,
  });

  factory Violation.fromJson(Map<String, dynamic> json) {
    return Violation(
      id: json['id'] as String,
      inspectionId: json['inspection_id'] as String,
      category: json['category'] as String,
      description: json['description'] as String,
      severity: ViolationSeverity.values.firstWhere(
        (e) => e.name == (json['severity'] as String),
        orElse: () => ViolationSeverity.medium,
      ),
      photos: List<String>.from(json['photos'] as List? ?? []),
      status: ViolationStatus.values.firstWhere(
        (e) => e.name == (json['status'] as String),
        orElse: () => ViolationStatus.open,
      ),
      correctiveAction: json['corrective_action'] as String? ?? '',
      dueDate: json['due_date'] != null ? DateTime.parse(json['due_date'] as String) : null,
      createdAt: DateTime.parse(json['created_at'] as String),
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'inspection_id': inspectionId,
        'category': category,
        'description': description,
        'severity': severity.name,
        'photos': photos,
        'status': status.name,
        'corrective_action': correctiveAction,
        'due_date': dueDate?.toIso8601String(),
        'created_at': createdAt.toIso8601String(),
      };

  Violation copyWith({
    String? id,
    String? inspectionId,
    String? category,
    String? description,
    ViolationSeverity? severity,
    List<String>? photos,
    ViolationStatus? status,
    String? correctiveAction,
    DateTime? dueDate,
    DateTime? createdAt,
  }) {
    return Violation(
      id: id ?? this.id,
      inspectionId: inspectionId ?? this.inspectionId,
      category: category ?? this.category,
      description: description ?? this.description,
      severity: severity ?? this.severity,
      photos: photos ?? this.photos,
      status: status ?? this.status,
      correctiveAction: correctiveAction ?? this.correctiveAction,
      dueDate: dueDate ?? this.dueDate,
      createdAt: createdAt ?? this.createdAt,
    );
  }
}
