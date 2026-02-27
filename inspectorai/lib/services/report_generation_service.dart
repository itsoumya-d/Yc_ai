import '../models/inspection.dart';
import '../models/room.dart';
import '../models/inspection_item.dart';

class ReportGenerationService {
  static String generateHtmlReport(Inspection inspection) {
    final buffer = StringBuffer();
    buffer.writeln('<!DOCTYPE html><html><head>');
    buffer.writeln('<title>Property Inspection Report</title>');
    buffer.writeln('<style>');
    buffer.writeln('body { font-family: Arial, sans-serif; margin: 40px; color: #333; }');
    buffer.writeln('h1 { color: #3949AB; border-bottom: 3px solid #3949AB; padding-bottom: 10px; }');
    buffer.writeln('h2 { color: #3949AB; margin-top: 30px; }');
    buffer.writeln('.header { background: #f5f5ff; padding: 20px; border-radius: 8px; margin-bottom: 30px; }');
    buffer.writeln('.room { background: white; border: 1px solid #ddd; border-radius: 8px; margin: 20px 0; padding: 20px; }');
    buffer.writeln('.item { padding: 10px 0; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; }');
    buffer.writeln('.good { color: #2e7d32; font-weight: bold; }');
    buffer.writeln('.fair { color: #f57f17; font-weight: bold; }');
    buffer.writeln('.poor { color: #c62828; font-weight: bold; }');
    buffer.writeln('.badge { padding: 3px 10px; border-radius: 12px; font-size: 12px; }');
    buffer.writeln('</style></head><body>');

    buffer.writeln('<div class="header">');
    buffer.writeln('<h1>Property Inspection Report</h1>');
    buffer.writeln('<p><strong>Property:</strong> ${inspection.propertyAddress}</p>');
    buffer.writeln('<p><strong>Client:</strong> ${inspection.clientName}</p>');
    buffer.writeln('<p><strong>Inspector:</strong> ${inspection.inspectorName}</p>');
    buffer.writeln('<p><strong>Date:</strong> ${inspection.date}</p>');
    buffer.writeln('<p><strong>Overall Condition:</strong> <span class="${inspection.overallCondition.name}">${inspection.overallCondition.name.toUpperCase()}</span></p>');
    buffer.writeln('</div>');

    buffer.writeln('<h2>Summary</h2>');
    buffer.writeln('<p>Total Rooms Inspected: <strong>${inspection.rooms.length}</strong></p>');
    buffer.writeln('<p>Total Issues Found: <strong>${inspection.totalIssues}</strong></p>');

    buffer.writeln('<h2>Room-by-Room Inspection</h2>');
    for (final room in inspection.rooms) {
      buffer.writeln('<div class="room">');
      buffer.writeln('<h3>${room.name}</h3>');
      buffer.writeln('<p>Condition: <span class="${room.condition.name}">${room.condition.name.toUpperCase()}</span></p>');
      if (room.notes.isNotEmpty) {
        buffer.writeln('<p><em>${room.notes}</em></p>');
      }

      for (final item in room.items) {
        buffer.writeln('<div class="item">');
        buffer.writeln('<div><strong>${item.category}:</strong> ${item.description}</div>');
        buffer.writeln('<div class="${_conditionClass(item.condition)}">${item.condition.name.toUpperCase()}</div>');
        buffer.writeln('</div>');
        if (item.recommendation.isNotEmpty) {
          buffer.writeln('<p style="color:#666;font-size:13px;margin:4px 0 10px 20px;">Recommendation: ${item.recommendation}</p>');
        }
      }
      buffer.writeln('</div>');
    }

    buffer.writeln('</body></html>');
    return buffer.toString();
  }

  static String _conditionClass(ItemCondition condition) {
    switch (condition) {
      case ItemCondition.good:
        return 'good';
      case ItemCondition.fair:
        return 'fair';
      case ItemCondition.poor:
      case ItemCondition.deficient:
        return 'poor';
      default:
        return '';
    }
  }

  static Map<String, dynamic> generateReportSummary(Inspection inspection) {
    final issues = inspection.rooms
        .expand((r) => r.items.where((i) => i.hasIssue).map((i) => {
              'room': r.name,
              'category': i.category,
              'description': i.description,
              'condition': i.condition.name,
              'severity': i.severity?.name ?? 'minor',
              'recommendation': i.recommendation,
            }))
        .toList();

    return {
      'property': inspection.propertyAddress,
      'client': inspection.clientName,
      'date': inspection.date.toIso8601String(),
      'inspector': inspection.inspectorName,
      'overall_condition': inspection.overallCondition.name,
      'total_rooms': inspection.rooms.length,
      'total_issues': inspection.totalIssues,
      'issues': issues,
    };
  }
}
