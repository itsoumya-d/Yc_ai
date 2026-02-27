import 'inspection_item.dart';

enum RoomCondition { excellent, good, fair, poor }

class Room {
  final String id;
  final String inspectionId;
  final String name;
  final RoomCondition condition;
  final List<InspectionItem> items;
  final List<String> photos;
  final String notes;
  final bool isCompleted;

  const Room({
    required this.id,
    required this.inspectionId,
    required this.name,
    required this.condition,
    required this.items,
    required this.photos,
    required this.notes,
    required this.isCompleted,
  });

  factory Room.fromJson(Map<String, dynamic> json) {
    return Room(
      id: json['id'] as String,
      inspectionId: json['inspection_id'] as String,
      name: json['name'] as String,
      condition: RoomCondition.values.firstWhere(
        (e) => e.name == (json['condition'] as String),
        orElse: () => RoomCondition.good,
      ),
      items: (json['items'] as List?)?.map((i) => InspectionItem.fromJson(i)).toList() ?? [],
      photos: List<String>.from(json['photos'] as List? ?? []),
      notes: json['notes'] as String? ?? '',
      isCompleted: json['is_completed'] as bool? ?? false,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'inspection_id': inspectionId,
        'name': name,
        'condition': condition.name,
        'items': items.map((i) => i.toJson()).toList(),
        'photos': photos,
        'notes': notes,
        'is_completed': isCompleted,
      };

  Room copyWith({
    String? id,
    String? inspectionId,
    String? name,
    RoomCondition? condition,
    List<InspectionItem>? items,
    List<String>? photos,
    String? notes,
    bool? isCompleted,
  }) {
    return Room(
      id: id ?? this.id,
      inspectionId: inspectionId ?? this.inspectionId,
      name: name ?? this.name,
      condition: condition ?? this.condition,
      items: items ?? this.items,
      photos: photos ?? this.photos,
      notes: notes ?? this.notes,
      isCompleted: isCompleted ?? this.isCompleted,
    );
  }

  int get issueCount => items.where((i) => i.hasIssue).length;
  int get completedItems => items.length;
}
