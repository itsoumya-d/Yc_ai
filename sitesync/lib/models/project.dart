class Project {
  final String id;
  final String name;
  final String address;
  final String client;
  final DateTime startDate;
  final DateTime? endDate;
  final String status; // active, completed, on_hold
  final String description;

  const Project({
    required this.id,
    required this.name,
    required this.address,
    required this.client,
    required this.startDate,
    this.endDate,
    required this.status,
    required this.description,
  });

  factory Project.fromJson(Map<String, dynamic> json) {
    return Project(
      id: json['id'] as String,
      name: json['name'] as String,
      address: json['address'] as String,
      client: json['client'] as String,
      startDate: DateTime.parse(json['start_date'] as String),
      endDate: json['end_date'] != null ? DateTime.parse(json['end_date'] as String) : null,
      status: json['status'] as String,
      description: json['description'] as String? ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'address': address,
      'client': client,
      'start_date': startDate.toIso8601String(),
      'end_date': endDate?.toIso8601String(),
      'status': status,
      'description': description,
    };
  }

  Project copyWith({
    String? id,
    String? name,
    String? address,
    String? client,
    DateTime? startDate,
    DateTime? endDate,
    String? status,
    String? description,
  }) {
    return Project(
      id: id ?? this.id,
      name: name ?? this.name,
      address: address ?? this.address,
      client: client ?? this.client,
      startDate: startDate ?? this.startDate,
      endDate: endDate ?? this.endDate,
      status: status ?? this.status,
      description: description ?? this.description,
    );
  }
}
