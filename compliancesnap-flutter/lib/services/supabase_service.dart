import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import '../models/inspection.dart';
import '../models/violation.dart';
import '../models/facility.dart';
import '../models/checklist_item.dart';

class SupabaseService {
  static SupabaseClient get client => Supabase.instance.client;

  // Offline queue
  static const String _offlineQueueKey = 'offline_sync_queue';

  static Future<void> addToOfflineQueue(String operation, Map<String, dynamic> data) async {
    final prefs = await SharedPreferences.getInstance();
    final queue = prefs.getStringList(_offlineQueueKey) ?? [];
    queue.add(jsonEncode({'operation': operation, 'data': data, 'timestamp': DateTime.now().toIso8601String()}));
    await prefs.setStringList(_offlineQueueKey, queue);
  }

  static Future<void> processOfflineQueue() async {
    final prefs = await SharedPreferences.getInstance();
    final queue = prefs.getStringList(_offlineQueueKey) ?? [];
    if (queue.isEmpty) return;

    final remaining = <String>[];
    for (final item in queue) {
      try {
        final entry = jsonDecode(item) as Map<String, dynamic>;
        final operation = entry['operation'] as String;
        final data = entry['data'] as Map<String, dynamic>;

        switch (operation) {
          case 'create_inspection':
            await client.from('inspections').upsert(data);
          case 'update_inspection':
            await client.from('inspections').update(data).eq('id', data['id']);
          case 'create_violation':
            await client.from('violations').upsert(data);
        }
      } catch (e) {
        remaining.add(item);
      }
    }
    await prefs.setStringList(_offlineQueueKey, remaining);
  }

  // Inspections
  static Future<List<SafetyInspection>> getInspections() async {
    try {
      final response = await client.from('safety_inspections').select().order('date', ascending: false);
      return (response as List).map((e) => SafetyInspection.fromJson(e)).toList();
    } catch (e) {
      return _mockInspections();
    }
  }

  static Future<void> createInspection(SafetyInspection inspection) async {
    try {
      await client.from('safety_inspections').insert(inspection.toJson());
    } catch (e) {
      await addToOfflineQueue('create_inspection', inspection.toJson());
    }
  }

  static Future<void> updateInspection(SafetyInspection inspection) async {
    try {
      await client.from('safety_inspections').update(inspection.toJson()).eq('id', inspection.id);
    } catch (e) {
      await addToOfflineQueue('update_inspection', inspection.toJson());
    }
  }

  // Violations
  static Future<List<Violation>> getViolations() async {
    try {
      final response = await client.from('violations').select().order('created_at', ascending: false);
      return (response as List).map((e) => Violation.fromJson(e)).toList();
    } catch (e) {
      return _mockViolations();
    }
  }

  static Future<void> updateViolation(Violation violation) async {
    try {
      await client.from('violations').update(violation.toJson()).eq('id', violation.id);
    } catch (e) {
      // Handle offline
    }
  }

  // Facilities
  static Future<List<Facility>> getFacilities() async {
    try {
      final response = await client.from('facilities').select().order('name');
      return (response as List).map((e) => Facility.fromJson(e)).toList();
    } catch (e) {
      return _mockFacilities();
    }
  }

  // Auth
  static Future<bool> signIn(String email, String password) async {
    try {
      await client.auth.signInWithPassword(email: email, password: password);
      return true;
    } catch (e) {
      return false;
    }
  }

  static Future<void> signOut() async {
    try {
      await client.auth.signOut();
    } catch (e) {
      // Handle
    }
  }

  static bool get isAuthenticated => client.auth.currentUser != null;

  // Mock data
  static List<SafetyInspection> _mockInspections() {
    final now = DateTime.now();
    return [
      SafetyInspection(
        id: 's1',
        facilityId: 'f1',
        type: InspectionType.fire,
        inspector: 'John Safety',
        date: now.subtract(const Duration(days: 2)),
        status: InspectionStatus.completed,
        items: _mockChecklistItems('fire'),
        violations: [],
        score: 87.5,
        isOffline: false,
      ),
      SafetyInspection(
        id: 's2',
        facilityId: 'f2',
        type: InspectionType.electrical,
        inspector: 'Jane Compliance',
        date: now.subtract(const Duration(days: 5)),
        status: InspectionStatus.completed,
        items: _mockChecklistItems('electrical'),
        violations: [],
        score: 72.0,
        isOffline: false,
      ),
      SafetyInspection(
        id: 's3',
        facilityId: 'f1',
        type: InspectionType.general,
        inspector: 'John Safety',
        date: now.add(const Duration(days: 3)),
        status: InspectionStatus.pending,
        items: [],
        violations: [],
        score: 100.0,
        isOffline: false,
      ),
    ];
  }

