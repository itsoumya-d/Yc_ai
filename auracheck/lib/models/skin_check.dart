class SkinCheck {
  final String id;
  final DateTime date;
  final int spotsChecked;
  final int newSpotsFound;
  final String? notes;
  final bool completed;
  final List<String> areasChecked;

  const SkinCheck({
    required this.id,
    required this.date,
    required this.spotsChecked,
    required this.newSpotsFound,
    this.notes,
    required this.completed,
    this.areasChecked = const [],
  });

  factory SkinCheck.fromJson(Map<String, dynamic> json) {
    return SkinCheck(
      id: json['id'] as String,
      date: DateTime.parse(json['date'] as String),
      spotsChecked: (json['spots_checked'] as num).toInt(),
      newSpotsFound: (json['new_spots_found'] as num).toInt(),
      notes: json['notes'] as String?,
      completed: json['completed'] as bool,
      areasChecked: List<String>.from(json['areas_checked'] as List? ?? []),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'date': date.toIso8601String(),
      'spots_checked': spotsChecked,
      'new_spots_found': newSpotsFound,
      'notes': notes,
      'completed': completed,
      'areas_checked': areasChecked,
    };
  }

  SkinCheck copyWith({
    String? id, DateTime? date, int? spotsChecked, int? newSpotsFound,
    String? notes, bool? completed, List<String>? areasChecked,
  }) {
    return SkinCheck(
      id: id ?? this.id,
      date: date ?? this.date,
      spotsChecked: spotsChecked ?? this.spotsChecked,
      newSpotsFound: newSpotsFound ?? this.newSpotsFound,
      notes: notes ?? this.notes,
      completed: completed ?? this.completed,
      areasChecked: areasChecked ?? this.areasChecked,
    );
  }

  static List<SkinCheck> sampleData() {
    final now = DateTime.now();
    return List.generate(14, (i) {
      final date = now.subtract(Duration(days: i));
      final shouldSkip = i == 3 || i == 8 || i == 11;
      if (shouldSkip) return null;
      return SkinCheck(
        id: 'check_$i',
        date: date,
        spotsChecked: 2 + (i % 2),
        newSpotsFound: i == 5 ? 1 : 0,
        completed: true,
        areasChecked: ['face', 'arms', 'back'],
      );
    }).whereType<SkinCheck>().toList();
  }
}

// Body region constants
class BodyRegion {
  static const String face = 'face';
  static const String neck = 'neck';
  static const String chest = 'chest';
  static const String leftArm = 'left_arm';
  static const String rightArm = 'right_arm';
  static const String leftShoulder = 'left_shoulder';
  static const String rightShoulder = 'right_shoulder';
  static const String upperBack = 'upper_back';
  static const String lowerBack = 'lower_back';
  static const String abdomen = 'abdomen';
  static const String leftLeg = 'left_leg';
  static const String rightLeg = 'right_leg';
  static const String leftFoot = 'left_foot';
  static const String rightFoot = 'right_foot';

  static const List<String> all = [
    face, neck, chest, leftArm, rightArm, leftShoulder, rightShoulder,
    upperBack, lowerBack, abdomen, leftLeg, rightLeg, leftFoot, rightFoot,
  ];

  static String displayName(String region) {
    final map = {
      face: 'Face',
      neck: 'Neck',
      chest: 'Chest',
      leftArm: 'Left Arm',
      rightArm: 'Right Arm',
      leftShoulder: 'Left Shoulder',
      rightShoulder: 'Right Shoulder',
      upperBack: 'Upper Back',
      lowerBack: 'Lower Back',
      abdomen: 'Abdomen',
      leftLeg: 'Left Leg',
      rightLeg: 'Right Leg',
      leftFoot: 'Left Foot',
      rightFoot: 'Right Foot',
    };
    return map[region] ?? region;
  }
}
