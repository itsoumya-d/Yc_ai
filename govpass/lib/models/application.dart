enum ApplicationStatus {
  submitted,
  processing,
  approved,
  rejected,
  pendingInfo,
}

extension ApplicationStatusExtension on ApplicationStatus {
  String get label {
    switch (this) {
      case ApplicationStatus.submitted:
        return 'Submitted';
      case ApplicationStatus.processing:
        return 'Processing';
      case ApplicationStatus.approved:
        return 'Approved';
      case ApplicationStatus.rejected:
        return 'Rejected';
      case ApplicationStatus.pendingInfo:
        return 'Pending Info';
    }
  }
}

class Application {
  final String id;
  final String serviceId;
  final String serviceName;
  final ApplicationStatus status;
  final DateTime submittedAt;
  final String? notes;
  final List<String> documents;
  final List<StatusUpdate> statusHistory;

  const Application({
    required this.id,
    required this.serviceId,
    required this.serviceName,
    required this.status,
    required this.submittedAt,
    this.notes,
    required this.documents,
    required this.statusHistory,
  });

  factory Application.fromJson(Map<String, dynamic> json) {
    return Application(
      id: json['id'] as String,
      serviceId: json['service_id'] as String,
      serviceName: json['service_name'] as String,
      status: ApplicationStatus.values.firstWhere(
        (e) => e.name == json['status'],
        orElse: () => ApplicationStatus.submitted,
      ),
      submittedAt: DateTime.parse(json['submitted_at'] as String),
      notes: json['notes'] as String?,
      documents: List<String>.from(json['documents'] as List? ?? []),
      statusHistory: (json['status_history'] as List? ?? [])
          .map((s) => StatusUpdate.fromJson(s as Map<String, dynamic>))
          .toList(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'service_id': serviceId,
      'service_name': serviceName,
      'status': status.name,
      'submitted_at': submittedAt.toIso8601String(),
      'notes': notes,
      'documents': documents,
      'status_history': statusHistory.map((s) => s.toJson()).toList(),
    };
  }

  Application copyWith({
    String? id,
    String? serviceId,
    String? serviceName,
    ApplicationStatus? status,
    DateTime? submittedAt,
    String? notes,
    List<String>? documents,
    List<StatusUpdate>? statusHistory,
  }) {
    return Application(
      id: id ?? this.id,
      serviceId: serviceId ?? this.serviceId,
      serviceName: serviceName ?? this.serviceName,
      status: status ?? this.status,
      submittedAt: submittedAt ?? this.submittedAt,
      notes: notes ?? this.notes,
      documents: documents ?? this.documents,
      statusHistory: statusHistory ?? this.statusHistory,
    );
  }
}

class StatusUpdate {
  final ApplicationStatus status;
  final DateTime date;
  final String? message;

  const StatusUpdate({
    required this.status,
    required this.date,
    this.message,
  });

  factory StatusUpdate.fromJson(Map<String, dynamic> json) {
    return StatusUpdate(
      status: ApplicationStatus.values.firstWhere(
        (e) => e.name == json['status'],
        orElse: () => ApplicationStatus.submitted,
      ),
      date: DateTime.parse(json['date'] as String),
      message: json['message'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'status': status.name,
      'date': date.toIso8601String(),
      'message': message,
    };
  }
}
