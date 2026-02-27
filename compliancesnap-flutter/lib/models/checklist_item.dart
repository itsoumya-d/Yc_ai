class ChecklistItem {
  final String id;
  final String category;
  final String description;
  final bool? isCompliant;
  final String notes;
  final List<String> photos;

  const ChecklistItem({
    required this.id,
    required this.category,
    required this.description,
    this.isCompliant,
    required this.notes,
    required this.photos,
  });

  factory ChecklistItem.fromJson(Map<String, dynamic> json) {
    return ChecklistItem(
      id: json['id'] as String,
      category: json['category'] as String,
      description: json['description'] as String,
      isCompliant: json['is_compliant'] as bool?,
      notes: json['notes'] as String? ?? '',
      photos: List<String>.from(json['photos'] as List? ?? []),
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'category': category,
        'description': description,
        'is_compliant': isCompliant,
        'notes': notes,
        'photos': photos,
      };

  ChecklistItem copyWith({
    String? id,
    String? category,
    String? description,
    bool? isCompliant,
    String? notes,
    List<String>? photos,
  }) {
    return ChecklistItem(
      id: id ?? this.id,
      category: category ?? this.category,
      description: description ?? this.description,
      isCompliant: isCompliant ?? this.isCompliant,
      notes: notes ?? this.notes,
      photos: photos ?? this.photos,
    );
  }

  bool get isAnswered => isCompliant != null;
}
