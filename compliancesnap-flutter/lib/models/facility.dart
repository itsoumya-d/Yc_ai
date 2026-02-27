class Facility {
  final String id;
  final String name;
  final String type;
  final String address;
  final double complianceScore;
  final DateTime? lastInspection;
  final int openViolations;

  const Facility({
    required this.id,
    required this.name,
    required this.type,
    required this.address,
    required this.complianceScore,
    this.lastInspection,
    required this.openViolations,
  });

  factory Facility.fromJson(Map<String, dynamic> json) {
    return Facility(
      id: json['id'] as String,
      name: json['name'] as String,
      type: json['type'] as String,
      address: json['address'] as String,
      complianceScore: (json['compliance_score'] as num).toDouble(),
      lastInspection: json['last_inspection'] != null ? DateTime.parse(json['last_inspection'] as String) : null,
      openViolations: json['open_violations'] as int? ?? 0,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'type': type,
        'address': address,
        'compliance_score': complianceScore,
        'last_inspection': lastInspection?.toIso8601String(),
        'open_violations': openViolations,
      };
}