  static List<ChecklistItem> _mockChecklistItems(String type) {
    if (type == 'fire') {
      return [
        ChecklistItem(id: 'c1', category: 'Extinguishers', description: 'Fire extinguishers accessible and charged', isCompliant: true, notes: '', photos: []),
        ChecklistItem(id: 'c2', category: 'Exits', description: 'Emergency exits clearly marked and unobstructed', isCompliant: true, notes: '', photos: []),
        ChecklistItem(id: 'c3', category: 'Alarms', description: 'Smoke detectors tested and functional', isCompliant: false, notes: 'Unit 3 alarm needs battery', photos: []),
        ChecklistItem(id: 'c4', category: 'Sprinklers', description: 'Sprinkler heads unobstructed', isCompliant: true, notes: '', photos: []),
      ];
    }
    return [
      ChecklistItem(id: 'e1', category: 'Panels', description: 'Electrical panels properly labeled', isCompliant: false, notes: 'Panel B needs relabeling', photos: []),
      ChecklistItem(id: 'e2', category: 'Outlets', description: 'GFCI outlets in wet areas', isCompliant: true, notes: '', photos: []),
      ChecklistItem(id: 'e3', category: 'Cords', description: 'No extension cords as permanent wiring', isCompliant: false, notes: 'Found in server room', photos: []),
    ];
  }

  static List<Violation> _mockViolations() {
    return [
      Violation(
        id: 'v1',
        inspectionId: 's1',
        category: 'Alarms',
        description: 'Smoke detector in Unit 3 needs battery replacement',
        severity: ViolationSeverity.medium,
        photos: [],
        status: ViolationStatus.open,
        correctiveAction: 'Replace battery immediately',
        dueDate: DateTime.now().add(const Duration(days: 3)),
        createdAt: DateTime.now().subtract(const Duration(days: 2)),
      ),
      Violation(
        id: 'v2',
        inspectionId: 's2',
        category: 'Electrical',
        description: 'Extension cords used as permanent wiring in server room',
        severity: ViolationSeverity.high,
        photos: [],
        status: ViolationStatus.inReview,
        correctiveAction: 'Install proper wiring and remove extension cords',
        dueDate: DateTime.now().add(const Duration(days: 7)),
        createdAt: DateTime.now().subtract(const Duration(days: 5)),
      ),
      Violation(
        id: 'v3',
        inspectionId: 's2',
        category: 'Panels',
        description: 'Electrical panel B not properly labeled',
        severity: ViolationSeverity.low,
        photos: [],
        status: ViolationStatus.resolved,
        correctiveAction: 'Labels applied by electrician',
        createdAt: DateTime.now().subtract(const Duration(days: 5)),
      ),
    ];
  }

  static List<Facility> _mockFacilities() {
    return [
      Facility(
        id: 'f1',
        name: 'Main Manufacturing Plant',
        type: 'Manufacturing',
        address: '1200 Industrial Blvd, Chicago, IL',
        complianceScore: 87.5,
        lastInspection: DateTime.now().subtract(const Duration(days: 2)),
        openViolations: 1,
      ),
      Facility(
        id: 'f2',
        name: 'Office HQ',
        type: 'Office',
        address: '500 Michigan Ave, Chicago, IL',
        complianceScore: 72.0,
        lastInspection: DateTime.now().subtract(const Duration(days: 5)),
        openViolations: 3,
      ),
      Facility(
        id: 'f3',
        name: 'Distribution Center',
        type: 'Warehouse',
        address: '8900 Logistics Dr, Joliet, IL',
        complianceScore: 95.0,
        lastInspection: DateTime.now().subtract(const Duration(days: 14)),
        openViolations: 0,
      ),
    ];
  }
}
