import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/inspection.dart';
import '../models/room.dart';
import '../models/inspection_item.dart';

class SupabaseService {
  static SupabaseClient get client => Supabase.instance.client;

  static Future<List<Inspection>> getInspections() async {
    try {
      final response = await client.from('inspections').select().order('date', ascending: false);
      return (response as List).map((e) => Inspection.fromJson(e)).toList();
    } catch (e) {
      return _mockInspections();
    }
  }

  static Future<Inspection> createInspection(Inspection inspection) async {
    try {
      final response = await client.from('inspections').insert(inspection.toJson()).select().single();
      return Inspection.fromJson(response);
    } catch (e) {
      return inspection;
    }
  }

  static Future<void> updateInspection(Inspection inspection) async {
    try {
      await client.from('inspections').update(inspection.toJson()).eq('id', inspection.id);
    } catch (e) {
      // Handle offline
    }
  }

  static List<Inspection> _mockInspections() {
    final room1 = Room(
      id: 'r1',
      inspectionId: 'i1',
      name: 'Living Room',
      condition: RoomCondition.good,
      items: [
        InspectionItem(
          id: 'item1',
          roomId: 'r1',
          category: 'Walls',
          description: 'Paint condition and wall integrity',
          condition: ItemCondition.good,
          photos: [],
          recommendation: '',
        ),
        InspectionItem(
          id: 'item2',
          roomId: 'r1',
          category: 'Ceiling',
          description: 'Ceiling integrity, water stains',
          condition: ItemCondition.fair,
          severity: ItemSeverity.minor,
          photos: [],
          recommendation: 'Minor paint touch-up recommended',
        ),
        InspectionItem(
          id: 'item3',
          roomId: 'r1',
          category: 'Electrical',
          description: 'Outlet covers and switch plates',
          condition: ItemCondition.good,
          photos: [],
          recommendation: '',
        ),
      ],
      photos: [],
      notes: 'General condition is satisfactory',
      isCompleted: true,
    );

    final room2 = Room(
      id: 'r2',
      inspectionId: 'i1',
      name: 'Kitchen',
      condition: RoomCondition.fair,
      items: [
        InspectionItem(
          id: 'item4',
          roomId: 'r2',
          category: 'Plumbing',
          description: 'Under-sink plumbing',
          condition: ItemCondition.poor,
          severity: ItemSeverity.moderate,
          photos: [],
          recommendation: 'Replace P-trap. Signs of previous leak.',
        ),
        InspectionItem(
          id: 'item5',
          roomId: 'r2',
          category: 'Floor',
          description: 'Tile condition and grout',
          condition: ItemCondition.fair,
          photos: [],
          recommendation: 'Re-grout around perimeter',
        ),
      ],
      photos: [],
      notes: 'Plumbing concern noted',
      isCompleted: true,
    );

    return [
      Inspection(
        id: 'i1',
        propertyAddress: '742 Evergreen Terrace, Springfield',
        clientName: 'Homer Simpson',
        date: DateTime.now().subtract(const Duration(days: 1)),
        inspectorName: 'Jane Inspector',
        status: InspectionStatus.completed,
        rooms: [room1, room2],
        overallCondition: OverallCondition.fair,
      ),
      Inspection(
        id: 'i2',
        propertyAddress: '1600 Pennsylvania Ave, Washington DC',
        clientName: 'John Client',
        date: DateTime.now().add(const Duration(hours: 3)),
        inspectorName: 'Jane Inspector',
        status: InspectionStatus.scheduled,
        rooms: [],
        overallCondition: OverallCondition.good,
      ),
    ];
  }
}
