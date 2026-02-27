enum ItemCondition { good, fair, poor, deficient, notApplicable }
enum ItemSeverity { minor, moderate, major, safety }

class InspectionItem {
  final String id;
  final String roomId;
  final String category;
  final String description;
  final ItemCondition condition;
  final ItemSeverity? severity;
  final List<String> photos;
  final String recommendation;

  const InspectionItem({
    required this.id,
    required this.roomId,
    required this.category,
    required this.description,
    required this.condition,
    this.severity,
    required this.photos,
    required this.recommendation,
  });

  factory InspectionItem.fromJson(Map<String, dynamic> json) {
    return InspectionItem(
      id: json['id'] as String,
      roomId: json['room_id'] as String,
      category: json['category'] as String,
      description: json['description'] as String,
      condition: ItemCondition.values.firstWhere(
        (e) => e.name == (json['condition'] as String),
        orElse: () => ItemCondition.good,
      ),
      severity: json['severity'] != null
          ? ItemSeverity.values.firstWhere((e) => e.name == (json['severity'] as String), orElse: () => ItemSeverity.minor)
          : null,
      photos: List<String>.from(json['photos'] as List? ?? []),
      recommendation: json['recommendation'] as String? ?? '',
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'room_id': roomId,
        'category': category,
        'description': description,
        'condition': condition.name,
        'severity': severity?.name,
        'photos': photos,
        'recommendation': recommendation,
      };

  InspectionItem copyWith({
    String? id,
    String? roomId,
    String? category,
    String? description,
    ItemCondition? condition,
    ItemSeverity? severity,
    List<String>? photos,
    String? recommendation,
  }) {
    return InspectionItem(
      id: id ?? this.id,
      roomId: roomId ?? this.roomId,
      category: category ?? this.category,
      description: description ?? this.description,
      condition: condition ?? this.condition,
      severity: severity ?? this.severity,
      photos: photos ?? this.photos,
      recommendation: recommendation ?? this.recommendation,
    );
  }

  bool get hasIssue => condition == ItemCondition.poor || condition == ItemCondition.deficient;
}
