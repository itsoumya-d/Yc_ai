import 'package:supabase_flutter/supabase_flutter.dart';

class SupabaseService {
  final SupabaseClient _client;

  SupabaseService(this._client);

  Future<bool> savePlanningData(String userId, Map<String, dynamic> data) async {
    try {
      await _client.from('planning_data').upsert({
        'user_id': userId,
        'data': data,
        'updated_at': DateTime.now().toIso8601String(),
      });
      return true;
    } catch (e) {
      return false;
    }
  }

  Future<Map<String, dynamic>?> loadPlanningData(String userId) async {
    try {
      final response = await _client
          .from('planning_data')
          .select()
          .eq('user_id', userId)
          .single();
      return response['data'] as Map<String, dynamic>?;
    } catch (e) {
      return null;
    }
  }

  Future<String?> uploadDocument(String userId, String fileName, List<int> bytes) async {
    try {
      final path = '$userId/$fileName';
      await _client.storage.from('documents').uploadBinary(path, bytes as Uint8List);
      return _client.storage.from('documents').getPublicUrl(path);
    } catch (e) {
      return null;
    }
  }

  Future<bool> deleteDocument(String userId, String fileName) async {
    try {
      final path = '$userId/$fileName';
      await _client.storage.from('documents').remove([path]);
      return true;
    } catch (e) {
      return false;
    }
  }
}

// ignore: avoid_classes_with_only_static_members, non_constant_identifier_names
typedef Uint8List = List<int>;
