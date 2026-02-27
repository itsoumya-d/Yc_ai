import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/daily_report.dart';
import '../models/punch_item.dart';
import '../models/project.dart';

class SupabaseService {
  static SupabaseClient get client => Supabase.instance.client;

  // Projects
  static Future<List<Project>> getProjects() async {
    try {
      final response = await client
          .from('projects')
          .select()
          .order('created_at', ascending: false);
      return (response as List).map((e) => Project.fromJson(e)).toList();
    } catch (e) {
      return _mockProjects();
    }
  }

  static List<Project> _mockProjects() {
    return [
      Project(
        id: '1',
        name: 'Riverside Commercial Complex',
        address: '1234 River Rd, Springfield, IL',
        client: 'Acme Development Co.',
        startDate: DateTime(2024, 1, 15),
        endDate: DateTime(2024, 12, 31),
        status: 'active',
        description: 'Mixed-use commercial and retail development.',
      ),
      Project(
        id: '2',
        name: 'Oak Park Residences',
        address: '567 Oak Ave, Oak Park, IL',
        client: 'Green Home Builders',
        startDate: DateTime(2024, 3, 1),
        status: 'active',
        description: '24-unit residential building.',
      ),
    ];
  }

  // Daily Reports
  static Future<List<DailyReport>> getReports({String? projectId}) async {
    try {
      var query = client.from('daily_reports').select();
      if (projectId != null) {
        query = query.eq('project_id', projectId);
      }
      final response = await query.order('date', ascending: false);
      return (response as List).map((e) => DailyReport.fromJson(e)).toList();
    } catch (e) {
      return _mockReports();
    }
  }

  static Future<DailyReport> createReport(DailyReport report) async {
    try {
      final response = await client
          .from('daily_reports')
          .insert(report.toJson())
          .select()
          .single();
      return DailyReport.fromJson(response);
    } catch (e) {
      return report;
    }
  }

  static Future<void> updateReport(DailyReport report) async {
    try {
      await client
          .from('daily_reports')
          .update(report.toJson())
          .eq('id', report.id);
    } catch (e) {
      // Handle offline gracefully
    }
  }

  static List<DailyReport> _mockReports() {
    return [
      DailyReport(
        id: '1',
        projectId: '1',
        date: DateTime.now(),
        weather: 'Sunny, 72°F',
        crewCount: 12,
        workPerformed: 'Poured concrete for north wing foundation. Installed rebar grid sections A-D.',
        equipmentUsed: 'Concrete pump, 2x excavators, flatbed crane',
        issues: 'Minor delay due to concrete delivery - 45 min late.',
        photos: [],
        location: '41.8781,-87.6298',
        createdBy: 'John Foreman',
        createdAt: DateTime.now(),
      ),
      DailyReport(
        id: '2',
        projectId: '1',
        date: DateTime.now().subtract(const Duration(days: 1)),
        weather: 'Cloudy, 65°F',
        crewCount: 10,
        workPerformed: 'Excavation work completed on east wing. Drainage pipe installation sections 1-5.',
        equipmentUsed: 'Backhoe, bulldozer, compactor',
        issues: '',
        photos: [],
        location: '41.8781,-87.6298',
        createdBy: 'Jane Site Manager',
        createdAt: DateTime.now().subtract(const Duration(days: 1)),
      ),
    ];
  }

  // Punch Items
  static Future<List<PunchItem>> getPunchItems({String? projectId}) async {
    try {
      var query = client.from('punch_items').select();
      if (projectId != null) {
        query = query.eq('project_id', projectId);
      }
      final response = await query.order('created_at', ascending: false);
      return (response as List).map((e) => PunchItem.fromJson(e)).toList();
    } catch (e) {
      return _mockPunchItems();
    }
  }

  static Future<PunchItem> createPunchItem(PunchItem item) async {
    try {
      final response = await client
          .from('punch_items')
          .insert(item.toJson())
          .select()
          .single();
      return PunchItem.fromJson(response);
    } catch (e) {
      return item;
    }
  }

  static Future<void> updatePunchItem(PunchItem item) async {
    try {
      await client
          .from('punch_items')
          .update(item.toJson())
          .eq('id', item.id);
    } catch (e) {
      // Handle offline
    }
  }

  static List<PunchItem> _mockPunchItems() {
    return [
      PunchItem(
        id: '1',
        projectId: '1',
        description: 'Crack in east wall foundation - requires patching',
        location: 'East Wing, Section A',
        priority: PunchPriority.high,
        status: PunchStatus.open,
        assignedTo: 'Mike Contractor',
        dueDate: DateTime.now().add(const Duration(days: 3)),
        photos: [],
        createdAt: DateTime.now().subtract(const Duration(hours: 2)),
      ),
      PunchItem(
        id: '2',
        projectId: '1',
        description: 'Missing safety railing on 2nd floor stairwell',
        location: 'Building B, Floor 2',
        priority: PunchPriority.critical,
        status: PunchStatus.inProgress,
        assignedTo: 'Safety Team',
        dueDate: DateTime.now().add(const Duration(days: 1)),
        photos: [],
        createdAt: DateTime.now().subtract(const Duration(hours: 5)),
      ),
      PunchItem(
        id: '3',
        projectId: '1',
        description: 'Paint touch-up needed in lobby area',
        location: 'Main Lobby',
        priority: PunchPriority.low,
        status: PunchStatus.resolved,
        assignedTo: 'Painting Crew',
        photos: [],
        resolvedAt: DateTime.now().subtract(const Duration(hours: 1)),
        createdAt: DateTime.now().subtract(const Duration(days: 2)),
      ),
    ];
  }

  // Storage
  static Future<String?> uploadPhoto(List<int> bytes, String fileName) async {
    try {
      await client.storage
          .from('site-photos')
          .uploadBinary(fileName, bytes);
      return client.storage.from('site-photos').getPublicUrl(fileName);
    } catch (e) {
      return null;
    }
  }
}
