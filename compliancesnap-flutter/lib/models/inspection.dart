import 'checklist_item.dart';
import 'violation.dart';

enum InspectionType { fire, electrical, general, ergonomic, chemical, emergency }
enum InspectionStatus { pending, inProgress, completed, failed }

class SafetyInspection {
  final String id;
  final String facilityId;
  final InspectionType type;
  final String inspector;
  final DateTime date;
  final InspectionStatus status;
  final List<ChecklistItem> items;
  final List<Violation> violations;
  final double score;
  final bool isOffline;

  const SafetyInspection({
    required this.id,
    required this.facilityId,
    required this.type,
    required this.inspector,
    required this.date,
    required this.status,
    required this.items,
    required this.violations,
    required this.score,
    required this.isOffline,
  });

  factory SafetyInspection.fromJson(Map<String, dynamic> json) {
    return SafetyInspection(
      id: json['id'] as String,
      facilityId: json['facility_id'] as String,
      type: InspectionType.values.firstWhere(
        (e) => e.name == (json['type'] as String),
        orElse: () => InspectionType.general,
      ),
      inspector: json['inspector'] as String,
      date: DateTime.parse(json['date'] as String),
      status: InspectionStatus.values.firstWhere(
        (e) => e.name == (json['status'] as String),
        orElse: () => InspectionStatus.pending,
      ),
      items: (json['items'] as List?)?.map((i) => ChecklistItem.fromJson(i)).toList() ?? [],
      violations: (json['violations'] as List?)?.map((v) => Violation.fromJson(v)).toList() ?? [],
      score: (json['score'] as num?)?.toDouble() ?? 100.0,
      isOffline: json['is_offline'] as bool? ?? false,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'facility_id': facilityId,
        'type': type.name,
        'inspector': inspector,
        'date': date.toIso8601String(),
        'status': status.name,
        'items': items.map((i) => i.toJson()).toList(),
        'violations': violations.map((v) => v.toJson()).toList(),
        'score': score,
        'is_offline': isOffline,
      };

  SafetyInspection copyWith({
    String? id,
    String? facilityId,
    InspectionType? type,
    String? inspector,
    DateTime? date,
    InspectionStatus? status,
    List<ChecklistItem>? items,
    List<Violation>? violations,
    double? score,
    bool? isOffline,
  }) {
    return SafetyInspection(
      id: id ?? this.id,
      facilityId: facilityId ?? this.facilityId,
      type: type ?? this.type,
      inspector: inspector ?? this.inspector,
      date: date ?? this.date,
      status: status ?? this.status,
      items: items ?? this.items,
      violations: violations ?? this.violations,
      score: score ?? this.score,
      isOffline: isOffline ?? this.isOffline,
    );
  }

  double get calculatedScore {
    if (items.isEmpty) return 100.0;
    final answered = items.where((i) => i.isAnswered).length;
    if (answered == 0) return 100.0;
    final compliant = items.where((i) => i.isCompliant == true).length;
    return (compliant / answered * 100).clamp(0, 100);
  }

  int get progress => items.isEmpty ? 0 : ((items.where((i) => i.isAnswered).length / items.length) * 100).round();
}
