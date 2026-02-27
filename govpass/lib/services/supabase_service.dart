import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/application.dart';

class SupabaseService {
  final SupabaseClient _client;

  SupabaseService(this._client);

  SupabaseClient get client => _client;

  Future<List<Map<String, dynamic>>> getServices() async {
    try {
      final response = await _client.from('services').select();
      return List<Map<String, dynamic>>.from(response as List);
    } catch (e) {
      return [];
    }
  }

  Future<List<Map<String, dynamic>>> getUserApplications(String userId) async {
    try {
      final response = await _client
          .from('applications')
          .select()
          .eq('user_id', userId)
          .order('submitted_at', ascending: false);
      return List<Map<String, dynamic>>.from(response as List);
    } catch (e) {
      return [];
    }
  }

  Future<String?> createApplication(Map<String, dynamic> data) async {
    try {
      final response = await _client
          .from('applications')
          .insert(data)
          .select('id')
          .single();
      return response['id'] as String?;
    } catch (e) {
      return null;
    }
  }

  Future<bool> updateApplicationStatus(String appId, String status) async {
    try {
      await _client
          .from('applications')
          .update({'status': status})
          .eq('id', appId);
      return true;
    } catch (e) {
      return false;
    }
  }

  Future<bool> deleteApplication(String appId) async {
    try {
      await _client.from('applications').delete().eq('id', appId);
      return true;
    } catch (e) {
      return false;
    }
  }

  Future<Map<String, dynamic>?> getUserProfile(String userId) async {
    try {
      final response = await _client
          .from('profiles')
          .select()
          .eq('id', userId)
          .single();
      return response as Map<String, dynamic>?;
    } catch (e) {
      return null;
    }
  }

  Future<bool> updateUserProfile(String userId, Map<String, dynamic> data) async {
    try {
      await _client.from('profiles').upsert({'id': userId, ...data});
      return true;
    } catch (e) {
      return false;
    }
  }
}
