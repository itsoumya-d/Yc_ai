import 'room.dart';

enum InspectionStatus { scheduled, inProgress, completed, reportGenerated }
enum OverallCondition { excellent, good, fair, poor }

class Inspection {
  final String id;
  final String propertyAddress;
  final String clientName;
  final DateTime date;
  final String inspectorName;
  final InspectionStatus status;
  final List<Room> rooms;
  final OverallCondition overallCondition;
  final String? reportUrl;

  const Inspection({
    required this.id,
    required this.propertyAddress,
    required this.clientName,
    required this.date,
    required this.inspectorName,
    required this.status,
    required this.rooms,
    required this.overallCondition,
    this.reportUrl,
  });

  factory Inspection.fromJson(Map<String, dynamic> json) {
    return Inspection(
      id: json['id'] as String,
      propertyAddress: json['property_address'] as String,
      clientName: json['client_name'] as String,
      date: DateTime.parse(json['date'] as String),
      inspectorName: json['inspector_name'] as String,
      status: InspectionStatus.values.firstWhere(
        (e) => e.name == (json['status'] as String),
        orElse: () => InspectionStatus.scheduled,
      ),
      rooms: (json['rooms'] as List?)?.map((r) => Room.fromJson(r)).toList() ?? [],
      overallCondition: OverallCondition.values.firstWhere(
        (e) => e.name == (json['overall_condition'] as String),
        orElse: () => OverallCondition.good,
      ),
      reportUrl: json['report_url'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'property_address': propertyAddress,
        'client_name': clientName,
        'date': date.toIso8601String(),
        'inspector_name': inspectorName,
        'status': status.name,
        'rooms': rooms.map((r) => r.toJson()).toList(),
        'overall_condition': overallCondition.name,
        'report_url': reportUrl,
      };

  Inspection copyWith({
    String? id,
    String? propertyAddress,
    String? clientName,
    DateTime? date,
    String? inspectorName,
    InspectionStatus? status,
    List<Room>? rooms,
    OverallCondition? overallCondition,
    String? reportUrl,
  }) {
    return Inspection(
      id: id ?? this.id,
      propertyAddress: propertyAddress ?? this.propertyAddress,
      clientName: clientName ?? this.clientName,
      date: date ?? this.date,
      inspectorName: inspectorName ?? this.inspectorName,
      status: status ?? this.status,
      rooms: rooms ?? this.rooms,
      overallCondition: overallCondition ?? this.overallCondition,
      reportUrl: reportUrl ?? this.reportUrl,
    );
  }

  int get totalIssues => rooms.fold(0, (sum, r) => sum + r.issueCount);
  int get completedRooms => rooms.where((r) => r.isCompleted).length;
  double get progress => rooms.isEmpty ? 0 : completedRooms / rooms.length;
}
